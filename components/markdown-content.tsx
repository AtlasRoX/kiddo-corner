"use client"

import ReactMarkdown from "react-markdown"

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
