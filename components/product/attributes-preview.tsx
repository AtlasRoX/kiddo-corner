"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Palette, ExternalLink } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface AttributesPreviewProps {
  productId: string
}

export function AttributesPreview({ productId }: AttributesPreviewProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    colorCount: 0,
    sizeCount: 0,
    variationCount: 0,
    hasAttributes: false,
  })

  useEffect(() => {
    fetchAttributeStats()
  }, [productId])

  const fetchAttributeStats = async () => {
    try {
      setLoading(true)

      // Get color count
      const { count: colorCount } = await supabase
        .from("product_colors")
        .select("id", { count: "exact", head: false })
        .eq("product_id", productId)

      // Get size count
      const { count: sizeCount } = await supabase
        .from("product_sizes")
        .select("id", { count: "exact", head: false })
        .eq("product_id", productId)

      // Get variation count
      const { count: variationCount } = await supabase
        .from("product_variations")
        .select("id", { count: "exact", head: false })
        .eq("product_id", productId)

      setStats({
        colorCount: colorCount || 0,
        sizeCount: sizeCount || 0,
        variationCount: variationCount || 0,
        hasAttributes: (colorCount || 0) > 0 || (sizeCount || 0) > 0 || (variationCount || 0) > 0,
      })
    } catch (error) {
      console.error("Error fetching attribute stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Product Attributes
        </CardTitle>
        <CardDescription>Manage colors, sizes, and variations for this product</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-md">
              <div className="text-2xl font-bold">{stats.colorCount}</div>
              <div className="text-sm text-muted-foreground">Colors</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-md">
              <div className="text-2xl font-bold">{stats.sizeCount}</div>
              <div className="text-sm text-muted-foreground">Sizes</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-md">
              <div className="text-2xl font-bold">{stats.variationCount}</div>
              <div className="text-sm text-muted-foreground">Variations</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/admin/products/${productId}/attributes`}>
            {stats.hasAttributes ? "Edit Attributes" : "Add Attributes"}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
