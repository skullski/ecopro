import React, { createContext, useContext, ReactNode } from "react";

// Minimal i18n context placeholder
const I18nContext = createContext({});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  return (
    <I18nContext.Provider value={{}}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
