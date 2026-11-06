import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, X, Search, ChevronDown, Check, ArrowUpDown } from 'lucide-react';
import { Product, Category } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface ShopViewProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialFilter?: string;
  initialOccasion?: string;
  initialSale?: boolean;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onNavigateHome: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  categories,
  initialCategory = 'all',
  initialFilter = 'all',
  initialOccasion = 'all',
  initialSale = false,
  onSelectProduct,
  onQuickView,
  onNavigateHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedOccasion, setSelectedOccasion] = useState<string>(initialOccasion);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(300);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlySale, setOnlySale] = useState<boolean>(initialSale);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const occasions = ['All', 'Birthday', 'Anniversary', 'Wedding', 'Valentine', 'Festive', 'Corporate'];
  const recipients = ['All', 'Her', 'Him', 'Couples', 'Friend', 'Kids'];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        const catLower = selectedCategory.toLowerCase();
        const matchesCategory =
          p.category.toLowerCase() === catLower ||
          categories.find((c) => c.slug.toLowerCase() === catLower)?.slug.toLowerCase() === p.category.toLowerCase() ||
          (catLower === 'birthday-gifts' && (p.category === 'birthday-gifts' || p.occasion?.toLowerCase() === 'birthday' || p.tags.some(t => t.toLowerCase().includes('birthday')))) ||
          (catLower === 'gifts-for-her' && (p.recipient?.toLowerCase() === 'her' || p.tags.some(t => t.toLowerCase() === 'gifts for her'))) ||
          ((catLower === 'personalized-gifts' || catLower === 'customized-gifts') && (
            p.category === 'personalized-gifts' ||
            p.category === 'customized-gifts' ||
            p.isPersonalized ||
            p.tags.some((t) => t.toLowerCase().includes('custom') || t.toLowerCase().includes('personal'))
          )) ||
          (catLower === 'flowers-hampers' && (p.tags.some(t => t.toLowerCase().includes('hamper') || t.toLowerCase().includes('flower'))));
        if (!matchesCategory) return false;
      }

      // Occasion
      if (selectedOccasion !== 'all' && selectedOccasion !== 'All') {
        if (p.occasion?.toLowerCase() !== selectedOccasion.toLowerCase()) return false;
      }

      // Recipient
      if (selectedRecipient !== 'all' && selectedRecipient !== 'All') {
        if (p.recipient?.toLowerCase() !== selectedRecipient.toLowerCase()) return false;
      }

      // Price
      if (p.price > priceRange) return false;

      // Stock
      if (onlyInStock && p.stock <= 0) return false;

      // Sale
      if (onlySale && (!p.originalPrice || p.originalPrice <= p.price)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      // Popularity default
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [
    products,
    categories,
    selectedCategory,
    selectedOccasion,
    selectedRecipient,
    sortBy,
    searchQuery,
    priceRange,
    onlyInStock,
    onlySale,
  ]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedOccasion('all');
    setSelectedRecipient('all');
    setSearchQuery('');
    setPriceRange(300);
    setOnlyInStock(false);
    setOnlySale(false);
    setSortBy('popularity');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedOccasion !== 'all' ||
    selectedRecipient !== 'all' ||
    searchQuery !== '' ||
    priceRange < 300 ||
    onlyInStock ||
    onlySale;

  return (
    <div className="min-h-screen bg-[#F5F1EE] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Heading */}
        <div className="mb-8 pb-6 border-b border-[#E3C5C7]">
          <div className="flex items-center gap-2 text-xs text-[#483A38]/70 mb-2">
            <button onClick={onNavigateHome} className="hover:text-[#483A38] cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-[#483A38] font-medium">Gifting Catalog</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-[#9A8582] font-semibold">
                  {selectedCategory === 'personalized-gifts' || selectedCategory === 'customized-gifts'
                    ? 'Customized Gifts'
                    : selectedCategory === 'birthday-gifts'
                    ? 'Birthday Gifts'
                    : selectedCategory === 'gifts-for-her'
                    ? 'Gifts for Her'
                    : selectedCategory === 'gifts-for-him'
                    ? 'Gifts for Him'
                    : selectedCategory === 'flowers-hampers'
                    ? 'Flowers & Hampers'
                    : selectedCategory.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#483A38] font-normal tracking-tight">
                {selectedCategory === 'personalized-gifts' || selectedCategory === 'customized-gifts'
                  ? 'Customized Gifts'
                  : selectedCategory === 'birthday-gifts'
                  ? 'Birthday Gifts'
                  : selectedCategory === 'gifts-for-her'
                  ? 'Gifts for Her'
                  : selectedCategory === 'gifts-for-him'
                  ? 'Gifts for Him'
                  : selectedCategory === 'flowers-hampers'
                  ? 'Flowers & Hampers'
                  : 'Curated Gifting Collections'}
              </h1>
              <p className="text-xs sm:text-sm text-[#483A38]/80 mt-1 font-light">
                {selectedCategory === 'personalized-gifts' || selectedCategory === 'customized-gifts'
                  ? `Discover ${filteredProducts.length} bespoke engraved keepsakes, personalized photo frames, and monogrammed treasures.`
                  : `Discover ${filteredProducts.length} handcrafted gift boxes, personalized ceramics, and everlasting botanical keepsakes.`}
              </p>
            </div>

            {/* Sort & Mobile Filter Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[#F5F1EE] border border-[#E3C5C7] text-xs font-medium text-[#483A38] rounded cursor-pointer"
              >
                <Filter size={14} />
                Filters {hasActiveFilters && '•'}
              </button>

              <div className="flex items-center gap-2 bg-[#F5F1EE] border border-[#E3C5C7] rounded px-3 py-1.5 text-xs text-[#483A38]">
                <ArrowUpDown size={13} className="text-[#9A8582]" />
                <span className="text-[#483A38]/70 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-medium outline-none cursor-pointer text-[#483A38]"
                >
                  <option value="popularity">Popularity / Bestsellers</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar Filters + Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar in Ivory & Sand Beige */}
          <aside className="hidden lg:block space-y-6 bg-[#F5F1EE] p-6 rounded-xl border border-[#E3C5C7] h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3C5C7]">
              <h3 className="font-serif text-base text-[#483A38] font-medium flex items-center gap-2">
                <SlidersHorizontal size={15} />
                Refine Selection
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-[#C49A9C] font-semibold hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#483A38] block mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keyword (e.g. candle, rose)..."
                  className="w-full bg-[#F5F1EE] border border-[#E3C5C7] rounded px-3 py-2 text-xs text-[#483A38] outline-none focus:border-[#D4AF7C]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2.5 text-[#9A8582]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#483A38] block mb-2">
                Categories
              </label>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left py-1 px-2 rounded transition flex items-center justify-between cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#E3C5C7] text-[#483A38] font-semibold'
                      : 'text-[#483A38]/70 hover:text-[#483A38]'
                  }`}
                >
                  <span>All Collections</span>
                  <span className="text-[10px]">({products.length})</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left py-1 px-2 rounded transition flex items-center justify-between cursor-pointer ${
                      selectedCategory === c.slug
                        ? 'bg-[#E3C5C7] text-[#483A38] font-semibold'
                        : 'text-[#483A38]/70 hover:text-[#483A38]'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px]">({c.itemCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion Filter */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#483A38] block mb-2">
                Occasion
              </label>
              <div className="flex flex-wrap gap-1.5">
                {occasions.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setSelectedOccasion(occ === 'All' ? 'all' : occ)}
                    className={`text-[11px] px-2.5 py-1 rounded transition border cursor-pointer ${
                      (selectedOccasion === 'all' && occ === 'All') || selectedOccasion === occ
                        ? 'bg-[#483A38] text-[#F5F1EE] border-[#483A38]'
                        : 'bg-[#F5F1EE] text-[#483A38] border-[#E3C5C7] hover:border-[#D4AF7C]'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Filter */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#483A38] block mb-2">
                Recipient
              </label>
              <div className="flex flex-wrap gap-1.5">
                {recipients.map((rec) => (
                  <button
                    key={rec}
                    onClick={() => setSelectedRecipient(rec === 'All' ? 'all' : rec)}
                    className={`text-[11px] px-2.5 py-1 rounded transition border cursor-pointer ${
                      (selectedRecipient === 'all' && rec === 'All') || selectedRecipient === rec
                        ? 'bg-[#483A38] text-[#F5F1EE] border-[#483A38]'
                        : 'bg-[#F5F1EE] text-[#483A38] border-[#E3C5C7] hover:border-[#D4AF7C]'
                    }`}
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between items-center text-[11px] font-semibold uppercase tracking-wider text-[#483A38] mb-2">
                <span>Max Budget</span>
                <span className="text-[#D4AF7C] font-bold">₹{priceRange}</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="5"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full accent-[#483A38] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#483A38]/70 mt-1">
                <span>₹20</span>
                <span>₹300+</span>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2 pt-2 border-t border-[#E3C5C7]">
              <label className="flex items-center gap-2 text-xs text-[#483A38] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlySale}
                  onChange={(e) => setOnlySale(e.target.checked)}
                  className="rounded text-[#483A38] focus:ring-0 border-[#E3C5C7] accent-[#483A38]"
                />
                <span>Special Sale Deals Only</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#483A38] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#483A38] focus:ring-0 border-[#E3C5C7] accent-[#483A38]"
                />
                <span>In-Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Main Product Grid Area */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-[#F5F1EE] rounded-xl border border-[#E3C5C7] p-12 text-center">
                <h3 className="font-serif text-2xl text-[#483A38] mb-2">
                  No matching treasures found
                </h3>
                <p className="text-xs text-[#483A38]/80 max-w-sm mx-auto mb-6">
                  No items matched your current filter combinations. Try loosening the price range or resetting all filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={onSelectProduct}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden bg-[#2A2222]/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-[#F5F1EE] h-full shadow-2xl p-6 overflow-y-auto space-y-5 animate-slideInRight">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3C5C7]">
              <h3 className="font-serif text-lg text-[#483A38]">Filter Gifts</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-[#483A38] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-semibold text-[#483A38] mb-2 uppercase tracking-wider">
                Category
              </p>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left py-1 px-2 rounded cursor-pointer ${
                    selectedCategory === 'all' ? 'bg-[#483A38] text-[#F5F1EE]' : 'text-[#483A38]/70'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left py-1 px-2 rounded cursor-pointer ${
                      selectedCategory === c.slug ? 'bg-[#483A38] text-[#F5F1EE]' : 'text-[#483A38]/70'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#483A38] mb-2">
                <span>Max Budget</span>
                <span className="text-[#D4AF7C] font-bold">₹{priceRange}</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full accent-[#483A38]"
              />
            </div>

            <div className="pt-4 border-t border-[#E3C5C7] flex gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 py-2 text-xs border border-[#E3C5C7] text-[#483A38] cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs bg-[#483A38] text-[#F5F1EE] font-semibold uppercase cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
