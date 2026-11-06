import React, { useState, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Gift,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Share2,
  Calendar,
  Sparkles,
  MessageSquarePlus,
  X
} from 'lucide-react';
import { Product, Review } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onNavigateHome: () => void;
  onNavigateToShop: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToCheckout: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  onNavigateHome,
  onNavigateToShop,
  onSelectProduct,
  onNavigateToCheckout,
}) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [personalizationText, setPersonalizationText] = useState('');
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ author: '', rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setPersonalizationText('');
    setIsGiftWrapped(false);
    setGiftNote('');
    setAddedMessage(false);

    // Initial variants
    if (product.variants && product.variants.length > 0) {
      const init: Record<string, string> = {};
      product.variants.forEach((v) => {
        if (v.options.length > 0) init[v.name] = v.options[0].label;
      });
      setSelectedVariants(init);
    } else {
      setSelectedVariants({});
    }

    // Load reviews
    api.getReviews(product.id).then(setReviews).catch(() => {});
  }, [product]);

  const wishlisted = isInWishlist(product.id);

  // Calculate dynamic price
  let currentPrice = product.price;
  if (product.variants) {
    for (const [varName, chosenLabel] of Object.entries(selectedVariants)) {
      const group = product.variants.find((v) => v.name === varName);
      if (group) {
        const opt = group.options.find((o) => o.label === chosenLabel);
        if (opt) currentPrice += opt.priceDelta;
      }
    }
  }

  // Delivery date estimate (calculated as 2-3 days from today)
  const deliveryDateStart = new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const deliveryDateEnd = new Date(Date.now() + 86400000 * 4).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleAddToCart = () => {
    addItem(
      product,
      quantity,
      selectedVariants,
      personalizationText.trim() ? personalizationText.trim() : undefined,
      isGiftWrapped
    );
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2500);
  };

  const handleBuyNow = () => {
    addItem(
      product,
      quantity,
      selectedVariants,
      personalizationText.trim() ? personalizationText.trim() : undefined,
      isGiftWrapped
    );
    onNavigateToCheckout();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.author.trim() || !reviewForm.comment.trim()) return;
    setSubmittingReview(true);
    const newRev = await api.submitReview({
      productId: product.id,
      author: reviewForm.author.trim(),
      rating: reviewForm.rating,
      title: reviewForm.title.trim() || 'Wonderful Gifting Item',
      comment: reviewForm.comment.trim(),
    });
    setReviews((prev) => [newRev, ...prev]);
    setSubmittingReview(false);
    setShowReviewModal(false);
    setReviewForm({ author: '', rating: 5, title: '', comment: '' });
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.isBestSeller))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F5F1EE] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#9A8582] mb-8 pb-4 border-b border-[#E3C5C7]">
          <button onClick={onNavigateHome} className="hover:text-[#483A38]">
            Home
          </button>
          <span>/</span>
          <button onClick={onNavigateToShop} className="hover:text-[#483A38]">
            Catalog
          </button>
          <span>/</span>
          <span className="text-[#483A38] font-medium capitalize">
            {product.category.replace(/-/g, ' ')}
          </span>
          <span>/</span>
          <span className="text-[#C49A9C] font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Showcase: Grid 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Gallery (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/4.5] sm:aspect-[4/3.8] rounded-xl overflow-hidden bg-white border border-[#E3C5C7] shadow-xs">
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
                className="w-full h-full object-cover object-center transition-all duration-500"
              />

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm transition ${
                  wishlisted
                    ? 'bg-[#C49A9C] text-white shadow'
                    : 'bg-white/80 hover:bg-white text-[#483A38]'
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.isBestSeller && (
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-[#F5F1EE]/95 text-[#483A38] border border-[#E3C5C7]">
                    Signature Bestseller
                  </span>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-[#C49A9C] text-[#483A38]">
                    Save ₹{(product.originalPrice - product.price).toFixed(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                      idx === activeImageIndex
                        ? 'border-[#C49A9C] shadow-sm'
                        : 'border-[#E3C5C7] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Customization, Purchasing & Details (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A8582]">
                  {product.category.replace(/-/g, ' ')}
                </span>

                <div className="flex items-center gap-1 text-xs text-[#9A8582]">
                  <div className="flex text-[#D4AF7C]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < Math.floor(product.rating) ? 'fill-[#D4AF7C]' : 'text-[#E3C5C7]'}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-[#483A38] ml-1">{product.rating}</span>
                  <span>({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#483A38] leading-tight mb-2">
                {product.name}
              </h1>
              {product.subtitle && (
                <p className="text-xs text-[#9A8582] font-medium tracking-wide uppercase mb-4">
                  {product.subtitle}
                </p>
              )}

              {/* Price & Stock */}
              <div className="flex items-center justify-between py-3 border-y border-[#E3C5C7] mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#483A38]">
                    ₹{currentPrice.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > currentPrice && (
                    <span className="text-sm text-[#9A8582] line-through font-light">
                      ₹{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-800 font-medium">
                    {product.stock > 0 ? `In Stock (${product.stock} units left)` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#9A8582] font-light leading-relaxed mb-6 font-sans">
                {product.description}
              </p>

              {/* Product Variants (e.g. Size, Tone, Scent) */}
              {product.variants?.map((vGroup) => (
                <div key={vGroup.name} className="mb-5">
                  <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#483A38] mb-2">
                    <span>{vGroup.name}</span>
                    <span className="text-[#C49A9C] font-normal lowercase">{selectedVariants[vGroup.name]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {vGroup.options.map((opt) => {
                      const isSelected = selectedVariants[vGroup.name] === opt.label;
                      return (
                        <button
                          key={opt.label}
                          onClick={() =>
                            setSelectedVariants((prev) => ({ ...prev, [vGroup.name]: opt.label }))
                          }
                          className={`text-xs px-3.5 py-2 border transition rounded-sm flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-[#483A38] bg-[#483A38] text-white shadow-xs font-medium'
                              : 'border-[#E3C5C7] bg-white text-[#483A38] hover:border-[#C49A9C]'
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{opt.label}</span>
                          {opt.priceDelta !== 0 && (
                            <span className="text-[10px] opacity-80">
                              ({opt.priceDelta > 0 ? `+₹${opt.priceDelta}` : `-₹${Math.abs(opt.priceDelta)}`})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Personalization Section if applicable */}
              {product.isPersonalized && (
                <div className="mb-6 p-4 bg-white rounded-lg border border-[#E3C5C7] shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#483A38] mb-1.5">
                    <Sparkles size={14} className="text-[#D4AF7C]" />
                    <span>Personalized Keepsake Inscription</span>
                  </div>
                  <p className="text-[11px] text-[#9A8582] mb-2 font-light">
                    {product.personalizationPrompt || 'Provide name, milestone date, or custom engraving:'}
                  </p>
                  <input
                    type="text"
                    value={personalizationText}
                    onChange={(e) => setPersonalizationText(e.target.value)}
                    placeholder="e.g. S.W. · With Love Elena · 24.10.2026"
                    maxLength={45}
                    className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded p-2.5 text-xs text-[#483A38] outline-none focus:border-[#C49A9C]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9A8582] mt-1">
                    <span>Complimentary precision engraving</span>
                    <span>{personalizationText.length}/45</span>
                  </div>
                </div>
              )}

              {/* Signature Gift Wrapping & Handwritten Card */}
              <div className="mb-6 p-4 bg-[#E3C5C7]/40 rounded-lg border border-[#E3C5C7]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pdp-wrap"
                      checked={isGiftWrapped}
                      onChange={(e) => setIsGiftWrapped(e.target.checked)}
                      className="rounded border-[#C49A9C] text-[#C49A9C] cursor-pointer"
                    />
                    <label htmlFor="pdp-wrap" className="text-xs font-semibold text-[#483A38] cursor-pointer flex items-center gap-1.5">
                      <Gift size={14} className="text-[#C49A9C]" />
                      Adoriva Signature Gift Casket & Silk Ribbon
                    </label>
                  </div>
                  <span className="text-xs font-bold text-[#483A38]">+₹4.99</span>
                </div>

                {isGiftWrapped && (
                  <div className="mt-3 pt-3 border-t border-[#E3C5C7]">
                    <label className="text-[11px] font-medium text-[#483A38] block mb-1">
                      Handwritten Gifting Card Note (Free):
                    </label>
                    <textarea
                      rows={2}
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Write your personal message to be handwritten in gold ink on cotton paper..."
                      className="w-full bg-white border border-[#E3C5C7] p-2 text-xs text-[#483A38] rounded outline-none focus:border-[#C49A9C]"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Estimate */}
              <div className="mb-6 flex items-center gap-3 p-3 bg-white rounded border border-[#E3C5C7] text-xs text-[#9A8582]">
                <Calendar size={16} className="text-[#C49A9C] flex-shrink-0" />
                <div>
                  <span className="text-[#483A38] font-medium">Estimated Delivery: </span>
                  <span>{deliveryDateStart} – {deliveryDateEnd}</span>
                </div>
              </div>
            </div>

            {/* Buying Action Bar */}
            <div className="space-y-3 pt-4 border-t border-[#E3C5C7]">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-[#E3C5C7] bg-white rounded">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-[#483A38] hover:bg-[#E3C5C7]/40"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-[#483A38]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-[#483A38] hover:bg-[#E3C5C7]/40"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#C49A9C] hover:bg-[#B38385] text-[#483A38] text-xs font-semibold uppercase tracking-[0.15em] py-3.5 px-6 shadow-sm hover:shadow-md btn-luxury-shimmer active:scale-[0.98] transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag size={16} />
                  Add to Bag • ₹{(currentPrice * quantity).toFixed(2)}
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold uppercase tracking-[0.15em] py-3.5 shadow-sm hover:shadow-md btn-luxury-shimmer active:scale-[0.98] transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                Instant Buy Now
              </button>

              {addedMessage && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded text-center border border-emerald-200 animate-fadeIn">
                  ✓ Item added to bag! Open your bag or proceed to checkout.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews & Ratings Section */}
        <div className="mt-16 pt-12 border-t border-[#E3C5C7]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-[#E3C5C7]">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9A8582] block mb-1">
                PATRON TESTIMONIALS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#483A38]">
                Customer Reviews ({reviews.length})
              </h2>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="mt-3 sm:mt-0 flex items-center gap-1.5 px-4 py-2 border border-[#483A38] text-xs font-semibold uppercase tracking-wider text-[#483A38] hover:bg-[#483A38] hover:text-white transition"
            >
              <MessageSquarePlus size={14} />
              Write a Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#9A8582]">
              Be the first to leave a review for this handcrafted gift!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-5 rounded-xl border border-[#E3C5C7] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#D4AF7C]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < rev.rating ? 'fill-[#D4AF7C]' : 'text-[#E3C5C7]'}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#9A8582]">{rev.date}</span>
                  </div>

                  <h4 className="font-serif text-base text-[#483A38] font-medium">{rev.title}</h4>
                  <p className="text-xs text-[#9A8582] font-light leading-relaxed">{rev.comment}</p>

                  <div className="pt-2 border-t border-[#E3C5C7]/60 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#483A38]">{rev.author}</span>
                    {rev.verified && (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check size={11} /> Verified Gifting Recipient
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#E3C5C7]">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A8582] block mb-1">
                COMPLEMENTARY TREASURES
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#483A38]">
                You May Also Cherish
              </h2>
              <div className="w-12 h-[1px] bg-[#C49A9C] mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F5F1EE] border border-[#E3C5C7] rounded-xl max-w-md w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-1 text-[#9A8582]"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif text-xl text-[#483A38] mb-1">Share Your Experience</h3>
            <p className="text-xs text-[#9A8582] mb-4">
              Reviewing: <strong>{product.name}</strong>
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#483A38] block mb-1">Rating</label>
                <div className="flex gap-1 text-[#D4AF7C]">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setReviewForm((f) => ({ ...f, rating: num }))}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        size={20}
                        className={num <= reviewForm.rating ? 'fill-[#D4AF7C]' : 'text-[#E3C5C7]'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#483A38] block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewForm.author}
                  onChange={(e) => setReviewForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder="e.g. Charlotte M."
                  className="w-full bg-white border border-[#E3C5C7] p-2 text-xs text-[#483A38] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#483A38] block mb-1">Headline</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Stunning ribbon presentation!"
                  className="w-full bg-white border border-[#E3C5C7] p-2 text-xs text-[#483A38] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#483A38] block mb-1">Your Thoughts</label>
                <textarea
                  required
                  rows={3}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Tell us about the gift, scent, unboxing experience..."
                  className="w-full bg-white border border-[#E3C5C7] p-2 text-xs text-[#483A38] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-[#C49A9C] hover:bg-[#B38385] text-[#483A38] text-xs font-semibold uppercase tracking-wider py-2.5 transition"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
