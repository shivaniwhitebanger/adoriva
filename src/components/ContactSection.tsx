import React, { useState } from 'react';
import { Mail, Check, Copy, MessageSquare, Send, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const emailAddress = 'shivani.whitebanger@gmail.com';
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prefill mailto URL so user can send immediately from their preferred email client
    const subject = encodeURIComponent(
      formData.subject || `Inquiry from ${formData.name || 'Adoriva Visitor'}`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 5000);
  };

  return (
    <section id="contact-us" className="py-16 sm:py-20 bg-[#F5F1EE] border-b border-[#E3C5C7] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF7C] mb-2">
            <Sparkles size={13} />
            <span>Dedicated Maison Concierge</span>
            <Sparkles size={13} />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#483A38] font-normal tracking-tight">
            Contact Us
          </h2>
          <div className="flex items-center justify-center gap-2 my-3">
            <span className="h-[0.5px] w-12 bg-[#D4AF7C]/40" />
            <span className="text-[10px] text-[#D4AF7C]">✦</span>
            <span className="h-[0.5px] w-12 bg-[#D4AF7C]/40" />
          </div>
          <p className="text-xs sm:text-sm text-[#483A38]/80 font-light leading-relaxed">
            Whether you are curating bespoke gift hampers, customizing keepsakes, or inquiring about an existing order, we are always here to assist you personally.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Contact & Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Email Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E3C5C7] shadow-xs relative overflow-hidden group hover:border-[#D4AF7C] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-xl bg-[#F5F1EE] border border-[#D4AF7C]/30 text-[#D4AF7C] shadow-2xs group-hover:scale-110 group-hover:bg-[#483A38] group-hover:text-[#F5F1EE] transition-all duration-300">
                  <Mail size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#9A8582] font-semibold block">
                    Direct Email Support
                  </span>
                  <a
                    href={`mailto:${emailAddress}`}
                    className="text-sm sm:text-base font-serif font-semibold text-[#483A38] hover:text-[#D4AF7C] transition-colors break-all block mt-1 underline underline-offset-4 decoration-[#D4AF7C]/40 hover:decoration-[#D4AF7C] cursor-pointer"
                    title="Click to email directly"
                  >
                    {emailAddress}
                  </a>
                  <p className="text-[11px] text-[#483A38]/70 mt-1.5 font-light">
                    Click to compose an email directly, or use the quick inquiry form.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-[#E3C5C7] flex items-center gap-2.5">
                <a
                  href={`mailto:${emailAddress}`}
                  className="flex-1 bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold py-2.5 px-4 rounded-lg tracking-wider uppercase text-center transition-all duration-300 btn-luxury-shimmer active:scale-[0.98] shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Mail size={13} />
                  <span>Send Email</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-3.5 py-2.5 rounded-lg border border-[#E3C5C7] hover:border-[#D4AF7C] bg-[#F5F1EE] text-[#483A38] hover:text-[#D4AF7C] text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  title="Copy email to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Concierge Promises */}
            <div className="bg-[#E3C5C7]/30 rounded-2xl p-6 border border-[#E3C5C7] space-y-4">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-[#D4AF7C] shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-[#483A38] uppercase tracking-wider">
                    Fast Response Time
                  </h4>
                  <p className="text-[11px] text-[#483A38]/75 font-light">
                    We typically reply within 2 to 4 business hours.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-[#D4AF7C] shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-[#483A38] uppercase tracking-wider">
                    Personalized Attention
                  </h4>
                  <p className="text-[11px] text-[#483A38]/75 font-light">
                    Every message is read and answered personally.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3C5C7] shadow-xs">
              <div className="flex items-center gap-2 mb-2 pb-3 border-b border-[#E3C5C7]">
                <MessageSquare size={18} className="text-[#D4AF7C]" />
                <h3 className="font-serif text-xl text-[#483A38]">
                  Send a Direct Message
                </h3>
              </div>
              <p className="text-xs text-[#483A38]/70 font-light mb-6">
                Fill in your details below and click Send Message to reach{' '}
                <a
                  href={`mailto:${emailAddress}`}
                  className="font-medium text-[#D4AF7C] hover:underline"
                >
                  {emailAddress}
                </a>
                .
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#483A38] block mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-[#F5F1EE] border border-[#E3C5C7] focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] rounded-lg px-3.5 py-2.5 text-xs text-[#483A38] placeholder-[#483A38]/40 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#483A38] block mb-1.5">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. priya@example.com"
                      className="w-full bg-[#F5F1EE] border border-[#E3C5C7] focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] rounded-lg px-3.5 py-2.5 text-xs text-[#483A38] placeholder-[#483A38]/40 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#483A38] block mb-1.5">
                    Subject / Occasion
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Custom Hamper Curation or Order Inquiry"
                    className="w-full bg-[#F5F1EE] border border-[#E3C5C7] focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] rounded-lg px-3.5 py-2.5 text-xs text-[#483A38] placeholder-[#483A38]/40 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#483A38] block mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please describe your gift requirements, customization requests, or order question..."
                    className="w-full bg-[#F5F1EE] border border-[#E3C5C7] focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] rounded-lg p-3 text-xs text-[#483A38] placeholder-[#483A38]/40 outline-none transition resize-none"
                  />
                </div>

                {sentSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span>Your email composer is opening to deliver your message to {emailAddress}.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold uppercase tracking-[0.18em] py-3.5 rounded-lg transition-all duration-300 btn-luxury-shimmer active:scale-[0.99] shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>Send Message to {emailAddress}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
