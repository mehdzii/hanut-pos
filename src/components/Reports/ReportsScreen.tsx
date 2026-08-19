import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  Award
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const sales = useLiveQuery(() => db.sales.toArray(), []) || [];
  const payments = useLiveQuery(() => db.credit_payments.toArray(), []) || [];

  // Filter based on period
  const now = new Date();
  let startTime = new Date();
  if (period === 'today') {
    startTime.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    startTime.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    startTime.setDate(now.getDate() - 30);
  }

  const periodSales = sales.filter((s) => new Date(s.created_at) >= startTime);
  const periodPayments = payments.filter((p) => new Date(p.created_at) >= startTime);

  // Financial aggregates
  const totalRevenue = periodSales.reduce((sum, s) => sum + s.total_amount, 0);
  const directCashSales = periodSales
    .filter((s) => s.payment_method === 'paid')
    .reduce((sum, s) => sum + s.total_amount, 0);
  const newCreditGiven = periodSales
    .filter((s) => s.payment_method === 'credit')
    .reduce((sum, s) => sum + s.total_amount, 0);
  const debtRecovered = periodPayments.reduce((sum, p) => sum + p.amount, 0);

  // Total cash inside the till = direct cash sales + debt payments received in cash
  const totalCashInTill = directCashSales + debtRecovered;
  const totalOrdersCount = periodSales.length;

  // Compute Top 5 Sold Products in this period
  const productStats: Record<
    string,
    { name: string; name_ar: string; quantity: number; revenue: number }
  > = {};

  periodSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productStats[item.product_id]) {
        productStats[item.product_id] = {
          name: item.product_name,
          name_ar: item.product_name_ar,
          quantity: 0,
          revenue: 0
        };
      }
      productStats[item.product_id].quantity += item.quantity;
      productStats[item.product_id].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-6">
      
      {/* PERIOD FILTER SWITCHER */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t.today_summary}</span>
          <span className="text-xs text-slate-500 font-normal">({totalOrdersCount} عملية)</span>
        </h2>

        <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setPeriod('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'today'
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            اليوم (Today)
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'week'
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            آخر 7 أيام
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'month'
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            آخر 30 يوم
          </button>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Revenue */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              {t.total_revenue}
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight dir-ltr">
              {totalRevenue.toFixed(2)} <span className="text-xs text-slate-400">{t.currency}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Cash in Till */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              إجمالي النقد بالقاصة
            </span>
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono tracking-tight dir-ltr block mt-0.5">
              {totalCashInTill.toFixed(2)} <span className="text-xs text-slate-400">{t.currency}</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
              كاش مباشر: {directCashSales.toFixed(0)} + ديون محصلة: {debtRecovered.toFixed(0)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* New Credit Issued */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              {t.new_credit_given}
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight dir-ltr">
              {newCreditGiven.toFixed(2)} <span className="text-xs text-slate-400">{t.currency}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Debt Recovered */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              {t.debt_recovered}
            </span>
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono tracking-tight dir-ltr">
              {debtRecovered.toFixed(2)} <span className="text-xs text-slate-400">{t.currency}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* TOP 5 PRODUCTS RANKING */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-4">
          <Award className="w-5 h-5" />
          <span>{t.top_selling_today}</span>
        </h3>

        {topProducts.length > 0 ? (
          <div className="space-y-3">
            {topProducts.map((prod, idx) => {
              const displayName = language === 'ar' ? prod.name_ar : prod.name;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{displayName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        تم بيع: <strong className="text-emerald-600 dark:text-emerald-400">{prod.quantity} قطعة</strong>
                      </p>
                    </div>
                  </div>

                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm font-mono dir-ltr">
                    {prod.revenue.toFixed(2)} {t.currency}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-slate-400 text-sm">
            لا توجد مبيعات مسجلة في هذه الفترة الزمنية.
          </p>
        )}
      </div>

    </div>
  );
};
