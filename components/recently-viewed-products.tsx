"use client"

import { useEffect, useState } from "react"
import { TranslatedText } from "@/components/translated-text"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  category?: string
}

export function RecentlyViewedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const { language } = useLanguage()

  const itemsPerPage = typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 4

  useEffect(() => {
    const recentProducts = localStorage.getItem("recentlyViewed")
    if (recentProducts) {
      try {
        const parsed = JSON.parse(recentProducts)
        setProducts(parsed.slice(0, 8)) // Limit to 8 items
      } catch (e) {
        console.error("Error parsing recently viewed products:", e)
      }
    }
  }, [])

  if (products.length <= 1) return null

  const totalPages = Math.ceil(products.length / itemsPerPage)

  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const visibleProducts = products.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage)

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${language === "bn" ? "bangla-text" : ""}`}>
          <TranslatedText textKey="products.recentlyViewed" fallback="Recently Viewed" />
        </h2>

        {totalPages > 1 && (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevPage} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextPage} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {visibleProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={`/products/${product.slug}`}>
              <Card className="overflow-hidden h-full border hover:border-primary/30 transition-colors">
                <div className="relative aspect-square overflow-hidden bg-muted/30">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Image
                        src="/placeholder.svg"
                        alt="Product placeholder"
                        width={50}
                        height={50}
                        className="opacity-50"
                      />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className={`font-medium text-sm line-clamp-1 ${language === "bn" ? "bangla-text" : ""}`}>
                    {product.name}
                  </h3>
                  <p className="text-primary font-semibold text-sm mt-1">৳{product.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
