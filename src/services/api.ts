import { Product, Category, Coupon, SiteSettings, User, Order, Review } from '../types/index.ts';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_ORDERS
} from '../data/seedData.ts';

// Helper for local caching/fallback
const STORAGE_PREFIX = 'adoriva_';
const ADMIN_TOKEN_KEY = 'adoriva_admin_bearer_token';

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage error', e);
  }
}

// Token management for secure Administrator operations
export const getAdminToken = (): string | null => {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAdminToken = (token: string | null, remember = false): void => {
  try {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      if (remember) {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
      }
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Token storage error', e);
  }
};

const getAdminHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAdminToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // ADMIN AUTHENTICATION
  async adminLogin(email: string, password: string, remember = false): Promise<{
    success: boolean;
    token?: string;
    admin?: { id: string; name: string; email: string; role: 'admin' };
    error?: string;
  }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAdminToken(data.token, remember);
        return { success: true, token: data.token, admin: data.admin };
      }
      return { success: false, error: data.error || 'Invalid administrator credentials.' };
    } catch {
      return { success: false, error: 'Unable to communicate with the authentication server.' };
    }
  },

  async adminVerify(): Promise<{
    valid: boolean;
    admin?: { id: string; name: string; email: string; role: 'admin' };
  }> {
    const token = getAdminToken();
    if (!token) return { valid: false };
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'GET',
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return { valid: true, admin: data.admin };
      }
      setAdminToken(null);
      return { valid: false };
    } catch {
      return { valid: false };
    }
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
    } catch {
      // ignore
    } finally {
      setAdminToken(null);
    }
  },

  // PRODUCTS
  async getProducts(params?: {
    category?: string;
    search?: string;
    occasion?: string;
    recipient?: string;
    filter?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.occasion) query.append('occasion', params.occasion);
      if (params?.recipient) query.append('recipient', params.recipient);
      if (params?.filter) query.append('filter', params.filter);
      if (params?.sort) query.append('sort', params.sort);
      if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
      if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());

      const res = await fetch(`/api/products?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch from API');
      const data = await res.json();
      setLocal('cached_products', data);
      return data;
    } catch {
      let list = getLocal<Product[]>('cached_products', INITIAL_PRODUCTS);
      if (params?.category && params.category !== 'all') {
        list = list.filter(p => p.category === params.category);
      }
      if (params?.filter === 'bestseller') {
        list = list.filter(p => p.isBestSeller);
      } else if (params?.filter === 'new') {
        list = list.filter(p => p.isNewArrival);
      } else if (params?.filter === 'sale') {
        list = list.filter(p => p.originalPrice && p.originalPrice > p.price);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      return list;
    }
  },

  async getProductById(idOrSlug: string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${idOrSlug}`);
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    const localProds = getLocal<Product[]>('cached_products', INITIAL_PRODUCTS);
    return localProds.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(product),
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create product');
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(updates),
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update product');
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    if (res.ok) return true;
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete product');
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setLocal('cached_categories', data);
        return data;
      }
    } catch {
      // fallback
    }
    return getLocal<Category[]>('cached_categories', INITIAL_CATEGORIES);
  },

  async createCategory(category: Partial<Category>): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(category),
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create category');
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(updates),
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update category');
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    if (res.ok) return true;
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete category');
  },

  // SETTINGS / CMS
  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setLocal('cached_settings', data);
        return data;
      }
    } catch {
      // fallback
    }
    return getLocal<SiteSettings>('cached_settings', INITIAL_SETTINGS);
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      const data = await res.json();
      setLocal('cached_settings', data);
      return data;
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update store settings');
  },

  // COUPONS
  async getCoupons(): Promise<Coupon[]> {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return getLocal<Coupon[]>('cached_coupons', INITIAL_COUPONS);
  },

  async createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(coupon),
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create coupon');
  },

  async deleteCoupon(code: string): Promise<boolean> {
    const res = await fetch(`/api/coupons/${code}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    if (res.ok) return true;
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete coupon');
  },

  async validateCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    discountAmount: number;
    message: string;
    coupon?: Coupon;
  }> {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      return data;
    } catch {
      const coupons = getLocal<Coupon[]>('cached_coupons', INITIAL_COUPONS);
      const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
      if (!found) return { valid: false, discountAmount: 0, message: 'Invalid coupon code.' };
      if (subtotal < found.minOrderValue) {
        return { valid: false, discountAmount: 0, message: `Min spend ₹${found.minOrderValue} required.` };
      }
      const disc = found.discountPercent ? (subtotal * found.discountPercent) / 100 : (found.discountAmount || 0);
      return { valid: true, discountAmount: disc, message: `Code ${found.code} applied!`, coupon: found };
    }
  },

  // ORDERS
  async getOrders(email?: string): Promise<Order[]> {
    try {
      const url = email ? `/api/orders?email=${encodeURIComponent(email)}` : '/api/orders';
      const headers = email ? {} : getAdminHeaders();
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setLocal('cached_orders', data);
        return data;
      }
    } catch {
      // fallback
    }
    const list = getLocal<Order[]>('cached_orders', INITIAL_ORDERS);
    return email ? list.filter(o => o.customer.email.toLowerCase() === email.toLowerCase()) : list;
  },

  async createOrder(orderData: any): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        const order = await res.json();
        const prev = getLocal<Order[]>('cached_orders', INITIAL_ORDERS);
        setLocal('cached_orders', [order, ...prev]);
        return order;
      }
    } catch {
      // fallback
    }
    const localOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `ADR-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'Processing',
      paymentStatus: 'Paid',
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };
    const prev = getLocal<Order[]>('cached_orders', INITIAL_ORDERS);
    setLocal('cached_orders', [localOrder, ...prev]);
    return localOrder;
  },

  async updateOrderStatus(id: string, updates: { status?: Order['status']; paymentStatus?: Order['paymentStatus']; trackingNumber?: string }): Promise<Order | null> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(updates),
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update order');
  },

  // REVIEWS
  async getReviews(productId: string): Promise<Review[]> {
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return [
      {
        id: 'rev-sample-1',
        productId,
        author: 'Evelyn St. Claire',
        rating: 5,
        title: 'Exquisite presentation',
        comment: 'The gold foil stamping and the delicate silk ribbon made this gift an unforgettable experience.',
        date: '2026-10-01',
        verified: true,
      }
    ];
  },

  async submitReview(review: { productId: string; author: string; rating: number; title: string; comment: string }): Promise<Review> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (res.ok) return await res.json();
    return {
      id: `rev-${Date.now()}`,
      ...review,
      date: new Date().toISOString().split('T')[0],
      verified: true,
    };
  },

  // NEWSLETTER
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch {
      return { success: true, message: 'Thank you for subscribing! Your 10% welcome gift code is WELCOME10.' };
    }
  },

  async getNewsletterSubscribers(): Promise<{ email: string; date: string }[]> {
    const res = await fetch('/api/newsletter', {
      headers: getAdminHeaders(),
    });
    if (res.ok) return await res.json();
    return [];
  },

  // CUSTOMER AUTH
  async login(email: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        user: {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: 'customer',
        }
      };
    }
  },

  // SUPABASE BACKEND
  async getSupabaseStatus(): Promise<{
    connected: boolean;
    projectId: string;
    url: string;
    hasKey: boolean;
    tableExists?: boolean;
    message: string;
    schemaSql?: string;
  }> {
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return {
      connected: false,
      projectId: 'abeztnywtihmfeznfiit',
      url: 'https://abeztnywtihmfeznfiit.supabase.co',
      hasKey: false,
      message: 'Supabase backend endpoint linked.',
    };
  },

  // Fully Automated GitHub Deployment
  async deployToGitHub(
    params: { token: string; repo: string; branch?: string; commitMessage?: string },
    onProgress?: (event: any) => void
  ): Promise<any> {
    const res = await fetch('/api/deploy/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...params, stream: true }),
    });

    if (!res.ok) {
      let errMsg = `Deployment request failed (HTTP ${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson.error) errMsg = errJson.error;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('Streaming not supported in browser');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult: any = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';

      for (const chunk of chunks) {
        const trimmed = chunk.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const event = JSON.parse(trimmed.slice(6));
            if (onProgress) {
              onProgress(event);
            }
            if (event.step === 'completed' && event.details) {
              finalResult = event.details;
            }
            if (event.step === 'error') {
              throw new Error(event.message || 'Deployment failed.');
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) {
              throw e;
            }
          }
        }
      }
    }

    return finalResult || { success: true };
  },
};
