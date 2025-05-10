"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { useThemeColors } from "@/contexts/theme-context"
import { Loader2, Globe, Palette } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function AppearancePage() {
  const { language, setLanguage, translate } = useLanguage()
  const { colors, updateColor, isLoading } = useThemeColors()
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleLanguageChange = async (value: "en" | "bn") => {
    setSaving(true)
    try {
      await setLanguage(value)
      toast({
        title: "Success",
        description: "Default language updated successfully.",
      })
    } catch (error) {
      console.error("Error updating language:", error)
      toast({
        title: "Error",
        description: "Failed to update language. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleColorChange = async (key: keyof typeof colors, value: string) => {
    try {
      await updateColor(key, value)
      toast({
        title: "Success",
        description: `${key.charAt(0).toUpperCase() + key.slice(1)} color updated successfully.`,
      })
    } catch (error) {
      console.error(`Error updating ${key} color:`, error)
      toast({
        title: "Error",
        description: `Failed to update ${key} color. Please try again.`,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
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
        <h1 className="text-2xl font-bold tracking-tight">{translate("admin.appearance")}</h1>
      </div>

      <Tabs defaultValue="language">
        <TabsList className="mb-4">
          <TabsTrigger value="language">
            <Globe className="h-4 w-4 mr-2" />
            {translate("admin.language")}
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{translate("admin.language")}</CardTitle>
              <CardDescription>Set the default language for your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue={language} onValueChange={(value) => handleLanguageChange(value as "en" | "bn")}>
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="en" id="en" />
                  <Label htmlFor="en">English</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bn" id="bn" />
                  <Label htmlFor="bn" className="bangla-text">
                    বাংলা (Bangla)
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-muted-foreground mt-4">
                This will set the default language for all users. Users can still switch languages using the language
                switcher.
              </p>
            </CardContent>
            <CardFooter>
              <Button disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Saved"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Theme Colors</CardTitle>
              <CardDescription>Customize the colors of your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <ColorPicker
                  label="Primary Color"
                  value={colors.primary}
                  onChange={(value) => handleColorChange("primary", value)}
                  description="Main brand color, used for buttons and accents"
                />

                <ColorPicker
                  label="Secondary Color"
                  value={colors.secondary}
                  onChange={(value) => handleColorChange("secondary", value)}
                  description="Used for secondary elements and backgrounds"
                />

                <ColorPicker
                  label="Accent Color"
                  value={colors.accent}
                  onChange={(value) => handleColorChange("accent", value)}
                  description="Used for highlighting and accenting elements"
                />

                <ColorPicker
                  label="Background Color"
                  value={colors.background}
                  onChange={(value) => handleColorChange("background", value)}
                  description="Main background color of the website"
                />

                <ColorPicker
                  label="Foreground Color"
                  value={colors.foreground}
                  onChange={(value) => handleColorChange("foreground", value)}
                  description="Main text color"
                />

                <ColorPicker
                  label="Muted Color"
                  value={colors.muted}
                  onChange={(value) => handleColorChange("muted", value)}
                  description="Used for muted backgrounds"
                />

                <ColorPicker
                  label="Muted Foreground"
                  value={colors.mutedForeground}
                  onChange={(value) => handleColorChange("mutedForeground", value)}
                  description="Used for muted text"
                />

                <ColorPicker
                  label="Border Color"
                  value={colors.border}
                  onChange={(value) => handleColorChange("border", value)}
                  description="Used for borders and dividers"
                />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Preview</h3>
                <div className="grid gap-4">
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: colors.background, color: colors.foreground }}
                  >
                    <h4 className="font-medium mb-2">Background & Foreground</h4>
                    <p className="text-sm">This shows how your main text will look against the background.</p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: colors.primary, color: "#ffffff" }}>
                    <h4 className="font-medium mb-2">Primary Color</h4>
                    <p className="text-sm">This is how your primary buttons and accents will look.</p>
                  </div>

                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: colors.secondary, color: colors.foreground }}
                  >
                    <h4 className="font-medium mb-2">Secondary Color</h4>
                    <p className="text-sm">This is how your secondary elements will look.</p>
                  </div>

                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: colors.muted, color: colors.mutedForeground }}
                  >
                    <h4 className="font-medium mb-2">Muted Colors</h4>
                    <p className="text-sm">This shows how muted text will look against muted backgrounds.</p>
                  </div>

                  <div
                    className="p-4 rounded-lg border"
                    style={{ borderColor: colors.border, color: colors.foreground }}
                  >
                    <h4 className="font-medium mb-2">Border Color</h4>
                    <p className="text-sm">This shows how borders will look around elements.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
}

function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.replace(/\s+/g, "-").toLowerCase()}>{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-md border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(label.replace(/\s+/g, "-").toLowerCase())?.click()}
        />
        <input
          type="color"
          id={label.replace(/\s+/g, "-").toLowerCase()}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
