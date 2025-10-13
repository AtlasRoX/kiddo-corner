"use client"

import { use } from 'react';
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, ChevronLeft, ShoppingCart } from "lucide-react"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { MarkdownContent } from "@/components/markdown-content"
import { useSiteSettings } from "@/contexts/site-settings-context"
import { useLanguage } from "@/contexts/language-context"
import { TranslatedText } from "@/components/translated-text"
import { ProductVariationSelector } from "@/components/product/product-variation-selector"
import type { ProductVariation } from "@/lib/types/product-attributes"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { YouTubeEmbed } from "@/components/youtube-embed"



interface Product {
  id: string
  slug: string
  name: string
  price: number
  description: string
  images: string[]
  category: string
  stock: number
  default_rating: number
  review_count: number
  video_url?: string
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const { settings } = useSiteSettings()
  const { slug } = params;
  const { language } = useLanguage()
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()
  const { toast } = useToast()
  const [hasVariations, setHasVariations] = useState(false)
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null)

  useEffect(() => {
    fetchProduct()
    checkProductVariations()
  }, [slug])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", params.slug)
        .eq("active", true)
        .single()

      if (error) throw error
      setProduct(data)

      // Extract YouTube video ID if video_url exists
      if (data.video_url) {
        const videoId = extractYouTubeId(data.video_url)
        setYoutubeVideoId(videoId)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  // Function to extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    return match && match[2].length === 11 ? match[2] : null
  }

  const checkProductVariations = async () => {
    if (!params.slug) return

    try {
      // First get the product ID from slug
      const { data: productData } = await supabase.from("products").select("id").eq("slug", params.slug).single()

      if (!productData) return

      // Check if product has variations
      const { count } = await supabase
        .from("product_variations")
        .select("id", { count: "exact", head: false })
        .eq("product_id", productData.id)

      setHasVariations((count || 0) > 0)
    } catch (error) {
      console.error("Error checking product variations:", error)
    }
  }

  const handleVariationChange = (variation: ProductVariation | null) => {
    setSelectedVariation(variation)
    // Reset quantity when variation changes
    setQuantity(1)
  }

  const handleBuyNow = () => {
    if (!product) return

    // Check if product has variations but none selected
    if (hasVariations && !selectedVariation) {
      toast({
        title: "Please select options",
        description: "Please select color and size options before proceeding",
        variant: "destructive",
      })
      return
    }

    // Navigate to checkout page with product details
    const checkoutParams = new URLSearchParams({
      product_id: product.id,
      quantity: quantity.toString(),
    })

    if (selectedVariation) {
      if (selectedVariation?.id) {
        checkoutParams.append("variation_id", selectedVariation.id)
      }
    }

    router.push(`/checkout?${checkoutParams.toString()}`)
  }

  const handleQuantityChange = (value: number) => {
    if (value < 1) return
    const maxStock = selectedVariation ? selectedVariation.stock : product?.stock || 10
    if (value > maxStock) return
    setQuantity(value)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          <div className="mb-6 h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border-2 border-primary/10 bg-muted/30">
                <div className="relative aspect-square">
                  <Skeleton className="h-full w-full" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((_, index) => (
                  <Skeleton key={index} className="aspect-square rounded-md" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/4 mb-2" />
                <div className="flex items-center mt-2">
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-10 w-full mt-6" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border-2 border-primary/10 bg-muted/30">
              <div className="relative aspect-square">
                <Image
                  src={product.images?.[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`overflow-hidden rounded-md border cursor-pointer hover:border-primary/30 ${
                      selectedImage === index ? "border-primary" : "border-primary/10"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className={`text-3xl font-adorable tracking-tight ${language === "bn" ? "bangla-text" : ""}`}>
                {product.name}
              </h1>
              <p className="mt-2 text-xl font-bold text-primary">
                ৳{(selectedVariation?.price || product.price).toFixed(2)}
                {selectedVariation?.sale_price && (
                  <span className="ml-2 text-sm line-through text-muted-foreground">
                    ৳{selectedVariation.price.toFixed(2)}
                  </span>
                )}
              </p>
              <div className="flex items-center mt-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (product.default_rating || 5) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                <span className="ml-2 text-sm text-muted-foreground">{product.review_count || 0} reviews</span>
              </div>
            </div>

            {/* Product Variations Section */}
            <div className="mt-6 border rounded-lg p-4 bg-background/50">
              <h2 className={`mb-4 text-lg font-adorable ${language === "bn" ? "bangla-text" : ""}`}>
                <TranslatedText textKey="product.options" fallback="Product Options" />
              </h2>
              <ProductVariationSelector productId={product.id} onVariationChange={handleVariationChange} />
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <label htmlFor="quantity" className="text-sm font-medium">
                <TranslatedText textKey="product.quantity" fallback="Quantity" />:
              </label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={(selectedVariation?.stock || product.stock) <= 0}
                >
                  -
                </Button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedVariation?.stock || product.stock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                  className="h-8 w-12 text-center border-y border-input"
                  disabled={(selectedVariation?.stock || product.stock) <= 0}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={(selectedVariation?.stock || product.stock) <= 0}
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              onClick={handleBuyNow}
              size="lg"
              className="w-full gap-2 bg-primary/90 hover:bg-primary"
              disabled={(selectedVariation?.stock || product.stock) <= 0}
            >
              <ShoppingCart className="w-5 h-5" />
              <TranslatedText textKey="product.buyNow" fallback="Buy Now" />
            </Button>

            <div>
              <h2 className={`mb-2 text-lg font-adorable ${language === "bn" ? "bangla-text" : ""}`}>
                <TranslatedText textKey="product.details" fallback="Product Details" />
              </h2>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  <TranslatedText textKey="product.category" fallback="Category" />: {product.category}
                </li>
                <li>
                  <TranslatedText textKey="product.stock" fallback="Available Stock" />:{" "}
                  {selectedVariation?.stock || product.stock} items
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Tabs Section */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="description" className="font-adorable">
                <TranslatedText textKey="product.description" fallback="Description" />
              </TabsTrigger>
              <TabsTrigger value="video" className="font-adorable" disabled={!youtubeVideoId}>
                <TranslatedText textKey="product.video" fallback="Video" />
              </TabsTrigger>
              <TabsTrigger value="reviews" className="font-adorable">
                <TranslatedText textKey="product.reviews" fallback="Reviews" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6 p-4 bg-background/50 rounded-lg border">
              <div className={`prose prose-sm max-w-none ${language === "bn" ? "bangla-text" : ""}`}>
                <MarkdownContent content={product.description || "No description available."} />
              </div>
            </TabsContent>

            <TabsContent value="video" className="mt-6 p-4 bg-background/50 rounded-lg border">
              {youtubeVideoId ? (
                <div className="max-w-3xl mx-auto">
                  <YouTubeEmbed videoId={youtubeVideoId} title={product.name} />
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  <TranslatedText textKey="product.noVideo" fallback="No video available for this product." />
                </p>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6 p-4 bg-background/50 rounded-lg border">
              <div className="text-center py-8">
                <h3 className="text-lg font-adorable mb-2">
                  <TranslatedText textKey="product.customerReviews" fallback="Customer Reviews" />
                </h3>
                <p className="text-muted-foreground">
                  <TranslatedText
                    textKey="product.noReviews"
                    fallback="No reviews yet. Be the first to review this product!"
                  />
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </main>
  )
}
