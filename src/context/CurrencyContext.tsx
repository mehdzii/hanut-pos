import React, { createContext, useContext, useState } from 'react';

export type CurrencyMode = 'MAD' | 'RYAL';

interface CurrencyContextType {
  currencyMode: CurrencyMode;
  setCurrencyMode: (mode: CurrencyMode) => void;
  formatAmount: (amountInMAD: number) => string;
  formatNumberOnly: (amountInMAD: number) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencyMode, setCurrencyModeState] = useState<CurrencyMode>(() => {
    return (localStorage.getItem('hanut_currency_mode') as CurrencyMode) || 'MAD';
  });

  const setCurrencyMode = (mode: CurrencyMode) => {
    setCurrencyModeState(mode);
    localStorage.setItem('hanut_currency_mode', mode);
  };

  const currencySymbol = currencyMode === 'MAD' ? 'د.م' : 'ريال';

  const formatAmount = (amountInMAD: number): string => {
    if (currencyMode === 'RYAL') {
      const ryalVal = Math.round(amountInMAD * 20);
      return `${ryalVal.toLocaleString('ar-MA')} ريال`;
    }
    return `${amountInMAD.toFixed(2)} ${currencySymbol}`;
  };

  const formatNumberOnly = (amountInMAD: number): string => {
    if (currencyMode === 'RYAL') {
      const ryalVal = Math.round(amountInMAD * 20);
      return `${ryalVal.toLocaleString('ar-MA')}`;
    }
    return amountInMAD.toFixed(2);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencyMode,
        setCurrencyMode,
        formatAmount,
        formatNumberOnly,
        currencySymbol
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
