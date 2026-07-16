"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  dictionaries,
  type Dictionary,
  type Locale,
} from "@/lib/i18n/dictionary";

const LocaleCtx = createContext<{
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
  toggle: () => void;
} | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");

  useEffect(() => {
    const stored = localStorage.getItem("fotocekim-locale") as Locale | null;
    if (stored === "tr" || stored === "en") setLocaleState(stored);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("fotocekim-locale", l);
    document.documentElement.lang = l;
  }, []);

  const toggle = useCallback(() => {
    setLocale(locale === "tr" ? "en" : "tr");
  }, [locale, setLocale]);

  const value = useMemo(
    () => ({
      locale,
      t: dictionaries[locale] as Dictionary,
      setLocale,
      toggle,
    }),
    [locale, setLocale, toggle],
  );

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale outside provider");
  return ctx;
}

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      className={
        className ??
        "inline-flex items-center rounded-full border border-border p-0.5 text-xs"
      }
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale("tr")}
        className={`rounded-full px-2.5 py-1 font-medium transition ${
          locale === "tr"
            ? "bg-accent text-white"
            : "text-muted hover:text-foreground"
        }`}
      >
        TR
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-2.5 py-1 font-medium transition ${
          locale === "en"
            ? "bg-accent text-white"
            : "text-muted hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
