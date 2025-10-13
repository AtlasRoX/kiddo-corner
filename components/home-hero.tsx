"use client"

import { useSiteSettings } from "@/contexts/site-settings-context"

export function HomeHero() {
  const { settings, loading, error } = useSiteSettings()

  if (loading) {
    return (
      <div className="mb-12 text-center px-4">
        <div className="h-12 bg-muted rounded w-3/4 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-muted rounded w-2/3 mx-auto animate-pulse" />
      </div>
    )
  }

  return (
    <div className="mb-12 text-center px-4">
      <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl xl:text-6xl bangla-text">
        {settings.site_name || "Adorable Products for Your Little One"}
      </h1>
      <p className="max-w-3xl mx-auto text-base md:text-lg text-muted-foreground bangla-text">
        {settings.site_tagline ||
          "Discover our collection of high-quality baby products that bring joy and comfort to your baby's life."}
      </p>
    </div>
  )
}
