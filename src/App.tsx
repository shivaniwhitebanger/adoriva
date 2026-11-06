import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { QuickViewModal } from './components/QuickViewModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';

// Views
import { HomeView } from './views/HomeView.tsx';
import { ShopView } from './views/ShopView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { CartView } from './views/CartView.tsx';
import { CheckoutView } from './views/CheckoutView.tsx';
import { OrderSuccessView } from './views/OrderSuccessView.tsx';
import { AccountView } from './views/AccountView.tsx';
import { WishlistView } from './views/WishlistView.tsx';
import { AdminDashboardView } from './views/AdminDashboardView.tsx';

import { Product, Category, SiteSettings, Order } from './types/index.ts';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS } from './data/seedData.ts';
import { api } from './services/api.ts';

function MainApp() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();

  // Core state
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Data
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const [prods, cats, sets] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSettings(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setSettings(sets);
    } catch {
      // seed fallback active
    }
  };

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'contact') {
      setCurrentView('home');
      setViewParam('');
      setTimeout(() => {
        const el = document.getElementById('contact-us');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    if (view === 'deploy') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentView('admin');
      setViewParam('section=github');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
    setViewParam(param || '');
  };

  const handleSelectProduct = (product: Product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedProduct(product);
    setCurrentView('product');
  };

  const handleOrderSuccess = (order: Order) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCompletedOrder(order);
    setCurrentView('order-success');
  };

  // Parse viewParam for shop filters (e.g. category=personalized-gifts or filter=bestseller or sale=true)
  let parsedCategory = 'all';
  let parsedFilter = 'all';
  let parsedOccasion = 'all';
  let parsedSale = false;

  if (viewParam) {
    const params = new URLSearchParams(viewParam);
    if (params.get('category')) parsedCategory = params.get('category')!;
    if (params.get('filter')) parsedFilter = params.get('filter')!;
    if (params.get('occasion')) parsedOccasion = params.get('occasion')!;
    if (params.get('sale')) parsedSale = params.get('sale') === 'true';
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1EE] text-[#483A38]">
      {/* Global Header (hidden on admin full view or kept with banner) */}
      <Header
        settings={settings}
        categories={categories}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Content Router with smooth view transition */}
      <main key={currentView} className="flex-1 animate-fadeIn">
        {currentView === 'home' && (
          <HomeView
            products={products}
            categories={categories}
            settings={settings}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {currentView === 'shop' && (
          <ShopView
            products={products}
            categories={categories}
            initialCategory={parsedCategory}
            initialFilter={parsedFilter}
            initialOccasion={parsedOccasion}
            initialSale={parsedSale}
            onSelectProduct={handleSelectProduct}
            onQuickView={(p) => setQuickViewProduct(p)}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'product' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            allProducts={products}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateToShop={() => handleNavigate('shop')}
            onSelectProduct={handleSelectProduct}
            onNavigateToCheckout={() => handleNavigate('checkout')}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            onNavigateToCheckout={() => handleNavigate('checkout')}
            onNavigateToShop={() => handleNavigate('shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onOrderSuccess={handleOrderSuccess}
            onBackToCart={() => handleNavigate('cart')}
          />
        )}

        {currentView === 'order-success' && completedOrder && (
          <OrderSuccessView
            order={completedOrder}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateToAccount={() => handleNavigate('account')}
          />
        )}

        {currentView === 'account' && (
          <AccountView
            allProducts={products}
            onSelectProduct={handleSelectProduct}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateToShop={() => handleNavigate('shop')}
            onNavigateToAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistView
            allProducts={products}
            onSelectProduct={handleSelectProduct}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateToShop={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            initialProducts={products}
            initialCategories={categories}
            initialSettings={settings}
            initialSection={viewParam === 'section=github' ? 'github' : undefined}
            onRefreshData={loadStoreData}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Global Multi-Column Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => handleNavigate('checkout')}
        onNavigateToCart={() => handleNavigate('cart')}
        onNavigateToShop={() => handleNavigate('shop')}
      />

      {/* Search Overlay Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigateToCategory={(catSlug) => handleNavigate('shop', `category=${catSlug}`)}
      />

      {/* Quick View Customization Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFullDetails={handleSelectProduct}
      />

      {/* User Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
