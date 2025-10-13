"use client"

import { useSiteSettings } from "@/contexts/site-settings-context"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export function SiteLogo({ size = "default", link = "/" }: { size?: "small" | "default" | "large"; link?: string }) {
  const { settings, loading, error } = useSiteSettings()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getSizeClasses = () => {
    return {
      wrapper: size === "small" ? "w-8 h-8" : size === "large" ? "w-12 h-12" : "w-10 h-10",
      text: size === "small" ? "text-lg" : size === "large" ? "text-2xl" : "text-xl",
      heading: size === "small" ? "text-xl" : size === "large" ? "text-3xl" : "text-2xl",
    }
  }

  const { wrapper, text, heading } = getSizeClasses()

  const logoContent = (
    <>
      <div className={`relative flex items-center justify-center ${wrapper} overflow-hidden rounded-full bg-primary/20`}>
        <span className={`${text} font-bold text-primary`}>
          {settings?.logo_text || "KC"}
        </span>
      </div>
      <h1 className={`${heading} font-bold tracking-tight text-primary`}>
        {settings?.site_name || "Kiddo Corner"}
      </h1>
    </>
  )

  const imageContent = (
    <>
      <div className={`relative ${wrapper} overflow-hidden rounded-md`}>
        <Image
          src={settings!.logo_image || "/placeholder.svg"}
          alt={settings!.site_name}
          fill
          className="object-contain"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = "/placeholder.svg?height=32&width=32"
          }}
        />
      </div>
      <h1 className={`${heading} font-bold tracking-tight text-primary`}>
        {settings!.site_name}
      </h1>
    </>
  )

  // SSR fallback (avoids hydration errors)
  if (!mounted) {
    return (
      <Link href={link}>
        <div className="flex items-center gap-2">
          <div className={`relative flex items-center justify-center ${wrapper} overflow-hidden rounded-full bg-primary/20`}>
            <span className={`${text} font-bold text-primary`}>KC</span>
          </div>
          <h1 className={`${heading} font-bold tracking-tight text-primary`}>
            Kiddo Corner
          </h1>
        </div>
      </Link>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className={`relative flex items-center justify-center ${wrapper} overflow-hidden rounded-full bg-primary/20`}>
          <div className="animate-pulse bg-muted w-full h-full" />
        </div>
        <div className="h-6 bg-muted rounded w-32 animate-pulse" />
      </div>
    )
  }

  if (error || !settings) {
    return (
      <Link href={link}>
        <div className="flex items-center gap-2">
          {logoContent}
        </div>
      </Link>
    )
  }

  if (settings.logo_type === "image" && settings.logo_image) {
    return (
      <Link href={link}>
        <div className="flex items-center gap-2">
          {imageContent}
        </div>
      </Link>
    )
  }

  return (
    <Link href={link}>
      <div className="flex items-center gap-2">
        {logoContent}
      </div>
    </Link>
  )
}
