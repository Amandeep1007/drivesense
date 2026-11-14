"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { THEME_STORAGE_KEY } from "@/services/driving";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  error: string | null;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "dark" || saved === "light") setTheme(saved);
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? storageError.message
          : "Unable to load the saved colour theme.",
      );
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (!ready) return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      setError(null);
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? storageError.message
          : "Unable to save the colour theme.",
      );
    }
  }, [theme, ready]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    [],
  );
  const value = useMemo(
    () => ({ theme, toggleTheme, error }),
    [theme, toggleTheme, error],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider.");
  return context;
}
