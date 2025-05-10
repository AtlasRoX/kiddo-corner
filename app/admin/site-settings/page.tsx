"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSiteSettings } from "@/contexts/site-settings-context"
import { Loader2, Upload, Globe, Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import Image from "next/image"

export default function SiteSettingsPage() {
  const { settings, loading: settingsLoading, updateSettings } = useSiteSettings()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    site_name: "",
    site_tagline: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    facebook_url: "",
    instagram_url: "",
    messenger_id: "",
    logo_type: "text",
    logo_text: "",
    logo_image: "",
  })

  useEffect(() => {
    if (!settingsLoading) {
      setFormData({
        site_name: settings.site_name || "",
        site_tagline: settings.site_tagline || "",
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        contact_address: settings.contact_address || "",
        facebook_url: settings.facebook_url || "",
        instagram_url: settings.instagram_url || "",
        messenger_id: settings.messenger_id || "",
        logo_type: settings.logo_type || "text",
        logo_text: settings.logo_text || "",
        logo_image: settings.logo_image || "",
      })

      if (settings.logo_image) {
        setLogoPreview(settings.logo_image)
      }
    }
  }, [settings, settingsLoading])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [activeTab])

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleLogoTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      logo_type: value,
    }))
  }

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // File size check (limit 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image under 2MB.",
          variant: "destructive",
        })
        return
      }

      // File type check
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Only image files are allowed.",
          variant: "destructive",
        })
        return
      }

      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async (section: string) => {
    setSaving(true)

    try {
      let updates: Record<string, string> = {}

      if (section === "general") {
        updates = {
          site_name: formData.site_name,
          site_tagline: formData.site_tagline,
        }
      } else if (section === "contact") {
        updates = {
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          contact_address: formData.contact_address,
        }
      } else if (section === "social") {
        updates = {
          facebook_url: formData.facebook_url,
          instagram_url: formData.instagram_url,
          messenger_id: formData.messenger_id,
        }
      } else if (section === "logo") {
        updates = {
          logo_type: formData.logo_type,
          logo_text: formData.logo_text,
        }

        if (logoFile && formData.logo_type === "image") {
          const fileName = `logos/${Date.now()}-${logoFile.name}`
          const storageRef = ref(storage, fileName)
          await uploadBytes(storageRef, logoFile)
          const logoUrl = await getDownloadURL(storageRef)
          updates.logo_image = logoUrl
        }
      }

      // Prevent unnecessary updates
      const filteredUpdates = Object.entries(updates).filter(
        ([key, value]) => settings[key as keyof typeof settings] !== value
      )

      if (filteredUpdates.length === 0) {
        toast({
          title: "No changes detected",
          description: "Nothing to update.",
        })
        return
      }

      for (const [key, value] of filteredUpdates) {
        await updateSettings(key as keyof typeof settings, value)
      }

      toast({
        title: "Success",
        description: "Settings updated successfully.",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (settingsLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="social">
            <Facebook className="h-4 w-4 mr-2" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="logo">
            <Upload className="h-4 w-4 mr-2" />
            Logo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your website's basic information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={formData.site_name}
                  onChange={(e) => handleInputChange("site_name", e.target.value)}
                  placeholder="Kiddo Corner"
                />
                <p className="text-xs text-muted-foreground">
                  You can use both English and <span className="bangla-text">বাংলা</span> for your site name.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="site_tagline">Tagline</Label>
                <Input
                  id="site_tagline"
                  value={formData.site_tagline}
                  onChange={(e) => handleInputChange("site_tagline", e.target.value)}
                  placeholder="Adorable Products for Your Little One"
                />
                <p className="text-xs text-muted-foreground">A short description that appears below your site name.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("general")} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save General Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update your business contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="contact_email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  placeholder="hello@kiddocorner.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact_phone">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                  placeholder="(123) 456-7890"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact_address">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Address
                </Label>
                <Input
                  id="contact_address"
                  value={formData.contact_address}
                  onChange={(e) => handleInputChange("contact_address", e.target.value)}
                  placeholder="123 Kiddo Lane, Toyland, KL 12345"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("contact")} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Contact Information
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Configure your social media profiles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="facebook_url">
                  <Facebook className="h-4 w-4 inline mr-2" />
                  Facebook URL
                </Label>
                <Input
                  id="facebook_url"
                  value={formData.facebook_url}
                  onChange={(e) => handleInputChange("facebook_url", e.target.value)}
                  placeholder="https://facebook.com/kiddocorner"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="instagram_url">
                  <Instagram className="h-4 w-4 inline mr-2" />
                  Instagram URL
                </Label>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url}
                  onChange={(e) => handleInputChange("instagram_url", e.target.value)}
                  placeholder="https://instagram.com/kiddocorner"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="messenger_id">
                  <MessageCircle className="h-4 w-4 inline mr-2" />
                  Facebook Messenger ID
                </Label>
                <Input
                  id="messenger_id"
                  value={formData.messenger_id}
                  onChange={(e) => handleInputChange("messenger_id", e.target.value)}
                  placeholder="your-facebook-page"
                />
                <p className="text-xs text-muted-foreground">
                  This is used for the "Buy Now" button that opens Facebook Messenger.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("social")} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Social Media Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="logo">
          <Card>
            <CardHeader>
              <CardTitle>Logo Settings</CardTitle>
              <CardDescription>Configure your website's logo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Logo Type</Label>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="logo_type_text"
                      name="logo_type"
                      value="text"
                      checked={formData.logo_type === "text"}
                      onChange={() => handleLogoTypeChange("text")}
                      className="mr-2"
                    />
                    <Label htmlFor="logo_type_text" className="font-normal">
                      Text Logo
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="logo_type_image"
                      name="logo_type"
                      value="image"
                      checked={formData.logo_type === "image"}
                      onChange={() => handleLogoTypeChange("image")}
                      className="mr-2"
                    />
                    <Label htmlFor="logo_type_image" className="font-normal">
                      Image Logo
                    </Label>
                  </div>
                </div>
              </div>

              {formData.logo_type === "text" ? (
                <div className="grid gap-2">
                  <Label htmlFor="logo_text">Logo Text</Label>
                  <Input
                    id="logo_text"
                    value={formData.logo_text}
                    onChange={(e) => handleInputChange("logo_text", e.target.value)}
                    placeholder="KC"
                    maxLength={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Short text (1-3 characters) to display in the logo circle.
                  </p>

                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="mt-2 flex items-center gap-2 p-4 border rounded-md">
                      <div className="relative flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-primary/20">
                        <span className="text-xl font-bold text-primary">{formData.logo_text || "KC"}</span>
                      </div>
                      <h1 className="text-2xl font-bold tracking-tight text-primary bangla-text">
                        {formData.site_name || "Kiddo Corner"}
                      </h1>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="logo_image">Logo Image</Label>
                  <Input
                    id="logo_image"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a square image for best results. Recommended size: 200x200 pixels.
                  </p>

                  {(logoPreview || formData.logo_image) && (
                    <div className="mt-4">
                      <Label>Preview</Label>
                      <div className="mt-2 flex items-center gap-2 p-4 border rounded-md">
                        <div className="relative w-10 h-10 overflow-hidden rounded-md">
                          <Image
                            src={logoPreview || formData.logo_image}
                            alt="Logo preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary bangla-text">
                          {formData.site_name || "Kiddo Corner"}
                        </h1>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("logo")} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Logo Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}