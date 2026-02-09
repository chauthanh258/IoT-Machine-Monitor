"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Get system preference
    const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

    // Resolve theme
    let resolved: "light" | "dark";
    if (theme === "system") {
      resolved = systemPrefersLight ? "light" : "dark";
    } else {
      resolved = theme;
    }

    setResolvedTheme(resolved);

    // Apply to document
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => {
      if (theme === "system") {
        const resolved = mediaQuery.matches ? "light" : "dark";
        setResolvedTheme(resolved);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(resolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
