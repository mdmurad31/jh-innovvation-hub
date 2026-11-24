import React, { createContext, useContext } from 'react';
import { Language, translations, tText, translateText, translateCategory, translateStatus, translatePriority, translateDistrict } from '../lib/i18n';

interface TranslationContextType {
  lang: Language;
  t: (key: string, defaultEn?: string, defaultHi?: string) => string;
  translateText: (text: string | null | undefined) => string;
  translateCategory: (cat: string) => string;
  translateStatus: (status: string) => string;
  translatePriority: (priority: string) => string;
  translateDistrict: (district: string) => string;
}

const TranslationContext = createContext<TranslationContextType>({
  lang: 'en',
  t: (key, defaultEn, defaultHi) => defaultEn || key,
  translateText: (text) => text || '',
  translateCategory: (cat) => cat,
  translateStatus: (status) => status,
  translatePriority: (pri) => pri,
  translateDistrict: (dist) => dist,
});

export const useTranslation = () => useContext(TranslationContext);

interface TranslatedViewProps {
  lang?: Language;
  children: React.ReactNode | ((context: TranslationContextType) => React.ReactNode);
}

/**
 * Standardized Translation Wrapper Component for Dashboard Sub-Views & Modules
 * Provides centralized context & helpers to eliminate hardcoded UI strings.
 */
export const TranslatedView: React.FC<TranslatedViewProps> = ({ lang = 'en', children }) => {
  const currentLang: Language = lang === 'hi' ? 'hi' : 'en';

  const t = (key: string, defaultEn?: string, defaultHi?: string): string => {
    const dict = translations[currentLang] as Record<string, string>;
    if (dict && dict[key]) {
      return dict[key];
    }
    if (defaultEn) {
      return tText(currentLang, defaultEn, defaultHi || defaultEn);
    }
    const enDict = translations.en as Record<string, string>;
    return enDict[key] || key;
  };

  const contextValue: TranslationContextType = {
    lang: currentLang,
    t,
    translateText: (txt) => translateText(txt, currentLang),
    translateCategory: (cat) => translateCategory(cat, currentLang),
    translateStatus: (st) => translateStatus(st, currentLang),
    translatePriority: (pri) => translatePriority(pri, currentLang),
    translateDistrict: (dist) => translateDistrict(dist, currentLang),
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
    </TranslationContext.Provider>
  );
};
