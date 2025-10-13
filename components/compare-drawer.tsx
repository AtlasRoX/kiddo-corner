"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MinusCircle, ArrowRight, Check, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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

interface CompareDrawerProps {
  products: Product[]
  onRemove: (productId: string) => void
  onClearAll: () => void
}

export function CompareDrawer({ products, onRemove, onClearAll }: CompareDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)

  useEffect(() => {
    // When products change, ensure drawer is visible if we have products
    if (products.length > 0) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [products.length])

  if (!isOpen) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background border-t border-x rounded-t-lg shadow-lg overflow-auto max-h-[70vh]"
          >
            <div className="p-4 border-b sticky top-0 bg-background z-10 flex justify-between items-center">
              <h3 className="font-semibold">Compare Products ({products.length})</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onClearAll}>
                  Clear All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsMinimized(true)}>
                  Minimize
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted/30 sticky top-[57px]">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium text-muted-foreground text-sm w-1/5">Product</th>
                    {products.map((product) => (
                      <th key={product.id} className="py-3 px-4 text-center font-medium text-sm min-w-[200px]">
                        <div className="flex flex-col items-center">
                          <div className="relative w-full aspect-square max-w-[120px] mx-auto mb-2">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover rounded-md"
                                sizes="120px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                                <Image
                                  src="/placeholder.svg"
                                  alt="Product placeholder"
                                  width={40}
                                  height={40}
                                  className="opacity-50"
                                />
                              </div>
                            )}
                            <button
                              onClick={() => onRemove(product.id)}
                              className="absolute -top-2 -right-2 bg-white rounded-full shadow-sm hover:text-destructive"
                              aria-label="Remove product"
                            >
                              <MinusCircle className="h-5 w-5" />
                            </button>
                          </div>

                          <span className="line-clamp-1 font-medium mb-1">{product.name}</span>
                          <span className="text-primary font-bold">৳{product.price.toFixed(2)}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Category Row */}
                  <tr className="border-t">
                    <td className="py-3 px-4 font-medium bg-muted/10">Category</td>
                    {products.map((product) => (
                      <td key={`${product.id}-category`} className="py-3 px-4 text-center">
                        {product.category || "Uncategorized"}
                      </td>
                    ))}
                  </tr>

                  {/* Availability Row */}
                  <tr className="border-t">
                    <td className="py-3 px-4 font-medium bg-muted/10">Availability</td>
                    {products.map((product) => {
                      const isInStock = product.stock === undefined || product.stock > 0
                      return (
                        <td key={`${product.id}-availability`} className="py-3 px-4 text-center">
                          {isInStock ? (
                            <span className="inline-flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-600">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Out of Stock
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Description Row */}
                  <tr className="border-t">
                    <td className="py-3 px-4 font-medium bg-muted/10">Description</td>
                    {products.map((product) => (
                      <td key={`${product.id}-description`} className="py-3 px-4 text-center">
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {product.description || "No description available"}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr className="border-t">
                    <td className="py-3 px-4 font-medium bg-muted/10">Action</td>
                    {products.map((product) => {
                      const isInStock = product.stock === undefined || product.stock > 0
                      return (
                        <td key={`${product.id}-action`} className="py-3 px-4 text-center">
                          <Link href={`/products/${product.slug}`}>
                            <Button size="sm" className="gap-1" disabled={!isInStock}>
                              {isInStock ? "View Details" : "Out of Stock"}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-primary text-primary-foreground px-4 py-2 border-t-2 border-primary-foreground/10 cursor-pointer flex items-center justify-between"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">Compare Products ({products.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onClearAll()
            }}
          >
            Clear All
          </Button>

          <button
            className="flex items-center justify-center h-6 w-6 rounded-full hover:bg-primary-foreground/20"
            onClick={(e) => {
              e.stopPropagation()
              setIsMinimized(!isMinimized)
            }}
          >
            {isMinimized ? <ArrowRight className="h-4 w-4 rotate-90" /> : <ArrowRight className="h-4 w-4 -rotate-90" />}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
