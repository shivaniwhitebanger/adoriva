import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Gift,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Order, ShippingAddress } from '../types/index.ts';

interface CheckoutViewProps {
  onOrderSuccess: (order: Order) => void;
  onBackToCart: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onOrderSuccess,
  onBackToCart,
}) => {
  const { items, subtotal, couponDiscount, coupon, giftWrapTotal, shippingFee, tax, total, clearCart } =
    useCart();
  const { user } = useAuth();

  const [contact, setContact] = useState({
    fullName: user?.name || 'Shivani Verma',
    email: user?.email || 'demo@adoriva.com',
    phone: user?.phone || '+1 (555) 876-5432',
  });

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.name || 'Shivani Verma',
    phone: user?.phone || '+1 (555) 876-5432',
    street: '742 Evergreen Terrace',
    apartment: 'Suite 4B',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 'United States',
  });

  const [deliverySlot, setDeliverySlot] = useState('Standard Priority (2-3 Business Days)');
  const [giftCardMessage, setGiftCardMessage] = useState(
    'Wishing you endless moments of happiness, wonder, and joy!'
  );
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Stripe' | 'Razorpay' | 'UPI' | 'COD'>('Card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-[#F5F1EE] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-2xl text-[#483A38] mb-3">Your shopping bag is empty</h2>
        <button
          onClick={onBackToCart}
          className="bg-[#C49A9C] text-[#483A38] text-xs font-semibold px-6 py-2.5 uppercase"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.email || !address.street || !address.city) {
      setErrorMessage('Please fill in all essential shipping and contact details.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customer: contact,
        shippingAddress: address,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.product.name,
          productImage: i.product.images[0],
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          selectedVariants: i.selectedVariants,
          personalizationText: i.personalizationText,
          isGiftWrapped: i.isGiftWrapped,
        })),
        subtotal,
        couponDiscount,
        couponCode: coupon?.code,
        giftWrapCost: giftWrapTotal,
        shippingCost: shippingFee,
        tax,
        total,
        paymentMethod,
        giftMessage: giftCardMessage,
        deliverySlot,
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();
      onOrderSuccess(createdOrder);
    } catch {
      setErrorMessage('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1EE] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-6 mb-8 border-b border-[#E3C5C7] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9A8582]">
              SECURE CHECKOUT
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#483A38] mt-1">
              Finalize Your Cherished Gift
            </h1>
          </div>
          <button
            onClick={onBackToCart}
            className="text-xs text-[#9A8582] hover:text-[#483A38] underline"
          >
            ← Back to Bag
          </button>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Contact Information */}
              <div className="bg-white p-6 rounded-xl border border-[#E3C5C7] shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E3C5C7]">
                  <span className="w-5 h-5 rounded-full bg-[#483A38] text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <h3 className="font-serif text-lg text-[#483A38]">Contact Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-[#483A38] block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contact.fullName}
                      onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                      className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded p-2.5 text-xs text-[#483A38] outline-none focus:border-[#C49A9C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#483A38] block mb-1">
                      Email for Order Receipt
                    </label>
                    <input
                      type="email"
                      required
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded p-2.5 text-xs text-[#483A38] outline-none focus:border-[#C49A9C]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[#483A38] block mb-1">
                      Phone Number (for courier SMS updates)
                    </label>
                    <input
                      type="tel"
                      required
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded p-2.5 text-xs text-[#483A38] outline-none focus:border-[#C49A9C]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="bg-white p-6 rounded-xl border border-[#E3C5C7] shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E3C5C7]">
                  <span className="w-5 h-5 rounded-full bg-[#483A38] text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <h3 className="font-serif text-lg text-[#483A38]">Shipping Destination</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[#483A38] block mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded p-2.5 text-xs text-[#483A38] outline-none focus:border-[#C49A9C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#483A38] block mb-1">
                      Apt, Suite, Floor (Optional)
                    </label>
                    <input
                      type="text"
                      value={address.apartment}
                      onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                      className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded p-2.5 text-xs text-[#483A38] outline-none focus:border-[#C49A9C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#483A38] block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded p-2.5 text-xs text-[#483A38] outline-none focus:border-[#C49A9C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#483A38] block mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded p-2.5 text-xs text-[#483A38] outline-none focus:border-[#C49A9C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#483A38] block mb-1">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded p-2.5 text-xs text-[#483A38] outline-none focus:border-[#C49A9C]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Delivery Method & Gift Note */}
              <div className="bg-white p-6 rounded-xl border border-[#E3C5C7] shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E3C5C7]">
                  <span className="w-5 h-5 rounded-full bg-[#483A38] text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <h3 className="font-serif text-lg text-[#483A38]">Delivery Speed & Gift Card Note</h3>
                </div>

                <div className="space-y-3 mb-5">
                  {[
                    { label: 'Standard Priority (2-3 Business Days)', cost: 'Included' },
                    { label: 'Next-Day White Glove Courier Delivery', cost: '+₹14.00' },
                    { label: 'Specific Weekend Date Delivery', cost: '+₹9.00' },
                  ].map((speed) => (
                    <label
                      key={speed.label}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                        deliverySlot === speed.label
                          ? 'border-[#C49A9C] bg-[#C49A9C]/20'
                          : 'border-[#E3C5C7] bg-[#F5F1EE]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="deliverySpeed"
                          checked={deliverySlot === speed.label}
                          onChange={() => setDeliverySlot(speed.label)}
                          className="accent-[#C49A9C]"
                        />
                        <span className="text-xs font-medium text-[#483A38]">{speed.label}</span>
                      </div>
                      <span className="text-xs text-[#9A8582] font-semibold">{speed.cost}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#483A38] block mb-1">
                    Complimentary Gold-Lettered Handwritten Greeting Note:
                  </label>
                  <textarea
                    rows={2}
                    value={giftCardMessage}
                    onChange={(e) => setGiftCardMessage(e.target.value)}
                    placeholder="Enter message for the recipient..."
                    className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded p-2.5 text-xs text-[#483A38] outline-none focus:border-[#C49A9C]"
                  />
                </div>
              </div>

              {/* 4. Payment Gateway */}
              <div className="bg-white p-6 rounded-xl border border-[#E3C5C7] shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E3C5C7]">
                  <span className="w-5 h-5 rounded-full bg-[#483A38] text-white text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  <h3 className="font-serif text-lg text-[#483A38]">Payment Method</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    { id: 'Card', label: 'Credit Card' },
                    { id: 'Stripe', label: 'Stripe Direct' },
                    { id: 'Razorpay', label: 'Razorpay' },
                    { id: 'UPI', label: 'UPI / NetBanking' },
                  ].map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-3 text-xs font-semibold rounded border text-center transition ${
                        paymentMethod === method.id
                          ? 'border-[#483A38] bg-[#483A38] text-white'
                          : 'border-[#E3C5C7] bg-[#F5F1EE] text-[#483A38] hover:border-[#C49A9C]'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>

                {/* Simulated payment inputs with card simulation */}
                <div className="bg-[#F5F1EE] p-4 rounded-lg border border-[#E3C5C7] space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#9A8582]">
                    <span className="flex items-center gap-1.5 text-[#483A38] font-medium">
                      <Lock size={13} className="text-[#C49A9C]" />
                      Verified 256-Bit Test Mode Active
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Sandbox Ready
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-[#9A8582] block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-[#E3C5C7] rounded p-2 text-xs text-[#483A38] font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[#9A8582] block mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-[#E3C5C7] rounded p-2 text-xs text-[#483A38] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[#9A8582] block mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-white border border-[#E3C5C7] rounded p-2 text-xs text-[#483A38] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-xl border border-[#E3C5C7] shadow-xs space-y-4 sticky top-24">
                <h3 className="font-serif text-lg text-[#483A38] pb-3 border-b border-[#E3C5C7]">
                  Bag Breakdown ({items.length} items)
                </h3>

                {/* Items preview list */}
                <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-xs items-center">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-14 object-cover rounded bg-[#F5F1EE] border border-[#E3C5C7]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-medium text-[#483A38] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[#9A8582]">Qty: {item.quantity}</p>
                        {item.personalizationText && (
                          <p className="text-[10px] text-[#D4AF7C] truncate">
                            Note: {item.personalizationText}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-[#483A38]">
                        ₹{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="space-y-2 text-xs text-[#9A8582] pt-3 border-t border-[#E3C5C7]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#483A38] font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Promo Discount ({coupon?.code})</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {giftWrapTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Signature Gift Packaging</span>
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
                    <span>Estimated Sales Tax</span>
                    <span className="text-[#483A38] font-semibold">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-serif text-[#483A38] pt-3 border-t border-[#E3C5C7]">
                    <span>Total Due</span>
                    <span className="font-sans font-bold">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#C49A9C] hover:bg-[#B38385] text-[#483A38] text-xs font-semibold uppercase tracking-[0.2em] py-4 shadow-sm hover:shadow-md btn-luxury-shimmer active:scale-[0.98] transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? 'Authenticating Order...' : `PLACE ORDER • ₹${total.toFixed(2)}`}
                </button>

                <div className="text-center text-[10px] text-[#9A8582] pt-1">
                  By clicking Place Order, you agree to Adoriva Maison’s Terms of Gifting and Return Policy.
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
