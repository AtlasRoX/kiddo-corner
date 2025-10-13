"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

interface ThemeContextType {
  colors: ThemeColors
  updateColor: (key: keyof ThemeColors, value: string) => Promise<void>
  isLoading: boolean
}

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
}

const defaultColors: ThemeColors = {
  primary: "#e91e63",
  secondary: "#f3f4f6",
  accent: "#f3f4f6",
  background: "#ffffff",
  foreground: "#0f172a",
  muted: "#f3f4f6",
  mutedForeground: "#6b7280",
  border: "#e5e7eb",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(defaultColors)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Only fetch colors after component has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const fetchThemeColors = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", [
            "theme_primary_color",
            "theme_secondary_color",
            "theme_accent_color",
            "theme_background_color",
            "theme_foreground_color",
            "theme_muted_color",
            "theme_muted_foreground_color",
            "theme_border_color",
          ])

        if (!error && data) {
          const themeColors: Partial<ThemeColors> = {}

          data.forEach((item) => {
            switch (item.key) {
              case "theme_primary_color":
                themeColors.primary = item.value
                break
              case "theme_secondary_color":
                themeColors.secondary = item.value
                break
              case "theme_accent_color":
                themeColors.accent = item.value
                break
              case "theme_background_color":
                themeColors.background = item.value
                break
              case "theme_foreground_color":
                themeColors.foreground = item.value
                break
              case "theme_muted_color":
                themeColors.muted = item.value
                break
              case "theme_muted_foreground_color":
                themeColors.mutedForeground = item.value
                break
              case "theme_border_color":
                themeColors.border = item.value
                break
            }
          })

          setColors((prev) => ({ ...prev, ...themeColors }))
        }
      } catch (error) {
        console.error("Error fetching theme colors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchThemeColors()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    // Apply theme colors to CSS variables
    const root = document.documentElement
    root.style.setProperty("--color-primary", colors.primary)
    root.style.setProperty("--color-secondary", colors.secondary)
    root.style.setProperty("--color-accent", colors.accent)
    root.style.setProperty("--color-background", colors.background)
    root.style.setProperty("--color-foreground", colors.foreground)
    root.style.setProperty("--color-muted", colors.muted)
    root.style.setProperty("--color-muted-foreground", colors.mutedForeground)
    root.style.setProperty("--color-border", colors.border)

    // Convert hex to RGB for primary color
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
        : null
    }

    const primaryRgb = hexToRgb(colors.primary)
    if (primaryRgb) {
      root.style.setProperty("--primary-rgb", primaryRgb)
    }
  }, [colors, mounted])

  const updateColor = async (key: keyof ThemeColors, value: string) => {
    try {
      let dbKey: string
      switch (key) {
        case "primary":
          dbKey = "theme_primary_color"
          break
        case "secondary":
          dbKey = "theme_secondary_color"
          break
        case "accent":
          dbKey = "theme_accent_color"
          break
        case "background":
          dbKey = "theme_background_color"
          break
        case "foreground":
          dbKey = "theme_foreground_color"
          break
        case "muted":
          dbKey = "theme_muted_color"
          break
        case "mutedForeground":
          dbKey = "theme_muted_foreground_color"
          break
        case "border":
          dbKey = "theme_border_color"
          break
        default:
          return
      }

      await supabase.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", dbKey)

      setColors((prev) => ({ ...prev, [key]: value }))
    } catch (error) {
      console.error(`Error updating ${key} color:`, error)
    }
  }

  // Use a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ colors: defaultColors, updateColor: async () => {}, isLoading: true }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return <ThemeContext.Provider value={{ colors, updateColor, isLoading }}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider")
  }
  return context
}

export const useThemeColors = () => {
  const context = useThemeContext()
  return {
    colors: context.colors,
    updateColor: context.updateColor,
    isLoading: context.isLoading,
  }
}
