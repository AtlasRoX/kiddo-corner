"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bold, Italic, List, ListOrdered, Heading, Link, ImageIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

  const insertMarkdown = (markdownTemplate: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let newText = ""

    if (markdownTemplate.includes("{}")) {
      newText = markdownTemplate.replace("{}", selectedText)
    } else {
      newText = selectedText ? markdownTemplate.replace("text", selectedText) : markdownTemplate
    }

    const newValue = value.substring(0, start) + newText + value.substring(end)
    onChange(newValue)

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + newText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <div className="border rounded-md">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "preview")}>
        <div className="flex items-center justify-between border-b px-3 py-2">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {activeTab === "write" && (
            <div className="flex items-center space-x-1">
              <Button type="button" variant="ghost" size="icon" onClick={() => insertMarkdown("**{}**")} title="Bold">
                <Bold className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => insertMarkdown("*{}*")} title="Italic">
                <Italic className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => insertMarkdown("## {}")} title="Heading">
                <Heading className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => insertMarkdown("- Item 1\n- Item 2\n- Item 3")}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => insertMarkdown("1. Item 1\n2. Item 2\n3. Item 3")}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => insertMarkdown("[link text](https://example.com)")}
                title="Link"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => insertMarkdown("![alt text](https://example.com/image.jpg)")}
                title="Image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="write" className="p-0 m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Write your markdown content here..."}
            className="min-h-[200px] border-0 rounded-none focus-visible:ring-0 resize-y"
          />
        </TabsContent>

        <TabsContent value="preview" className="p-4 m-0 prose prose-sm max-w-none dark:prose-invert">
          {value ? <ReactMarkdown>{value}</ReactMarkdown> : <p className="text-muted-foreground">Nothing to preview</p>}
        </TabsContent>
      </Tabs>
    </div>
  )
}
