"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { TranslatedText } from "@/components/translated-text"

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    images: string[]
    category?: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { language } = useLanguage()
  const [imageError, setImageError] = useState(false)

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className="overflow-hidden h-full border-2 border-primary/10 hover:border-primary/30 transition-colors">
        <Link href={`/products/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            {product.images && product.images.length > 0 && !imageError ? (
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300"
                style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        <CardContent className="p-4">
          <Link href={`/products/${product.slug}`}>
            <h3
              className={`font-semibold text-lg line-clamp-1 hover:underline ${language === "bn" ? "bangla-text" : ""}`}
            >
              {product.name}
            </h3>
          </Link>
          <p className="text-xl font-bold text-primary mt-1">৳{product.price.toFixed(2)}</p>
          {product.category && <p className="text-sm text-muted-foreground mt-1 capitalize">{product.category}</p>}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Link href={`/products/${product.slug}`} className="w-full">
            <Button className="w-full gap-2 bg-primary/90 hover:bg-primary">
              <ShoppingCart className="w-4 h-4" />
              <TranslatedText textKey="product.buyNow" fallback="Buy Now" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
