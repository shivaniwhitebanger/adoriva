import React from 'react';
import { HeroSection } from '../components/HeroSection.tsx';
import { BenefitsStrip } from '../components/BenefitsStrip.tsx';
import { CategoryCircles } from '../components/CategoryCircles.tsx';
import { BestSellersSection } from '../components/BestSellersSection.tsx';
import { PromoBannersSection } from '../components/PromoBannersSection.tsx';
import { NewArrivalsSection } from '../components/NewArrivalsSection.tsx';
import { ContactSection } from '../components/ContactSection.tsx';
import { NewsletterSection } from '../components/NewsletterSection.tsx';
import { Product, Category, SiteSettings } from '../types/index.ts';

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  onNavigate: (view: string, param?: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  settings,
  onNavigate,
  onSelectProduct,
  onQuickView,
}) => {
  return (
    <div className="min-h-screen bg-[#F5F1EE]">
      {/* 1. Main Hero Banner matching reference screenshot */}
      <HeroSection
        slides={settings.heroSlides}
        onNavigate={onNavigate}
      />

      {/* 2. Benefits Strip */}
      <BenefitsStrip />

      {/* 3. Shop by Category (Circular or softly rounded category images) */}
      <CategoryCircles
        categories={categories}
        onSelectCategory={(slug) => onNavigate('shop', `category=${slug}`)}
      />

      {/* 4. Best Sellers Section */}
      <BestSellersSection
        products={products}
        onSelectProduct={onSelectProduct}
        onQuickView={onQuickView}
        onViewAll={() => onNavigate('shop', 'filter=bestseller')}
      />

      {/* 5. Promotional Banners (Two adjacent banners: blush pink & muted sage green) */}
      <PromoBannersSection
        bannerOne={settings.promoOne}
        bannerTwo={settings.promoTwo}
        onNavigate={onNavigate}
      />

      {/* 6. New Arrivals Section */}
      <NewArrivalsSection
        products={products}
        onSelectProduct={onSelectProduct}
        onQuickView={onQuickView}
        onViewAll={() => onNavigate('shop', 'filter=new')}
      />

      {/* 7. Dedicated Contact Us Section */}
      <ContactSection />

      {/* 8. Newsletter Section */}
      <NewsletterSection />
    </div>
  );
};
