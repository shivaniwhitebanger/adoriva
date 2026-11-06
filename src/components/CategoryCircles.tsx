import React from 'react';
import { Category } from '../types/index.ts';

interface CategoryCirclesProps {
  categories: Category[];
  onSelectCategory: (categorySlug: string) => void;
}

export const CategoryCircles: React.FC<CategoryCirclesProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <section className="py-14 sm:py-18 bg-[#F5F1EE] border-b border-[#E3C5C7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A8582] block mb-2">
            CURATED MOMENTS
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#483A38] tracking-tight">
            SHOP BY CATEGORY
          </h2>
          <div className="w-12 h-[1.5px] bg-[#D4AF7C] mx-auto mt-3" />
        </div>

        {/* Circular / Softly rounded category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="flex flex-col items-center group cursor-pointer text-center category-circle-hover"
            >
              {/* Circular image with luxury gold border on hover */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 bg-[#F5F1EE] border border-[#E3C5C7] shadow-xs group-hover:border-[#D4AF7C] group-hover:shadow-lg group-hover:shadow-[#D4AF7C]/15 transition-all duration-400">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img
                    src={
                      cat.slug === 'birthday-gifts' || cat.id === 'cat-birthday'
                        ? '/images/birthday-gift-box.jpg'
                        : cat.slug === 'home-living' || cat.id === 'cat-home-living'
                        ? '/images/home-living-decor.jpg'
                        : cat.slug === 'gifts-for-her' || cat.id === 'cat-for-her'
                        ? '/assets/aistudio/images_-_2026-10-21T170132.172_24c69567.jpg'
                        : cat.slug === 'gifts-for-him' || cat.id === 'cat-for-him'
                        ? '/images/mens-personalized-hamper.jpg'
                        : cat.slug === 'flowers-hampers' || cat.id === 'cat-flowers-hampers'
                        ? '/images/flowers-hampers.jpg'
                        : cat.slug === 'kids-toys' || cat.id === 'cat-kids-toys'
                        ? '/images/kids-baby-gift-box.jpg'
                        : cat.slug === 'gift-cards' || cat.id === 'cat-gift-cards'
                        ? '/images/bespoke-gift-cards.jpg'
                        : cat.slug === 'personalized-gifts' || cat.id === 'cat-personalized'
                        ? '/images/custom-engraved-wooden-photo-frame.jpg'
                        : cat.image
                    }
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-115 transition-transform duration-600 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Label */}
              <h3 className="mt-3 text-xs font-medium text-[#483A38] group-hover:text-[#D4AF7C] transition-colors duration-300 leading-tight">
                {cat.name}
              </h3>
              <span className="text-[10px] text-[#483A38]/70 mt-0.5 group-hover:text-[#483A38]/90 transition-colors">
                {cat.itemCount} items
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
