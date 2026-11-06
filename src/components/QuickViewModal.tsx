import React, { useState, useEffect } from 'react';
import { X, Star, Heart, ShoppingBag, Plus, Minus, Gift, Check } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullDetails: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onViewFullDetails,
}) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [personalization, setPersonalization] = useState('');
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      setPersonalization('');
      setIsGiftWrapped(false);
      setAddedNotice(false);

      // Default variants
      if (product.variants && product.variants.length > 0) {
        const initial: Record<string, string> = {};
        product.variants.forEach((v) => {
          if (v.options.length > 0) {
            initial[v.name] = v.options[0].label;
          }
        });
        setSelectedVariants(initial);
      } else {
        setSelectedVariants({});
      }
    }
  }, [product]);

  if (!product) return null;

  const wishlisted = isInWishlist(product.id);

  // Compute price with selected variants
  let computedPrice = product.price;
  if (product.variants) {
    for (const [varName, chosenLabel] of Object.entries(selectedVariants)) {
      const group = product.variants.find((v) => v.name === varName);
      if (group) {
        const opt = group.options.find((o) => o.label === chosenLabel);
        if (opt) computedPrice += opt.priceDelta;
      }
    }
  }

  const handleAddToCart = () => {
    addItem(
      product,
      quantity,
      selectedVariants,
      personalization.trim() ? personalization.trim() : undefined,
      isGiftWrapped
    );
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2A2222]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-[#F5F1EE] border border-[#E3C5C7] rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#F5F1EE]/90 hover:bg-[#F5F1EE] hover:scale-105 active:scale-95 text-[#483A38] border border-[#E3C5C7] hover:border-[#D4AF7C] shadow-sm transition-all"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-[#F5F1EE] flex flex-col justify-between border-r border-[#E3C5C7]">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F5F1EE] border border-[#E3C5C7]">
              <img
                src={product.images[activeImageIndex] || product.images[0] || '/images/hero-gift.jpg'}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('hero-gift.jpg')) {
                    target.src = '/images/hero-gift.jpg';
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded overflow-hidden flex-shrink-0 border-2 transition ${
                      idx === activeImageIndex ? 'border-[#D4AF7C]' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Customization Options */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-[#F5F1EE]">
            <div>
              {/* Category in Deep Plum */}
              <span className="text-[10px] font-semibold tracking-widest uppercase text-[#9A8582] block mb-1">
                {product.category.replace(/-/g, ' ')}
              </span>

              {/* Title in Mocha Brown */}
              <h3 className="font-serif text-xl sm:text-2xl text-[#483A38] font-normal leading-snug mb-2">
                {product.name}
              </h3>

              {/* Price & Rating */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E3C5C7] mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-[#483A38]">
                    ₹{computedPrice.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > computedPrice && (
                    <span className="text-xs text-[#9A8582]/70 line-through">
                      ₹{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-[#483A38]/80">
                  <Star size={13} className="text-[#D4AF7C] fill-[#D4AF7C]" />
                  <span className="font-semibold text-[#483A38]">{product.rating}</span>
                  <span>({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Variants */}
              {product.variants?.map((vGroup) => (
                <div key={vGroup.name} className="mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#483A38] block mb-1.5">
                    {vGroup.name}: <span className="font-normal text-[#9A8582]">{selectedVariants[vGroup.name]}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {vGroup.options.map((opt) => {
                      const isSelected = selectedVariants[vGroup.name] === opt.label;
                      return (
                        <button
                          key={opt.label}
                          onClick={() =>
                            setSelectedVariants((prev) => ({ ...prev, [vGroup.name]: opt.label }))
                          }
                          className={`text-xs px-3 py-1.5 border transition rounded-sm cursor-pointer ${
                            isSelected
                              ? 'border-[#483A38] bg-[#483A38] text-[#F5F1EE]'
                              : 'border-[#E3C5C7] bg-[#F5F1EE] text-[#483A38] hover:border-[#D4AF7C]'
                          }`}
                        >
                          {opt.label}
                          {opt.priceDelta !== 0 && (
                            <span className="text-[10px] ml-1 opacity-80">
                              ({opt.priceDelta > 0 ? `+₹${opt.priceDelta}` : `-₹${Math.abs(opt.priceDelta)}`})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Personalization Prompt if custom item */}
              {product.isPersonalized && (
                <div className="mb-4 bg-[#F5F1EE] p-3 rounded border border-[#E3C5C7]">
                  <label className="text-[11px] font-semibold text-[#483A38] block mb-1">
                    {product.personalizationPrompt || 'Custom Monogram or Engraved Note:'}
                  </label>
                  <input
                    type="text"
                    value={personalization}
                    onChange={(e) => setPersonalization(e.target.value)}
                    placeholder="e.g. S.W. or Happy Birthday Elena"
                    maxLength={40}
                    className="w-full bg-[#F5F1EE] border border-[#E3C5C7] text-xs px-3 py-2 outline-none focus:border-[#D4AF7C] text-[#483A38]"
                  />
                </div>
              )}

              {/* Gift Wrapping Checkbox */}
              <div className="mb-5 flex items-center gap-2 text-xs text-[#483A38]">
                <input
                  type="checkbox"
                  id="modal-wrap"
                  checked={isGiftWrapped}
                  onChange={(e) => setIsGiftWrapped(e.target.checked)}
                  className="rounded border-[#D4AF7C] text-[#483A38] accent-[#483A38]"
                />
                <label htmlFor="modal-wrap" className="cursor-pointer flex items-center gap-1">
                  <Gift size={13} className="text-[#D4AF7C]" />
                  Add signature gift box & gold ribbon (+₹4.99)
                </label>
              </div>
            </div>

            {/* Actions: Quantity & Add to Cart (Mocha Brown button) */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-[#E3C5C7] bg-[#F5F1EE] rounded">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-[#483A38] hover:bg-[#E3C5C7]/40 cursor-pointer"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="px-3 text-xs font-semibold text-[#483A38]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-[#483A38] hover:bg-[#E3C5C7]/40 cursor-pointer"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={addedNotice}
                  className="flex-1 bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold uppercase tracking-[0.15em] py-3 px-4 flex items-center justify-center gap-2 btn-luxury-shimmer active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  {addedNotice ? (
                    <>
                      <Check size={16} />
                      Added to Bag!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={15} />
                      Add to Bag • ₹{(computedPrice * quantity).toFixed(2)}
                    </>
                  )}
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded border border-[#E3C5C7] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                    wishlisted
                      ? 'bg-[#C49A9C] text-[#483A38] border-[#C49A9C] animate-heart-pop shadow-xs'
                      : 'bg-[#F5F1EE] hover:bg-[#E3C5C7]/40 text-[#483A38] hover:border-[#D4AF7C]'
                  }`}
                  title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} className="transition-transform duration-200" />
                </button>
              </div>

              {/* View Full Product Details Link */}
              <button
                onClick={() => {
                  onClose();
                  onViewFullDetails(product);
                }}
                className="w-full text-center text-xs text-[#9A8582] hover:text-[#483A38] underline cursor-pointer"
              >
                View complete specifications & customer reviews →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
