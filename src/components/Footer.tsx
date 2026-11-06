import React from 'react';
import { BrandLogo } from './BrandLogo.tsx';
import { Instagram, Facebook, Twitter, Lock, ShieldCheck, Mail, FolderGit2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#2A2222] border-t border-[#D4AF7C]/30 text-[#F5F1EE] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-[#D4AF7C]/20">
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-2 flex flex-col items-start pr-0 lg:pr-8">
            <BrandLogo size="md" variant="light" showTagline={true} className="items-start text-left mb-4" />
            <p className="text-xs text-[#E3C5C7]/80 font-light leading-relaxed max-w-sm mt-2 mb-3">
              Adoriva is a boutique gifting maison dedicated to handcrafted treasures, botanical scents, bespoke keepsakes, and lavish gift hampers wrapped with delicate silk ribbons.
            </p>

            {/* Direct Contact Email */}
            <div className="mb-5 flex flex-col items-start gap-1">
              <span className="text-[10px] uppercase tracking-wider text-[#D4AF7C] font-semibold">
                Direct Concierge Email
              </span>
              <a
                href="mailto:shivani.whitebanger@gmail.com"
                className="inline-flex items-center gap-2 text-xs text-[#E3C5C7]/90 hover:text-[#D4AF7C] transition-colors group cursor-pointer"
                title="Send email to shivani.whitebanger@gmail.com"
              >
                <Mail size={13} className="text-[#D4AF7C] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="underline underline-offset-4 decoration-[#D4AF7C]/40 group-hover:decoration-[#D4AF7C]">
                  shivani.whitebanger@gmail.com
                </span>
              </a>
            </div>

            <div className="flex items-center space-x-3 text-[#F5F1EE]">
              <a
                href="#instagram"
                onClick={(e) => e.preventDefault()}
                className="p-2 rounded-full bg-[#483A38] border border-[#D4AF7C]/30 text-[#D4AF7C] hover:bg-[#D4AF7C] hover:text-[#2A2222] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-md cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
              <a
                href="#facebook"
                onClick={(e) => e.preventDefault()}
                className="p-2 rounded-full bg-[#483A38] border border-[#D4AF7C]/30 text-[#D4AF7C] hover:bg-[#D4AF7C] hover:text-[#2A2222] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-md cursor-pointer"
                aria-label="Facebook"
              >
                <Facebook size={15} />
              </a>
              <a
                href="#twitter"
                onClick={(e) => e.preventDefault()}
                className="p-2 rounded-full bg-[#483A38] border border-[#D4AF7C]/30 text-[#D4AF7C] hover:bg-[#D4AF7C] hover:text-[#2A2222] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-md cursor-pointer"
                aria-label="Twitter"
              >
                <Twitter size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop Collections */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF7C] mb-4">
              Shop Gifts
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E3C5C7]/80">
              <li>
                <button
                  onClick={() => onNavigate('shop', 'category=flowers-hampers')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Luxury Hampers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'category=personalized-gifts')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Personalized Keepsakes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'category=home-living')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Botanical Candles & Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'category=gifts-for-her')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Gifts for Her
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'category=gifts-for-him')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Gifts for Him
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'category=gift-cards')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Bespoke Gift Cards
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Occasions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF7C] mb-4">
              Occasions
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E3C5C7]/80">
              <li>
                <button
                  onClick={() => onNavigate('shop', 'occasion=Birthday')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Birthday Celebrations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'occasion=Anniversary')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Weddings & Anniversaries
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'occasion=Valentine')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Valentine & Romance
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'occasion=Corporate')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Corporate Gifting
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', 'sale=true')}
                  className="hover:text-[#C49A9C] transition-colors text-left font-medium text-[#C49A9C]"
                >
                  Special Offers & Sale
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF7C] mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E3C5C7]/80">
              <li>
                <button
                  onClick={() => onNavigate('account')}
                  className="hover:text-[#D4AF7C] transition-colors text-left"
                >
                  Track Your Order
                </button>
              </li>
              <li>
                <span className="hover:text-[#D4AF7C] transition-colors text-left cursor-pointer">
                  Shipping & Hand-Delivery
                </span>
              </li>
              <li>
                <span className="hover:text-[#D4AF7C] transition-colors text-left cursor-pointer">
                  Easy 30-Day Returns
                </span>
              </li>
              <li>
                <span className="hover:text-[#D4AF7C] transition-colors text-left cursor-pointer">
                  Bespoke Gift Wrapping
                </span>
              </li>
              <li>
                <span className="hover:text-[#D4AF7C] transition-colors text-left cursor-pointer">
                  Privacy Policy & Terms
                </span>
              </li>
              <li>
                <a
                  href="mailto:shivani.whitebanger@gmail.com"
                  className="hover:text-[#D4AF7C] transition-colors text-left flex items-center gap-1.5 cursor-pointer text-[#E3C5C7]/80 hover:underline"
                  title="Contact Concierge directly"
                >
                  <Mail size={12} className="text-[#D4AF7C]" />
                  <span>Contact Concierge</span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-[#D4AF7C] transition-colors text-left flex items-center gap-1.5 text-xs text-[#D4AF7C]/90 font-medium cursor-pointer"
                >
                  <Lock size={12} className="text-[#D4AF7C]" />
                  <span>Admin Panel</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('deploy')}
                  className="hover:text-[#D4AF7C] transition-colors text-left flex items-center gap-1.5 text-xs text-[#E3C5C7]/80 hover:underline cursor-pointer"
                  title="Automated GitHub Codebase Deployment"
                >
                  <FolderGit2 size={12} className="text-[#D4AF7C]" />
                  <span>Deploy to GitHub</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF7C] mb-4">
              Contact Us
            </h4>
            <p className="text-xs text-[#E3C5C7]/80 font-light leading-relaxed mb-3">
              For bespoke gifting, custom curation, or order assistance, write to us directly:
            </p>
            <a
              href="mailto:shivani.whitebanger@gmail.com"
              className="inline-flex items-center gap-2 text-xs text-[#D4AF7C] hover:text-[#F5F1EE] transition-all font-medium group cursor-pointer break-all"
              title="Send email to shivani.whitebanger@gmail.com"
            >
              <Mail size={13} className="text-[#D4AF7C] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="underline underline-offset-4 decoration-[#D4AF7C]/50 group-hover:decoration-[#F5F1EE]">
                shivani.whitebanger@gmail.com
              </span>
            </a>
            <div className="mt-4 pt-3 border-t border-[#D4AF7C]/20 text-[11px] text-[#9A8582]">
              <span>Direct personal concierge assistance</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Admin Portal & GitHub Deployment */}
        <div className="pt-10 pb-3 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('admin')}
            className="text-xs sm:text-[13px] text-[#E3C5C7]/80 hover:text-[#D4AF7C] transition-all flex items-center gap-2 cursor-pointer font-medium py-2.5 px-5 rounded-lg border border-[#D4AF7C]/30 hover:border-[#D4AF7C] hover:bg-[#483A38]/60 shadow-xs"
            title="Secure Store Administrator Portal"
          >
            <ShieldCheck size={16} className="text-[#D4AF7C]" />
            <span>Admin Portal</span>
          </button>
          <button
            onClick={() => onNavigate('deploy')}
            className="text-xs sm:text-[13px] text-[#E3C5C7]/80 hover:text-[#D4AF7C] transition-all flex items-center gap-2 cursor-pointer font-medium py-2.5 px-5 rounded-lg border border-[#D4AF7C]/30 hover:border-[#D4AF7C] hover:bg-[#483A38]/60 shadow-xs"
            title="Automated GitHub Codebase Deployment"
          >
            <FolderGit2 size={16} className="text-[#D4AF7C]" />
            <span>Deploy to GitHub</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
