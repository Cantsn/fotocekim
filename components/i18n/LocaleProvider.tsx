"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  dictionaries,
  type Dictionary,
  type Locale,
} from "@/lib/i18n/dictionary";
import { LOCALE_COOKIE } from "@/lib/i18n/server-cookie";

const LocaleCtx = createContext<{
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
} | null>(null);

function writeCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function LocaleProvider({
  children,
  initialLocale = "tr",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_COOKIE) as Locale | null;
    if (stored === "tr" || stored === "en") {
      setLocaleState(stored);
      writeCookie(stored);
      document.documentElement.lang = stored;
    } else {
      document.documentElement.lang = initialLocale;
    }
  }, [initialLocale]);

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      localStorage.setItem(LOCALE_COOKIE, l);
      writeCookie(l);
      document.documentElement.lang = l;
      startTransition(() => {
        router.refresh();
      });
    },
    [router],
  );

  const value = useMemo(
    () => ({
      locale,
      t: dictionaries[locale] as Dictionary,
      setLocale,
    }),
    [locale, setLocale],
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
