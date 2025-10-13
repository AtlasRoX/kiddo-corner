"use client"

import { useLanguage } from "@/contexts/language-context"

interface TranslatedTextProps {
  textKey?: string
  text?: string
  fallback?: string
  values?: Record<string, string | number>
}

export function TranslatedText({ textKey, text, fallback, values }: TranslatedTextProps) {
  const { translate } = useLanguage()

  if (textKey) {
    return <>{translate(textKey, fallback, values)}</>
  }

  if (text) {
    return <>{text}</>
  }

  return <>{fallback || ""}</>
}
