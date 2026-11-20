import React, { createContext, useContext, useState } from 'react';
import { translations, Language } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.hinglish;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('yogsetu_lang') as Language) || 'hinglish';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('yogsetu_lang', lang);
  };

  // Synchronize document element language attribute for screen readers & a11y audits
  React.useEffect(() => {
    const langCode = language === 'hi' ? 'hi' : 'en';
    document.documentElement.lang = langCode;
  }, [language]);

  const t = translations[language] || translations.hinglish;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
