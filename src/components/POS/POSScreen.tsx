import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { ProductTile } from './ProductTile';
import { CreditCheckoutModal } from './CreditCheckoutModal';
import type { Customer, Sale } from '../../types';
import confetti from 'canvas-confetti';
import {
  Search,
  Undo2,
  Trash2,
  Banknote,
  Clock,
  Sparkles,
  Layers,
  ShoppingBag,
  CheckCircle2,
  X,
  ChevronUp
} from 'lucide-react';
import { syncLocalDBToMongoDB } from '../../services/apiSync';

export const POSScreen: React.FC = () => {
  const { t } = useLanguage();
  const {
    activeCartId,
    setActiveCartId,
    carts,
    activeCart,
    addItem,
    updateQuantity,
    undoLastTap,
    clearActiveCart,
    activeCartTotal,
    activeCartItemCount,
    canUndo
  } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreditModal, setShowCreditModal] = useState<boolean>(false);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Live queries for Products
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  
  // Popular products (Top 8 by recent sales count)
  const popularProducts = useLiveQuery(
    () => db.products.orderBy('times_sold_recent').reverse().limit(8).toArray(),
    []
  ) || [];

  // Filter products by search and category
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_ar.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#3b82f6', '#f59e0b']
    });
  };

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  // Complete Cash Payment
  const handleCashCheckout = async () => {
    if (activeCart.length === 0) return;

    const now = new Date().toISOString();

    const saleItems = activeCart.map((item) => ({
      product_id: item.product.id!,
      product_name: item.product.name,
      product_name_ar: item.product.name_ar,
      price: item.product.price,
      quantity: item.quantity
    }));

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      items: saleItems,
      total_amount: activeCartTotal,
      payment_method: 'paid',
      created_at: now
    };

    // Save sale log
    await db.sales.add(newSale);

    // Update stock levels and sales counters
    for (const item of activeCart) {
      if (item.product.id) {
        const prod = await db.products.get(item.product.id);
        if (prod) {
          await db.products.update(item.product.id, {
            stock_quantity: Math.max(0, prod.stock_quantity - item.quantity),
            times_sold_total: prod.times_sold_total + item.quantity,
            times_sold_recent: prod.times_sold_recent + item.quantity,
            last_sold_at: now
          });
        }
      }
    }

    clearActiveCart();
    setShowCartDrawer(false);
    triggerCelebration();
    showToast(t.sale_completed);
    syncLocalDBToMongoDB().catch(() => {});
  };

  // Complete Credit Payment
  const handleConfirmCreditSale = async (customer: Customer) => {
    if (activeCart.length === 0 || !customer.id) return;

    const now = new Date().toISOString();

    const saleItems = activeCart.map((item) => ({
      product_id: item.product.id!,
      product_name: item.product.name,
      product_name_ar: item.product.name_ar,
      price: item.product.price,
      quantity: item.quantity
    }));

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      items: saleItems,
      total_amount: activeCartTotal,
      payment_method: 'credit',
      customer_id: customer.id,
      customer_name: customer.name,
      created_at: now
    };

    await db.sales.add(newSale);

    // Update customer total_owed balance and last_activity
    await db.customers.update(customer.id, {
      total_owed: customer.total_owed + activeCartTotal,
      last_activity: now
    });

    // Update product stock and stats
    for (const item of activeCart) {
      if (item.product.id) {
        const prod = await db.products.get(item.product.id);
        if (prod) {
          await db.products.update(item.product.id, {
            stock_quantity: Math.max(0, prod.stock_quantity - item.quantity),
            times_sold_total: prod.times_sold_total + item.quantity,
            times_sold_recent: prod.times_sold_recent + item.quantity,
            last_sold_at: now
          });
        }
      }
    }

    clearActiveCart();
    setShowCreditModal(false);
    setShowCartDrawer(false);
    triggerCelebration();
    showToast(`تم تسجيل الدين على حساب ${customer.name} بنجاح!`);
    syncLocalDBToMongoDB().catch(() => {});
  };

  const categories = [
    { id: 'all', label: t.cat_all },
    { id: 'dairy', label: t.cat_dairy },
    { id: 'bakery', label: t.cat_bakery },
    { id: 'drinks', label: t.cat_drinks },
    { id: 'pantry', label: t.cat_pantry },
    { id: 'snacks', label: t.cat_snacks },
    { id: 'hygiene', label: t.cat_hygiene }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] overflow-hidden relative pb-16">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 start-1/2 -translate-x-1/2 z-50 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 animate-bounce-short">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* FULL SCREEN PRODUCT CATALOG & CONTROLS */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 p-4">
        
        {/* Top Controls: Search + Hold Cart Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.search_product}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl ps-10 pe-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Hold Cart Switcher Tabs */}
          <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-950/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            {['cart-1', 'cart-2', 'cart-3'].map((cId, idx) => {
              const cartItems = carts[cId] || [];
              const cartItemCount = cartItems.reduce((s, i) => s + i.quantity, 0);
              const isActive = activeCartId === cId;
              return (
                <button
                  key={cId}
                  onClick={() => setActiveCartId(cId)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>سلة {idx + 1}</span>
                  {cartItemCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-white/20 text-white dark:bg-slate-950 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-md'
                  : 'bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Catalog Scroll Container (Full Height & Grid) */}
        <div className="flex-1 overflow-y-auto pe-1 space-y-6 no-scrollbar pb-12">
          
          {/* PINNED POPULAR SECTION (Top 8 recent sales items) */}
          {selectedCategory === 'all' && searchQuery === '' && popularProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {t.popular}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {popularProducts.map((product) => {
                  const cartItem = activeCart.find((ci) => ci.product.id === product.id);
                  return (
                    <ProductTile
                      key={'pop-' + product.id}
                      product={product}
                      isPopular={true}
                      quantityInCart={cartItem ? cartItem.quantity : 0}
                      onTap={addItem}
                      onUpdateQty={updateQuantity}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* MAIN PRODUCT CATALOG GRID */}
          <div>
            {selectedCategory === 'all' && searchQuery === '' && (
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>جميع المنتجات ({filteredProducts.length})</span>
              </h2>
            )}

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredProducts.map((product) => {
                  const cartItem = activeCart.find((ci) => ci.product.id === product.id);
                  return (
                    <ProductTile
                      key={product.id}
                      product={product}
                      quantityInCart={cartItem ? cartItem.quantity : 0}
                      onTap={addItem}
                      onUpdateQty={updateQuantity}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-sm">
                لم يتم العثور على منتجات مطابقة لـ "{searchQuery}"
              </div>
            )}
          </div>

        </div>
      </div>

      {/* STICKY FLOATING CART BAR (Elevated on mobile above bottom navbar) */}
      <div className="fixed bottom-16 sm:bottom-3 start-3 end-3 sm:start-4 sm:end-4 z-30 max-w-4xl mx-auto">
        <div
          onClick={() => setShowCartDrawer(true)}
          className="glass-panel p-2.5 sm:p-3 rounded-2xl border border-emerald-500/50 shadow-xl shadow-emerald-500/10 flex items-center justify-between cursor-pointer group hover:border-emerald-500 transition-all"
        >
          {/* Left / Info side: Item count & Total */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white dark:text-slate-950 font-bold shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
              {activeCartItemCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                  {activeCartItemCount}
                </span>
              )}
            </div>

            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block flex items-center gap-1">
                <span>{activeCartItemCount > 0 ? `${activeCartItemCount} عناصر بالسلة` : 'السلة فارغة'}</span>
                <ChevronUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:-translate-y-0.5 transition-transform" />
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono dir-ltr">
                {activeCartTotal.toFixed(2)} <span className="text-xs text-slate-400">{t.currency}</span>
              </span>
            </div>
          </div>

          {/* Right side: Quick Action Buttons */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              disabled={activeCart.length === 0}
              onClick={handleCashCheckout}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Banknote className="w-4 h-4" />
              <span>{t.pay_cash}</span>
            </button>

            <button
              disabled={activeCart.length === 0}
              onClick={() => setShowCreditModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Clock className="w-4 h-4" />
              <span>{t.pay_credit}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FULL CART SLIDE-UP DRAWER MODAL */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-lg glass-panel p-5 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col max-h-[85vh] animate-slideUp">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">{t.cart}</h2>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                  ({activeCartItemCount})
                </span>
              </div>

              {/* Quick Actions: Undo & Clear */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={!canUndo}
                  onClick={undoLastTap}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800 flex items-center gap-1 transition-all"
                  title={t.undo}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>{t.undo}</span>
                </button>
                <button
                  disabled={activeCart.length === 0}
                  onClick={() => {
                    if (window.confirm(t.confirm_clear_cart)) {
                      clearActiveCart();
                    }
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 transition-all"
                  title={t.clear_cart}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-400 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Itemized Cart List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2 no-scrollbar min-h-[160px]">
              {activeCart.length > 0 ? (
                activeCart.map((item) => {
                  const name = t.currency === 'MAD' ? item.product.name_ar : item.product.name;
                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80"
                    >
                      <div className="flex-1 min-w-0 me-2">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 dir-ltr text-start">
                          {item.quantity} x {item.product.price.toFixed(2)} {t.currency}
                        </p>
                      </div>
                      <div className="text-end">
                        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono dir-ltr">
                          {(item.product.price * item.quantity).toFixed(2)} {t.currency}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ShoppingBag className="w-10 h-10 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs">{t.empty_cart}</p>
                </div>
              )}
            </div>

            {/* Drawer Total & Checkout Buttons */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.total}</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight dir-ltr">
                  {activeCartTotal.toFixed(2)} <span className="text-xs text-slate-500">{t.currency}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={activeCart.length === 0}
                  onClick={handleCashCheckout}
                  className="py-3.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Banknote className="w-4 h-4" />
                  <span>{t.pay_cash}</span>
                </button>

                <button
                  disabled={activeCart.length === 0}
                  onClick={() => setShowCreditModal(true)}
                  className="py-3.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Clock className="w-4 h-4" />
                  <span>{t.pay_credit}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Credit Checkout Modal Drawer */}
      {showCreditModal && (
        <CreditCheckoutModal
          totalAmount={activeCartTotal}
          onClose={() => setShowCreditModal(false)}
          onConfirmCreditSale={handleConfirmCreditSale}
        />
      )}

    </div>
  );
};
