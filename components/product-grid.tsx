"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/contexts/language-context"
import { TranslatedText } from "@/components/translated-text"

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  category: string
}

export function ProductGrid({ limit = 8, showViewAll = true }: { limit?: number; showViewAll?: boolean }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language } = useLanguage()

  useEffect(() => {
    fetchProducts()
  }, [limit])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, price, images, category")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      setProducts(data || [])
    } catch (err: any) {
      console.error("Error fetching products:", err)
      setError("Failed to load products. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className={`text-2xl font-bold tracking-tight ${language === "bn" ? "bangla-text" : ""}`}>
          <TranslatedText textKey="home.featured" fallback="Featured Products" />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(limit)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="h-[300px] rounded-lg border-2 border-primary/10 bg-muted/30 animate-pulse"
              ></div>
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchProducts} variant="outline" className="mx-auto">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Retry
        </Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No products found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className={`text-2xl font-bold tracking-tight ${language === "bn" ? "bangla-text" : ""}`}>
        <TranslatedText textKey="home.featured" fallback="Featured Products" />
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {showViewAll && products.length >= limit && (
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <a href="/products">
              <TranslatedText textKey="home.viewAll" fallback="View All Products" />
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}
