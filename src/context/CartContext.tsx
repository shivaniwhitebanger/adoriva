import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon, SiteSettings } from '../types/index.ts';
import { api } from '../services/api.ts';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/seedData.ts';

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    selectedVariants?: Record<string, string>,
    personalizationText?: string,
    isGiftWrapped?: boolean
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  toggleItemGiftWrap: (cartItemId: string) => void;
  clearCart: () => void;
  coupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  giftWrapTotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  freeShippingProgress: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('adoriva_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Initial sample item for immediate delight
    const sampleProduct = INITIAL_PRODUCTS[0];
    return [
      {
        id: 'cart-sample-1',
        productId: sampleProduct.id,
        product: sampleProduct,
        quantity: 1,
        selectedVariants: { 'Hamper Size': 'Deluxe Edition (4 items)', 'Ribbon Finish': 'Dusty Rose Silk' },
        personalizationText: 'With all my love, always',
        isGiftWrapped: true,
        unitPrice: sampleProduct.price,
      }
    ];
  });

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('adoriva_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // Recalculate coupon if subtotal changes
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  useEffect(() => {
    if (coupon) {
      if (subtotal < coupon.minOrderValue) {
        setCoupon(null);
        setCouponDiscount(0);
      } else {
        const disc = coupon.discountPercent
          ? (subtotal * coupon.discountPercent) / 100
          : Math.min(coupon.discountAmount || 0, subtotal);
        setCouponDiscount(Math.round(disc * 100) / 100);
      }
    } else {
      setCouponDiscount(0);
    }
  }, [subtotal, coupon]);

  const giftWrapFeePerItem = settings.giftWrappingFee || 4.99;
  const giftWrapTotal = items.reduce(
    (sum, item) => sum + (item.isGiftWrapped ? giftWrapFeePerItem * item.quantity : 0),
    0
  );

  const freeShippingThreshold = settings.freeShippingThreshold || 75;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : settings.standardShippingFee || 9.99;
  const taxRate = settings.taxRate || 0.08;
  const taxableAmount = Math.max(0, subtotal - couponDiscount + giftWrapTotal);
  const tax = Math.round(taxableAmount * taxRate * 100) / 100;
  const total = Math.max(0, Math.round((subtotal - couponDiscount + giftWrapTotal + shippingFee + tax) * 100) / 100);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (
    product: Product,
    quantity: number = 1,
    selectedVariants?: Record<string, string>,
    personalizationText?: string,
    isGiftWrapped: boolean = false
  ) => {
    // calculate unit price with variant deltas if any
    let unitPrice = product.price;
    if (selectedVariants && product.variants) {
      for (const [varName, chosenOption] of Object.entries(selectedVariants)) {
        const foundGroup = product.variants.find(v => v.name === varName);
        if (foundGroup) {
          const opt = foundGroup.options.find(o => o.label === chosenOption);
          if (opt) unitPrice += opt.priceDelta;
        }
      }
    }

    const variantKey = selectedVariants ? JSON.stringify(selectedVariants) : '';
    const existingIndex = items.findIndex(
      item =>
        item.productId === product.id &&
        JSON.stringify(item.selectedVariants || {}) === variantKey &&
        (item.personalizationText || '') === (personalizationText || '') &&
        item.isGiftWrapped === isGiftWrapped
    );

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      setItems(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        product,
        quantity,
        selectedVariants,
        personalizationText,
        isGiftWrapped,
        unitPrice,
      };
      setItems(prev => [newItem, ...prev]);
    }

    setIsCartOpen(true);
  };

  const removeItem = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.id === cartItemId ? { ...i, quantity } : i))
    );
  };

  const toggleItemGiftWrap = (cartItemId: string) => {
    setItems(prev =>
      prev.map(i => (i.id === cartItemId ? { ...i, isGiftWrapped: !i.isGiftWrapped } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setCouponDiscount(0);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.validateCoupon(code, subtotal);
    if (res.valid && res.coupon) {
      setCoupon(res.coupon);
      setCouponDiscount(res.discountAmount);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponDiscount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        toggleItemGiftWrap,
        clearCart,
        coupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        subtotal,
        giftWrapTotal,
        shippingFee,
        tax,
        total,
        freeShippingThreshold,
        amountNeededForFreeShipping,
        freeShippingProgress,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
