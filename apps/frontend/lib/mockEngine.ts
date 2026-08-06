import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_COUPONS, MockProduct } from './mockData';
import {
  findClusterByFilter,
  getMissingClusters,
  isClusterFilled,
  MISSION_CLUSTER_MAP,
} from './missionClusters';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: MockProduct;
}

interface Cart {
  id: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  product: MockProduct;
}

interface Order {
  id: string;
  status: 'PLACED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  totalAmount: number;
  discountAmount: number;
  address: any;
  items: OrderItem[];
  createdAt: string;
}

const STORAGE_KEYS = {
  CART: 'blinkclone_mock_cart',
  ORDERS: 'blinkclone_mock_orders',
};

// Helper: load/save from localStorage
function getLocal<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
}

export class MockEngine {
  // Categories
  static getCategories() {
    return MOCK_CATEGORIES;
  }

  // Products
  static getProducts(params?: { q?: string; category?: string; subcategory?: string; sort?: string; limit?: number }) {
    let list = [...MOCK_PRODUCTS];

    if (params?.category) {
      const cat = MOCK_CATEGORIES.find((c) => c.slug === params.category);
      if (cat) {
        list = list.filter((p) => p.categoryId === cat.id);
      }
    }

    if (params?.subcategory) {
      list = list.filter((p) => p.subcategory.toLowerCase() === params.subcategory!.toLowerCase());
    }

    if (params?.q) {
      const query = params.q.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.subcategory.toLowerCase().includes(query) ||
          p.missionTags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (params?.sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (params?.sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    }

    if (params?.limit) {
      list = list.slice(0, Number(params.limit));
    }

    return { products: list, total: list.length };
  }

  static getProductById(id: string) {
    return MOCK_PRODUCTS.find((p) => p.id === id) || null;
  }

  // Cart Management
  static getCart(cartId?: string | null): Cart {
    let cart = getLocal<Cart | null>(STORAGE_KEYS.CART, null);
    if (!cart) {
      cart = {
        id: cartId || 'cart-' + Math.random().toString(36).substring(2, 9),
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocal(STORAGE_KEYS.CART, cart);
    }
    return cart;
  }

  static addItem(productId: string, quantity = 1): Cart {
    const cart = this.getCart();
    const product = this.getProductById(productId);
    if (!product) return cart;

    const existingIndex = cart.items.findIndex((i) => i.productId === productId);
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity = Math.min(10, cart.items[existingIndex].quantity + quantity);
    } else {
      cart.items.push({
        id: 'item-' + Math.random().toString(36).substring(2, 9),
        productId,
        quantity: Math.min(10, quantity),
        product,
      });
    }

    cart.updatedAt = new Date().toISOString();
    setLocal(STORAGE_KEYS.CART, cart);
    return cart;
  }

  static updateQuantity(itemId: string, quantity: number): Cart {
    const cart = this.getCart();
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.id !== itemId);
    } else {
      const item = cart.items.find((i) => i.id === itemId);
      if (item) item.quantity = Math.min(10, quantity);
    }

    cart.updatedAt = new Date().toISOString();
    setLocal(STORAGE_KEYS.CART, cart);
    return cart;
  }

  static applyCoupon(code: string, cartTotal: number) {
    const coupon = MOCK_COUPONS[code.toUpperCase()];
    if (!coupon) {
      throw { response: { data: { error: 'Invalid coupon code' } } };
    }
    if (cartTotal < coupon.minTotal) {
      throw { response: { data: { error: `Minimum order amount of ₹${coupon.minTotal} required` } } };
    }

    let discountAmount = 0;
    if (coupon.discountAmount) {
      discountAmount = coupon.discountAmount;
    } else if (coupon.discountPercent) {
      discountAmount = Math.min(coupon.maxDiscount || 9999, Math.round((cartTotal * coupon.discountPercent) / 100));
    }

    return { discountAmount, appliedCoupon: coupon.code };
  }

  // AI Mission Intelligence
  static detectMission(cartId?: string | null) {
    const cart = this.getCart(cartId);
    if (!cart.items || cart.items.length === 0) {
      return {
        mission: null,
        displayName: 'No Intent Detected',
        confidence: 0,
        icon: '🛒',
        matchedSignals: [],
      };
    }

    const cartSubcats = new Set(cart.items.map((i) => i.product.subcategory));
    const cartTags = new Set(cart.items.flatMap((i) => i.product.missionTags));

    let bestMissionKey: string | null = null;
    let highestScore = 0;
    let matchedSignals: string[] = [];

    for (const [key, def] of Object.entries(MISSION_CLUSTER_MAP)) {
      const coreClusters = def.clusters.filter((c) => !c.isAdjacent);
      const filled = coreClusters.filter((c) => isClusterFilled(cartSubcats, c)).length;
      const tagMatch = cartTags.has(key);

      let score = 0;
      if (coreClusters.length > 0 && filled > 0) {
        score = (filled / coreClusters.length) * 0.7 + (tagMatch ? 0.25 : 0);
      } else if (tagMatch) {
        score = 0.5;
      }

      if (score > highestScore && score >= 0.4) {
        highestScore = score;
        bestMissionKey = key;
        matchedSignals = def.clusters
          .filter((c) => isClusterFilled(cartSubcats, c))
          .map((c) => c.name);
      }
    }

    if (!bestMissionKey) {
      return {
        mission: null,
        displayName: 'General Grocery',
        confidence: 0.2,
        icon: '🛒',
        matchedSignals: [],
      };
    }

    const bestMission = MISSION_CLUSTER_MAP[bestMissionKey];
    return {
      mission: bestMissionKey,
      displayName: bestMission.displayName,
      confidence: Math.min(0.98, Number(highestScore.toFixed(2))),
      icon: bestMission.icon,
      matchedSignals: matchedSignals.map((s) => `Matched cluster: ${s}`),
    };
  }

  static getMissionCompletion(cartId?: string | null) {
    const detection = this.detectMission(cartId);
    if (!detection.mission) {
      return { completionPercentage: 0, missingSlots: [], suggestedItems: [], mission: null };
    }

    const clusterDef = MISSION_CLUSTER_MAP[detection.mission];
    if (!clusterDef) return { completionPercentage: 0, missingSlots: [], suggestedItems: [], mission: null };

    const cart = this.getCart(cartId);
    const cartSubcats = new Set(cart.items.map((i) => i.product.subcategory));

    const coreClusters = clusterDef.clusters.filter((c) => !c.isAdjacent);
    const filledCount = coreClusters.filter((c) => isClusterFilled(cartSubcats, c)).length;
    const missingClusters = getMissingClusters(cartSubcats, detection.mission, false);

    const completionPercentage =
      coreClusters.length === 0 ? 100 : Math.min(100, Math.round((filledCount / coreClusters.length) * 100));

    const missingSubcategories = Array.from(new Set(missingClusters.flatMap((c) => c.catalogSubcategories)));
    const suggestedItems = MOCK_PRODUCTS.filter(
      (p) =>
        missingSubcategories.includes(p.subcategory) &&
        !cart.items.some((i) => i.productId === p.id)
    ).slice(0, 3);

    return {
      completionPercentage,
      missingSlots: missingClusters.map((c) => c.name),
      suggestedItems,
      mission: {
        key: clusterDef.key,
        displayName: clusterDef.displayName,
        icon: clusterDef.icon,
      },
    };
  }

  static getMissionRecommendations(missionKey?: string, cartId?: string | null, query?: string | null) {
    const cart = this.getCart(cartId);
    const cartItemIds = new Set(cart.items.map((i) => i.productId));
    const cartSubcats = new Set(cart.items.map((i) => i.product.subcategory));

    if (query && missionKey) {
      const matchedCluster = findClusterByFilter(missionKey, query);
      if (matchedCluster) {
        const clusterSubs = matchedCluster.catalogSubcategories.map((s) => s.toLowerCase());
        const examples = matchedCluster.productExamples.map((e) => e.toLowerCase());

        const matched = MOCK_PRODUCTS.filter((p) => {
          if (cartItemIds.has(p.id)) return false;
          const pSub = (p.subcategory || '').toLowerCase();
          const pName = (p.name || '').toLowerCase();
          const pDesc = (p.description || '').toLowerCase();

          if (clusterSubs.some((sub) => pSub.includes(sub) || sub.includes(pSub))) return true;
          if (examples.some((ex) => ex.length > 2 && (pName.includes(ex) || pDesc.includes(ex)))) return true;

          return false;
        });

        if (matched.length > 0) return matched;
      }

      const q = query.toLowerCase().trim();
      const directMatch = MOCK_PRODUCTS.filter((p) => {
        if (cartItemIds.has(p.id)) return false;
        return (
          p.name.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      });
      if (directMatch.length > 0) return directMatch;
    }

    if (missionKey && MISSION_CLUSTER_MAP[missionKey]) {
      const missingClusters = getMissingClusters(cartSubcats, missionKey, true);
      const targetSubs = Array.from(new Set(missingClusters.flatMap((c) => c.catalogSubcategories)));
      const clusterMatches = MOCK_PRODUCTS.filter(
        (p) => targetSubs.includes(p.subcategory) && !cartItemIds.has(p.id)
      );
      if (clusterMatches.length > 0) return clusterMatches.slice(0, 8);
    }

    let candidates = MOCK_PRODUCTS.filter((p) => !cartItemIds.has(p.id));
    if (missionKey) {
      candidates = candidates.filter((p) => p.missionTags.includes(missionKey));
    }

    return candidates.slice(0, 8);
  }

  // Orders
  static createOrder(cartId: string, address: any, discountAmount = 0): Order {
    const cart = this.getCart(cartId);

    const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const deliveryFee = subtotal === 0 || subtotal > 299 ? 0 : 25;
    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

    const newOrder: Order = {
      id: 'ord-' + Math.random().toString(36).substring(2, 9),
      status: 'PLACED',
      totalAmount,
      discountAmount,
      address,
      items: cart.items.map((i) => ({
        id: 'ord-item-' + Math.random().toString(36).substring(2, 9),
        productId: i.productId,
        quantity: i.quantity,
        priceAtPurchase: i.product.price,
        product: i.product,
      })),
      createdAt: new Date().toISOString(),
    };

    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    orders.unshift(newOrder);
    setLocal(STORAGE_KEYS.ORDERS, orders);

    // Clear cart
    setLocal(STORAGE_KEYS.CART, { id: 'cart-' + Math.random().toString(36).substring(2, 9), items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

    return newOrder;
  }

  static getOrderById(id: string): Order | null {
    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    // Simulate real-time status based on elapsed time (seconds)
    const elapsedSeconds = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
    let status: Order['status'] = 'PLACED';
    if (elapsedSeconds > 120) {
      status = 'DELIVERED';
    } else if (elapsedSeconds > 45) {
      status = 'OUT_FOR_DELIVERY';
    } else if (elapsedSeconds > 15) {
      status = 'PACKED';
    }

    order.status = status;
    return order;
  }

  static getOrders(): Order[] {
    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    return orders.map((o) => this.getOrderById(o.id)!).filter(Boolean);
  }
}
