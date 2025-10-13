"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Eye, BarChart4, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { TranslatedText } from "@/components/translated-text"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  category?: string
  description?: string
  rating?: number
  stock?: number
}

interface ProductListItemProps {
  product: Product
  onQuickView: () => void
  onToggleWishlist: () => void
  onToggleCompare: () => void
  isInWishlist: boolean
  isInCompare: boolean
}

export function ProductListItem({
  product,
  onQuickView,
  onToggleWishlist,
  onToggleCompare,
  isInWishlist,
  isInCompare,
}: ProductListItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { language } = useLanguage()
  const [imageError, setImageError] = useState(false)

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true)
  }

  // Check if product is in stock
  const isInStock = product.stock === undefined || product.stock > 0

  return (
    <div
      className="flex flex-col md:flex-row border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full md:w-48 h-48">
        <Link href={`/products/${product.slug}`}>
          <div className="relative h-full overflow-hidden bg-muted/30">
            {product.images && product.images.length > 0 && !imageError ? (
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300"
                style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, 192px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Image
                  src="/placeholder.svg"
                  alt="Product placeholder"
                  width={100}
                  height={100}
                  className="opacity-50"
                />
              </div>
            )}
          </div>
        </Link>

        {/* Category badge */}
        {product.category && (
          <Badge className="absolute left-2 top-2 bg-white/90 text-primary hover:bg-white">{product.category}</Badge>
        )}

        {/* Stock badge */}
        {!isInStock && (
          <Badge variant="destructive" className="absolute left-2 bottom-2">
            Out of Stock
          </Badge>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <Link href={`/products/${product.slug}`}>
              <h3 className={`font-semibold text-lg hover:underline ${language === "bn" ? "bangla-text" : ""}`}>
                {product.name}
              </h3>
            </Link>

            <p className="text-xl font-bold text-primary">৳{product.price.toFixed(2)}</p>
          </div>

          {/* Rating */}
          {product.rating !== undefined && (
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                />
              ))}
              <span className="ml-1 text-xs text-muted-foreground">({product.rating.toFixed(1)})</span>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{product.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={onQuickView}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quick View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-9 w-9 p-0 ${isInWishlist ? "text-red-500 border-red-200" : ""}`}
                    onClick={onToggleWishlist}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-9 w-9 p-0 ${isInCompare ? "text-blue-500 border-blue-200" : ""}`}
                    onClick={onToggleCompare}
                  >
                    <BarChart4 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isInCompare ? "Remove from Compare" : "Add to Compare"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Link href={`/products/${product.slug}`}>
            <Button className="gap-2 bg-primary/90 hover:bg-primary" disabled={!isInStock}>
              <ShoppingCart className="w-4 h-4" />
              {isInStock ? (
                <TranslatedText textKey="product.buyNow" fallback="Buy Now" />
              ) : (
                <TranslatedText textKey="product.outOfStock" fallback="Out of Stock" />
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
