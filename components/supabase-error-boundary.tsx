"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface SupabaseErrorBoundaryProps {
  children: React.ReactNode
}

export function SupabaseErrorBoundary({ children }: SupabaseErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Listen for unhandled errors that might be related to Supabase
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes("Failed to fetch") ||
        event.error?.message?.includes("NetworkError") ||
        event.error?.message?.includes("Error fetching site settings")
      ) {
        setHasError(true)
        event.preventDefault()
      }
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  // Auto retry connection every 30 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (hasError) {
      timer = setTimeout(() => {
        handleRetry()
      }, 30000)
    }

    return () => clearTimeout(timer)
  }, [hasError, retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    setHasError(false)
    window.location.reload()
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTitle className="text-xl">Connection Issue</AlertTitle>
          <AlertDescription className="mt-4">
            <p className="mb-4">We're having trouble connecting to our database. This could be due to:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Temporary network issues</li>
              <li>Server maintenance</li>
              <li>Your internet connection</li>
            </ul>
            <Button onClick={handleRetry} className="w-full mt-2" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
