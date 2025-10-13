"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { Search, X, Clock, Tag, Loader2, History, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
}

interface Category {
  name: string
  count: number
}

interface SearchSuggestion {
  term: string
  type: "popular" | "category" | "history"
}

interface SearchBarProps {
  onSearch?: (term: string) => void
  initialValue?: string
  onCategorySelect?: (category: string) => void
  className?: string
  placeholder?: string
  expanded?: boolean
  showCategories?: boolean
}

export function SearchBar({
  onSearch,
  initialValue = "",
  onCategorySelect,
  className = "",
  placeholder = "Search for products...",
  expanded = false,
  showCategories = true,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(expanded)
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [results, setResults] = useState<Product[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([
    "Baby clothes",
    "Toys",
    "Diapers",
    "Formula",
    "Strollers",
  ])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const router = useRouter()

  // Load search history from localStorage on component mount
  useEffect(() => {
    const history = localStorage.getItem("searchHistory")
    if (history) {
      try {
        setSearchHistory(JSON.parse(history).slice(0, 5))
      } catch (e) {
        console.error("Error parsing search history:", e)
      }
    }

    // Fetch categories on mount
    fetchCategories()
  }, [])

  // Update suggestions when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      // Build suggestions based on the search term
      const newSuggestions: SearchSuggestion[] = []

      // Add matching popular searches
      popularSearches
        .filter((term) => term.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 3)
        .forEach((term) => {
          newSuggestions.push({ term, type: "popular" })
        })

      // Add matching categories
      categories
        .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 3)
        .forEach((cat) => {
          newSuggestions.push({ term: cat.name, type: "category" })
        })

      // Add matching history items
      searchHistory
        .filter((term) => term.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 3)
        .forEach((term) => {
          newSuggestions.push({ term, type: "history" })
        })

      setSuggestions(newSuggestions)
    } else {
      setSuggestions([])
    }
  }, [searchTerm, popularSearches, categories, searchHistory])

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
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .eq("active", true)
        .not("category", "is", null)

      if (error) throw error

      // Create a map to count products per category
      const categoryMap = new Map<string, number>()

      data.forEach((item) => {
        if (item.category) {
          const count = categoryMap.get(item.category) || 0
          categoryMap.set(item.category, count + 1)
        }
      })

      // Convert map to array of Category objects
      const categoryArray: Category[] = Array.from(categoryMap).map(([name, count]) => ({
        name,
        count,
      }))

      // Sort by product count (descending)
      categoryArray.sort((a, b) => b.count - a.count)

      setCategories(categoryArray)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const searchProducts = async (term: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, price, images, category")
        .or(`name.ilike.%${term}%, description.ilike.%${term}%, category.ilike.%${term}%`)
        .eq("active", true)
        .limit(8)

      if (error) throw error

      setResults(data || [])
      setShowResults(true)
    } catch (error) {
      console.error("Error searching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Add to search history
      const newHistory = [searchTerm, ...searchHistory.filter((term) => term !== searchTerm)].slice(0, 5)

      setSearchHistory(newHistory)
      localStorage.setItem("searchHistory", JSON.stringify(newHistory))

      if (onSearch) {
        onSearch(searchTerm)
        setShowResults(false)
      }
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "category") {
      if (onCategorySelect) {
        onCategorySelect(suggestion.term)
        setSearchTerm("")
        setShowResults(false)
      }
    } else {
      setSearchTerm(suggestion.term)
      if (onSearch) {
        onSearch(suggestion.term)

        // Add to search history
        const newHistory = [suggestion.term, ...searchHistory.filter((term) => term !== suggestion.term)].slice(0, 5)

        setSearchHistory(newHistory)
        localStorage.setItem("searchHistory", JSON.stringify(newHistory))

        setShowResults(false)
      }
    }
  }

  const handleCategoryClick = (category: string) => {
    if (onCategorySelect) {
      onCategorySelect(category)
      setSearchTerm("")
      setShowResults(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setResults([])
    setShowResults(false)
    if (onSearch) onSearch("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {}

    results.forEach((product) => {
      const category = product.category || "Uncategorized"
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(product)
    })

    return grouped
  }, [results])

  // Get categories from results
  const resultCategories = useMemo(() => Object.keys(productsByCategory).sort(), [productsByCategory])

  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <motion.div initial={{ scale: 1 }} animate={{ scale: isFocused ? 1.02 : 1 }} className="relative">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 rounded-full border-2 border-primary/20 focus-visible:ring-primary/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              setIsFocused(true)
              if (searchTerm.trim() || searchHistory.length > 0 || categories.length > 0) {
                setShowResults(true)
              }
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </button>
          )}
          <button type="submit" className="sr-only">
            Search
          </button>
        </form>
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
            {/* Suggestions Section */}
            {(suggestions.length > 0 || searchHistory.length > 0) && searchTerm.trim() && (
              <div className="p-3 border-b">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Suggestions</h3>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${index}`}
                      className="flex items-center w-full text-left p-2 hover:bg-muted rounded-md text-sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.type === "popular" && <Search className="h-3.5 w-3.5 mr-2 text-primary" />}
                      {suggestion.type === "category" && <Tag className="h-3.5 w-3.5 mr-2 text-blue-500" />}
                      {suggestion.type === "history" && <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />}
                      <span>
                        {highlightMatchedText(suggestion.term, searchTerm)}
                        {suggestion.type === "category" && " (Category)"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches - shown when search is empty */}
            {!searchTerm.trim() && searchHistory.length > 0 && (
              <div className="p-3 border-b">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</h3>
                <div className="space-y-1">
                  {searchHistory.map((term, index) => (
                    <button
                      key={`history-${index}`}
                      className="flex items-center w-full text-left p-2 hover:bg-muted rounded-md text-sm"
                      onClick={() => {
                        setSearchTerm(term)
                        if (onSearch) onSearch(term)
                        setShowResults(false)
                      }}
                    >
                      <History className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show top categories when search is empty */}
            {!searchTerm.trim() && showCategories && categories.length > 0 && (
              <div className="p-3 border-b">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 8).map((category, index) => (
                    <Badge
                      key={`category-${index}`}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      {category.name} ({category.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Results Section */}
            {searchTerm.trim() && (
              <div>
                {results.length > 0 ? (
                  <>
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <div className="px-3 pt-3">
                        <TabsList className="w-full">
                          <TabsTrigger value="all" className="flex-1">
                            All
                          </TabsTrigger>
                          {resultCategories.slice(0, 3).map((category, idx) => (
                            <TabsTrigger key={idx} value={category} className="flex-1">
                              {category}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>

                      <TabsContent value="all" className="max-h-[60vh] overflow-y-auto mt-0">
                        {results.map((product) => (
                          <ProductSearchResult
                            key={product.id}
                            product={product}
                            onSelect={() => setShowResults(false)}
                          />
                        ))}
                      </TabsContent>

                      {resultCategories.map((category, idx) => (
                        <TabsContent key={idx} value={category} className="max-h-[60vh] overflow-y-auto mt-0">
                          {productsByCategory[category].map((product) => (
                            <ProductSearchResult
                              key={product.id}
                              product={product}
                              onSelect={() => setShowResults(false)}
                            />
                          ))}
                        </TabsContent>
                      ))}
                    </Tabs>

                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        className="w-full text-primary justify-between text-sm font-medium"
                        onClick={() => {
                          if (onSearch) onSearch(searchTerm)
                          setShowResults(false)
                        }}
                      >
                        <span>View all results for "{searchTerm}"</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    {loading ? (
                      <div className="flex flex-col items-center py-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p>Searching...</p>
                      </div>
                    ) : (
                      <>
                        <p className="mb-2">No products found for "{searchTerm}"</p>
                        <p className="text-sm">Try using different keywords or check for typos</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper component for search results
function ProductSearchResult({ product, onSelect }: { product: Product; onSelect: () => void }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex items-center p-3 hover:bg-muted transition-colors"
      onClick={onSelect}
    >
      <div className="relative w-14 h-14 rounded-md overflow-hidden bg-muted/50 mr-3">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground line-clamp-1">{product.category || "Uncategorized"}</span>
          <span className="text-sm font-semibold text-primary">৳{product.price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  )
}

// Helper function to highlight matched text
function highlightMatchedText(text: string, query: string) {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-100 text-yellow-900">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}
