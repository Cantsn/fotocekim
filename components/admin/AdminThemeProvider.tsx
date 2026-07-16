"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";

const ThemeCtx = createContext<{
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
} | null>(null);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fotocekim-admin-theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("fotocekim-admin-theme", theme);
  }, [theme, ready]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(
    () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return (
    <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>
      <div
        className="admin-root flex min-h-full flex-1 flex-col"
        data-theme={theme}
      >
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useAdminTheme outside provider");
  return ctx;
}

export function ThemeToggleButton() {
  const { theme, toggle } = useAdminTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-foreground"
      aria-label={theme === "dark" ? "Aydınlık moda geç" : "Koyu moda geç"}
      title={theme === "dark" ? "Aydınlık mod" : "Koyu mod"}
    >
      {theme === "dark" ? "☀️ Aydınlık" : "🌙 Koyu"}
    </button>
  );
}
