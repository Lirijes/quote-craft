import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import sv from "@/i18n/sv.json";
import en from "@/i18n/en.json";

type Translations = typeof sv;
type Lang = "sv" | "en";

const translations: Record<Lang, Translations> = { sv, en };

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("sv");
  const t = translations[lang];
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
