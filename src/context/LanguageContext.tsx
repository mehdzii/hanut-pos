import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Language, translations, type Translations } from '../i18n/translations';
import { db } from '../db';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    // Load persisted language from database
    db.settings.get('language').then((setting) => {
      if (setting && (setting.value === 'ar' || setting.value === 'en')) {
        setLanguageState(setting.value);
        applyDocumentDirection(setting.value);
      } else {
        applyDocumentDirection('ar');
      }
    });
  }, []);

  const applyDocumentDirection = (lang: Language) => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    applyDocumentDirection(lang);
    db.settings.put({ key: 'language', value: lang });
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
    dir: (language === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
