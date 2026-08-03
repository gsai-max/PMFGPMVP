import { create } from 'zustand';
import { api } from '../lib/api';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    mrp: number;
    unit: string;
    imageUrl: string;
    subcategory: string;
    missionTags: string[];
  };
}

export interface DetectedMission {
  mission: string | null;
  displayName: string;
  confidence: number;
  icon: string;
  matchedSignals: string[];
}

export interface MissionCompletion {
  completionPercentage: number;
  missingSlots: string[];
  suggestedItems: any[];
  mission: any;
}

interface CartState {
  cartId: string | null;
  items: CartItem[];
  isCartOpen: boolean;
  discountAmount: number;
  appliedCoupon: string | null;
  detectedMission: DetectedMission | null;
  missionCompletion: MissionCompletion | null;
  
  // Actions
  toggleCart: (open?: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  refreshMissionData: () => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartId: null,
  items: [],
  isCartOpen: false,
  discountAmount: 0,
  appliedCoupon: null,
  detectedMission: null,
  missionCompletion: null,

  toggleCart: (open) => set((state) => ({ isCartOpen: open !== undefined ? open : !state.isCartOpen })),

  fetchCart: async () => {
    try {
      let savedCartId = typeof window !== 'undefined' ? localStorage.getItem('blinkclone_cart_id') : null;
      const res = await api.get('/cart', { params: { cartId: savedCartId } });
      const cart = res.data;
      if (cart?.id) {
        if (typeof window !== 'undefined') localStorage.setItem('blinkclone_cart_id', cart.id);
        set({ cartId: cart.id, items: cart.items || [] });
        get().refreshMissionData();
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  },

  addItem: async (productId: string, quantity = 1) => {
    try {
      const { cartId } = get();
      const res = await api.post('/cart/items', { cartId, productId, quantity });
      const cart = res.data;
      if (cart?.id) {
        if (typeof window !== 'undefined') localStorage.setItem('blinkclone_cart_id', cart.id);
        set({ cartId: cart.id, items: cart.items || [] });
        get().refreshMissionData();
      }
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    try {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity });
      const cart = res.data;
      if (cart?.id) {
        set({ cartId: cart.id, items: cart.items || [] });
        get().refreshMissionData();
      } else {
        await get().fetchCart();
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  },

  applyCoupon: async (code: string) => {
    const subtotal = get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const res = await api.post('/cart/apply-coupon', { code, cartTotal: subtotal });
    set({ discountAmount: res.data.discountAmount, appliedCoupon: code });
  },

  refreshMissionData: async () => {
    const { cartId } = get();
    try {
      const [detectRes, completionRes] = await Promise.all([
        api.get('/mission/detect', { params: { cartId } }),
        api.get('/mission/completion', { params: { cartId } }),
      ]);

      set({
        detectedMission: detectRes.data,
        missionCompletion: completionRes.data,
      });
    } catch (err) {
      console.error('Failed to refresh mission data:', err);
    }
  },

  clearCart: () => {
    set({ cartId: null, items: [], discountAmount: 0, appliedCoupon: null, detectedMission: null, missionCompletion: null });
  },
}));
