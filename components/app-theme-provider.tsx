"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect, useState } from "react"

export function AppThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Use this to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  // Only show the UI after client-side hydration completes
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same structure but no theme switching
    return <div className="contents">{children}</div>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
