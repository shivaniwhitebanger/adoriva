import React from 'react';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onQuickView,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const wishlisted = isInWishlist(product.id);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group flex flex-col bg-[#F5F1EE] border border-[#E3C5C7] rounded-lg overflow-hidden card-hover cursor-pointer text-left relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] bg-[#F5F1EE] overflow-hidden">
        <img
          src={product.images[0] || '/images/hero-gift.jpg'}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('hero-gift.jpg')) {
              target.src = '/images/hero-gift.jpg';
            }
          }}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
          loading="lazy"
        />

        {/* Badges with luxury palette tokens */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none transition-transform duration-300 group-hover:translate-x-0.5">
          {product.isBestSeller && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-[#F5F1EE]/95 text-[#483A38] border border-[#E3C5C7] backdrop-blur-sm shadow-2xs">
              Bestseller
            </span>
          )}
          {hasDiscount && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-[#C49A9C] text-[#F5F1EE] shadow-2xs">
              Sale
            </span>
          )}
          {product.isPersonalized && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-[#9A8582] text-[#483A38] shadow-2xs">
              Custom
            </span>
          )}
        </div>

        {/* Wishlist Button in Blush Pink / Champagne Gold */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 active:scale-90 z-10 ${
            wishlisted
              ? 'bg-[#C49A9C] text-[#483A38] shadow-xs animate-heart-pop'
              : 'bg-[#F5F1EE]/85 hover:bg-[#F5F1EE] text-[#483A38] border border-[#E3C5C7]/60 hover:border-[#D4AF7C]'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} className="transition-transform duration-200" />
        </button>

        {/* Quick Actions Hover Slide-up: Mocha Brown button */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 z-10">
          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-[11px] font-semibold uppercase tracking-wider py-2.5 px-3 btn-luxury-shimmer active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
          >
            <ShoppingBag size={14} className="transition-transform duration-200 group-hover:scale-110" />
            Quick Add
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="bg-[#F5F1EE]/95 hover:bg-[#F5F1EE] text-[#483A38] p-2.5 transition-all duration-200 border border-[#E3C5C7] hover:border-[#D4AF7C] hover:scale-105 active:scale-95 shadow-sm"
              title="Quick View"
            >
              <Eye size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Product Details Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#F5F1EE]">
        <div>
          {/* Subtle Category Kicker in Deep Plum */}
          <span className="text-[10px] font-medium tracking-widest uppercase text-[#9A8582] block mb-1">
            {product.category === 'personalized-gifts' || product.category === 'customized-gifts'
              ? 'customized gifts'
              : product.category.replace(/-/g, ' ')}
          </span>

          {/* Product Title in Mocha Brown */}
          <h3 className="font-serif text-base font-normal text-[#483A38] line-clamp-2 group-hover:text-[#D4AF7C] transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#E3C5C7] flex items-center justify-between">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-[#483A38]">
              ₹{product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#9A8582]/70 line-through font-light">
                ₹{product.originalPrice?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Ratings with Champagne Gold stars */}
          <div className="flex items-center gap-1 text-[11px] text-[#483A38]/70">
            <Star size={12} className="text-[#D4AF7C] fill-[#D4AF7C]" />
            <span className="font-medium text-[#483A38]">{product.rating}</span>
            <span className="text-[10px]">({product.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
