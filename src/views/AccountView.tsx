import React, { useState, useEffect } from 'react';
import { Package, Heart, MapPin, User, LogOut, ChevronRight, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { Order, Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface AccountViewProps {
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateHome: () => void;
  onNavigateToShop: () => void;
  onNavigateToAdmin?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  allProducts,
  onSelectProduct,
  onNavigateHome,
  onNavigateToShop,
  onNavigateToAdmin,
}) => {
  const { user, logout, isAdmin } = useAuth();
  const { wishlistIds } = useWishlist();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      api.getOrders(user.email).then((data) => {
        setOrders(data);
        setLoadingOrders(false);
      }).catch(() => setLoadingOrders(false));
    }
  }, [user]);

  const wishlistedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F5F1EE] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-6 mb-8 border-b border-[#E3C5C7] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9A8582]">
              PATRON VAULT
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#483A38] mt-1">
              Account of {user?.name || 'Valued Guest'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="bg-[#483A38] text-white text-xs font-semibold px-4 py-2 uppercase tracking-wider rounded"
              >
                Store Admin Panel →
              </button>
            )}
            <button
              onClick={logout}
              className="text-xs text-red-700 hover:underline flex items-center gap-1"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E3C5C7] mb-8 space-x-6 text-xs font-semibold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'orders'
                ? 'border-[#C49A9C] text-[#483A38]'
                : 'border-transparent text-[#9A8582] hover:text-[#483A38]'
            }`}
          >
            <Package size={15} />
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'wishlist'
                ? 'border-[#C49A9C] text-[#483A38]'
                : 'border-transparent text-[#9A8582] hover:text-[#483A38]'
            }`}
          >
            <Heart size={15} />
            Wishlist ({wishlistedProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'addresses'
                ? 'border-[#C49A9C] text-[#483A38]'
                : 'border-transparent text-[#9A8582] hover:text-[#483A38]'
            }`}
          >
            <MapPin size={15} />
            Addresses
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-[#C49A9C] text-[#483A38]'
                : 'border-transparent text-[#9A8582] hover:text-[#483A38]'
            }`}
          >
            <User size={15} />
            Personal Details
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div className="py-12 text-center text-xs text-[#9A8582]">Retrieving orders...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E3C5C7] p-12 text-center">
                <Package size={36} className="text-[#C49A9C] mx-auto mb-3" />
                <h3 className="font-serif text-xl text-[#483A38] mb-1">No orders yet</h3>
                <p className="text-xs text-[#9A8582] max-w-sm mx-auto mb-6">
                  Surprise someone special today with our signature botanical hampers and custom engraved keepsakes.
                </p>
                <button
                  onClick={onNavigateToShop}
                  className="bg-[#C49A9C] text-[#483A38] text-xs font-semibold px-6 py-2.5 uppercase"
                >
                  Shop Best Sellers
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-xl border border-[#E3C5C7] shadow-xs overflow-hidden"
                  >
                    <div className="bg-[#F5F1EE] p-4 sm:p-5 border-b border-[#E3C5C7] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-[#9A8582] block font-semibold">
                          Order Reference
                        </span>
                        <span className="font-mono font-bold text-[#483A38]">{ord.orderNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#9A8582] block font-semibold">
                          Date Placed
                        </span>
                        <span className="text-[#483A38]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#9A8582] block font-semibold">
                          Total Amount
                        </span>
                        <span className="font-bold text-[#483A38]">₹{ord.total.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#9A8582] block font-semibold">
                          Status
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-[#C49A9C] text-[#483A38]'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-4">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-12 h-14 object-cover rounded bg-[#F5F1EE]"
                            />
                            <div>
                              <p className="font-serif font-medium text-[#483A38]">{item.productName}</p>
                              <p className="text-[11px] text-[#9A8582]">Qty: {item.quantity}</p>
                              {item.personalizationText && (
                                <p className="text-[10px] text-[#D4AF7C]">
                                  Inscription: &ldquo;{item.personalizationText}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-semibold text-[#483A38]">
                            ₹{(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}

                      <div className="pt-4 border-t border-[#E3C5C7] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#9A8582] gap-2">
                        <div className="flex items-center gap-2">
                          <Truck size={14} className="text-[#C49A9C]" />
                          <span>Tracking: <strong>{ord.trackingNumber || 'Processing'}</strong></span>
                        </div>
                        {ord.giftMessage && (
                          <span className="italic line-clamp-1">
                            Note: &ldquo;{ord.giftMessage}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E3C5C7] p-12 text-center">
                <Heart size={36} className="text-[#C49A9C] mx-auto mb-3" />
                <h3 className="font-serif text-xl text-[#483A38] mb-1">Your wishlist is empty</h3>
                <p className="text-xs text-[#9A8582] max-w-sm mx-auto mb-6">
                  Save your desired gifts for birthdays, weddings, and anniversaries by clicking the heart icon on any product.
                </p>
                <button
                  onClick={onNavigateToShop}
                  className="bg-[#C49A9C] text-[#483A38] text-xs font-semibold px-6 py-2.5 uppercase"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
            <div className="bg-white p-6 rounded-xl border border-[#C49A9C] shadow-xs relative">
              <span className="absolute top-4 right-4 text-[10px] uppercase font-semibold bg-[#C49A9C] text-[#483A38] px-2 py-0.5 rounded">
                Default
              </span>
              <h3 className="font-serif text-base text-[#483A38] mb-2">Primary Residence</h3>
              <p className="text-xs font-semibold text-[#483A38]">{user?.name || 'Shivani Verma'}</p>
              <p className="text-xs text-[#9A8582] mt-1">742 Evergreen Terrace, Suite 4B</p>
              <p className="text-xs text-[#9A8582]">San Francisco, CA 94107</p>
              <p className="text-xs text-[#9A8582]">United States</p>
              <p className="text-xs text-[#9A8582] mt-2 font-mono">{user?.phone || '+1 (555) 876-5432'}</p>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-xl border border-[#E3C5C7] shadow-xs max-w-xl space-y-4">
            <h3 className="font-serif text-xl text-[#483A38]">Account Details</h3>
            <div>
              <label className="text-[11px] font-semibold text-[#9A8582] uppercase block mb-1">
                Full Name
              </label>
              <p className="text-sm font-semibold text-[#483A38]">{user?.name}</p>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#9A8582] uppercase block mb-1">
                Email Address
              </label>
              <p className="text-sm font-semibold text-[#483A38]">{user?.email}</p>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#9A8582] uppercase block mb-1">
                Account Privilege Tier
              </label>
              <span className="inline-block text-xs uppercase px-2 py-0.5 rounded bg-[#C49A9C]/50 text-[#483A38] font-semibold">
                {user?.role === 'admin' ? 'Store Administrator (Full Access)' : 'Verified Customer'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
