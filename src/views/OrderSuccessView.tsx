import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, Package, Truck, Calendar, MapPin, ArrowRight, Printer, Sparkles } from 'lucide-react';
import { Order } from '../types/index.ts';

interface OrderSuccessViewProps {
  order: Order;
  onNavigateHome: () => void;
  onNavigateToAccount: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  order,
  onNavigateHome,
  onNavigateToAccount,
}) => {
  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C49A9C', '#C49A9C', '#D4AF7C', '#F5F1EE'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F1EE] py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Celebration Header */}
        <div className="bg-white rounded-2xl border border-[#E3C5C7] shadow-sm p-8 sm:p-10 text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#C49A9C]/50 text-[#483A38] flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[#483A38]" />
          </div>

          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A8582] block mb-1">
            THANK YOU FOR YOUR PATRONAGE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#483A38] mb-3">
            Your Gift Has Been Reverently Reserved
          </h1>
          <p className="text-xs sm:text-sm text-[#9A8582] max-w-lg mx-auto font-light leading-relaxed mb-6">
            We are preparing your handcrafted gift package with our signature ribbon and complimentary gold-lettered card. A confirmation email has been dispatched to{' '}
            <strong className="text-[#483A38]">{order.customer.email}</strong>.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-[#F5F1EE] px-6 py-3 rounded-xl border border-[#E3C5C7] text-xs">
            <div>
              <span className="text-[#9A8582] block text-[10px] uppercase tracking-wider">Order Reference</span>
              <span className="font-mono font-bold text-[#483A38]">{order.orderNumber}</span>
            </div>
            <span className="text-[#E3C5C7]">|</span>
            <div>
              <span className="text-[#9A8582] block text-[10px] uppercase tracking-wider">Tracking Code</span>
              <span className="font-mono font-bold text-[#C49A9C]">{order.trackingNumber}</span>
            </div>
            <span className="text-[#E3C5C7]">|</span>
            <div>
              <span className="text-[#9A8582] block text-[10px] uppercase tracking-wider">Total Amount</span>
              <span className="font-bold text-[#483A38]">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Details Accordion / Summary Card */}
        <div className="bg-white rounded-2xl border border-[#E3C5C7] shadow-sm p-6 sm:p-8 space-y-6 mb-8">
          {/* Timeline tracker */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#483A38] mb-4">
              Gifting Journey
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#483A38] text-white flex items-center justify-center mb-1">
                  ✓
                </div>
                <span className="font-semibold text-[#483A38]">Order Placed</span>
                <span className="text-[10px] text-[#9A8582]">Today</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#C49A9C] text-white flex items-center justify-center mb-1">
                  🎁
                </div>
                <span className="font-semibold text-[#483A38]">Artisan Ribbon Hand-Tie</span>
                <span className="text-[10px] text-[#9A8582]">In Preparation</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#E3C5C7] text-[#9A8582] flex items-center justify-center mb-1">
                  <Truck size={14} />
                </div>
                <span className="text-[#9A8582]">In Transit</span>
                <span className="text-[10px] text-[#9A8582]">Priority Courier</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#E3C5C7] text-[#9A8582] flex items-center justify-center mb-1">
                  ✨
                </div>
                <span className="text-[#9A8582]">Cherished Arrival</span>
                <span className="text-[10px] text-[#9A8582]">At Destination</span>
              </div>
            </div>
          </div>

          {/* Delivery & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#E3C5C7] text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9A8582] block mb-1">
                Recipient Shipping Address
              </span>
              <p className="font-semibold text-[#483A38]">{order.shippingAddress.fullName}</p>
              <p className="text-[#9A8582]">{order.shippingAddress.street}</p>
              {order.shippingAddress.apartment && <p className="text-[#9A8582]">{order.shippingAddress.apartment}</p>}
              <p className="text-[#9A8582]">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-[#9A8582] mt-1">{order.customer.phone}</p>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9A8582] block mb-1">
                Handwritten Card Inscription
              </span>
              <div className="bg-[#F5F1EE] p-3 rounded border border-[#E3C5C7] italic text-[#483A38]">
                &ldquo;{order.giftMessage || 'With heartfelt wishes and affection!'}&rdquo;
              </div>
              <p className="text-[11px] text-[#9A8582] mt-2">
                Speed: <strong>{order.deliverySlot}</strong>
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="pt-6 border-t border-[#E3C5C7]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#483A38] mb-3">
              Included Treasures
            </h4>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-14 object-cover rounded bg-[#F5F1EE]"
                    />
                    <div>
                      <p className="font-serif font-medium text-[#483A38]">{item.productName}</p>
                      <p className="text-[11px] text-[#9A8582]">Qty: {item.quantity}</p>
                      {item.personalizationText && (
                        <p className="text-[10px] text-[#D4AF7C]">
                          Engraving: &ldquo;{item.personalizationText}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-[#483A38]">
                    ₹{(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto bg-[#483A38] hover:bg-[#342726] text-white text-xs font-semibold uppercase tracking-[0.15em] px-8 py-3.5 transition"
          >
            Continue Gifting
          </button>
          <button
            onClick={onNavigateToAccount}
            className="w-full sm:w-auto bg-white hover:bg-[#E3C5C7]/40 border border-[#E3C5C7] text-[#483A38] text-xs font-semibold uppercase tracking-[0.15em] px-8 py-3.5 transition"
          >
            View in My Orders
          </button>
        </div>
      </div>
    </div>
  );
};
