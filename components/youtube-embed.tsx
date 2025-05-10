"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface YouTubeEmbedProps {
  videoId: string
  title?: string
  className?: string
  aspectRatio?: "16:9" | "4:3" | "1:1"
}

export function YouTubeEmbed({ videoId, title, className = "", aspectRatio = "16:9" }: YouTubeEmbedProps) {
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Calculate aspect ratio padding
  const aspectRatioPadding = {
    "16:9": "pb-[56.25%]", // 9/16 = 0.5625 or 56.25%
    "4:3": "pb-[75%]", // 3/4 = 0.75 or 75%
    "1:1": "pb-[100%]", // 1/1 = 1 or 100%
  }

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) return null

  return (
    <div className={`relative ${aspectRatioPadding[aspectRatio]} ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-md">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      )}
      <iframe
        className={`absolute inset-0 w-full h-full rounded-md ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title={title || `YouTube video player for ${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoading(false)}
      />
    </div>
  )
}
