import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_ORDERS
} from './src/data/seedData.ts';
import { Product, Category, Coupon, SiteSettings, User, Order, Review } from './src/types/index.ts';
import {
  saveOrderToSupabase,
  testSupabaseConnection,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_ORDERS_TABLE_SQL
} from './src/services/supabaseBackend.ts';
import { executeGitHubDeployment, ProgressEvent } from './src/services/githubDeployerServer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SECURE BACKEND AUTHENTICATION & RBAC ---
const AUTHORIZED_ADMIN_EMAIL = 'shivani.whitebanger@gmail.com';
const ADMIN_SALT = '940a9579e17c123b5f1f38e047435e93';
const ADMIN_HASH = '67467aa32daef19bfe2b1e1b41245e7d8fd4ae1356b0e56d3362e675e5fda04e56c6467059d42cda7204117ca78b73ee85fe0b38a13c4875935226fe4e8a3833';

interface AdminSession {
  token: string;
  email: string;
  name: string;
  role: 'admin';
  createdAt: number;
  expiresAt: number;
}

const activeAdminSessions = new Map<string, AdminSession>();
const adminLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function verifyAdminCredentials(email?: string, password?: string): boolean {
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') return false;
  if (email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) return false;
  
  const computed = crypto.pbkdf2Sync(password, ADMIN_SALT, 100000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(ADMIN_HASH, 'hex'));
  } catch {
    return false;
  }
}

function isValidAdminToken(authHeader?: string): boolean {
  if (!authHeader) return false;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  const session = activeAdminSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeAdminSessions.delete(token);
    return false;
  }
  return session.role === 'admin' && session.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !isValidAdminToken(authHeader)) {
    res.status(401).json({
      error: 'Access denied: Valid administrator authentication token required.',
      code: 'ADMIN_UNAUTHORIZED'
    });
    return;
  }
  next();
}

// In-memory data store with initialization
let products: Product[] = [...INITIAL_PRODUCTS];
let categories: Category[] = [...INITIAL_CATEGORIES];
let coupons: Coupon[] = [...INITIAL_COUPONS];
let settings: SiteSettings = { ...INITIAL_SETTINGS };
let users: User[] = [...INITIAL_USERS];
let orders: Order[] = [...INITIAL_ORDERS];
let newsletterSubscribers: { email: string; date: string }[] = [
  { email: 'sophia.g@example.com', date: new Date().toISOString() },
  { email: 'marcus.v@example.com', date: new Date().toISOString() }
];

let reviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-her-01',
    author: 'Eleanor Vance',
    rating: 5,
    title: 'Brought tears of joy!',
    comment: 'The presentation was breathtaking. The silk ribbon and custom gold card made my sister feel like royalty on her milestone birthday.',
    date: '2026-09-28',
    verified: true,
  },
  {
    id: 'rev-2',
    productId: 'prod-her-01',
    author: 'David Chen',
    rating: 5,
    title: 'Worth every penny.',
    comment: 'Extremely high quality candle and delicate shortbread. Will definitely be reordering for holiday clients.',
    date: '2026-10-02',
    verified: true,
  },
  {
    id: 'rev-3',
    productId: 'prod-002',
    author: 'Clara Oswald',
    rating: 5,
    title: 'The gold rim is magnificent',
    comment: 'Substantial weight, silky glaze, and the monogram was crisp and elegant. My best friend uses it every morning.',
    date: '2026-09-15',
    verified: true,
  }
];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());
  app.use((req, res, next) => {
    if (req.path.endsWith('.avif')) {
      res.type('image/avif');
    }
    next();
  });

  app.use(express.static(path.resolve(__dirname, 'public')));
  app.use('/images', express.static(path.resolve(__dirname, 'public/images')));
  app.use('/images', express.static(path.resolve(__dirname, 'images')));
  app.use('/images2', express.static(path.resolve(__dirname, 'public/images2')));
  app.use('/images2', express.static(path.resolve(__dirname, 'images2')));

  app.get(['/gifts2.avif', '/images/gifts2.avif'], (_req: Request, res: Response) => {
    res.type('image/avif');
    res.sendFile(path.resolve(__dirname, 'public/gifts2.avif'));
  });

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', brand: 'ADORIVA', time: new Date().toISOString() });
  });

  // PRODUCTS
  app.get('/api/products', (req: Request, res: Response) => {
    const { category, search, occasion, recipient, filter, sort, minPrice, maxPrice } = req.query;
    if (products.some(p => p.id === 'prod-001' || p.id === 'prod-006') || !products.some(p => p.id === 'prod-her-01') || products.length !== INITIAL_PRODUCTS.length) {
      products = [...INITIAL_PRODUCTS];
    }
    let filtered = [...products];

    if (category && typeof category === 'string' && category !== 'all') {
      const catLower = category.toLowerCase();
      filtered = filtered.filter(p => {
        if (p.category.toLowerCase() === catLower) return true;
        if (catLower === 'birthday-gifts') {
          return p.category === 'birthday-gifts' || p.occasion?.toLowerCase() === 'birthday' || p.tags.some(t => t.toLowerCase().includes('birthday'));
        }
        if (catLower === 'gifts-for-her') {
          return p.recipient?.toLowerCase() === 'her' || p.tags.some(t => t.toLowerCase() === 'gifts for her');
        }
        if (catLower === 'gifts-for-him') {
          return p.recipient?.toLowerCase() === 'him' || p.tags.some(t => t.toLowerCase() === 'gifts for him');
        }
        if (catLower === 'personalized-gifts' || catLower === 'customized-gifts') {
          return (
            p.category === 'personalized-gifts' ||
            p.category === 'customized-gifts' ||
            p.isPersonalized ||
            p.tags.some(t => t.toLowerCase().includes('custom') || t.toLowerCase().includes('personal'))
          );
        }
        if (catLower === 'flowers-hampers') {
          return p.tags.some(t => t.toLowerCase().includes('hamper') || t.toLowerCase().includes('flower'));
        }
        return false;
      });
    }

    if (occasion && typeof occasion === 'string' && occasion !== 'all') {
      filtered = filtered.filter(p => p.occasion?.toLowerCase() === occasion.toLowerCase());
    }

    if (recipient && typeof recipient === 'string' && recipient !== 'all') {
      filtered = filtered.filter(p => p.recipient?.toLowerCase() === recipient.toLowerCase());
    }

    if (filter === 'bestseller') {
      filtered = filtered.filter(p => p.isBestSeller);
    } else if (filter === 'new') {
      filtered = filtered.filter(p => p.isNewArrival);
    } else if (filter === 'sale') {
      filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(minPrice as string));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(maxPrice as string));
    }

    if (sort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }

    res.json(filtered);
  });

  app.get('/api/products/:idOrSlug', (req: Request, res: Response) => {
    const param = req.params.idOrSlug;
    const product = products.find(p => p.id === param || p.slug === param);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  });

  // Admin Product CRUD (Protected with requireAdminAuth)
  app.post('/api/products', requireAdminAuth, (req: Request, res: Response) => {
    const data = req.body;
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      rating: data.rating || 5.0,
      reviewCount: data.reviewCount || 0,
      stock: parseInt(data.stock) || 10,
      price: parseFloat(data.price) || 0,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map((t: string) => t.trim()) : ['Luxury', 'Gifting']),
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop'],
    };
    products.unshift(newProduct);
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  });

  app.delete('/api/products/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    products = products.filter(p => p.id !== id);
    res.json({ success: true, message: 'Product deleted' });
  });

  // CATEGORIES
  app.get('/api/categories', (req: Request, res: Response) => {
    const result = categories.map(cat => {
      const initialCat = INITIAL_CATEGORIES.find(c => c.id === cat.id || c.slug === cat.slug);
      let count = initialCat?.itemCount ?? cat.itemCount;
      if (cat.slug === 'birthday-gifts' || cat.id === 'cat-birthday') {
        count = 37;
      }
      if (cat.slug === 'gifts-for-her' || cat.id === 'cat-for-her') {
        count = 36;
      }
      return {
        ...cat,
        itemCount: count,
      };
    });
    res.json(result);
  });

  app.post('/api/categories', requireAdminAuth, (req: Request, res: Response) => {
    const data = req.body;
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      image: data.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      itemCount: 0,
    };
    categories.push(newCategory);
    res.status(201).json(newCategory);
  });

  app.put('/api/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = categories.findIndex(c => c.id === id || c.slug === id);
    if (index === -1) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    categories[index] = { ...categories[index], ...req.body };
    res.json(categories[index]);
  });

  app.delete('/api/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    categories = categories.filter(c => c.id !== id && c.slug !== id);
    res.json({ success: true, message: 'Category deleted' });
  });

  // COUPONS
  app.get('/api/coupons', (req: Request, res: Response) => {
    res.json(coupons);
  });

  app.post('/api/coupons', requireAdminAuth, (req: Request, res: Response) => {
    const newCoupon: Coupon = {
      code: req.body.code.toUpperCase(),
      discountPercent: req.body.discountPercent ? parseFloat(req.body.discountPercent) : undefined,
      discountAmount: req.body.discountAmount ? parseFloat(req.body.discountAmount) : undefined,
      minOrderValue: parseFloat(req.body.minOrderValue) || 0,
      description: req.body.description || 'Special Gift Promotion',
      active: true,
    };
    coupons.push(newCoupon);
    res.status(201).json(newCoupon);
  });

  app.delete('/api/coupons/:code', requireAdminAuth, (req: Request, res: Response) => {
    coupons = coupons.filter(c => c.code !== req.params.code.toUpperCase());
    res.json({ success: true });
  });

  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ valid: false, message: 'Please enter a coupon code.' });
      return;
    }
    const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
    if (!found) {
      res.status(404).json({ valid: false, message: 'Invalid or expired promotional code.' });
      return;
    }
    if (subtotal < found.minOrderValue) {
      res.status(400).json({
        valid: false,
        message: `This coupon requires a minimum subtotal of ₹${found.minOrderValue.toFixed(2)}.`,
      });
      return;
    }

    let discount = 0;
    if (found.discountPercent) {
      discount = (subtotal * found.discountPercent) / 100;
    } else if (found.discountAmount) {
      discount = Math.min(found.discountAmount, subtotal);
    }

    res.json({
      valid: true,
      coupon: found,
      discountAmount: Math.round(discount * 100) / 100,
      message: `Coupon '${found.code}' applied successfully!`,
    });
  });

  // ORDERS
  app.get('/api/orders', (req: Request, res: Response) => {
    const { email } = req.query;
    if (email && typeof email === 'string') {
      res.json(orders.filter(o => o.customer.email.toLowerCase() === email.toLowerCase()));
      return;
    }
    // Viewing all store orders across all patrons is restricted to authorized administrators
    if (!isValidAdminToken(req.headers.authorization)) {
      res.status(401).json({ error: 'Admin authorization required to view all customer orders.' });
      return;
    }
    res.json(orders);
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    const data = req.body;
    const orderNum = `ADR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      customer: data.customer,
      shippingAddress: data.shippingAddress,
      items: data.items,
      subtotal: data.subtotal,
      couponDiscount: data.couponDiscount || 0,
      couponCode: data.couponCode,
      giftWrapCost: data.giftWrapCost || 0,
      shippingCost: data.shippingCost || 0,
      tax: data.tax || 0,
      total: data.total,
      status: 'Processing',
      paymentStatus: 'Paid',
      paymentMethod: data.paymentMethod || 'Card',
      giftMessage: data.giftMessage,
      deliverySlot: data.deliverySlot || 'Standard Delivery (2-3 business days)',
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    // Deduct stock
    for (const item of newOrder.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    orders.unshift(newOrder);

    // Persist order details to Supabase backend table 'orders'
    let supabaseResult = null;
    try {
      supabaseResult = await saveOrderToSupabase(newOrder);
    } catch (err: any) {
      console.error('[Supabase order save error]', err?.message || err);
    }

    res.status(201).json({
      ...newOrder,
      supabaseSync: supabaseResult,
    });
  });

  // SUPABASE BACKEND INTEGRATION ENDPOINTS
  app.get('/api/supabase/status', async (_req: Request, res: Response) => {
    try {
      const status = await testSupabaseConnection();
      res.json({
        ...status,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        schemaSql: SUPABASE_ORDERS_TABLE_SQL,
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Failed to check Supabase status' });
    }
  });

  app.put('/api/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber } = req.body;
    const order = orders.find(o => o.id === id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    res.json(order);
  });

  // SITE SETTINGS
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(settings);
  });

  app.put('/api/settings', requireAdminAuth, (req: Request, res: Response) => {
    settings = { ...settings, ...req.body };
    res.json(settings);
  });

  // REVIEWS
  app.get('/api/reviews/:productId', (req: Request, res: Response) => {
    const { productId } = req.params;
    res.json(reviews.filter(r => r.productId === productId));
  });

  app.post('/api/reviews', (req: Request, res: Response) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: req.body.productId,
      author: req.body.author || 'Anonymous Gifter',
      rating: req.body.rating || 5,
      title: req.body.title || 'Wonderful Experience',
      comment: req.body.comment,
      date: new Date().toISOString().split('T')[0],
      verified: true,
    };
    reviews.unshift(newReview);

    // Update product rating
    const prodReviews = reviews.filter(r => r.productId === newReview.productId);
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const prod = products.find(p => p.id === newReview.productId);
    if (prod) {
      prod.rating = Math.round(avg * 10) / 10;
      prod.reviewCount = prodReviews.length;
    }

    res.status(201).json(newReview);
  });

  // NEWSLETTER (List of subscribers protected for admin only)
  app.get('/api/newsletter', requireAdminAuth, (req: Request, res: Response) => {
    res.json(newsletterSubscribers);
  });

  app.post('/api/newsletter', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    const exists = newsletterSubscribers.some(s => s.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      res.json({ message: 'You are already subscribed to our luxury gifting updates!' });
      return;
    }
    newsletterSubscribers.push({ email, date: new Date().toISOString() });
    res.json({ success: true, message: 'Thank you for subscribing! Your 10% welcome gift code is WELCOME10.' });
  });

  // --- DEDICATED SECURE ADMIN AUTHENTICATION ---
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'ip';
    const now = Date.now();
    const attempts = adminLoginAttempts.get(ip) || { count: 0, lockedUntil: 0 };

    if (attempts.lockedUntil > now) {
      const remainingSeconds = Math.ceil((attempts.lockedUntil - now) / 1000);
      res.status(429).json({
        error: `Too many failed login attempts. Panel is temporarily locked. Please wait ${remainingSeconds} seconds.`,
      });
      return;
    }

    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Administrator email and master password are required.' });
      return;
    }

    if (verifyAdminCredentials(email, password)) {
      adminLoginAttempts.delete(ip);
      const token = `adm_${crypto.randomBytes(32).toString('hex')}`;
      activeAdminSessions.set(token, {
        token,
        email: AUTHORIZED_ADMIN_EMAIL,
        name: 'Shivani Whitebanger',
        role: 'admin',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24-hour validity
      });

      res.json({
        success: true,
        token,
        admin: {
          id: 'admin-shivani',
          name: 'Shivani Whitebanger',
          email: AUTHORIZED_ADMIN_EMAIL,
          role: 'admin',
        },
        message: 'Administrator authentication granted.',
      });
      return;
    }

    // Record failed attempt
    attempts.count += 1;
    if (attempts.count >= 5) {
      attempts.lockedUntil = now + 60 * 1000; // 60s lockout
    }
    adminLoginAttempts.set(ip, attempts);

    res.status(401).json({
      error: 'Invalid administrator credentials. Access to this management portal is restricted solely to the designated owner.',
    });
  });

  app.get('/api/admin/verify', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !isValidAdminToken(authHeader)) {
      res.status(401).json({ valid: false, error: 'Administrator session expired or invalid.' });
      return;
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    const session = activeAdminSessions.get(token);
    res.json({
      valid: true,
      admin: {
        id: 'admin-shivani',
        name: session?.name || 'Shivani Whitebanger',
        email: session?.email || AUTHORIZED_ADMIN_EMAIL,
        role: 'admin',
      },
    });
  });

  app.post('/api/admin/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
      activeAdminSessions.delete(token);
    }
    res.json({ success: true, message: 'Administrator session terminated.' });
  });

  // --- FULLY AUTOMATED GITHUB DEPLOYMENT (Streaming SSE and REST) ---
  app.post('/api/deploy/github', async (req: Request, res: Response) => {
    const { token, repo, branch = 'main', commitMessage, stream = true } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'GitHub Personal Access Token is required.' });
      return;
    }
    if (!repo || typeof repo !== 'string') {
      res.status(400).json({ error: 'Repository Name is required (e.g. "adoriva" or "username/repository-name").' });
      return;
    }

    const sanitize = (str: string) => String(str || '').replace(/ghp_[a-zA-Z0-9]+/g, '[REDACTED_TOKEN]');

    if (stream) {
      // Set Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      if (typeof (res as any).flushHeaders === 'function') {
        (res as any).flushHeaders();
      }

      const sendEvent = (event: ProgressEvent) => {
        try {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        } catch {
          // client disconnected
        }
      };

      try {
        const result = await executeGitHubDeployment(
          {
            token,
            repo,
            branch: branch || 'main',
            commitMessage,
          },
          (progressEvent) => {
            sendEvent(progressEvent);
          }
        );

        sendEvent({
          step: 'completed',
          message: 'Deployment completed successfully!',
          progress: 100,
          details: result,
        });
        res.end();
      } catch (err: any) {
        const safeError = sanitize(err?.message || 'Deployment error');
        sendEvent({
          step: 'error',
          message: safeError,
          progress: 100,
        });
        res.end();
      }
    } else {
      try {
        const result = await executeGitHubDeployment(
          {
            token,
            repo,
            branch: branch || 'main',
            commitMessage,
          },
          () => {}
        );
        res.json(result);
      } catch (err: any) {
        const safeError = sanitize(err?.message || 'Deployment error');
        res.status(500).json({ error: safeError });
      }
    }
  });

  // REGULAR CUSTOMER AUTH (Can NEVER grant admin role)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email.toLowerCase() === email?.toLowerCase());
    
    // Disallow regular login from acting as admin
    if (user && user.role === 'customer' && (password === 'demo' || password.length >= 4)) {
      res.json({
        success: true,
        user,
        token: `cust-token-${user.id}-${Date.now()}`,
      });
      return;
    }

    // Auto-create as customer only
    if (email && email.includes('@')) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: 'customer',
      };
      users.push(newUser);
      res.json({
        success: true,
        user: newUser,
        token: `cust-token-${newUser.id}-${Date.now()}`,
      });
      return;
    }
    res.status(401).json({ error: 'Invalid credentials. Password must be at least 4 characters.' });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, phone } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email required' });
      return;
    }
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.json({ success: true, user: existing });
      return;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name || 'Valued Patron',
      email,
      phone,
      role: 'customer',
      savedAddresses: [],
    };
    users.push(newUser);
    res.status(201).json({ success: true, user: newUser });
  });

  // VITE DEV SERVER OR STATIC IN PROD
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ADORIVA Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
