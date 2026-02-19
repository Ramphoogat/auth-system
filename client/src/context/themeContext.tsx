import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "brutalist" | "macos" | "terminal";

interface EnabledThemes {
  brutalist: boolean;
  macos: boolean;
  terminal: boolean;
}

interface ThemeContextType {
  theme: ThemeMode;
  enabledThemes: EnabledThemes;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleThemeFeature: (feature: keyof EnabledThemes) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
      return savedTheme || "light";
    }
    return "light";
  });

  const [enabledThemes, setEnabledThemes] = useState<EnabledThemes>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("enabledThemes");
      return saved ? JSON.parse(saved) : { brutalist: false, macos: false, terminal: false };
    }
    return { brutalist: false, macos: false, terminal: false };
  });

  // Apply theme to root html
  useEffect(() => {
    localStorage.setItem("theme", theme);

    // Reset classes
    document.documentElement.classList.remove("dark", "brutalist", "macos", "terminal");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "brutalist") {
      document.documentElement.classList.add("brutalist");
    } else if (theme === "macos") {
      document.documentElement.classList.add("macos");
    } else if (theme === "terminal") {
      document.documentElement.classList.add("terminal");
    }
  }, [theme]);

  // Persist enabled themes
  useEffect(() => {
    localStorage.setItem("enabledThemes", JSON.stringify(enabledThemes));
  }, [enabledThemes]);

  const toggleTheme = () => {
    setTheme(prev => {
      // Logic to cycle through enabled themes
      if (prev === 'light') return 'dark';

      if (prev === 'dark') {
        if (enabledThemes.brutalist) return 'brutalist';
        if (enabledThemes.macos) return 'macos';
        if (enabledThemes.terminal) return 'terminal';
        return 'light';
      }

      if (prev === 'brutalist') {
        if (enabledThemes.macos) return 'macos';
        if (enabledThemes.terminal) return 'terminal';
        return 'light';
      }

      if (prev === 'macos') {
        if (enabledThemes.terminal) return 'terminal';
        return 'light';
      }

      if (prev === 'terminal') return 'light';

      return 'light';
    });
  };

  const toggleThemeFeature = (feature: keyof EnabledThemes) => {
    setEnabledThemes(prev => {
      const newState = { ...prev, [feature]: !prev[feature] };

      // If disabling the current theme, switch back to light
      if (!newState[feature] && theme === feature) {
        setTheme('light');
      }

      return newState;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, enabledThemes, toggleTheme, setTheme, toggleThemeFeature }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};
