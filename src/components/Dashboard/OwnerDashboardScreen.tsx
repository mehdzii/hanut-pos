import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import type { Customer } from '../../types';
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  Package,
  MessageCircle,
  Edit3,
  Check,
  Sparkles,
  Crown
} from 'lucide-react';

export const OwnerDashboardScreen: React.FC = () => {
  const { t } = useLanguage();

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceVal, setNewPriceVal] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Live Database Queries
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const sales = useLiveQuery(() => db.sales.toArray(), []) || [];

  // Financial Metrics
  const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const cashSalesTotal = sales
    .filter((s) => s.payment_method === 'paid')
    .reduce((sum, s) => sum + s.total_amount, 0);
  const creditSalesTotal = sales
    .filter((s) => s.payment_method === 'credit')
    .reduce((sum, s) => sum + s.total_amount, 0);

  const totalDebtOwed = customers.reduce((sum, c) => sum + c.total_owed, 0);
  const activeDebtors = customers.filter((c) => c.total_owed > 0);
  const overdueDebtors = activeDebtors.filter((c) => {
    const timeDiff = new Date().getTime() - new Date(c.last_activity).getTime();
    return timeDiff > 30 * 24 * 60 * 60 * 1000;
  });

  // Low Stock Items (< 10)
  const lowStockProducts = products.filter((p) => p.stock_quantity <= 10);

  // Top Selling Products (Sorted by times_sold_total)
  const topSellingProducts = [...products]
    .sort((a, b) => b.times_sold_total - a.times_sold_total)
    .slice(0, 5);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Remote Price Editor Handler
  const handleSaveNewPrice = async (productId: string) => {
    const priceNum = parseFloat(newPriceVal);
    if (isNaN(priceNum) || priceNum <= 0) return;

    await db.products.update(productId, { price: priceNum });
    setEditingPriceId(null);
    setNewPriceVal('');
    showToast('تم تحديث السعر بنجاح وسينعكس فوراً عند البائع! 🏷️');
  };

  // 1-Click Individual Customer WhatsApp Debt Reminder
  const handleSendWhatsAppReminder = (customer: Customer) => {
    if (!customer.phone) {
      alert('رقم هاتف الزبون غير مسجل');
      return;
    }

    const cleanPhone = customer.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') ? '212' + cleanPhone.slice(1) : cleanPhone;

    const message = `أهلاً ${customer.name} 👋\nنذكركم بلطف بأن مجموع الدين المعلق لحسابكم لدى خالد هو: *${customer.total_owed.toFixed(2)} MAD*.\nشكراً جزيلاً لتعاونكم معنا! 🙏`;

    const waUrl = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-10">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 start-1/2 -translate-x-1/2 z-50 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 animate-bounce-short">
          <Check className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER TITLE */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>لوحة تحكم مالك المحل</span>
              <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
                Executive Owner
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تحليل المبيعات، مراقبة ديون الزبناء، وتعديل الأسعار والمخزون عن بُعد
            </p>
          </div>
        </div>
      </div>

      {/* FINANCIAL STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Revenue */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              إجمالي المبيعات
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight dir-ltr block mt-1">
              {totalRevenue.toFixed(2)} <span className="text-xs text-slate-400 font-normal">{t.currency}</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {sales.length} عملية بيع مسجلة
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Cash Sales vs Credit Sales */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              مبيعات الكاش / الديون
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {cashSalesTotal.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">كاش</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                {creditSalesTotal.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">دين</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              نسبة التحصيل: {totalRevenue > 0 ? ((cashSalesTotal / totalRevenue) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Total Outstanding Debt */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              مجموع الديون المعلقة
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight dir-ltr block mt-1">
              {totalDebtOwed.toFixed(2)} <span className="text-xs text-slate-400 font-normal">{t.currency}</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              لدى {activeDebtors.length} زبون
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue Debtors (+30 Days) */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              ديون متأخرة (+30 يوم)
            </span>
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono tracking-tight block mt-1">
              {overdueDebtors.length} <span className="text-xs text-slate-400 font-normal">حساب متأخر</span>
            </span>
            <span className="text-[11px] text-orange-500 mt-1 block font-bold">
              تتطلب متابعة وإرسال تذكير
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* CUSTOMER DEBTORS AUDIT & 1-CLICK WHATSAPP REMINDERS */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>متابعة ديون الزبناء وإرسال التذكيرات</span>
              </h2>
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-bold">
                {activeDebtors.length} زبون
              </span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto no-scrollbar pe-1">
              {activeDebtors.length > 0 ? (
                activeDebtors.map((customer) => {
                  const isOverdue =
                    new Date().getTime() - new Date(customer.last_activity).getTime() >
                    30 * 24 * 60 * 60 * 1000;

                  return (
                    <div
                      key={customer.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        isOverdue
                          ? 'bg-rose-500/5 border-rose-400 dark:border-rose-500/40'
                          : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {customer.name}
                          </h4>
                          {isOverdue && (
                            <span className="text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                              متأخر ⚠️
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-black mt-0.5">
                          {customer.total_owed.toFixed(2)} MAD
                        </p>
                      </div>

                      <button
                        onClick={() => handleSendWhatsAppReminder(customer)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                        title="إرسال تذكير بالدين عبر الواتساب"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>تذكير WhatsApp 📲</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  لا توجد ديون معلقة حالياً 🎉
                </div>
              )}
            </div>
          </div>
        </div>

        {/* REMOTE PRICE EDITOR & INVENTORY MANAGEMENT */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-500" />
                <span>تعديل أسعار المنتجات عن بُعد</span>
              </h2>
              <span className="text-xs text-slate-400 font-bold">ينعكس فوراً للبائع</span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto no-scrollbar pe-1">
              {products.map((product) => {
                const isEditing = editingPriceId === product.id;

                return (
                  <div
                    key={product.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={product.image_url}
                        alt={product.name_ar}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {product.name_ar}
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          المخزون: {product.stock_quantity} قطعة
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            value={newPriceVal}
                            onChange={(e) => setNewPriceVal(e.target.value)}
                            placeholder={product.price.toString()}
                            className="w-20 bg-slate-50 dark:bg-slate-950 border border-emerald-500 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveNewPrice(product.id!)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs font-mono text-emerald-600 dark:text-emerald-400">
                            {product.price.toFixed(2)} MAD
                          </span>
                          <button
                            onClick={() => {
                              setEditingPriceId(product.id!);
                              setNewPriceVal(product.price.toString());
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="تعديل السعر"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* LOW STOCK ALERTS & TOP SELLERS LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Low Stock Alerts */}
        <div className="glass-panel p-5 rounded-3xl border border-rose-500/30">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-black text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>تنبيهات المخزون المنخفض (أقل من 10 قطع)</span>
            </h2>
            <span className="text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold font-mono">
              {lowStockProducts.length} منتجات
            </span>
          </div>

          <div className="space-y-2">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((p) => (
                <div
                  key={'low-' + p.id}
                  className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between"
                >
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {p.name_ar}
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    متبقي {p.stock_quantity} قطعة فقط ⚠️
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                جميع المنتجات متوفرة بمخزون جيد 👍
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Selling Products */}
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/30">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-black text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>أكثر 5 منتجات مبيعاً بالمتجر ⭐</span>
            </h2>
          </div>

          <div className="space-y-2">
            {topSellingProducts.map((p, idx) => (
              <div
                key={'top-' + p.id}
                className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white dark:text-slate-950 font-black text-[11px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {p.name_ar}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  تم بيع {p.times_sold_total} وحدة 🔥
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
