"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
}

export function SearchBar() {
  const [isFocused, setIsFocused] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchProducts(debouncedSearchTerm)
    } else {
      setResults([])
      setShowResults(false)
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const searchProducts = async (term: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, price, images, category")
        .or(`name.ilike.%${term}%, description.ilike.%${term}%, category.ilike.%${term}%`)
        .limit(5)

      if (error) throw error

      setResults(data || [])
      setShowResults(true)
    } catch (error) {
      console.error("Error searching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="relative w-full max-w-md mx-auto" ref={searchRef}>
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        className="relative flex items-center"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for baby products..."
          className="pl-10 pr-10 h-12 rounded-full border-2 border-primary/20 focus-visible:ring-primary/30"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            if (searchTerm) setShowResults(true)
          }}
          onBlur={() => setIsFocused(false)}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-2 bg-background rounded-lg shadow-lg border overflow-hidden"
          >
            {results.length > 0 ? (
              <div className="max-h-[60vh] overflow-y-auto">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="flex items-center p-3 hover:bg-muted transition-colors"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted/50 mr-3">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{product.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-muted-foreground">{product.category || "Uncategorized"}</span>
                        <span className="text-sm font-semibold text-primary">${product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {loading ? "Searching..." : "No products found"}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
