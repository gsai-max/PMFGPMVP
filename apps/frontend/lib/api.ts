import axios from 'axios';
import { MockEngine } from './mockEngine';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000, // 3s timeout before fallback to instant mock engine
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('blinkclone_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Resilient API Wrapper with Client-Side Fallback Engine
export const api = {
  get: async (url: string, config?: any): Promise<{ data: any }> => {
    try {
      const response = await axiosInstance.get(url, config);
      return response;
    } catch (error) {
      // Handle transparent route matching to MockEngine
      const data = handleMockRoute('GET', url, undefined, config?.params);
      return { data };
    }
  },

  post: async (url: string, data?: any, config?: any): Promise<{ data: any }> => {
    try {
      const response = await axiosInstance.post(url, data, config);
      return response;
    } catch (error: any) {
      // Special check for coupon validation error handling
      if (url.includes('/cart/apply-coupon') && error.response?.data?.error) {
        throw error;
      }
      try {
        const mockData = handleMockRoute('POST', url, data, config?.params);
        return { data: mockData };
      } catch (err) {
        throw err;
      }
    }
  },

  patch: async (url: string, data?: any, config?: any): Promise<{ data: any }> => {
    try {
      const response = await axiosInstance.patch(url, data, config);
      return response;
    } catch (error) {
      const mockData = handleMockRoute('PATCH', url, data, config?.params);
      return { data: mockData };
    }
  },

  delete: async (url: string, config?: any): Promise<{ data: any }> => {
    try {
      const response = await axiosInstance.delete(url, config);
      return response;
    } catch (error) {
      const data = handleMockRoute('DELETE', url, undefined, config?.params);
      return { data };
    }
  },
};

function handleMockRoute(method: string, url: string, payload?: any, params?: any): any {
  const cleanUrl = url.split('?')[0];
  const urlParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');

  const q = params?.q || urlParams.get('q');
  const category = params?.category || urlParams.get('category');
  const subcategory = params?.subcategory || urlParams.get('subcategory');
  const sort = params?.sort || urlParams.get('sort');
  const limit = params?.limit || urlParams.get('limit');
  const cartId = params?.cartId || urlParams.get('cartId') || payload?.cartId;
  const mission = params?.mission || urlParams.get('mission');

  // Categories
  if (cleanUrl === '/categories' && method === 'GET') {
    return MockEngine.getCategories();
  }

  // Products
  if (cleanUrl === '/products' && method === 'GET') {
    return MockEngine.getProducts({ q, category, subcategory, sort, limit: limit ? Number(limit) : undefined });
  }

  if (cleanUrl.startsWith('/products/') && method === 'GET') {
    const id = cleanUrl.replace('/products/', '');
    return MockEngine.getProductById(id);
  }

  // Cart
  if (cleanUrl === '/cart' && method === 'GET') {
    return MockEngine.getCart(cartId);
  }

  if (cleanUrl === '/cart/items' && method === 'POST') {
    return MockEngine.addItem(payload.productId, payload.quantity);
  }

  if (cleanUrl.startsWith('/cart/items/') && method === 'PATCH') {
    const itemId = cleanUrl.replace('/cart/items/', '');
    return MockEngine.updateQuantity(itemId, payload.quantity);
  }

  if (cleanUrl === '/cart/apply-coupon' && method === 'POST') {
    return MockEngine.applyCoupon(payload.code, payload.cartTotal);
  }

  // AI Mission Intelligence
  if (cleanUrl === '/mission/detect' && method === 'GET') {
    return MockEngine.detectMission(cartId);
  }

  if (cleanUrl === '/mission/completion' && method === 'GET') {
    return MockEngine.getMissionCompletion(cartId);
  }

  if (cleanUrl === '/mission/recommendations' && method === 'GET') {
    return MockEngine.getMissionRecommendations(mission, cartId);
  }

  // Events logging
  if (cleanUrl === '/events/log' && method === 'POST') {
    return { status: 'logged' };
  }

  // Orders
  if (cleanUrl === '/orders' && method === 'POST') {
    return MockEngine.createOrder(payload.cartId, payload.address, payload.discountAmount);
  }

  if (cleanUrl === '/orders' && method === 'GET') {
    return MockEngine.getOrders();
  }

  if (cleanUrl.startsWith('/orders/') && method === 'GET') {
    const id = cleanUrl.replace('/orders/', '');
    return MockEngine.getOrderById(id);
  }

  return {};
}
