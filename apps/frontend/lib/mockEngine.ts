import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_MISSIONS, MOCK_COUPONS, MockProduct } from './mockData';

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

    // Extract subcategories in cart
    const cartSubcats = new Set(cart.items.map((i) => i.product.subcategory));
    const cartTags = new Set(cart.items.flatMap((i) => i.product.missionTags));

    let bestMission: any = null;
    let highestScore = 0;
    let matchedSignals: string[] = [];

    for (const m of MOCK_MISSIONS) {
      let matchedReq = 0;
      let matchedOpt = 0;

      m.requiredSubcategories.forEach((sub) => {
        if (cartSubcats.has(sub)) matchedReq++;
      });

      m.optionalSubcategories.forEach((sub) => {
        if (cartSubcats.has(sub)) matchedOpt++;
      });

      if (cartTags.has(m.key)) matchedOpt++;

      // Score calculation
      const totalReq = m.requiredSubcategories.length;
      let score = 0;

      if (matchedReq > 0) {
        score = (matchedReq / totalReq) * 0.7 + (matchedOpt > 0 ? 0.25 : 0);
      } else if (cartTags.has(m.key)) {
        score = 0.5;
      }

      if (score > highestScore && score >= 0.4) {
        highestScore = score;
        bestMission = m;
        matchedSignals = Array.from(cartSubcats).filter(
          (sub) => m.requiredSubcategories.includes(sub) || m.optionalSubcategories.includes(sub)
        );
      }
    }

    if (!bestMission) {
      return {
        mission: null,
        displayName: 'General Grocery',
        confidence: 0.2,
        icon: '🛒',
        matchedSignals: [],
      };
    }

    return {
      mission: bestMission.key,
      displayName: bestMission.displayName,
      confidence: Math.min(0.98, Number(highestScore.toFixed(2))),
      icon: bestMission.icon,
      matchedSignals: matchedSignals.map((s) => `Matched category: ${s}`),
    };
  }

  static getMissionCompletion(cartId?: string | null) {
    const detection = this.detectMission(cartId);
    if (!detection.mission) {
      return { completionPercentage: 0, missingSlots: [], suggestedItems: [], mission: null };
    }

    const missionDef = MOCK_MISSIONS.find((m) => m.key === detection.mission);
    if (!missionDef) return { completionPercentage: 0, missingSlots: [], suggestedItems: [], mission: null };

    const cart = this.getCart(cartId);
    const cartSubcats = new Set(cart.items.map((i) => i.product.subcategory));

    const missingReq = missionDef.requiredSubcategories.filter((sub) => !cartSubcats.has(sub));
    const missingOpt = missionDef.optionalSubcategories.filter((sub) => !cartSubcats.has(sub));

    const totalSubcats = missionDef.requiredSubcategories.length + Math.min(2, missionDef.optionalSubcategories.length);
    const fulfilledCount = totalSubcats - (missingReq.length + Math.min(1, missingOpt.length));

    const completionPercentage = Math.min(100, Math.max(25, Math.round((fulfilledCount / totalSubcats) * 100)));

    // Find suggested 1-tap add items matching missing subcategories
    const missingTargets = [...missingReq, ...missingOpt];
    const suggestedItems = MOCK_PRODUCTS.filter(
      (p) => missingTargets.includes(p.subcategory) && !cart.items.some((i) => i.productId === p.id)
    ).slice(0, 3);

    return {
      completionPercentage,
      missingSlots: missingTargets,
      suggestedItems,
      mission: {
        key: missionDef.key,
        displayName: missionDef.displayName,
        icon: missionDef.icon,
      },
    };
  }

  static getMissionRecommendations(missionKey?: string, cartId?: string | null) {
    const cart = this.getCart(cartId);
    const cartItemIds = new Set(cart.items.map((i) => i.productId));

    let candidates = MOCK_PRODUCTS.filter((p) => !cartItemIds.has(p.id));

    if (missionKey) {
      candidates = candidates.filter((p) => p.missionTags.includes(missionKey));
    }

    return candidates.slice(0, 6);
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
