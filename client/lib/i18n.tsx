import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from './translations';

export type Locale = "ar" | "en" | "fr";

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem("locale");
      return (stored as Locale) || "ar";
    } catch {
      return "ar";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("locale", locale);
      if (typeof document !== "undefined") {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
        document.documentElement.className = locale === "ar" ? "rtl" : "ltr";
      }
    } catch {}
  }, [locale]);

  function t(key: string, params?: Record<string, string | number>): string {
    let value = translations[locale][key];
    if (!value) return key;

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        value = value.replace(`{${key}}`, val.toString());
      });
    }

    return value;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
