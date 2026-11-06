import React from 'react';
import { Truck, ShieldCheck, Sparkles, RotateCcw, Headphones } from 'lucide-react';

export const BenefitsStrip: React.FC = () => {
  const benefits = [
    {
      icon: <Truck size={19} className="text-[#D4AF7C]" />,
      title: 'Free Shipping',
      subtitle: 'On all orders over ₹75',
    },
    {
      icon: <ShieldCheck size={19} className="text-[#D4AF7C]" />,
      title: 'Secure Payments',
      subtitle: '256-Bit encrypted checkout',
    },
    {
      icon: <Sparkles size={19} className="text-[#D4AF7C]" />,
      title: 'Premium Quality',
      subtitle: 'Handpicked artisan goods',
    },
    {
      icon: <RotateCcw size={19} className="text-[#D4AF7C]" />,
      title: 'Easy Returns',
      subtitle: '30-Day hassle-free policy',
    },
    {
      icon: <Headphones size={19} className="text-[#D4AF7C]" />,
      title: 'Customer Support',
      subtitle: 'Dedicated gifting concierge',
      href: 'mailto:shivani.whitebanger@gmail.com',
    },
  ];

  return (
    <div className="bg-[#E3C5C7] border-b border-[#E3C5C7] py-6 sm:py-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E3C5C7]">
          {benefits.map((b, i) => {
            const Content = (
              <>
                <div className="p-2.5 rounded-full bg-[#F5F1EE] border border-[#D4AF7C]/30 shadow-2xs group-hover:bg-[#F5F1EE] group-hover:border-[#D4AF7C] group-hover:scale-110 group-hover:shadow-md transition-all duration-300 flex-shrink-0">
                  {b.icon}
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#483A38] font-sans group-hover:text-[#2A2222]">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-[#483A38]/75 font-light mt-0.5 group-hover:text-[#483A38]">
                    {b.subtitle}
                  </p>
                </div>
              </>
            );

            return b.href ? (
              <a
                key={i}
                href={b.href}
                title="Email Concierge directly"
                className={`flex items-center gap-3.5 ${
                  i > 0 ? 'pt-4 md:pt-0 md:pl-4' : ''
                } group cursor-pointer transition-transform duration-300 hover:-translate-y-0.5`}
              >
                {Content}
              </a>
            ) : (
              <div
                key={i}
                className={`flex items-center gap-3.5 ${
                  i > 0 ? 'pt-4 md:pt-0 md:pl-4' : ''
                } group cursor-default transition-transform duration-300 hover:-translate-y-0.5`}
              >
                {Content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
