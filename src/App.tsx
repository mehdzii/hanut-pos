import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { initAndSeedDatabase } from './db';
import { Navbar, type ActiveTab } from './components/Layout/Navbar';
import { PinPadModal } from './components/Auth/PinPadModal';
import { POSScreen } from './components/POS/POSScreen';
import { DebtTrackerScreen } from './components/Debt/DebtTrackerScreen';
import { CatalogScreen } from './components/Catalog/CatalogScreen';
import { ReportsScreen } from './components/Reports/ReportsScreen';
import { SettingsScreen } from './components/Settings/SettingsScreen';

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');

  useEffect(() => {
    initAndSeedDatabase();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors">
      {/* PIN Authentication Lock Screen */}
      {!isAuthenticated && <PinPadModal />}

      {/* Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 px-4 pb-16 sm:pb-4">
        {activeTab === 'pos' && <POSScreen />}
        {activeTab === 'credit' && <DebtTrackerScreen />}
        {activeTab === 'catalog' && <CatalogScreen />}
        {activeTab === 'reports' && <ReportsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
