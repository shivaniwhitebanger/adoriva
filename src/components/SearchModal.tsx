import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToCategory: (categorySlug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigateToCategory,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.getProducts({ search: query.trim() });
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const popularSearches = [
    'Velvet Hamper',
    'Personalized Ceramic Mug',
    'Amber Candle',
    'Silk Sleep Mask',
    'Gold Pendant',
    'Champagne Box',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2A2222]/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fadeIn">
      <div className="bg-[#F5F1EE] border border-[#E3C5C7] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-scaleIn">
        {/* Search Input Bar in Ivory & Champagne Gold */}
        <div className="p-4 sm:p-5 border-b border-[#E3C5C7] flex items-center gap-3 bg-[#F5F1EE]">
          <Search size={20} className="text-[#D4AF7C]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hampers, personalized keepsakes, candles..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#483A38] outline-none placeholder-[#483A38]/50"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#9A8582] hover:text-[#483A38]"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs uppercase font-medium text-[#9A8582] hover:text-[#483A38] px-2 py-1"
          >
            Esc
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto bg-[#F5F1EE]">
          {query.trim() === '' ? (
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-[#9A8582] mb-3">
                Popular Inquiries
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs px-3 py-1.5 bg-[#F5F1EE] border border-[#E3C5C7] hover:border-[#D4AF7C] hover:text-[#483A38] text-[#483A38]/80 rounded-md transition cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-[#E3C5C7]">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-[#9A8582] mb-3">
                  Shop by Occasion
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Birthday Gifts', 'Romantic Anniversaries', 'Weddings', 'For Her', 'For Him', 'Gift Cards'].map((occ) => (
                    <button
                      key={occ}
                      onClick={() => {
                        onClose();
                        onNavigateToCategory(occ.toLowerCase().replace(/\s+/g, '-'));
                      }}
                      className="text-left text-xs py-2 px-3 bg-[#E3C5C7]/40 hover:bg-[#E3C5C7] rounded text-[#483A38] transition flex items-center justify-between cursor-pointer"
                    >
                      <span>{occ}</span>
                      <ArrowRight size={12} className="text-[#D4AF7C]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-xs text-[#483A38]/70">
              Searching luxury catalogue...
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-serif text-lg text-[#483A38] mb-1">No gifts found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-[#483A38]/70">Try checking for typos or searching a broader term like &lsquo;hamper&rsquo; or &lsquo;candle&rsquo;.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-[#9A8582] mb-2">
                Found {results.length} gifts
              </p>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onClose();
                    onSelectProduct(product);
                  }}
                  className="flex items-center gap-3 p-2 bg-[#F5F1EE] rounded-lg border border-[#E3C5C7] hover:border-[#D4AF7C] transition cursor-pointer"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-14 object-cover rounded bg-[#F5F1EE]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-serif font-medium text-[#483A38] truncate">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-[#9A8582] truncate">{product.category.replace(/-/g, ' ')}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-[#483A38]">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <div className="flex items-center text-[10px] text-[#483A38]/70">
                        <Star size={10} className="text-[#D4AF7C] fill-[#D4AF7C] mr-0.5" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#D4AF7C] mr-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
