import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Gift, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { Product } from '../types/index.ts';

interface CartViewProps {
  onNavigateToCheckout: () => void;
  onNavigateToShop: () => void;
  onSelectProduct: (product: Product) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  onNavigateToCheckout,
  onNavigateToShop,
  onSelectProduct,
}) => {
  const {
    items,
    removeItem,
    updateQuantity,
    toggleItemGiftWrap,
    subtotal,
    giftWrapTotal,
    shippingFee,
    couponDiscount,
    coupon,
    applyCoupon,
    removeCoupon,
    total,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    freeShippingProgress,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    const res = await applyCoupon(couponCode.trim());
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponCode('');
    } else {
      setCouponError(res.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F5F1EE] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#C49A9C]/40 flex items-center justify-center mb-4 text-[#C49A9C]">
          <ShoppingBag size={32} />
        </div>
        <h1 className="font-serif text-3xl text-[#483A38] mb-2">Your Shopping Bag is Empty</h1>
        <p className="text-xs sm:text-sm text-[#9A8582] max-w-sm mb-6 font-light">
          Your gifting journey begins here. Explore our signature hampers, custom jewelry, and botanical keepsakes.
        </p>
        <button
          onClick={onNavigateToShop}
          className="bg-[#C49A9C] hover:bg-[#B38385] text-[#483A38] text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 shadow-sm transition"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EE] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-6 mb-8 border-b border-[#E3C5C7]">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#483A38]">
            Your Shopping Bag
          </h1>
          <p className="text-xs text-[#9A8582] mt-1">
            Review your handcrafted gifts before proceeding to our secure checkout.
          </p>
        </div>

        {/* Free Shipping Progress bar */}
        <div className="bg-white p-4 rounded-xl border border-[#E3C5C7] mb-8 max-w-2xl">
          <div className="flex justify-between text-xs text-[#483A38] font-medium mb-1.5">
            <span>
              {amountNeededForFreeShipping > 0
                ? `Add ₹${amountNeededForFreeShipping.toFixed(2)} more for complimentary luxury shipping!`
                : '🎉 You have qualified for FREE Luxury Delivery!'}
            </span>
            <span>{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-[#C49A9C]/40 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#C49A9C] h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items Table (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl border border-[#E3C5C7] shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    onClick={() => onSelectProduct(item.product)}
                    className="w-20 h-24 object-cover rounded bg-[#F5F1EE] border border-[#E3C5C7] cursor-pointer"
                  />
                  <div>
                    <h3
                      onClick={() => onSelectProduct(item.product)}
                      className="font-serif text-base text-[#483A38] hover:text-[#C49A9C] transition cursor-pointer"
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-[#9A8582]">₹{item.unitPrice.toFixed(2)} each</p>

                    {item.selectedVariants && (
                      <div className="text-[11px] text-[#9A8582] mt-1 space-x-1">
                        {Object.entries(item.selectedVariants).map(([k, v]) => (
                          <span key={k}>
                            {k}: <strong>{v}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    {item.personalizationText && (
                      <p className="text-[11px] text-[#D4AF7C] mt-1 bg-[#F5F1EE] px-2 py-0.5 rounded border border-[#E3C5C7] inline-block">
                        Custom Note: &ldquo;{item.personalizationText}&rdquo;
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2 text-xs text-[#9A8582]">
                      <input
                        type="checkbox"
                        id={`cart-view-wrap-${item.id}`}
                        checked={item.isGiftWrapped}
                        onChange={() => toggleItemGiftWrap(item.id)}
                        className="rounded text-[#C49A9C]"
                      />
                      <label htmlFor={`cart-view-wrap-${item.id}`} className="cursor-pointer flex items-center gap-1">
                        <Gift size={12} className="text-[#C49A9C]" />
                        Signature Gift Box (+₹4.99)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E3C5C7]">
                  <div className="flex items-center border border-[#E3C5C7] rounded bg-[#F5F1EE]">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-[#483A38] hover:bg-[#E3C5C7]/50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#483A38]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-[#483A38] hover:bg-[#E3C5C7]/50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-[#483A38]">
                    ₹{(item.unitPrice * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-xl border border-[#E3C5C7] shadow-xs space-y-4 sticky top-24">
              <h3 className="font-serif text-lg text-[#483A38] pb-3 border-b border-[#E3C5C7]">
                Order Summary
              </h3>

              {/* Coupon Form */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between bg-[#C49A9C]/30 p-2.5 rounded text-xs">
                    <span className="text-[#483A38]">
                      Coupon <strong>{coupon.code}</strong> applied
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-red-700 underline text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. WELCOME10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#F5F1EE] border border-[#E3C5C7] p-2 text-xs text-[#483A38] uppercase outline-none focus:border-[#C49A9C]"
                    />
                    <button
                      type="submit"
                      className="bg-[#483A38] text-white text-xs font-semibold px-4 py-2 hover:bg-[#C49A9C] hover:text-[#483A38] transition"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-700 mt-1">{couponSuccess}</p>}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-[#9A8582] pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#483A38] font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {giftWrapTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Gift Packaging</span>
                    <span className="text-[#483A38] font-semibold">₹{giftWrapTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#483A38] font-semibold">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-[#483A38] font-semibold">
                    ₹{((subtotal - couponDiscount + giftWrapTotal) * 0.08).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif text-[#483A38] pt-3 border-t border-[#E3C5C7]">
                  <span>Total Amount</span>
                  <span className="font-sans font-bold">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={onNavigateToCheckout}
                className="w-full bg-[#C49A9C] hover:bg-[#B38385] text-[#483A38] text-xs font-semibold uppercase tracking-[0.15em] py-3.5 flex items-center justify-center gap-2 shadow-sm hover:shadow-md btn-luxury-shimmer active:scale-[0.98] transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#9A8582] pt-2">
                <ShieldCheck size={13} className="text-[#C49A9C]" />
                <span>SSL 256-bit encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
