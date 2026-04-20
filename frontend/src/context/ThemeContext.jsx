import { useEffect, useState } from "react";
import { MantineProvider } from "@mantine/core";
import { ThemeContext } from "./themeContext.js";
import hubMantineTheme from "../theme/mantineTheme.js";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("hub-theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("hub-theme", theme);
    } catch {
      // localStorage pode estar indisponível em navegação privada
    }

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MantineProvider
        theme={hubMantineTheme}
        defaultColorScheme="light"
        forceColorScheme={theme}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
}
