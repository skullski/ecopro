import { useEffect, useState } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") {
        // Apply theme immediately on initialization
        if (stored === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        return stored;
      }
      // default follow prefers-color-scheme
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
        return "dark";
      }
      document.documentElement.classList.remove("dark");
      return "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch {}
  }, [theme]);

  function toggle() {
    setTheme((s) => (s === "dark" ? "light" : "dark"));
  }

  return { theme, setTheme, toggle };
}
