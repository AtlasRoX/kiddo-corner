"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react"
import { VariationImageUploader } from "./variation-image-uploader"
import type { ProductColor, ProductSize } from "@/lib/types/product-attributes"

interface VariationData {
  id?: string
  colorId: string | null
  sizeId: string | null
  sku: string | null
  price: number
  salePrice: number | null
  stock: number
  isDefault: boolean
  images: Array<{
    id?: string
    file?: File
    url?: string
    isPrimary: boolean
    mediaType: "image" | "video"
    displayOrder: number
  }>
  expanded: boolean // UI state only
}

interface VariationManagerProps {
  colors: ProductColor[]
  sizes: ProductSize[]
  productPrice: number
  variations: VariationData[]
  onChange: (variations: VariationData[]) => void
}

export function VariationManager({ colors, sizes, productPrice, variations, onChange }: VariationManagerProps) {
  const [activeTab, setActiveTab] = useState<string>("all")

  // Generate all possible variations based on colors and sizes
  const generateAllVariations = () => {
    if (colors.length === 0 && sizes.length === 0) {
      // If no colors or sizes, create a default variation
      if (variations.length === 0) {
        onChange([
          {
            colorId: null,
            sizeId: null,
            sku: null,
            price: productPrice,
            salePrice: null,
            stock: 0,
            isDefault: true,
            images: [],
            expanded: true,
          },
        ])
      }
      return
    }

    const newVariations: VariationData[] = []

    if (colors.length === 0) {
      // Only size variations
      sizes.forEach((size) => {
        newVariations.push({
          colorId: null,
          sizeId: size.id,
          sku: null,
          price: productPrice,
          salePrice: null,
          stock: 0,
          isDefault: newVariations.length === 0,
          images: [],
          expanded: false,
        })
      })
    } else if (sizes.length === 0) {
      // Only color variations
      colors.forEach((color) => {
        newVariations.push({
          colorId: color.id,
          sizeId: null,
          sku: null,
          price: productPrice,
          salePrice: null,
          stock: 0,
          isDefault: newVariations.length === 0,
          images: [],
          expanded: false,
        })
      })
    } else {
      // Both color and size variations
      colors.forEach((color) => {
        sizes.forEach((size) => {
          newVariations.push({
            colorId: color.id,
            sizeId: size.id,
            sku: null,
            price: productPrice,
            salePrice: null,
            stock: 0,
            isDefault: newVariations.length === 0,
            images: [],
            expanded: false,
          })
        })
      })
    }

    // Set the first variation as expanded
    if (newVariations.length > 0) {
      newVariations[0].expanded = true
    }

    onChange(newVariations)
  }

  // Add a single variation
  const addVariation = () => {
    const newVariation: VariationData = {
      colorId: colors.length > 0 ? colors[0].id : null,
      sizeId: sizes.length > 0 ? sizes[0].id : null,
      sku: null,
      price: productPrice,
      salePrice: null,
      stock: 0,
      isDefault: variations.length === 0,
      images: [],
      expanded: true,
    }

    onChange([...variations, newVariation])
  }

  // Remove a variation
  const removeVariation = (index: number) => {
    const newVariations = [...variations]
    const removedVariation = newVariations.splice(index, 1)[0]

    // If we removed the default variation, make the first remaining variation default
    if (removedVariation.isDefault && newVariations.length > 0) {
      newVariations[0].isDefault = true
    }

    onChange(newVariations)
  }

  // Update a variation
  const updateVariation = (index: number, field: keyof VariationData, value: any) => {
    const newVariations = [...variations]

    if (field === "isDefault" && value === true) {
      // Set all other variations to non-default
      newVariations.forEach((v) => (v.isDefault = false))
    }

    newVariations[index] = { ...newVariations[index], [field]: value }
    onChange(newVariations)
  }

  // Toggle variation expanded state
  const toggleExpanded = (index: number) => {
    const newVariations = [...variations]
    newVariations[index].expanded = !newVariations[index].expanded
    onChange(newVariations)
  }

  // Update variation images
  const updateVariationImages = (index: number, images: VariationData["images"]) => {
    const newVariations = [...variations]
    newVariations[index].images = images
    onChange(newVariations)
  }

  // Filter variations based on active tab
  const filteredVariations = variations.filter((variation) => {
    if (activeTab === "all") return true
    if (activeTab === "default") return variation.isDefault

    // Filter by color
    if (activeTab.startsWith("color-")) {
      const colorId = activeTab.replace("color-", "")
      return variation.colorId === colorId
    }

    // Filter by size
    if (activeTab.startsWith("size-")) {
      const sizeId = activeTab.replace("size-", "")
      return variation.sizeId === sizeId
    }

    return true
  })

  // Generate tabs based on colors and sizes
  const generateTabs = () => {
    const tabs = [
      { id: "all", label: "All Variations" },
      { id: "default", label: "Default Variation" },
    ]

    // Add color tabs
    colors.forEach((color) => {
      tabs.push({
        id: `color-${color.id}`,
        label: color.name,
      })
    })

    // Add size tabs if there are more than 3 sizes
    if (sizes.length > 3) {
      sizes.forEach((size) => {
        tabs.push({
          id: `size-${size.id}`,
          label: size.name,
        })
      })
    }

    return tabs
  }

  // Get color and size names for display
  const getColorName = (colorId: string | null) => {
    if (!colorId) return "No Color"

    // Handle temp IDs
    if (colorId.toString().startsWith("temp-")) {
      const index = Number.parseInt(colorId.toString().replace("temp-", ""), 10)
      if (!isNaN(index) && index >= 0 && index < colors.length) {
        return colors[index].name
      }
    }

    const color = colors.find((c) => c.id === colorId)
    return color ? color.name : "Unknown Color"
  }

  const getSizeName = (sizeId: string | null) => {
    if (!sizeId) return "No Size"

    // Handle temp IDs
    if (sizeId.toString().startsWith("temp-")) {
      const index = Number.parseInt(sizeId.toString().replace("temp-", ""), 10)
      if (!isNaN(index) && index >= 0 && index < sizes.length) {
        return sizes[index].name
      }
    }

    const size = sizes.find((s) => s.id === sizeId)
    return size ? size.name : "Unknown Size"
  }

  // Effect to create default variation if none exists
  useEffect(() => {
    if (variations.length === 0) {
      if (colors.length > 0 || sizes.length > 0) {
        generateAllVariations()
      } else {
        addVariation()
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Product Variations</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={generateAllVariations}
            disabled={colors.length === 0 && sizes.length === 0}
          >
            Generate All Variations
          </Button>
          <Button type="button" onClick={addVariation}>
            <Plus className="w-4 h-4 mr-1" /> Add Variation
          </Button>
        </div>
      </div>

      {variations.length > 0 && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex flex-wrap h-auto">
            {generateTabs().map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="mb-1">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="space-y-4">
            {filteredVariations.map((variation, index) => {
              const originalIndex = variations.findIndex(
                (v) => v.colorId === variation.colorId && v.sizeId === variation.sizeId,
              )

              return (
                <Card key={index} className={variation.isDefault ? "border-primary" : ""}>
                  <CardHeader
                    className="py-3 flex flex-row items-center justify-between cursor-pointer"
                    onClick={() => toggleExpanded(originalIndex)}
                  >
                    <CardTitle className="text-base flex items-center">
                      {variation.isDefault && (
                        <span className="mr-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                      {getColorName(variation.colorId)}
                      {variation.colorId && variation.sizeId && " / "}
                      {getSizeName(variation.sizeId)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal">{variation.stock} in stock</span>
                      {variation.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CardHeader>

                  {variation.expanded && (
                    <CardContent className="pt-0">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {colors.length > 0 && (
                              <div className="space-y-2">
                                <Label>Color</Label>
                                <Select
                                  value={variation.colorId || ""}
                                  onValueChange={(value) => updateVariation(originalIndex, "colorId", value || null)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select color" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {colors.map((color) => (
                                      <SelectItem key={color.id} value={color.id}>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: color.hex_code }}
                                          />
                                          {color.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {sizes.length > 0 && (
                              <div className="space-y-2">
                                <Label>Size</Label>
                                <Select
                                  value={variation.sizeId || ""}
                                  onValueChange={(value) => updateVariation(originalIndex, "sizeId", value || null)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sizes.map((size) => (
                                      <SelectItem key={size.id} value={size.id}>
                                        {size.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`sku-${index}`}>SKU (Optional)</Label>
                            <Input
                              id={`sku-${index}`}
                              value={variation.sku || ""}
                              onChange={(e) => updateVariation(originalIndex, "sku", e.target.value)}
                              placeholder="e.g., BABY-PINK-SM"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`price-${index}`}>Price</Label>
                              <Input
                                id={`price-${index}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={variation.price}
                                onChange={(e) => updateVariation(originalIndex, "price", Number(e.target.value))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`salePrice-${index}`}>Sale Price (Optional)</Label>
                              <Input
                                id={`salePrice-${index}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={variation.salePrice || ""}
                                onChange={(e) =>
                                  updateVariation(
                                    originalIndex,
                                    "salePrice",
                                    e.target.value ? Number(e.target.value) : null,
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`stock-${index}`}>Stock</Label>
                            <Input
                              id={`stock-${index}`}
                              type="number"
                              min="0"
                              value={variation.stock}
                              onChange={(e) => updateVariation(originalIndex, "stock", Number(e.target.value))}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`default-${index}`}
                              checked={variation.isDefault}
                              onCheckedChange={(checked) => updateVariation(originalIndex, "isDefault", checked)}
                            />
                            <Label htmlFor={`default-${index}`}>Set as default variation</Label>
                          </div>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVariation(originalIndex)}
                          >
                            <X className="w-4 h-4 mr-1" /> Remove Variation
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <Label>Variation Images</Label>
                          <VariationImageUploader
                            images={variation.images}
                            onChange={(images) => updateVariationImages(originalIndex, images)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </Tabs>
      )}
    </div>
  )
}
