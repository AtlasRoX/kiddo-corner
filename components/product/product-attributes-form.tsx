"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ColorPicker } from "./color-picker"
import { SizePicker } from "./size-picker"
import { VariationManager } from "./variation-manager"
import {
  saveProductAttributes,
  getProductColors,
  getProductSizes,
  getProductVariations,
} from "@/lib/services/product-attributes-service"
import type { ProductAttributesFormData } from "@/lib/types/product-attributes"

interface ProductAttributesFormProps {
  productId: string
  productPrice: number
  onSaved?: () => void
}

export function ProductAttributesForm({ productId, productPrice, onSaved }: ProductAttributesFormProps) {
  const [activeTab, setActiveTab] = useState("colors")
  const [colors, setColors] = useState<ProductAttributesFormData["colors"]>([])
  const [sizes, setSizes] = useState<ProductAttributesFormData["sizes"]>([])
  const [variations, setVariations] = useState<ProductAttributesFormData["variations"]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load existing attributes when component mounts
  useEffect(() => {
    const loadExistingAttributes = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch existing colors
        const existingColors = await getProductColors(productId)
        console.log("Existing colors:", existingColors)

        // Transform existing colors to form data format
        const colorFormData = existingColors.map((color) => ({
          name: color.name,
          hex_code: color.hex_code || "#000000", // Ensure we have a default
          display_order: color.display_order,
        }))
        setColors(colorFormData)

        // Fetch existing sizes
        const existingSizes = await getProductSizes(productId)
        console.log("Existing sizes:", existingSizes)

        // Transform existing sizes to form data format
        const sizeFormData = existingSizes.map((size) => ({
          name: size.name,
          scale: size.scale,
          display_order: size.display_order,
        }))
        setSizes(sizeFormData)

        // Fetch existing variations
        const existingVariations = await getProductVariations(productId)
        console.log("Existing variations:", existingVariations)

        // Transform existing variations to form data format
        const variationFormData = existingVariations.map((variation) => ({
          colorId: variation.color_id,
          sizeId: variation.size_id,
          sku: variation.sku,
          price: variation.price,
          salePrice: variation.sale_price,
          stock: variation.stock,
          isDefault: variation.is_default,
          expanded: false,
          images: (variation.images || []).map((img) => ({
            url: img.image_url,
            isPrimary: img.is_primary,
            mediaType: img.media_type as "image" | "video",
            displayOrder: img.display_order,
            file: null,
          })),
        }))
        setVariations(variationFormData)
      } catch (err) {
        console.error("Error loading existing attributes:", err)
        setError(err instanceof Error ? err.message : "Failed to load existing attributes")
        toast({
          title: "Error",
          description: "Failed to load existing attributes. Please refresh and try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadExistingAttributes()
  }, [productId, toast])

  const validateForm = () => {
    // Validate colors have valid hex codes
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i]
      if (!color.name.trim()) {
        return `Color #${i + 1} needs a name`
      }
      if (!color.hex_code || !color.hex_code.trim() || !/^#([0-9A-F]{3}){1,2}$/i.test(color.hex_code)) {
        return `Color #${i + 1} (${color.name}) needs a valid hex color code`
      }
    }

    // Validate sizes have names
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i]
      if (!size.name.trim()) {
        return `Size #${i + 1} needs a name`
      }
    }

    // Make sure there's at least one variation if we have colors or sizes
    if ((colors.length > 0 || sizes.length > 0) && variations.length === 0) {
      return "You need to create at least one variation for your product"
    }

    // Validate all variations have necessary data
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i]
      if (!variation.price || variation.price <= 0) {
        return `Variation #${i + 1} needs a valid price`
      }
      if (variation.stock < 0) {
        return `Variation #${i + 1} cannot have negative stock`
      }
    }

    return null
  }

  const handleSave = async () => {
    try {
      const validationError = validateForm()
      if (validationError) {
        toast({
          title: "Validation Error",
          description: validationError,
          variant: "destructive",
        })
        return
      }

      setSaving(true)
      setError(null)

      // Prepare form data - ensure we're using snake_case for database columns
      // and that all required fields have values
      const formData: ProductAttributesFormData = {
        colors: colors.map((color) => ({
          name: color.name.trim(),
          hex_code: color.hex_code.trim() || "#000000", // Ensure we have a default
          display_order: color.display_order,
        })),
        sizes: sizes.map((size) => ({
          name: size.name.trim(),
          scale: size.scale || "custom",
          display_order: size.display_order,
        })),
        variations: variations.map((v) => ({
          colorId: v.colorId,
          sizeId: v.sizeId,
          sku: v.sku || null,
          price: v.price,
          salePrice: v.salePrice || null,
          stock: v.stock,
          isDefault: v.isDefault,
          images: v.images || [],
        })),
      }

      console.log("Saving product attributes:", formData)
      await saveProductAttributes(productId, formData)

      toast({
        title: "Success",
        description: "Product attributes saved successfully.",
      })

      if (onSaved) {
        onSaved()
      }
    } catch (err) {
      console.error("Error saving product attributes:", err)
      setError(err instanceof Error ? err.message : "Failed to save product attributes")
      toast({
        title: "Error",
        description: `Failed to save product attributes: ${err instanceof Error ? err.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading product attributes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium">Error loading attributes</h3>
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="colors" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="sizes">Sizes</TabsTrigger>
          <TabsTrigger value="variations">Variations</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Options</CardTitle>
            </CardHeader>
            <CardContent>
              <ColorPicker colors={colors} onChange={setColors} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizes" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Size Options</CardTitle>
            </CardHeader>
            <CardContent>
              <SizePicker
                sizes={sizes.map(s => ({ ...s, displayOrder: s.display_order }))}
                onChange={(newSizes) =>
                  setSizes(newSizes.map(s => ({ ...s, display_order: s.displayOrder })))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variations" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <VariationManager
                colors={colors.map((c, i) => ({
                  id: `temp-${i}`,
                  product_id: productId,
                  ...c,
                  created_at: "",
                  updated_at: "",
                }))}
                sizes={sizes.map((s, i) => ({
                  id: `temp-${i}`,
                  product_id: productId,
                  ...s,
                  created_at: "",
                  updated_at: "",
                }))}
                productPrice={productPrice}
                variations={variations}
                onChange={setVariations}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? "Saving..." : "Save Product Attributes"}
        </Button>
      </div>
    </div>
  )
}
