import React, { createContext, useState } from "react";
import { locales } from "./locales";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("nl");

  const t = locales[language];

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "nl" ? "fr" : "nl"));
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
