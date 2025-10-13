"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MessageSquare, Save } from "lucide-react"
import { getSystemMessages, updateSystemMessage } from "@/lib/services/order-service"
import type { SystemMessage } from "@/lib/types/order"

export default function SystemMessagesPage() {
  const [messages, setMessages] = useState<SystemMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const data = await getSystemMessages()
      setMessages(data)
    } catch (error) {
      console.error("Error fetching system messages:", error)
      toast({
        title: "Error",
        description: "Failed to fetch system messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMessageChange = (id: number, content: string) => {
    setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, content } : message)))
  }

  const handleSaveMessage = async (key: string, content: string) => {
    setSaving((prev) => ({ ...prev, [key]: true }))
    try {
      const result = await updateSystemMessage(key, content)

      if (!result.success) {
        throw new Error(result.error || "Failed to update message")
      }

      toast({
        title: "Success",
        description: "Message updated successfully.",
      })
    } catch (error) {
      console.error("Error updating message:", error)
      toast({
        title: "Error",
        description: "Failed to update message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }))
    }
  }

  const getMessageTitle = (key: string) => {
    switch (key) {
      case "checkout_success_cod":
        return "Cash on Delivery Success Message"
      case "checkout_success_mobile_banking":
        return "Mobile Banking Success Message"
      default:
        return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  const getMessageDescription = (key: string) => {
    switch (key) {
      case "checkout_success_cod":
        return "This message is shown to customers after they place an order with Cash on Delivery."
      case "checkout_success_mobile_banking":
        return "This message is shown to customers after they place an order with Mobile Banking."
      default:
        return "System message shown to customers."
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">System Messages</h1>
        <Button variant="outline" onClick={fetchMessages}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {getMessageTitle(message.key)}
              </CardTitle>
              <CardDescription>{getMessageDescription(message.key)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor={`message-${message.id}`}>Message Content</Label>
                  <Textarea
                    id={`message-${message.id}`}
                    value={message.content}
                    onChange={(e) => handleMessageChange(message.id, e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can use emojis and basic formatting in your message.
                  </p>
                </div>
                <Button onClick={() => handleSaveMessage(message.key, message.content)} disabled={saving[message.key]}>
                  {saving[message.key] ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  )
}
