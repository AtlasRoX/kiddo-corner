"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

interface SiteSettings {
  facebook_url: string
  instagram_url: string
  messenger_id: string
  site_tagline: string
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  contact_address: string
  social_facebook: string
  social_instagram: string
  social_twitter: string
  logo_type: "text" | "image"
  logo_text: string
  logo_image: string
  banner_enabled: boolean
  banner_text: string
  banner_link: string
  banner_color: string
  banner_text_color: string
  footer_text: string
  footer_links: { title: string; url: string }[]
  tagline_enabled: boolean
  tagline_text: string
  tagline_subtext: string
}

const defaultSettings: SiteSettings = {
  site_name: "Kiddo Corner",
  site_description: "Adorable Products for Your Little One",
  contact_email: "contact@kiddocorner.com",
  contact_phone: "+880 1234 567890",
  contact_address: "123 Baby Street, Dhaka, Bangladesh",
  social_facebook: "https://facebook.com/kiddocorner",
  social_instagram: "https://instagram.com/kiddocorner",
  social_twitter: "https://twitter.com/kiddocorner",
  logo_type: "text",
  logo_text: "KC",
  logo_image: "",
  banner_enabled: false,
  banner_text: "Free shipping on orders over ৳1000",
  banner_link: "/products",
  banner_color: "#f3f4f6",
  banner_text_color: "#0f172a",
  footer_text: "© 2023 Kiddo Corner. All rights reserved.",
  footer_links: [
    { title: "Privacy Policy", url: "/privacy-policy" },
    { title: "Terms of Service", url: "/terms-of-service" },
    { title: "Shipping Policy", url: "/shipping-policy" },
  ],
  tagline_enabled: true,
  tagline_text: "Quality Products for Your Little Ones",
  tagline_subtext: "Discover our collection of high-quality baby products that bring joy and comfort to your baby's life.",
  facebook_url: "",
  instagram_url: "",
  messenger_id: "",
  site_tagline: ""
}

interface SiteSettingsContextType {
  settings: SiteSettings
  updateSettings: (key: keyof SiteSettings, value: any) => Promise<void>
  loading: boolean
  error: Error | null
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [mounted, setMounted] = useState(false)

  // Only run client-side code after mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Add a small delay to ensure client-side hydration is complete
    const timer = setTimeout(() => {
      fetchSettings()
    }, 100)

    return () => clearTimeout(timer)
  }, [mounted])

  const fetchSettings = async (retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("site_settings").select("key, value") as { data: { key: string; value: any }[] | null, error: any }

      if (error) {
        throw new Error(`Error fetching site settings: ${error.message}`)
      }

      if (data) {
        const newSettings = { ...defaultSettings }

        data.forEach((item: { key: string; value: any }) => {
          const key = item.key as keyof SiteSettings
          let value: any = item.value

          // Parse special values
          if (key === "banner_enabled" || key === "tagline_enabled") {
            value = value === "true" || value === true
          } else if (key === "footer_links") {
            try {
              value = JSON.parse(value)
            } catch (e) {
              console.error(`Error parsing footer_links: ${e}`)
              value = defaultSettings.footer_links
            }
          }

          // @ts-ignore - we know these keys exist
          newSettings[key] = value
        })

        setSettings(newSettings)
      }
    } catch (err) {
      console.error("Error fetching site settings:", err)
      setError(err instanceof Error ? err : new Error(String(err)))

      // Retry logic with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000
        setTimeout(() => fetchSettings(retryCount + 1), delay)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (key: keyof SiteSettings, value: any) => {
    try {
      // Special handling for objects
      const dbValue = typeof value === "object" ? JSON.stringify(value) : value

      await supabase
        .from("site_settings")
        .update({ value: dbValue, updated_at: new Date().toISOString() })
        .eq("key", key)

      setSettings((prev) => ({ ...prev, [key]: value }))
    } catch (err) {
      console.error(`Error updating setting ${key}:`, err)
      throw err
    }
  }

  // Use a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <SiteSettingsContext.Provider
        value={{
          settings: defaultSettings,
          updateSettings: async () => {},
          loading: true,
          error: null,
        }}
      >
        {children}
      </SiteSettingsContext.Provider>
    )
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings, loading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (context === undefined) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider")
  }
  return context
}
