"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  isDark: boolean
  isLight: boolean
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem("theme") as Theme | null
      if (stored === "light" || stored === "dark") {
        setThemeState(stored)
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeState("dark")
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    try {
      localStorage.setItem("theme", theme)
    } catch {
      // Ignore
    }
  }, [theme, mounted])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === "light" ? "dark" : "light")
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
    mounted,
  }), [theme, toggleTheme, setTheme, mounted])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

// Safe version that returns default values if called outside provider
export function useThemeSafe() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    return {
      theme: "light" as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
      isDark: false,
      isLight: true,
      mounted: false,
    }
  }
  return context
}