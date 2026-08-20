import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { syncLocalDBToMongoDB } from '../../services/apiSync';
import {
  Store,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Settings,
  Lock,
  Globe,
  Sun,
  Moon,
  Cloud,
  CheckCircle2,
  Coins
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export type ActiveTab = 'pos' | 'credit' | 'catalog' | 'reports' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { t, language, setLanguage } = useLanguage();
  const { lockApp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currencyMode, setCurrencyMode } = useCurrency();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  // Active debtors count badge
  const activeDebtorsCount =
    useLiveQuery(
      async () => (await db.customers.toArray()).filter((c) => c.total_owed > 0).length,
      []
    ) || 0;

  const handleManualSync = async () => {
    setIsSyncing(true);
    const success = await syncLocalDBToMongoDB();
    setIsSyncing(false);
    if (success) {
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'pos', label: t.pos, icon: <ShoppingCart className="w-5 h-5 sm:w-4 sm:h-4" /> },
    {
      id: 'credit',
      label: t.credit,
      icon: <Users className="w-5 h-5 sm:w-4 sm:h-4" />,
      badge: activeDebtorsCount
    },
    { id: 'catalog', label: t.catalog, icon: <Package className="w-5 h-5 sm:w-4 sm:h-4" /> },
    { id: 'reports', label: t.reports, icon: <BarChart3 className="w-5 h-5 sm:w-4 sm:h-4" /> },
    { id: 'settings', label: t.settings, icon: <Settings className="w-5 h-5 sm:w-4 sm:h-4" /> }
  ];

  return (
    <>
      {/* TOP BRAND HEADER (Logo, Theme, Language & Lock) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 mb-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-wide leading-none">
                {t.app_name}
              </h1>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {t.app_subtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile, visible on sm and up) */}
          <nav className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white/20 text-white dark:bg-slate-950 dark:text-rose-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Top Right Quick Actions */}
          <div className="flex items-center gap-1.5">
            {/* MAD ⇄ RYAL Currency Switcher Pill */}
            <button
              onClick={() => setCurrencyMode(currencyMode === 'MAD' ? 'RYAL' : 'MAD')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-black flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="تغيير وحدة العملة بين الدرهم (MAD) والريال (Ryal - 1MAD=20Ryal)"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{currencyMode === 'MAD' ? 'د.م (MAD)' : 'ريال (20x)'}</span>
            </button>

            {/* MongoDB Cloud Sync Button */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                syncSuccess
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-sky-600 dark:text-sky-400 border-slate-200 dark:border-slate-800'
              }`}
              title="مزامنة مع سحابة MongoDB Atlas"
            >
              {syncSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              )}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-amber-500 dark:text-amber-400 border border-slate-200 dark:border-slate-800 transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-1 transition-all"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Lock App Button */}
            <button
              onClick={lockApp}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-500/10 dark:bg-slate-900 dark:hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition-all"
              title={t.lock_app}
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="sm:hidden fixed bottom-0 start-0 end-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={'mob-' + item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative py-1.5 rounded-2xl text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                  isActive
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -end-2 text-[9px] px-1.5 py-0.1 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white text-rose-600 dark:bg-slate-950 dark:text-rose-400'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-full px-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
