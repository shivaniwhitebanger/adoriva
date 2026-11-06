import React from 'react';
import { Product } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';

interface NewArrivalsSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onViewAll: () => void;
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  products,
  onSelectProduct,
  onQuickView,
  onViewAll,
}) => {
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);

  return (
    <section className="py-14 sm:py-20 bg-[#E3C5C7] border-b border-[#E3C5C7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E3C5C7]">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A8582] block mb-2">
              FRESHLY CRAFTED
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#483A38] tracking-tight">
              NEW ARRIVALS
            </h2>
          </div>

          <button
            onClick={onViewAll}
            className="mt-3 sm:mt-0 text-xs font-semibold uppercase tracking-[0.15em] text-[#483A38] hover:text-[#9A8582] transition-colors flex items-center gap-1.5 group self-start sm:self-end cursor-pointer"
          >
            <span>VIEW ALL</span>
            <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
