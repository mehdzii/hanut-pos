import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import type { Customer } from '../../types';
import { CustomerDetailModal } from './CustomerDetailModal';
import {
  Search,
  UserPlus,
  ArrowUpDown,
  AlertTriangle,
  Users,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';

export const DebtTrackerScreen: React.FC = () => {
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'debt' | 'name'>('debt');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAmounts, setShowAmounts] = useState<boolean>(false); // Privacy mode default: HIDDEN

  // New Customer Form State
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');

  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];

  // Filter customers
  let filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  // Sort customers
  if (sortBy === 'debt') {
    filtered.sort((a, b) => b.total_owed - a.total_owed);
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }

  // Aggregate stats
  const totalDebtSum = customers.reduce((sum, c) => sum + c.total_owed, 0);
  const activeDebtorsCount = customers.filter((c) => c.total_owed > 0).length;
  const overdueCount = customers.filter((c) => {
    if (c.total_owed <= 0) return false;
    const timeDiff = new Date().getTime() - new Date(c.last_activity).getTime();
    return timeDiff > 30 * 24 * 60 * 60 * 1000;
  }).length;

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name: newName.trim(),
      phone: newPhone.trim() || undefined,
      total_owed: 0,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };

    await db.customers.add(newCust);
    setNewName('');
    setNewPhone('');
    setShowAddModal(false);
    setSelectedCustomer(newCust);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-6">
      
      {/* STATS HEADER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Total Owed Card (Masked in Privacy Mode) */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {t.total_debt}
              </span>
              <button
                onClick={() => setShowAmounts(!showAmounts)}
                className="text-slate-400 hover:text-amber-500 transition-colors p-0.5"
                title={showAmounts ? 'إخفاء المبالغ (وضع الخصوصية)' : 'إظهار المبالغ'}
              >
                {showAmounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            </div>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight dir-ltr">
              {showAmounts ? totalDebtSum.toFixed(2) : '••••••'}{' '}
              <span className="text-xs text-slate-400">{t.currency}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Active Debtors Card */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              عدد المدينين
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {activeDebtorsCount} <span className="text-xs text-slate-400 font-normal">زبون</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Accounts Card */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              ديون متأخرة (+30 يوم)
            </span>
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono tracking-tight">
              {overdueCount} <span className="text-xs text-slate-400 font-normal">حساب</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH BAR WITH PRIVACY TOGGLE */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.search_customer}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl ps-10 pe-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Sort, Privacy Toggle & Add Customer Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Privacy Toggle Button */}
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              !showAmounts
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
            title={showAmounts ? 'وضع الخصوصية: إخفاء المبالغ' : 'عرض المبالغ'}
          >
            {showAmounts ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-amber-500" />}
            <span>{showAmounts ? 'وضع الخصوصية' : 'إظهار المبالغ'}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSortBy('debt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                sortBy === 'debt'
                  ? 'bg-amber-500 text-white dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{t.sort_highest_debt}</span>
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === 'name'
                  ? 'bg-amber-500 text-white dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.sort_name}
            </button>
          </div>

          {/* Add Customer Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white dark:text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 whitespace-nowrap transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.add_customer}</span>
          </button>
        </div>

      </div>

      {/* CUSTOMER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length > 0 ? (
          filtered.map((customer) => {
            const isOverdue =
              customer.total_owed > 0 &&
              new Date().getTime() - new Date(customer.last_activity).getTime() >
                30 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isOverdue
                    ? 'bg-white dark:bg-slate-900/80 hover:bg-rose-50/50 border-rose-400 dark:border-rose-500/50 shadow-sm shadow-rose-500/10'
                    : customer.total_owed > 0
                    ? 'bg-white dark:bg-slate-900/80 hover:bg-amber-50/40 dark:hover:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-amber-400 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {customer.name}
                      </h3>
                      {customer.phone && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 dir-ltr text-start flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{customer.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {isOverdue && (
                    <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse-slow">
                      {t.overdue_badge}
                    </span>
                  )}
                </div>

                {/* Footer Balance & Action (Masked in Privacy Mode) */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                      {t.total_debt}
                    </span>
                    <span
                      className={`text-lg font-black font-mono dir-ltr ${
                        customer.total_owed > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {showAmounts ? (
                        <>
                          {customer.total_owed.toFixed(2)}{' '}
                          <span className="text-xs font-normal text-slate-400">{t.currency}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">•••••• (انقر للتفاصيل)</span>
                      )}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all">
                    {dir === 'rtl' ? (
                      <ChevronLeft className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            لم يتم العثور على زبناء مطابقين لـ "{searchTerm}"
          </div>
        )}
      </div>

      {/* Customer Detail & Visit History Modal (Opened on Tap) */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4">
          <form
            onSubmit={handleCreateCustomer}
            className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4"
          >
            <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              <span>{t.add_customer}</span>
            </h2>

            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.customer_name} *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثال: كريم منصوري"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.phone_number}</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="0663456789"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
