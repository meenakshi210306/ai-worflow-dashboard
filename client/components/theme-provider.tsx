"use client";

import { useEffect } from "react";
import { useThemeStore } from "../store/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hydrate the theme store
    useThemeStore.persist.rehydrate();

    // Apply the stored theme or system preference
    const theme = useThemeStore.getState().theme;
    useThemeStore.getState().applyTheme(theme);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (useThemeStore.getState().theme === "system") {
        useThemeStore.getState().applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return <>{children}</>;
}
