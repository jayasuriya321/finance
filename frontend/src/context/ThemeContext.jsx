import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 🔸 Get saved theme instantly (before render)
  const getInitialTheme = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
    }
    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // 🔸 Apply theme instantly to <html> (prevents flicker)
  useEffect(() => {
    const root = document.documentElement;

    // Remove both first to prevent duplicate transitions
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Apply Tailwind dark mode instantly
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // 🔸 Toggle manually or set directly
  const toggleTheme = (value) => {
    setTheme(value ? value : theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
