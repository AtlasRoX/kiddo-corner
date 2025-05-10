"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getActiveFooterSections, type FooterSection } from "@/lib/services/footer-service"

interface FooterContextType {
  sections: FooterSection[]
  loading: boolean
  error: Error | null
  refreshSections: () => Promise<void>
}

const FooterContext = createContext<FooterContextType | undefined>(undefined)

export function FooterProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<FooterSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [mounted, setMounted] = useState(false)

  // Only run client-side code after mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchSections = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getActiveFooterSections()
      setSections(data)
    } catch (err) {
      console.error("Error fetching footer sections:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }

  const refreshSections = async () => {
    await fetchSections()
  }

  useEffect(() => {
    if (mounted) {
      fetchSections()
    }
  }, [mounted])

  // Use a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <FooterContext.Provider
        value={{
          sections: [],
          loading: true,
          error: null,
          refreshSections: async () => {},
        }}
      >
        {children}
      </FooterContext.Provider>
    )
  }

  return (
    <FooterContext.Provider value={{ sections, loading, error, refreshSections }}>{children}</FooterContext.Provider>
  )
}

export function useFooter() {
  const context = useContext(FooterContext)
  if (context === undefined) {
    throw new Error("useFooter must be used within a FooterProvider")
  }
  return context
}
