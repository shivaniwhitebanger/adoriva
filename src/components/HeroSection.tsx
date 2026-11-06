import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Heart, Gift, ArrowRight } from 'lucide-react';
import { HeroSlide } from '../types/index.ts';

interface HeroSectionProps {
  slides: HeroSlide[];
  onNavigate: (view: string, param?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides, onNavigate }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  if (!slides || slides.length === 0) return null;
  const currentSlide = slides[currentSlideIndex];
  const nextSlideIndex = (currentSlideIndex + 1) % slides.length;
  const nextSlide = slides[nextSlideIndex];

  // Auto-play slideshow every 5.5s with pause-on-hover
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    autoPlayRef.current = setInterval(() => {
      triggerSlideTransition((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [slides.length, isPaused, currentSlideIndex]);

  const triggerSlideTransition = (nextIndexOrFn: number | ((prev: number) => number)) => {
    setIsAnimating(true);
    setTimeout(() => {
      if (typeof nextIndexOrFn === 'function') {
        setCurrentSlideIndex(nextIndexOrFn);
      } else {
        setCurrentSlideIndex(nextIndexOrFn);
      }
      setIsAnimating(false);
    }, 280);
  };

  const handlePrev = () => {
    triggerSlideTransition((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    triggerSlideTransition((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-r from-[#F5F1EE] via-[#F6E8E8] to-[#E3C5C7]/70 border-b border-[#E3C5C7]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Delicate floating background motifs in Blush Pink and Champagne Gold */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-10 left-12 text-[#C49A9C] animate-float-slow">
          <Heart size={20} fill="#C49A9C" />
        </div>
        <div className="absolute top-1/2 left-1/4 text-[#C49A9C] animate-float-slow-reverse">
          <Heart size={14} fill="#C49A9C" />
        </div>
        <div className="absolute bottom-16 left-16 text-[#C49A9C] animate-float-slow" style={{ animationDelay: '1.5s' }}>
          <Heart size={16} fill="#C49A9C" />
        </div>
        <div className="absolute top-20 right-1/3 text-[#D4AF7C] animate-float-slow" style={{ animationDelay: '2.5s' }}>
          <Sparkles size={18} />
        </div>
        <div className="absolute bottom-12 right-12 text-[#C49A9C] animate-float-slow-reverse" style={{ animationDelay: '0.8s' }}>
          <Heart size={22} fill="#C49A9C" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Copy with smooth fade transitions */}
          <div className="lg:col-span-7 flex flex-col items-start z-10 text-left">
            {/* Small uppercase eyebrow */}
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <span className="w-6 h-[1px] bg-[#D4AF7C]" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#9A8582]">
                {currentSlide.eyebrow || 'BOTANICAL LUXURY'}
              </span>
              <span className="w-6 h-[1px] bg-[#D4AF7C]" />
            </div>

            {/* Headline in Sophisticated Editorial Serif */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#483A38] leading-[1.12] tracking-tight mb-4 sm:mb-5 max-w-xl transition-opacity duration-300">
              {currentSlide.title || 'Made with love, meant to be cherished.'}
            </h1>

            {/* Supporting Text */}
            <p className="text-[#483A38]/85 text-sm sm:text-base font-light leading-relaxed max-w-lg mb-6 sm:mb-8 font-sans">
              {currentSlide.subtitle ||
                'Find the perfect gift for every special moment and make it unforgettable.'}
            </p>

            {/* Call to Actions: Mocha Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  if (currentSlide.ctaLink) {
                    const [view, query] = currentSlide.ctaLink.replace(/^\//, '').split('?');
                    onNavigate(view || 'shop', query);
                  } else {
                    onNavigate('shop');
                  }
                }}
                className="bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] font-semibold text-xs uppercase tracking-[0.2em] px-8 py-3.5 rounded-none shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center gap-2 btn-luxury-shimmer group"
              >
                <span>{currentSlide.ctaText || 'SHOP GIFTS'}</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={() => onNavigate('shop', 'filter=bestseller')}
                className="bg-[#F5F1EE]/80 hover:bg-[#E3C5C7]/50 text-[#483A38] border border-[#483A38]/40 hover:border-[#483A38] font-semibold text-xs uppercase tracking-[0.2em] px-7 py-3.5 rounded-none transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-xs cursor-pointer"
              >
                {currentSlide.secondaryCtaText || 'EXPLORE COLLECTION'}
              </button>
            </div>

            {/* Interactive Showcase Switcher & Progress Controls */}
            {slides.length > 1 && (
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 sm:mt-10 pt-4 border-t border-[#E3C5C7]/60 w-full max-w-lg">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-full border border-[#E3C5C7] text-[#483A38] hover:bg-[#F5F1EE] hover:border-[#D4AF7C] transition cursor-pointer shadow-2xs"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-2">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => triggerSlideTransition(idx)}
                        className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                          idx === currentSlideIndex
                            ? 'w-8 bg-[#483A38]'
                            : 'w-2 bg-[#9A8582]/40 hover:bg-[#483A38]/70'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="p-2 rounded-full border border-[#E3C5C7] text-[#483A38] hover:bg-[#F5F1EE] hover:border-[#D4AF7C] transition cursor-pointer shadow-2xs"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Direct Visual Thumbnail Selector */}
                <div className="flex items-center gap-2 text-xs text-[#9A8582]">
                  <span className="text-[10px] uppercase font-semibold tracking-wider hidden sm:inline">
                    Showcase:
                  </span>
                  {slides.map((s, idx) => (
                    <button
                      key={s.id || idx}
                      onClick={() => triggerSlideTransition(idx)}
                      className={`relative w-8 h-8 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        idx === currentSlideIndex
                          ? 'border-[#483A38] ring-2 ring-[#483A38]/30 scale-105'
                          : 'border-[#E3C5C7] opacity-60 hover:opacity-100'
                      }`}
                      title={s.tagLabel || `Slide ${idx + 1}`}
                    >
                      <img
                        src={s.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Luxury Gift Photography with Smooth Animation & Layered Floating Card */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-md lg:max-w-none">
              {/* Soft Ambient Radiance Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#E3C5C7]/70 via-[#C49A9C]/30 to-[#D4AF7C]/20 rounded-3xl blur-2xl transform rotate-1 pointer-events-none transition-all duration-700" />

              {/* Main Animated Card Frame */}
              <div className="relative overflow-hidden rounded-2xl shadow-xl border-4 border-[#F5F1EE] aspect-[4/5] bg-[#F5F1EE] group transition-all duration-500">
                {/* Floating Top Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F1EE]/95 backdrop-blur-md border border-[#E3C5C7] shadow-xs text-[10px] font-semibold uppercase tracking-wider text-[#483A38]">
                  <Sparkles size={12} className="text-[#D4AF7C] animate-pulse" />
                  <span>Handcrafted Signature Keepsake</span>
                </div>

                {/* Main Image with Ken-Burns Animated Zoom & Smooth Cross-fade */}
                <img
                  key={currentSlide.image}
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('hero-gift.jpg')) {
                      target.src = '/images/hero-gift.jpg';
                    }
                  }}
                  className={`w-full h-full object-cover object-center transform transition-all duration-700 ease-out cursor-pointer group-hover:scale-105 ${
                    isAnimating ? 'opacity-70 scale-98' : 'opacity-100 scale-100'
                  }`}
                  onClick={() => onNavigate('shop')}
                />

                {/* Floating Gifting Tag Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#F5F1EE]/95 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-[#E3C5C7] shadow-md flex items-center justify-between transition-all duration-300">
                  <div className="pr-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#9A8582] block font-semibold">
                      Featured Treasure
                    </span>
                    <span className="font-serif text-sm sm:text-base font-semibold text-[#483A38] block line-clamp-1">
                      {currentSlide.tagLabel || currentSlide.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C49A9C] text-[#483A38]">
                      {currentSlide.tagPrice || 'From ₹48'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Floating Peek Preview Card for Second Image */}
              {slides.length > 1 && nextSlide && (
                <div
                  onClick={handleNext}
                  className="hidden sm:flex absolute -bottom-5 -right-5 z-30 p-2.5 bg-[#F5F1EE] rounded-xl border-2 border-[#E3C5C7] shadow-xl card-hover cursor-pointer items-center gap-2.5 max-w-[215px] group/peek"
                  title="Click to preview next gift"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#E3C5C7] flex-shrink-0">
                    <img
                      src={nextSlide.image}
                      alt={nextSlide.title}
                      className="w-full h-full object-cover group-hover/peek:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#483A38]/10 group-hover/peek:bg-transparent transition-colors" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <span className="text-[9px] uppercase tracking-wider text-[#9A8582] font-semibold flex items-center gap-1">
                      <Gift size={10} className="text-[#C49A9C]" />
                      Next Look
                    </span>
                    <p className="text-[11px] font-medium text-[#483A38] truncate group-hover/peek:text-[#C49A9C] transition-colors">
                      {nextSlide.tagLabel || 'Discover Next'}
                    </p>
                    <span className="text-[10px] font-bold text-[#D4AF7C]">
                      {nextSlide.tagPrice || 'Explore →'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
