"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/contexts/language-context"
import { TranslatedText } from "@/components/translated-text"
import type { ProductVariation } from "@/lib/types/product-attributes"

interface ProductVariationSelectorProps {
  productId: string
  onVariationChange: (variation: ProductVariation | null) => void
}

export function ProductVariationSelector({ productId, onVariationChange }: ProductVariationSelectorProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [colors, setColors] = useState<{ id: string; name: string; hex_code: string }[]>([])
  const [sizes, setSizes] = useState<{ id: string; name: string }[]>([])
  const [variations, setVariations] = useState<ProductVariation[]>([])
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const { language } = useLanguage()

  useEffect(() => {
    fetchProductVariations()
  }, [productId])

  const fetchProductVariations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch colors for this product
      const { data: colorData, error: colorError } = await supabase
        .from("product_colors")
        .select("id, name, hex_code")
        .eq("product_id", productId)
        .order("name")

      if (colorError) throw colorError

      // Fetch sizes for this product
      const { data: sizeData, error: sizeError } = await supabase
        .from("product_sizes")
        .select("id, name")
        .eq("product_id", productId)
        .order("name")

      if (sizeError) throw sizeError

      // Fetch variations for this product
      const { data: variationData, error: variationError } = await supabase
        .from("product_variations")
        .select(`
          id, 
          color_id, 
          size_id, 
          price, 
          sale_price, 
          stock, 
          sku, 
          is_default
        `)
        .eq("product_id", productId)

      if (variationError) throw variationError

      setColors(colorData || [])
      setSizes(sizeData || [])
      setVariations(variationData || [])

      // If there are variations, select the default one
      if (variationData && variationData.length > 0) {
        const defaultVariation = variationData.find((v) => v.is_default) || variationData[0]
        setSelectedColorId(defaultVariation.color_id)
        setSelectedSizeId(defaultVariation.size_id)
        updateSelectedVariation(defaultVariation.color_id, defaultVariation.size_id, variationData)
      }
    } catch (error: any) {
      console.error("Error fetching product variations:", error)
      setError(error.message || "Failed to load product options")
    } finally {
      setLoading(false)
    }
  }

  const updateSelectedVariation = (
    colorId: string | null,
    sizeId: string | null,
    variationList: ProductVariation[] = variations,
  ) => {
    if (!colorId || !sizeId) {
      setSelectedVariation(null)
      onVariationChange(null)
      return
    }

    const variation = variationList.find((v) => v.color_id === colorId && v.size_id === sizeId)

    if (variation) {
      // Find color and size names
      const color = colors.find((c) => c.id === colorId)
      const size = sizes.find((s) => s.id === sizeId)

      const enrichedVariation = {
        ...variation,
        color_name: color?.name || "",
        size_name: size?.name || "",
        color_hex: color?.hex_code || "#000000",
      }

      setSelectedVariation(enrichedVariation)
      onVariationChange(enrichedVariation)
    } else {
      setSelectedVariation(null)
      onVariationChange(null)
    }
  }

  const handleColorChange = (colorId: string) => {
    setSelectedColorId(colorId)
    updateSelectedVariation(colorId, selectedSizeId)
  }

  const handleSizeChange = (sizeId: string) => {
    setSelectedSizeId(sizeId)
    updateSelectedVariation(selectedColorId, sizeId)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800 flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Error loading product options</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // If no variations, return empty
  if (colors.length === 0 || sizes.length === 0 || variations.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div>
          <h3 className={`text-sm font-medium mb-2 ${language === "bn" ? "bangla-text" : ""}`}>
            <TranslatedText textKey="product.color" fallback="Color" />:
          </h3>
          <RadioGroup value={selectedColorId || ""} onValueChange={handleColorChange} className="flex flex-wrap gap-2">
            {colors.map((color) => {
              // Check if this color has any in-stock variations with the selected size
              const hasStock =
                !selectedSizeId ||
                variations.some(
                  (v) => v.color_id === color.id && (!selectedSizeId || v.size_id === selectedSizeId) && v.stock > 0,
                )

              return (
                <div key={color.id} className="flex items-center">
                  <RadioGroupItem value={color.id} id={`color-${color.id}`} className="sr-only" disabled={!hasStock} />
                  <Label
                    htmlFor={`color-${color.id}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md cursor-pointer ${
                      selectedColorId === color.id
                        ? "border-primary bg-primary/10"
                        : "border-input hover:bg-accent hover:text-accent-foreground"
                    } ${!hasStock ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hex_code }}></span>
                    <span>{color.name}</span>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <h3 className={`text-sm font-medium mb-2 ${language === "bn" ? "bangla-text" : ""}`}>
            <TranslatedText textKey="product.size" fallback="Size" />:
          </h3>
          <RadioGroup value={selectedSizeId || ""} onValueChange={handleSizeChange} className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              // Check if this size has any in-stock variations with the selected color
              const hasStock =
                !selectedColorId ||
                variations.some(
                  (v) => v.size_id === size.id && (!selectedColorId || v.color_id === selectedColorId) && v.stock > 0,
                )

              return (
                <div key={size.id} className="flex items-center">
                  <RadioGroupItem value={size.id} id={`size-${size.id}`} className="sr-only" disabled={!hasStock} />
                  <Label
                    htmlFor={`size-${size.id}`}
                    className={`px-3 py-1.5 border rounded-md cursor-pointer ${
                      selectedSizeId === size.id
                        ? "border-primary bg-primary/10"
                        : "border-input hover:bg-accent hover:text-accent-foreground"
                    } ${!hasStock ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {size.name}
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>
      )}

      {selectedVariation && (
        <div className="mt-2">
          {selectedVariation.stock <= 5 && selectedVariation.stock > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
              <TranslatedText
                textKey="product.lowStock"
                fallback="Only {count} left in stock"
                values={{ count: selectedVariation.stock }}
              />
            </Badge>
          )}
          {selectedVariation.stock <= 0 && (
            <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
              <TranslatedText textKey="product.outOfStock" fallback="Out of stock" />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
