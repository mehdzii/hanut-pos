import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, Delete, Store } from 'lucide-react';

export const PinPadModal: React.FC = () => {
  const { unlockApp } = useAuth();
  const { t } = useLanguage();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const verifyPin = async (inputPin: string) => {
    const success = await unlockApp(inputPin);
    if (!success) {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/95 backdrop-blur-xl p-4">
      <div className="w-full max-w-sm glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
        
        {/* Header Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
          <Store className="w-9 h-9 text-white" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-wide">{t.app_name}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.app_subtitle}</p>

        {/* Status prompt */}
        <div className="mt-6 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>{t.enter_pin_desc}</span>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-4 my-6 dir-ltr">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                error
                  ? 'border-rose-500 bg-rose-500/30 scale-110'
                  : pin.length > index
                  ? 'border-emerald-500 bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/50'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-rose-500 dark:text-rose-400 text-xs font-medium mb-4 animate-shake">
            {t.incorrect_pin}
          </p>
        )}

        {/* Keypad (Strict LTR direction) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] my-2 dir-ltr" dir="ltr">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num)}
              className="w-16 h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 active:bg-emerald-600 active:text-white dark:active:bg-emerald-500 dark:active:text-slate-950 active:scale-95 text-xl font-bold text-slate-900 dark:text-slate-100 transition-all flex items-center justify-center border border-slate-200 dark:border-slate-800/80 shadow-sm mx-auto"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center border border-slate-200 dark:border-slate-800/50 mx-auto"
          >
            C
          </button>
          <button
            onClick={() => handleNumClick('0')}
            className="w-16 h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 active:bg-emerald-600 active:text-white dark:active:bg-emerald-500 dark:active:text-slate-950 active:scale-95 text-xl font-bold text-slate-900 dark:text-slate-100 transition-all flex items-center justify-center border border-slate-200 dark:border-slate-800/80 shadow-sm mx-auto"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center border border-slate-200 dark:border-slate-800/50 mx-auto"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
