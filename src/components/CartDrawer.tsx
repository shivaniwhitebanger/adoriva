import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, Gift, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToCart: () => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onNavigateToCart,
  onNavigateToShop,
}) => {
  const {
    items,
    isCartOpen,
    closeCart,
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
    amountNeededForFreeShipping,
    freeShippingProgress,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');
    const res = await applyCoupon(couponInput.trim());
    setIsApplying(false);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-[#2A2222]/50 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F5F1EE] shadow-2xl flex flex-col border-l border-[#E3C5C7] animate-slideInRight">
          {/* Header */}
          <div className="p-5 border-b border-[#E3C5C7] flex items-center justify-between bg-[#F5F1EE]">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#483A38]" />
              <h2 className="font-serif text-lg font-normal text-[#483A38] tracking-wide">
                YOUR SHOPPING BAG ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-[#E3C5C7]/60 text-[#483A38] transition-colors"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>

          {/* Free Shipping Progress Bar in Sand Beige & Sage Green */}
          <div className="bg-[#E3C5C7] px-5 py-3 border-b border-[#E3C5C7]">
            <div className="flex items-center justify-between text-xs text-[#483A38] mb-1.5 font-medium">
              <span>
                {amountNeededForFreeShipping > 0
                  ? `Add ₹${amountNeededForFreeShipping.toFixed(2)} more for FREE Luxury Shipping!`
                  : '🎉 Congratulations! You have unlocked FREE Shipping.'}
              </span>
              <span className="text-[10px] text-[#483A38]/75 font-semibold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-[#F5F1EE] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#9A8582] h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#483A38]/70">
                <div className="w-16 h-16 rounded-full bg-[#C49A9C]/40 flex items-center justify-center mb-4 text-[#483A38]">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-serif text-xl text-[#483A38] mb-1">Your bag is empty</h3>
                <p className="text-xs max-w-xs mb-6 font-light text-[#483A38]/80">
                  Explore our curated hampers, personalized ceramics, and everlasting botanical blossoms.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    onNavigateToShop();
                  }}
                  className="bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold uppercase tracking-wider py-3 px-6 transition cursor-pointer shadow-sm"
                >
                  START GIFTING
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 pb-4 border-b border-[#E3C5C7] bg-[#F5F1EE] p-3 rounded-lg border shadow-xs"
                >
                  {/* Image */}
                  <div className="w-20 h-24 rounded overflow-hidden bg-[#F5F1EE] flex-shrink-0 border border-[#E3C5C7]">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif text-sm text-[#483A38] font-medium leading-snug line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#9A8582] hover:text-[#C49A9C] p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Variant options if selected */}
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="text-[10px] text-[#9A8582] mt-0.5 space-x-1">
                          {Object.entries(item.selectedVariants).map(([k, v]) => (
                            <span key={k}>
                              {k}: <strong className="font-medium text-[#483A38]">{v}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Personalization Note */}
                      {item.personalizationText && (
                        <div className="text-[10px] text-[#483A38] bg-[#E3C5C7]/40 p-1 rounded mt-1 border border-[#E3C5C7] line-clamp-1">
                          Bespoke Note: &ldquo;{item.personalizationText}&rdquo;
                        </div>
                      )}

                      {/* Gift wrapping toggle */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#483A38]/80">
                        <input
                          type="checkbox"
                          id={`wrap-${item.id}`}
                          checked={item.isGiftWrapped}
                          onChange={() => toggleItemGiftWrap(item.id)}
                          className="rounded border-[#D4AF7C] text-[#483A38] focus:ring-0 cursor-pointer accent-[#483A38]"
                        />
                        <label htmlFor={`wrap-${item.id}`} className="cursor-pointer flex items-center gap-1 text-[10px]">
                          <Gift size={11} className="text-[#D4AF7C]" />
                          Signature Gift Box (+₹4.99)
                        </label>
                      </div>
                    </div>

                    {/* Quantity & Unit Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E3C5C7]">
                      <div className="flex items-center border border-[#E3C5C7] rounded bg-[#F5F1EE]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#E3C5C7]/40 text-[#483A38]"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#483A38]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#E3C5C7]/40 text-[#483A38]"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-[#483A38]">
                        ₹{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Actions */}
          {items.length > 0 && (
            <div className="p-5 bg-[#F5F1EE] border-t border-[#E3C5C7] space-y-3">
              {/* Coupon Form */}
              <div className="pb-2 border-b border-[#E3C5C7]">
                {coupon ? (
                  <div className="flex items-center justify-between bg-[#9A8582]/20 p-2 rounded text-xs">
                    <div className="flex items-center gap-1.5 text-[#483A38]">
                      <Tag size={13} className="text-[#9A8582]" />
                      <span>Coupon <strong>{coupon.code}</strong> applied</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[#C49A9C] text-[11px] underline font-medium hover:text-[#B38385]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#F5F1EE] border border-[#E3C5C7] px-3 py-1.5 text-xs text-[#483A38] uppercase outline-none focus:border-[#D4AF7C]"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="bg-[#483A38] text-[#F5F1EE] text-[11px] font-semibold uppercase px-3 py-1.5 hover:bg-[#342726] transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[10px] text-[#C49A9C] mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-[#9A8582] mt-1">{couponSuccess}</p>}
              </div>

              {/* Subtotals */}
              <div className="space-y-1 text-xs text-[#483A38]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#483A38] font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#9A8582]">
                    <span>Promotional Discount</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {giftWrapTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Signature Gift Packaging</span>
                    <span className="text-[#483A38] font-medium">₹{giftWrapTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-[#483A38] font-medium">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-serif text-base text-[#483A38] font-normal pt-2 border-t border-[#E3C5C7]">
                  <span>Estimated Total</span>
                  <span className="font-sans font-bold">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons: Mocha Brown */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    closeCart();
                    onNavigateToCheckout();
                  }}
                  className="w-full bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold uppercase tracking-[0.15em] py-3.5 flex items-center justify-center gap-2 shadow-sm hover:shadow-md btn-luxury-shimmer active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <span>CHECKOUT</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                </button>

                <button
                  onClick={() => {
                    closeCart();
                    onNavigateToCart();
                  }}
                  className="w-full bg-transparent hover:bg-[#E3C5C7]/40 border border-[#E3C5C7] hover:border-[#D4AF7C] text-[#483A38] text-xs font-medium uppercase tracking-[0.15em] py-2.5 transition-all active:scale-[0.98] text-center cursor-pointer"
                >
                  VIEW FULL CART
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#483A38]/70 pt-1">
                <ShieldCheck size={12} className="text-[#D4AF7C]" />
                <span>Encrypted checkout & 100% happiness guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
