import React from 'react';
import { PromoBanner } from '../types/index.ts';

interface PromoBannersSectionProps {
  bannerOne: PromoBanner;
  bannerTwo: PromoBanner;
  onNavigate: (view: string, param?: string) => void;
}

export const PromoBannersSection: React.FC<PromoBannersSectionProps> = ({
  bannerOne,
  bannerTwo,
  onNavigate,
}) => {
  return (
    <section className="py-12 sm:py-16 bg-[#F5F1EE] border-b border-[#E3C5C7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Banner 1: Luxury Blush Pink */}
          <div
            style={{ backgroundColor: '#C49A9C' }}
            className="relative overflow-hidden rounded-xl p-8 sm:p-10 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] card-hover group border border-[#C49A9C]/40"
          >
            {/* Background Image / Artistic Accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-40 group-hover:opacity-50 transition-opacity pointer-events-none overflow-hidden">
              <img
                src={bannerOne.image}
                alt={bannerOne.title}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#C49A9C] to-transparent" />
            </div>

            <div className="relative z-10 max-w-[65%]">
              <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A8582] block mb-2">
                {bannerOne.badge || 'LIMITED TIME OFFER'}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#483A38] leading-snug mb-3">
                {bannerOne.title || 'UP TO 20% OFF ON SELECTED GIFTS'}
              </h3>
              <p className="text-xs sm:text-sm text-[#483A38]/80 font-light leading-relaxed mb-6 line-clamp-2">
                {bannerOne.description ||
                  'Elevate your gifting moments with our best-loved curated sets and signature ribbons.'}
              </p>
            </div>

            <div className="relative z-10">
              <button
                onClick={() => onNavigate('shop', 'sale=true')}
                className="inline-block bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold uppercase tracking-[0.15em] px-6 py-3 btn-luxury-shimmer active:scale-[0.98] transform hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {bannerOne.cta || 'SHOP THE DEALS'}
              </button>
            </div>
          </div>

          {/* Banner 2: Muted Sage Green */}
          <div
            style={{ backgroundColor: '#9A8582' }}
            className="relative overflow-hidden rounded-xl p-8 sm:p-10 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] card-hover group border border-[#9A8582]/40"
          >
            {/* Background Image */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-40 group-hover:opacity-50 transition-opacity pointer-events-none overflow-hidden">
              <img
                src={bannerTwo.image}
                alt={bannerTwo.title}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#9A8582] to-transparent" />
            </div>

            <div className="relative z-10 max-w-[65%]">
              <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#483A38] block mb-2 font-bold">
                {bannerTwo.badge || 'NEW ARRIVALS'}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#483A38] leading-snug mb-3">
                {bannerTwo.title || 'DISCOVER OUR NEW COLLECTION'}
              </h3>
              <p className="text-xs sm:text-sm text-[#483A38]/85 font-light leading-relaxed mb-6 line-clamp-2">
                {bannerTwo.description ||
                  'Bespoke floral arrangements, delicate home scents, and newborn celebration chests.'}
              </p>
            </div>

            <div className="relative z-10">
              <button
                onClick={() => onNavigate('shop', 'filter=new')}
                className="inline-block bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold uppercase tracking-[0.15em] px-6 py-3 btn-luxury-shimmer active:scale-[0.98] transform hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {bannerTwo.cta || 'SHOP NEW ARRIVALS'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
