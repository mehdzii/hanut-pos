import React, { useState } from 'react';
import type { Customer } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Search, UserPlus, CheckCircle, X, AlertCircle } from 'lucide-react';

interface CreditCheckoutModalProps {
  totalAmount: number;
  onClose: () => void;
  onConfirmCreditSale: (customer: Customer) => void;
}

export const CreditCheckoutModal: React.FC<CreditCheckoutModalProps> = ({
  totalAmount,
  onClose,
  onConfirmCreditSale
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New Customer Form State
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [addError, setAddError] = useState<string>('');

  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleAddNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setAddError('الرجاء إدخال اسم الزبون');
      return;
    }

    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name: newName.trim(),
      phone: newPhone.trim() || undefined,
      total_owed: 0,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };

    await db.customers.add(newCust);
    setSelectedCustomerId(newCust.id!);
    setShowAddForm(false);
    setNewName('');
    setNewPhone('');
    setAddError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t.select_customer}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.total}: <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-mono dir-ltr">{totalAmount.toFixed(2)} {t.currency}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Customer Toggle */}
        {!showAddForm ? (
          <div className="my-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.search_customer}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl ps-10 pe-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.quick_add_customer}</span>
              </button>
            </div>

            {/* Customer Selectable List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pe-1 no-scrollbar">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => {
                  const isSelected = customer.id === selectedCustomerId;
                  return (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id!)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{customer.name}</h4>
                        {customer.phone && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 dir-ltr text-start">
                            {customer.phone}
                          </p>
                        )}
                      </div>

                      <div className="text-end">
                        <span className="text-[11px] text-slate-400 block">{t.total_debt}</span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono dir-ltr">
                          {customer.total_owed.toFixed(2)} {t.currency}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  لم يتم العثور على زبون. انقر على "+ زبون جديد" لإضافته مباشرة.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Inline Add Customer Form */
          <form onSubmit={handleAddNewCustomer} className="my-4 bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-500" />
              {t.add_customer}
            </h3>
            {addError && <p className="text-xs text-rose-500">{addError}</p>}
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.customer_name} *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثال: أحمد بنعلي"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.phone_number}</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="0661234567"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white dark:text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md"
              >
                {t.save}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer / Action Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 mt-auto">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all"
          >
            {t.cancel}
          </button>
          <button
            disabled={!selectedCustomer}
            onClick={() => selectedCustomer && onConfirmCreditSale(selectedCustomer)}
            className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>تسجيل الدين على {selectedCustomer ? selectedCustomer.name : '...'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
