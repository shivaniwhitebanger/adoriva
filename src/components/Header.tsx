import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Gift,
  ShieldCheck,
  LogOut,
  SlidersHorizontal,
  PackageCheck,
  Mail
} from 'lucide-react';
import { BrandLogo } from './BrandLogo.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { SiteSettings, Category } from '../types/index.ts';

interface HeaderProps {
  settings: SiteSettings;
  categories: Category[];
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories,
  currentView,
  onNavigate,
  onOpenSearch,
}) => {
  const { totalItemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, logout, openAuthModal } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [occasionDropdownOpen, setOccasionDropdownOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const occasionDropdownRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Occasions list for dropdown
  const occasions = [
    { name: 'Birthday Celebrations', slug: 'Birthday' },
    { name: 'Romantic Anniversaries', slug: 'Anniversary' },
    { name: 'Weddings & Engagements', slug: 'Wedding' },
    { name: 'Valentine & Sweetheart', slug: 'Valentine' },
    { name: 'Festive & Holidays', slug: 'Festive' },
    { name: 'Corporate & Client Appreciation', slug: 'Corporate' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false);
      }
      if (occasionDropdownRef.current && !occasionDropdownRef.current.contains(e.target as Node)) {
        setOccasionDropdownOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full transition-shadow duration-300">
      {/* Main Navigation Bar with Ivory Background and Sand Beige Border */}
      <nav
        className={`bg-[#F5F1EE] border-b border-[#E3C5C7] transition-all duration-200 ${
          isScrolled ? 'shadow-sm py-2.5' : 'py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#483A38] hover:text-[#D4AF7C] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                onClick={onOpenSearch}
                className="p-2 text-[#483A38] hover:text-[#D4AF7C] transition-colors ml-1"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </div>

            {/* Brand Logo (Centered on mobile, left on desktop) */}
            <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate('home')}>
              <BrandLogo size={isScrolled ? 'sm' : 'md'} showTagline={!isScrolled} />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-7 text-xs font-medium tracking-widest uppercase">
              {/* Shop by Category Dropdown */}
              <div className="relative" ref={shopDropdownRef}>
                <button
                  onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                  onMouseEnter={() => setShopDropdownOpen(true)}
                  className={`nav-link-elegant flex items-center gap-1 py-2 text-[#483A38] hover:text-[#D4AF7C] transition-colors cursor-pointer ${
                    currentView === 'shop' ? 'font-semibold text-[#D4AF7C] active' : ''
                  }`}
                >
                  Shop by Category
                  <ChevronDown size={14} className={`transition-transform duration-300 ${shopDropdownOpen ? 'rotate-180 text-[#D4AF7C]' : ''}`} />
                </button>

                {shopDropdownOpen && (
                  <div
                    onMouseLeave={() => setShopDropdownOpen(false)}
                    className="absolute top-full left-0 w-72 bg-[#F5F1EE] border border-[#E3C5C7] rounded-b-xl shadow-2xl py-3 z-50 animate-slideDown"
                  >
                    <div className="px-4 py-2 border-b border-[#E3C5C7] mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#9A8582] font-semibold">Curated Collections</span>
                    </div>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setShopDropdownOpen(false);
                          onNavigate('shop', `category=${cat.slug}`);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-[#483A38] hover:bg-[#E3C5C7]/40 hover:text-[#483A38] hover:translate-x-1 flex items-center justify-between transition-all duration-200 cursor-pointer"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-[#9A8582] font-medium">({cat.itemCount})</span>
                      </button>
                    ))}
                    <div className="pt-2 mt-2 border-t border-[#E3C5C7] px-4">
                      <button
                        onClick={() => {
                          setShopDropdownOpen(false);
                          onNavigate('shop');
                        }}
                        className="text-[11px] font-semibold text-[#C49A9C] hover:text-[#D4AF7C] hover:underline transition-colors"
                      >
                        View All Collections →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Occasions Dropdown */}
              <div className="relative" ref={occasionDropdownRef}>
                <button
                  onClick={() => setOccasionDropdownOpen(!occasionDropdownOpen)}
                  onMouseEnter={() => setOccasionDropdownOpen(true)}
                  className="nav-link-elegant flex items-center gap-1 py-2 text-[#483A38] hover:text-[#D4AF7C] transition-colors cursor-pointer"
                >
                  Occasions
                  <ChevronDown size={14} className={`transition-transform duration-300 ${occasionDropdownOpen ? 'rotate-180 text-[#D4AF7C]' : ''}`} />
                </button>

                {occasionDropdownOpen && (
                  <div
                    onMouseLeave={() => setOccasionDropdownOpen(false)}
                    className="absolute top-full left-0 w-64 bg-[#F5F1EE] border border-[#E3C5C7] rounded-b-xl shadow-2xl py-3 z-50 animate-slideDown"
                  >
                    <div className="px-4 py-2 border-b border-[#E3C5C7] mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#9A8582] font-semibold">Moments That Matter</span>
                    </div>
                    {occasions.map((occ) => (
                      <button
                        key={occ.slug}
                        onClick={() => {
                          setOccasionDropdownOpen(false);
                          onNavigate('shop', `occasion=${occ.slug}`);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-[#483A38] hover:bg-[#E3C5C7]/40 hover:translate-x-1 transition-all duration-200 cursor-pointer"
                      >
                        {occ.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Personalized Gifts */}
              <button
                onClick={() => onNavigate('shop', 'category=personalized-gifts')}
                className="nav-link-elegant py-2 text-[#483A38] hover:text-[#D4AF7C] transition-colors cursor-pointer"
              >
                Personalized Gifts
              </button>

              {/* Best Sellers */}
              <button
                onClick={() => onNavigate('shop', 'filter=bestseller')}
                className="nav-link-elegant py-2 text-[#483A38] hover:text-[#D4AF7C] transition-colors cursor-pointer"
              >
                Best Sellers
              </button>

              {/* New Arrivals */}
              <button
                onClick={() => onNavigate('shop', 'filter=new')}
                className="nav-link-elegant py-2 text-[#483A38] hover:text-[#D4AF7C] transition-colors cursor-pointer"
              >
                New Arrivals
              </button>

              {/* Sale */}
              <button
                onClick={() => onNavigate('shop', 'filter=sale')}
                className="nav-link-elegant py-2 text-[#C49A9C] font-semibold hover:text-[#483A38] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Sale
                <span className="w-1.5 h-1.5 rounded-full bg-[#C49A9C] animate-pulse" />
              </button>

              {/* Contact Us */}
              <button
                onClick={() => {
                  onNavigate('home');
                  setTimeout(() => {
                    const el = document.getElementById('contact-us');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="nav-link-elegant py-2 text-[#483A38] hover:text-[#D4AF7C] transition-colors cursor-pointer"
              >
                Contact Us
              </button>
            </div>

            {/* Action Icons Right */}
            <div className="flex items-center space-x-4 sm:space-x-5 text-[#483A38]">
              {/* Search Icon */}
              <button
                onClick={onOpenSearch}
                className="hidden lg:flex items-center text-[#483A38] hover:text-[#D4AF7C] icon-interactive p-1.5 cursor-pointer"
                title="Search Gifts"
              >
                <Search size={19} />
              </button>

              {/* Account Dropdown */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center text-[#483A38] hover:text-[#D4AF7C] icon-interactive p-1.5 cursor-pointer"
                  title="Account"
                >
                  <UserIcon size={19} />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#F5F1EE] border border-[#E3C5C7] rounded-xl shadow-2xl py-2 z-50 animate-slideDown">
                    {user ? (
                      <div>
                        <div className="px-4 py-2 border-b border-[#E3C5C7]">
                          <p className="text-xs font-semibold text-[#483A38] truncate">{user.name}</p>
                          <p className="text-[10px] text-[#9A8582] truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E3C5C7] text-[#483A38] font-medium">
                            {user.role}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onNavigate('account');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-[#483A38] hover:bg-[#E3C5C7]/40 flex items-center gap-2 hover:translate-x-1 transition-all duration-200 cursor-pointer"
                        >
                          <PackageCheck size={14} />
                          My Orders & Profile
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setAccountMenuOpen(false);
                              onNavigate('admin');
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-[#D4AF7C] hover:bg-[#E3C5C7]/40 flex items-center gap-2 hover:translate-x-1 transition-all duration-200 cursor-pointer"
                          >
                            <SlidersHorizontal size={14} />
                            Admin Store Manager
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-[#C49A9C] hover:bg-[#C49A9C]/10 flex items-center gap-2 border-t border-[#E3C5C7] mt-1 transition-colors cursor-pointer"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="p-3">
                        <p className="text-xs text-[#483A38]/80 mb-3">Sign in for personalized gifts and order tracking</p>
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            openAuthModal();
                          }}
                          className="w-full bg-[#483A38] hover:bg-[#342726] text-[#F5F1EE] font-semibold text-xs py-2 rounded-lg transition-all active:scale-[0.98] btn-luxury-shimmer cursor-pointer shadow-sm"
                        >
                          Sign In / Register
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Icon */}
              <button
                onClick={() => onNavigate('wishlist')}
                className="relative flex items-center text-[#483A38] hover:text-[#D4AF7C] icon-interactive p-1.5 cursor-pointer"
                title="Wishlist"
              >
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C49A9C] text-[#483A38] font-bold rounded-full text-[10px] flex items-center justify-center animate-scaleIn shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Shopping Bag Icon with Live Count */}
              <button
                onClick={openCart}
                className="relative flex items-center text-[#483A38] hover:text-[#D4AF7C] icon-interactive p-1.5 cursor-pointer"
                title="Shopping Bag"
              >
                <ShoppingBag size={19} />
                {totalItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#483A38] text-[#F5F1EE] font-bold rounded-full text-[10px] flex items-center justify-center animate-scaleIn shadow-xs">
                    {totalItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E3C5C7] bg-[#F5F1EE] px-4 pt-3 pb-6 space-y-3">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#E3C5C7]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('shop');
                }}
                className="py-2 px-3 text-left text-xs font-semibold bg-[#E3C5C7]/40 rounded-lg text-[#483A38]"
              >
                All Gifts
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('shop', 'filter=bestseller');
                }}
                className="py-2 px-3 text-left text-xs font-semibold bg-[#E3C5C7]/40 rounded-lg text-[#483A38]"
              >
                Best Sellers
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('shop', 'category=personalized-gifts');
                }}
                className="py-2 px-3 text-left text-xs font-semibold bg-[#E3C5C7]/40 rounded-lg text-[#483A38]"
              >
                Personalized
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('shop', 'filter=sale');
                }}
                className="py-2 px-3 text-left text-xs font-semibold bg-[#C49A9C]/40 rounded-lg text-[#483A38]"
              >
                Sale Offers
              </button>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#9A8582] mb-2 font-semibold">Categories</p>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('shop', `category=${c.slug}`);
                    }}
                    className="w-full text-left py-1.5 text-xs text-[#483A38] hover:text-[#D4AF7C]"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E3C5C7] flex flex-col gap-2">
              <a
                href="mailto:shivani.whitebanger@gmail.com"
                className="w-full py-2 px-3 text-xs font-medium text-[#483A38] hover:text-[#D4AF7C] flex items-center gap-2 border border-[#E3C5C7] rounded-lg bg-white/50"
                title="Send email to concierge"
              >
                <Mail size={14} className="text-[#D4AF7C] shrink-0" />
                <span className="truncate">Concierge: shivani.whitebanger@gmail.com</span>
              </a>

              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="w-full py-2 text-xs font-bold bg-[#483A38] text-[#F5F1EE] rounded-lg text-center"
                >
                  Admin Management
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
