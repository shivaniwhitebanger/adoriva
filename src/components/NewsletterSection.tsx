import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api.ts';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusMessage({ text: 'Please enter a valid email address.', isError: true });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.subscribeNewsletter(email);
      setStatusMessage({ text: res.message, isError: !res.success });
      if (res.success) {
        setEmail('');
      }
    } catch {
      setStatusMessage({ text: 'Subscription service temporarily offline. Please try again.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-14 sm:py-16 bg-[#E3C5C7] border-b border-[#E3C5C7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Envelope Icon in Ivory & Champagne Gold */}
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#F5F1EE] border border-[#D4AF7C]/40 text-[#D4AF7C] mb-4 shadow-2xs">
          <Mail size={22} className="text-[#D4AF7C]" />
        </div>

        {/* Heading in Mocha Brown */}
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#483A38] tracking-tight mb-2">
          STAY IN THE LOOP
        </h2>

        {/* Short supporting copy */}
        <p className="text-xs sm:text-sm text-[#483A38]/80 max-w-md mx-auto mb-6 font-light">
          Subscribe to receive exclusive access to seasonal launches, artisanal gift guides, and 10% off your inaugural order.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 bg-[#F5F1EE] border border-[#E3C5C7] focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] rounded-none px-4 py-3 text-xs text-[#483A38] placeholder-[#483A38]/50 outline-none transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold uppercase tracking-[0.15em] px-6 py-3 btn-luxury-shimmer active:scale-[0.98] transform hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Subscribing...' : 'SUBSCRIBE'}
          </button>
        </form>

        {/* Feedback message */}
        {statusMessage && (
          <div
            className={`mt-4 inline-flex items-center gap-2 text-xs py-1.5 px-4 rounded-md ${
              statusMessage.isError
                ? 'bg-[#C49A9C]/20 text-[#483A38] border border-[#C49A9C]'
                : 'bg-[#9A8582]/25 text-[#483A38] border border-[#9A8582]'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle size={14} className="text-[#C49A9C]" />
            ) : (
              <CheckCircle2 size={14} className="text-[#9A8582]" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>
    </section>
  );
};
