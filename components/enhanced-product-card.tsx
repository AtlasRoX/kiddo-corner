"use client"

import { useEffect } from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Eye, BarChart4, Star } from "lucide-react"
import { motion } from "framer-motion"
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
  stock?: number
}

interface EnhancedProductCardProps {
  product: Product
  onQuickView: () => void
  onToggleWishlist: () => void
  onToggleCompare: () => void
  isInWishlist: boolean
  isInCompare: boolean
}

export function EnhancedProductCard({
  product,
  onQuickView,
  onToggleWishlist,
  onToggleCompare,
  isInWishlist,
  isInCompare,
}: EnhancedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { language } = useLanguage()
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoaded = () => {
    setImageLoaded(true)
  }

  // Check if product is in stock
  const isInStock = product.stock === undefined || product.stock > 0

  // Handle image cycling on hover
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isHovered && product.images && product.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
      }, 1500)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isHovered, product.images])

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => {
        setIsHovered(false)
        setCurrentImageIndex(0) // Reset to first image when not hovering
      }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full border-2 border-primary/10 hover:border-primary/30 transition-colors">
        <div className="relative">
          <Link href={`/products/${product.slug}`}>
            <div className="relative aspect-square overflow-hidden bg-muted/30">
              {product.images && product.images.length > 0 && !imageError ? (
                <>
                  <div
                    className={`absolute inset-0 bg-muted/50 ${imageLoaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                  />
                  <Image
                    src={product.images[currentImageIndex] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className={`object-cover transition-all duration-300 ${
                      imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    } ${isHovered ? "scale-110" : "scale-100"}`}
                    onError={handleImageError}
                    onLoad={handleImageLoaded}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={85}
                  />
                </>
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

              {/* Quick image navigation for mobile - shown when there are multiple images */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {product.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${currentImageIndex === idx ? "bg-white" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </Link>

          {/* Quick action buttons */}
          <div
            className={`absolute right-2 top-2 flex flex-col gap-2 transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"}`}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/90 text-primary hover:bg-white"
                    onClick={(e) => {
                      e.preventDefault()
                      onQuickView()
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Quick View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className={`h-8 w-8 rounded-full bg-white/90 hover:bg-white ${isInWishlist ? "text-red-500" : "text-primary"}`}
                    onClick={(e) => {
                      e.preventDefault()
                      onToggleWishlist()
                    }}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className={`h-8 w-8 rounded-full bg-white/90 hover:bg-white ${isInCompare ? "text-blue-500" : "text-primary"}`}
                    onClick={(e) => {
                      e.preventDefault()
                      onToggleCompare()
                    }}
                  >
                    <BarChart4 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{isInCompare ? "Remove from Compare" : "Add to Compare"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

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

        <CardContent className="p-4">
          <Link href={`/products/${product.slug}`}>
            <h3
              className={`font-semibold text-lg line-clamp-1 hover:text-primary transition-colors ${language === "bn" ? "bangla-text" : ""}`}
            >
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
              />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">(4.0)</span>
          </div>

          <p className="text-xl font-bold text-primary mt-2">৳{product.price.toFixed(2)}</p>

          {/* Short description */}
          {product.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Link href={`/products/${product.slug}`} className="w-full">
            <Button
              className={`w-full gap-2 ${!isInStock ? "bg-muted hover:bg-muted text-muted-foreground" : "bg-primary/90 hover:bg-primary"}`}
              disabled={!isInStock}
            >
              <ShoppingCart className="w-4 h-4" />
              {isInStock ? (
                <TranslatedText textKey="product.buyNow" fallback="Buy Now" />
              ) : (
                <TranslatedText textKey="product.outOfStock" fallback="Out of Stock" />
              )}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
