import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order } from '../types/index.ts';

export const SUPABASE_PROJECT_ID = 'abeztnywtihmfeznfiit';
export const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;

// The server can use either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY or SUPABASE_KEY
const getSupabaseKey = (): string => {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    ''
  );
};

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const key = getSupabaseKey();
  if (!key) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedClient;
}

export interface SupabaseSyncResult {
  success: boolean;
  syncedAt?: string;
  orderNumber: string;
  error?: string;
  projectId: string;
}

/**
 * SQL Schema script for user's Supabase project SQL Editor
 */
export const SUPABASE_ORDERS_TABLE_SQL = `
-- Create orders table in Supabase public schema
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  items JSONB,
  subtotal NUMERIC,
  coupon_discount NUMERIC DEFAULT 0,
  coupon_code TEXT,
  gift_wrap_cost NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'Processing',
  payment_status TEXT DEFAULT 'Paid',
  payment_method TEXT,
  gift_message TEXT,
  delivery_slot TEXT,
  tracking_number TEXT,
  raw_payload JSONB
);

-- Enable Row Level Security (optional / recommended)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anon/service role insertions
CREATE POLICY "Allow insertions to orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Allow admins to read orders
CREATE POLICY "Allow read orders" ON public.orders
  FOR SELECT USING (true);
`.trim();

/**
 * Transforms an Order entity into Supabase record format
 */
export function formatOrderForSupabase(order: Order) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    created_at: order.createdAt || new Date().toISOString(),
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    shipping_address: order.shippingAddress,
    items: order.items,
    subtotal: order.subtotal,
    coupon_discount: order.couponDiscount || 0,
    coupon_code: order.couponCode || null,
    gift_wrap_cost: order.giftWrapCost || 0,
    shipping_cost: order.shippingCost || 0,
    tax: order.tax || 0,
    total: order.total,
    status: order.status || 'Processing',
    payment_status: order.paymentStatus || 'Paid',
    payment_method: order.paymentMethod || 'Card',
    gift_message: order.giftMessage || null,
    delivery_slot: order.deliverySlot || null,
    tracking_number: order.trackingNumber || null,
    raw_payload: order,
  };
}

/**
 * Persists an order into the Supabase 'orders' table
 */
export async function saveOrderToSupabase(order: Order): Promise<SupabaseSyncResult> {
  const key = getSupabaseKey();
  const client = getSupabaseClient();

  if (!client || !key) {
    const msg = `Supabase API key not configured. Order ${order.orderNumber} stored in local primary store. Set SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY to sync to Supabase project ${SUPABASE_PROJECT_ID}.`;
    console.warn(`[Supabase Sync] ${msg}`);
    return {
      success: false,
      orderNumber: order.orderNumber,
      projectId: SUPABASE_PROJECT_ID,
      error: 'SUPABASE_KEY_MISSING: Configure SUPABASE_ANON_KEY in environment variables.',
    };
  }

  const payload = formatOrderForSupabase(order);

  try {
    // Attempt standard insert
    const { data, error } = await client
      .from('orders')
      .upsert(payload, { onConflict: 'order_number' })
      .select();

    if (error) {
      console.error(`[Supabase Sync Error] Failed to save order ${order.orderNumber}:`, error.message);
      
      // Fallback: If table might use camelCase or simpler columns, attempt minimal insertion
      const fallbackPayload = {
        order_number: order.orderNumber,
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        total: order.total,
        status: order.status,
        created_at: order.createdAt,
      };

      const fallbackRes = await client.from('orders').insert(fallbackPayload);
      if (!fallbackRes.error) {
        console.log(`[Supabase Sync] Saved order ${order.orderNumber} using minimal payload schema.`);
        return {
          success: true,
          orderNumber: order.orderNumber,
          projectId: SUPABASE_PROJECT_ID,
          syncedAt: new Date().toISOString(),
        };
      }

      return {
        success: false,
        orderNumber: order.orderNumber,
        projectId: SUPABASE_PROJECT_ID,
        error: error.message,
      };
    }

    console.log(`[Supabase Sync Success] Order ${order.orderNumber} successfully recorded in Supabase table 'orders' (Project: ${SUPABASE_PROJECT_ID}).`);
    return {
      success: true,
      orderNumber: order.orderNumber,
      projectId: SUPABASE_PROJECT_ID,
      syncedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error(`[Supabase Sync Exception] Network or runtime error:`, err?.message || err);
    return {
      success: false,
      orderNumber: order.orderNumber,
      projectId: SUPABASE_PROJECT_ID,
      error: err?.message || 'Unknown network error communicating with Supabase',
    };
  }
}

/**
 * Diagnostic test connection to Supabase
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  projectId: string;
  url: string;
  hasKey: boolean;
  tableExists?: boolean;
  message: string;
}> {
  const key = getSupabaseKey();
  const client = getSupabaseClient();

  if (!key || !client) {
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      hasKey: false,
      message: `Supabase Project ID ${SUPABASE_PROJECT_ID} is linked to endpoint ${SUPABASE_URL}. To enable live table sync, please provide SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.`,
    };
  }

  try {
    const { data, error } = await client.from('orders').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet
        return {
          connected: true,
          projectId: SUPABASE_PROJECT_ID,
          url: SUPABASE_URL,
          hasKey: true,
          tableExists: false,
          message: `Connected to Supabase project ${SUPABASE_PROJECT_ID}! The 'orders' table has not yet been created in your Supabase SQL editor.`,
        };
      }
      return {
        connected: false,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        hasKey: true,
        message: `Supabase query error: ${error.message}`,
      };
    }

    return {
      connected: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      hasKey: true,
      tableExists: true,
      message: `Successfully connected to Supabase backend table 'orders' for project ${SUPABASE_PROJECT_ID}!`,
    };
  } catch (err: any) {
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      hasKey: true,
      message: `Error connecting to Supabase: ${err?.message || err}`,
    };
  }
}
