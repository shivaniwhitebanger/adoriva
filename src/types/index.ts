export interface ProductVariantOption {
  label: string;
  priceDelta: number;
  sku?: string;
}

export interface ProductVariant {
  name: string;
  options: ProductVariantOption[];
}

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  occasion?: string;
  recipient?: string;
  stock: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isPersonalized?: boolean;
  personalizationPrompt?: string;
  variants?: ProductVariant[];
  tags: string[];
  features?: string[];
  dimensions?: string;
  materials?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  featured?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
  personalizationText?: string;
  isGiftWrapped?: boolean;
  giftWrapNote?: string;
  unitPrice: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  selectedVariants?: Record<string, string>;
  personalizationText?: string;
  isGiftWrapped?: boolean;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  couponDiscount: number;
  couponCode?: string;
  giftWrapCost: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'Card' | 'Razorpay' | 'Stripe' | 'UPI' | 'COD';
  giftMessage?: string;
  deliverySlot?: string;
  trackingNumber?: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue: number;
  description: string;
  active: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  savedAddresses?: ShippingAddress[];
}

export interface AnnouncementSettings {
  text: string;
  linkText: string;
  linkHref: string;
  enabled: boolean;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image: string;
  tagLabel?: string;
  tagPrice?: string;
}

export interface PromoBanner {
  badge: string;
  title: string;
  description: string;
  cta: string;
  link: string;
  image: string;
  bgColor: string;
  textColor: string;
}

export interface SiteSettings {
  announcement: AnnouncementSettings;
  heroSlides: HeroSlide[];
  promoOne: PromoBanner;
  promoTwo: PromoBanner;
  freeShippingThreshold: number;
  standardShippingFee: number;
  giftWrappingFee: number;
  taxRate: number;
  currencySymbol: string;
  currencyCode: string;
}
