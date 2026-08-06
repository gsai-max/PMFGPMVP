import { prisma, sessionCache } from '../../db';
import {
  findClusterByFilter,
  getMissingClusters,
  getMissionClusters,
  isClusterFilled,
  MISSION_CLUSTER_MAP,
} from './missionClusters';

export interface DetectionResult {
  mission: string | null;
  displayName: string;
  confidence: number;
  icon: string;
  matchedSignals: string[];
  llmReasoning?: string;
}

const isSqlite = process.env.DATABASE_URL?.startsWith('file:');

// Helper to safely extract string array for PostgreSQL or SQLite
export function parseArrayField(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

// Groq API Mission Classification Fallback / Tie-Breaker with 800ms AbortController timeout
async function classifyMissionWithGroq(
  cartItemsSummary: string[],
  searchQueries: string[],
  timeOfDay: string
): Promise<{ mission: string; confidence: number; displayName: string; reason: string } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 800); // 800ms strict timeout

  try {
    const prompt = `Cart items: ${cartItemsSummary.join(', ') || 'None'}. Recent Searches: ${searchQueries.join(', ') || 'None'}. Time of Day: ${timeOfDay}.
Classify the user's shopping mission. Available missions: breakfast, meal_prep, dinner_prep, monthly_grocery, movie_night, guest_arrival, baby_care, pet_care, house_cleaning, office_snacks, emergency_purchase, fitness_nutrition, late_night_cravings.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an AI Mission Intelligence Engine for a quick-commerce app. Classify the user shopping mission and return ONLY a JSON object with keys: {"mission": string, "displayName": string, "confidence": number, "reason": string}.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return parsed;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Groq LLM classification skipped or timed out, using rule-weighted scorer:', (err as Error).message);
    return null;
  }
}

export async function detectMission(cartId?: string, sessionId?: string): Promise<DetectionResult> {
  const cacheKey = `mission_detect_${cartId || sessionId || 'anon'}`;
  const cached = sessionCache.get(cacheKey);
  if (cached) return cached;

  let cartItems: any[] = [];
  if (cartId) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });
    if (cart) cartItems = cart.items;
  }

  // Fetch recent search events for session
  let searchQueries: string[] = [];
  if (sessionId) {
    const events = await prisma.missionSignalEvent.findMany({
      where: { sessionId, eventType: 'SEARCH' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    searchQueries = events.map((e: any) => {
      let payload = e.payloadJson;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch {}
      }
      return payload?.query || '';
    }).filter(Boolean);
  }

  // Edge-Case Suppression (Section 2.1):
  // Suppress mission inference for 0 or 1 item carts with no search signals to avoid false positives
  const totalItemQuantity = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  if (cartItems.length < 2 && totalItemQuantity < 2 && searchQueries.length === 0) {
    const emptyResult: DetectionResult = {
      mission: null,
      displayName: 'General Browsing',
      confidence: 0,
      icon: '🛒',
      matchedSignals: ['Add 2+ items or search to activate AI Mission Intelligence'],
    };
    sessionCache.set(cacheKey, emptyResult, 120);
    return emptyResult;
  }

  // Fetch defined missions
  const missions = await prisma.mission.findMany();

  const currentHour = new Date().getHours();
  const timeOfDayStr = currentHour >= 4 && currentHour < 12 ? 'Morning' : currentHour >= 12 && currentHour < 17 ? 'Afternoon' : 'Evening';

  let topMissionKey: string | null = null;
  let topDisplayName = 'General Browsing';
  let topIcon = '🛒';
  let maxConfidence = 0;
  let topSignals: string[] = [];

  for (const m of missions) {
    let score = 0;
    const signals: string[] = [];

    // 1. Cart tag match score
    if (cartItems.length > 0) {
      let matchedCount = 0;
      for (const item of cartItems) {
        const productTags = parseArrayField(item.product.missionTags);
        if (productTags.includes(m.key)) {
          matchedCount += item.quantity;
        }
      }
      const ratio = totalItemQuantity > 0 ? matchedCount / totalItemQuantity : 0;
      score += ratio * 0.55;
      if (matchedCount > 0) {
        signals.push(`${matchedCount} cart item(s) match ${m.displayName}`);
      }
    }

    // 2. Search query match
    if (searchQueries.length > 0) {
      let searchMatch = false;
      for (const q of searchQueries) {
        if (q.toLowerCase().includes(m.key.replace('_', ' ')) || m.displayName.toLowerCase().includes(q.toLowerCase())) {
          searchMatch = true;
          break;
        }
      }
      if (searchMatch) {
        score += 0.25;
        signals.push(`Search history matches ${m.displayName}`);
      }
    }

    // 3. Time of day prior
    if (m.key === 'breakfast' && currentHour >= 4 && currentHour <= 11) {
      score += 0.20;
      signals.push('Morning shopping time prior (+20%)');
    } else if ((m.key === 'meal_prep' || m.key === 'dinner_prep') && currentHour >= 14 && currentHour <= 21) {
      score += 0.20;
      signals.push('Afternoon/evening prep & cooking time prior (+20%)');
    } else if ((m.key === 'movie_night' || m.key === 'late_night_cravings') && (currentHour >= 19 || currentHour <= 1)) {
      score += 0.15;
      signals.push('Late evening snack time prior (+15%)');
    }

    if (score > maxConfidence) {
      maxConfidence = score;
      topMissionKey = m.key;
      topDisplayName = m.displayName;
      topIcon = m.icon || '🛒';
      topSignals = signals;
    }
  }

  let llmReasoning: string | undefined = undefined;

  // Groq LLM API tie-breaker fallback if Groq API key is present and cart has items
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here' && cartItems.length > 0) {
    const cartSummary = cartItems.map((i) => `${i.quantity}x ${i.product.name}`);
    const groqResult = await classifyMissionWithGroq(cartSummary, searchQueries, timeOfDayStr);
    if (groqResult && groqResult.confidence > maxConfidence) {
      topMissionKey = groqResult.mission;
      topDisplayName = groqResult.displayName;
      maxConfidence = groqResult.confidence;
      llmReasoning = groqResult.reason;
      topSignals.push(`Groq LLM AI Inference: ${groqResult.reason}`);
    }
  }

  // Cap confidence score between 0 and 0.98
  const confidence = Math.min(0.98, Math.round(maxConfidence * 100) / 100);

  // Confidence Gatekeeper threshold >= 0.40
  const result: DetectionResult = {
    mission: confidence >= 0.40 ? topMissionKey : null,
    displayName: confidence >= 0.40 ? topDisplayName : 'General Browsing',
    confidence: confidence >= 0.40 ? confidence : 0,
    icon: confidence >= 0.40 ? topIcon : '🛒',
    matchedSignals: confidence >= 0.40 ? topSignals : ['Browsing catalog'],
    llmReasoning,
  };

  sessionCache.set(cacheKey, result, 120); // 2-min cache
  return result;
}

export async function getMissionRecommendations(missionKey?: string, cartId?: string, query?: string) {
  const cartSubcategories = new Set<string>();
  if (cartId) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });
    if (cart) {
      cart.items.forEach((i: any) => cartSubcategories.add(i.product.subcategory));
    }
  }

  // If a specific subcategory cluster filter or search query is provided
  if (query && missionKey) {
    const matchedCluster = findClusterByFilter(missionKey, query);
    const orConditions: any[] = [];

    if (matchedCluster) {
      if (matchedCluster.catalogSubcategories.length > 0) {
        orConditions.push({ subcategory: { in: matchedCluster.catalogSubcategories } });
      }
      for (const ex of matchedCluster.productExamples) {
        orConditions.push({ name: { contains: ex } });
        orConditions.push({ description: { contains: ex } });
      }
    }

    orConditions.push({ name: { contains: query } });
    orConditions.push({ subcategory: { contains: query } });

    const filterProducts = await prisma.product.findMany({
      where: {
        OR: orConditions,
        stockQty: { gt: 0 },
      },
      take: 12,
      include: { category: true },
    });

    if (filterProducts.length > 0) return filterProducts;
  }

  const clusterDef = missionKey ? MISSION_CLUSTER_MAP[missionKey] : null;
  if (clusterDef) {
    const missingClusters = getMissingClusters(cartSubcategories, missionKey!, true);
    const targetSubcategories = missingClusters.flatMap((c) => c.catalogSubcategories);
    const uniqueSubs = [...new Set(targetSubcategories)].filter((sub) => !cartSubcategories.has(sub));

    if (uniqueSubs.length > 0) {
      const clusterProducts = await prisma.product.findMany({
        where: {
          subcategory: { in: uniqueSubs },
          stockQty: { gt: 0 },
        },
        take: 8,
        include: { category: true },
      });
      if (clusterProducts.length > 0) return clusterProducts;
    }
  }

  let products: any[] = [];
  if (missionKey) {
    products = await prisma.product.findMany({
      where: {
        missionTags: { contains: missionKey } as any,
        subcategory: { notIn: Array.from(cartSubcategories) },
        stockQty: { gt: 0 },
      },
      take: 8,
      include: { category: true },
    });
  }

  if (products.length === 0) {
    products = await prisma.product.findMany({
      where: {
        ...(cartSubcategories.size > 0 ? { subcategory: { notIn: Array.from(cartSubcategories) } } : {}),
        stockQty: { gt: 0 },
      },
      take: 8,
      include: { category: true },
    });
  }

  return products;
}

export function getMissionClusterConfig(missionKey?: string) {
  return getMissionClusters(missionKey);
}

export async function getMissionCompletion(cartId?: string, missionKey?: string) {
  if (!cartId) {
    return { completionPercentage: 0, missingSlots: [], suggestedItems: [], mission: null };
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return { completionPercentage: 0, missingSlots: [], suggestedItems: [], mission: null };
  }

  // Find target mission definition
  let targetMission = null;
  if (missionKey) {
    targetMission = await prisma.mission.findUnique({ where: { key: missionKey } });
  } else {
    // Auto-detect mission key if omitted
    const detected = await detectMission(cartId);
    if (detected.mission) {
      targetMission = await prisma.mission.findUnique({ where: { key: detected.mission } });
    }
  }

  if (!targetMission) {
    return { completionPercentage: 100, missingSlots: [], suggestedItems: [], mission: null };
  }

  const activeSubcategories = new Set(cart.items.map((i: any) => i.product.subcategory));
  const clusterDef = MISSION_CLUSTER_MAP[targetMission.key];

  if (clusterDef) {
    const coreClusters = clusterDef.clusters.filter((c) => !c.isAdjacent);
    const filledClusters = coreClusters.filter((c) => isClusterFilled(activeSubcategories, c));
    const missingClusterList = coreClusters.filter((c) => !isClusterFilled(activeSubcategories, c));

    const completionPercentage =
      coreClusters.length === 0
        ? 100
        : Math.min(100, Math.round((filledClusters.length / coreClusters.length) * 100));

    const missingSlots = missingClusterList.map((c) => c.name);
    const missingSubcategories = [...new Set(missingClusterList.flatMap((c) => c.catalogSubcategories))];

    const missingProducts = await prisma.product.findMany({
      where: {
        subcategory: { in: missingSubcategories },
        stockQty: { gt: 0 },
      },
      take: 3,
      include: { category: true },
    });

    return {
      mission: targetMission,
      completionPercentage,
      missingSlots: completionPercentage === 100 ? [] : missingSlots,
      missingClusters: completionPercentage === 100 ? [] : missingClusterList.map((c) => c.id),
      suggestedItems: completionPercentage === 100 ? [] : missingProducts,
    };
  }

  const checklist = parseArrayField(targetMission.checklistCategories);
  if (checklist.length === 0) {
    return { completionPercentage: 100, missingSlots: [], suggestedItems: [], mission: targetMission };
  }

  let filledSlots = 0;
  const missingSlots: string[] = [];

  for (const slot of checklist) {
    if (activeSubcategories.has(slot)) {
      filledSlots++;
    } else {
      missingSlots.push(slot);
    }
  }

  const completionPercentage = Math.min(100, Math.round((filledSlots / checklist.length) * 100));

  const missingProducts = await prisma.product.findMany({
    where: {
      subcategory: { in: missingSlots },
      stockQty: { gt: 0 },
    },
    take: 3,
    include: { category: true },
  });

  return {
    mission: targetMission,
    completionPercentage,
    missingSlots: completionPercentage === 100 ? [] : missingSlots,
    suggestedItems: completionPercentage === 100 ? [] : missingProducts,
  };
}
