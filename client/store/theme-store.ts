import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  applyTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme: Theme) => {
        set({ theme });
        useThemeStore.getState().applyTheme(theme);
      },
      applyTheme: (theme: Theme) => {
        const htmlElement = document.documentElement;

        if (theme === "system") {
          // Check system preference
          const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          htmlElement.classList.toggle("dark", isDark);
        } else if (theme === "dark") {
          htmlElement.classList.add("dark");
        } else {
          htmlElement.classList.remove("dark");
        }
      }
    }),
    {
      name: "theme-store",
      skipHydration: true
    }
  )
);
