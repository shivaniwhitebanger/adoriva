import React from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { Product } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface WishlistViewProps {
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateHome: () => void;
  onNavigateToShop: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  allProducts,
  onSelectProduct,
  onNavigateHome,
  onNavigateToShop,
}) => {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const wishlistedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F5F1EE] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-6 mb-8 border-b border-[#E3C5C7] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#9A8582] mb-2">
              <button onClick={onNavigateHome} className="hover:text-[#483A38]">
                Home
              </button>
              <span>/</span>
              <span className="text-[#483A38] font-medium">My Wishlist</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#483A38]">
              Cherished Wishlist ({wishlistedProducts.length})
            </h1>
            <p className="text-xs text-[#9A8582] mt-1 font-light">
              Your saved keepsakes and milestone presents, ready for whenever celebration calls.
            </p>
          </div>

          {wishlistedProducts.length > 0 && (
            <button
              onClick={() => {
                wishlistedProducts.forEach((p) => addItem(p, 1));
              }}
              className="bg-[#C49A9C] hover:bg-[#B38385] text-[#483A38] text-xs font-semibold uppercase tracking-wider px-6 py-2.5 shadow-sm transition"
            >
              Move All to Bag
            </button>
          )}
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E3C5C7] p-16 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#C49A9C]/40 flex items-center justify-center mx-auto mb-4 text-[#C49A9C]">
              <Heart size={28} />
            </div>
            <h2 className="font-serif text-2xl text-[#483A38] mb-2">Your Wishlist is Empty</h2>
            <p className="text-xs text-[#9A8582] mb-6 font-light">
              Tap the heart icon on any product in our collection to save it for upcoming birthdays, weddings, or personal indulgences.
            </p>
            <button
              onClick={onNavigateToShop}
              className="bg-[#483A38] text-[#F5F1EE] text-xs font-semibold uppercase tracking-wider px-8 py-3 transition"
            >
              Explore Gifts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
