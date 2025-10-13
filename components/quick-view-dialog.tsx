"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Truck, Star, ChevronLeft, ChevronRight, Info, Check, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MarkdownContent } from "@/components/markdown-content"
import Image from "next/image"
import Link from "next/link"

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  category?: string
  description?: string
  stock?: number
}

interface QuickViewDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleWishlist: () => void
  isInWishlist: boolean
}

export function QuickViewDialog({ product, open, onOpenChange, onToggleWishlist, isInWishlist }: QuickViewDialogProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { language } = useLanguage()

  const isInStock = product.stock === undefined || product.stock > 0
  const maxQuantity = product.stock || 10

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImage((selectedImage + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImage((selectedImage - 1 + product.images.length) % product.images.length)
    }
  }

  const handleQuantityChange = (value: number) => {
    if (value < 1) return
    if (value > maxQuantity) return
    setQuantity(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 p-6 pb-0">
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square overflow-hidden rounded-lg border">
                {product.images && product.images.length > 0 ? (
                  <>
                    <Image
                      src={product.images[selectedImage] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                      priority
                    />

                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 shadow-md"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 shadow-md"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <Image
                      src="/placeholder.svg"
                      alt="Product placeholder"
                      width={80}
                      height={80}
                      className="opacity-50"
                    />
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 border-2 ${
                        selectedImage === idx ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge>{product.category || "Uncategorized"}</Badge>
                  {isInStock ? (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                <p className="text-xl font-bold text-primary">৳{product.price.toFixed(2)}</p>

                <div className="flex items-center mt-1">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  <span className="ml-2 text-sm text-muted-foreground">4.0 (24 reviews)</span>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-4 bg-muted/10 rounded-lg mt-2">
                  {product.description ? (
                    <div className={`prose prose-sm max-w-none ${language === "bn" ? "bangla-text" : ""}`}>
                      <MarkdownContent content={product.description} />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No description available for this product.</p>
                  )}
                </TabsContent>

                <TabsContent value="details" className="p-4 bg-muted/10 rounded-lg mt-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">SKU:</span>
                    </div>
                    <div>PROD-{product.id.slice(0, 8).toUpperCase()}</div>

                    <div className="flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Category:</span>
                    </div>
                    <div>{product.category || "Uncategorized"}</div>

                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Availability:</span>
                    </div>
                    <div>
                      {isInStock ? (
                        <span className="text-green-600">In Stock ({product.stock || "Available"})</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="p-4 bg-muted/10 rounded-lg mt-2">
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">Standard Shipping</p>
                        <p className="text-muted-foreground">2-4 business days</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">Express Delivery</p>
                        <p className="text-muted-foreground">24-48 hours (when available)</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Shipping time depends on your location. Check the product page for more details.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {isInStock && (
                <div className="flex items-center">
                  <div className="flex items-center border rounded-l-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-none rounded-l-md"
                      onClick={() => handleQuantityChange(quantity - 1)}
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      min="1"
                      max={maxQuantity}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                      className="h-9 w-12 text-center focus:outline-none"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-none rounded-r-md"
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    {product.stock ? `${product.stock} available` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-6 border-t gap-3 grid sm:grid-cols-2">
          <Button
            variant="outline"
            className={`gap-2 ${isInWishlist ? "text-red-500 border-red-200" : ""}`}
            onClick={onToggleWishlist}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
            {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          </Button>

          <Link href={`/products/${product.slug}`} className="w-full">
            <Button className="w-full gap-2" disabled={!isInStock}>
              <ShoppingCart className="h-4 w-4" />
              View Full Details
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
