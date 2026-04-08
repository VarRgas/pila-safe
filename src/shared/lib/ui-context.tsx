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

type ThemeMode = "light" | "dark";

type UiContextValue = {
  hideValues: boolean;
  theme: ThemeMode;
  toggleHideValues: () => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "pilasafe-ui";

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [hideValues, setHideValues] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      document.documentElement.dataset.theme = "light";
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<{ theme: ThemeMode; hideValues: boolean }>;

      const nextTheme: ThemeMode = parsed.theme === "dark" ? "dark" : "light";
      const nextHideValues = typeof parsed.hideValues === "boolean" ? parsed.hideValues : false;

      window.setTimeout(() => {
        setTheme(nextTheme);
        setHideValues(nextHideValues);
        document.documentElement.dataset.theme = nextTheme;
      }, 0);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      document.documentElement.dataset.theme = "light";
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme,
        hideValues,
      }),
    );
  }, [hideValues, theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const toggleHideValues = useCallback(() => {
    setHideValues((current) => !current);
  }, []);

  const value = useMemo(
    () => ({ hideValues, theme, toggleHideValues, toggleTheme }),
    [hideValues, theme, toggleHideValues, toggleTheme],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const context = useContext(UiContext);

  if (!context) {
    throw new Error("useUi must be used within UiProvider.");
  }

  return context;
}

export function maskFinancialValue(value: string, hideValues: boolean) {
  if (!hideValues) {
    return value;
  }

  if (value.includes("R$")) {
    return value.replace(/[\d.,]+/g, "••••");
  }

  return "••••";
}
