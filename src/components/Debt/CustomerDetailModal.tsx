import React, { useState } from 'react';
import type { Customer, CreditPayment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import confetti from 'canvas-confetti';
import {
  X,
  UserCheck,
  Calendar,
  DollarSign,
  CheckCircle2,
  History,
  Receipt
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, onClose }) => {
  const { t } = useLanguage();
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch sales for this customer
  const sales =
    useLiveQuery(
      () =>
        db.sales
          .where('customer_id')
          .equals(customer.id!)
          .reverse()
          .sortBy('created_at'),
      [customer.id]
    ) || [];

  // Fetch payments for this customer
  const payments =
    useLiveQuery(
      () =>
        db.credit_payments
          .where('customer_id')
          .equals(customer.id!)
          .reverse()
          .sortBy('created_at'),
      [customer.id]
    ) || [];

  const handleLogPayment = async (amountToPay: number, isFull: boolean = false) => {
    if (amountToPay <= 0 || !customer.id) return;

    const now = new Date().toISOString();

    // Create payment log
    const paymentRecord: CreditPayment = {
      id: 'pay-' + Date.now(),
      customer_id: customer.id,
      amount: amountToPay,
      created_at: now,
      notes: paymentNotes || (isFull ? t.full_settlement : t.partial_payment)
    };

    await db.credit_payments.add(paymentRecord);

    // Update customer total_owed balance
    const newTotalOwed = Math.max(0, customer.total_owed - amountToPay);
    await db.customers.update(customer.id, {
      total_owed: newTotalOwed,
      last_activity: now
    });

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 }
    });

    setSuccessMsg(t.payment_success);
    setPaymentAmount('');
    setPaymentNotes('');
    setShowPaymentForm(false);

    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
  };

  const isOverdue =
    customer.total_owed > 0 &&
    new Date().getTime() - new Date(customer.last_activity).getTime() >
      30 * 24 * 60 * 60 * 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{customer.name}</span>
                {isOverdue && (
                  <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                    {t.overdue_badge}
                  </span>
                )}
              </h2>
              {customer.phone && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 dir-ltr text-start">
                  📱 {customer.phone}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card & Quick Payment Trigger */}
        <div className="my-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              {t.total_debt}
            </span>
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono dir-ltr">
              {customer.total_owed.toFixed(2)} <span className="text-xs text-slate-400">{t.currency}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {customer.total_owed > 0 && (
              <>
                <button
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{t.log_payment}</span>
                </button>
                <button
                  onClick={() => handleLogPayment(customer.total_owed, true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all whitespace-nowrap"
                >
                  {t.full_settlement}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Success Message Toast */}
        {successMsg && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Payment Entry Form Drawer */}
        {showPaymentForm && (
          <div className="mb-4 bg-slate-50 dark:bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/40 space-y-3">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>{t.log_payment}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.enter_payment_amount}</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max={customer.total_owed}
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">ملاحظات (اختياري)</label>
                <input
                  type="text"
                  placeholder="دفعة تسديد..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  const val = parseFloat(paymentAmount);
                  if (!isNaN(val) && val > 0) {
                    handleLogPayment(val);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all"
              >
                تأكيد السداد الجزئي
              </button>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Visit & Payment History Tabs Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pe-1 no-scrollbar">
          
          {/* MULTI-VISIT SALES TIMELINE */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>{t.visit_history} ({sales.length})</span>
            </h3>

            {sales.length > 0 ? (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(sale.created_at).toLocaleString('ar-MA', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 font-mono dir-ltr text-sm">
                        {sale.total_amount.toFixed(2)} {t.currency}
                      </span>
                    </div>

                    {/* Item Breakdown */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl text-xs space-y-1">
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span>
                            {item.product_name_ar || item.product_name} x <strong>{item.quantity}</strong>
                          </span>
                          <span className="font-mono text-slate-500 dark:text-slate-400 dir-ltr">
                            {(item.price * item.quantity).toFixed(2)} {t.currency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-slate-400 text-xs">لا يوجد سجل مشتريات بالدين سابق هذا الزبون.</p>
            )}
          </div>

          {/* PAYMENT RECEIVED AUDIT LOG */}
          {payments.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <History className="w-4 h-4 text-emerald-500" />
                <span>{t.payment_history} ({payments.length})</span>
              </h3>

              <div className="space-y-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs"
                  >
                    <div>
                      <span className="text-slate-800 dark:text-slate-300 font-bold block">{p.notes || 'تسديد دين'}</span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(p.created_at).toLocaleString('ar-MA')}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm font-mono dir-ltr">
                      -{p.amount.toFixed(2)} {t.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
