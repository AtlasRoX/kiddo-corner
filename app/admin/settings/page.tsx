"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [messengerPageId, setMessengerPageId] = useState("")
  const [storeTagline, setStoreTagline] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // In a real app, these would be loaded from Supabase or another database
  useEffect(() => {
    // Simulate loading settings
    setMessengerPageId("your-facebook-page")
    setStoreTagline("Adorable Products for Your Little One")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Settings updated successfully.",
    })

    setSubmitting(false)
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>Configure your store's basic information and appearance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="tagline">Store Tagline</Label>
                <Textarea
                  id="tagline"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  placeholder="Enter your store's tagline"
                  rows={2}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="messenger">Facebook Messenger Page ID</Label>
                <Input
                  id="messenger"
                  value={messengerPageId}
                  onChange={(e) => setMessengerPageId(e.target.value)}
                  placeholder="your-facebook-page"
                />
                <p className="text-sm text-muted-foreground">
                  This is used for the "Buy Now" button that opens Facebook Messenger.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your admin account settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Account management features will be available in a future update.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
