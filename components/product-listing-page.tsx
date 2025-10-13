"use client"

import { useState, useEffect, useCallback } from "react"
import { ProductFilters } from "@/components/product-filters"
import { SearchBar } from "@/components/search-bar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { X, Grid, List, Home, ChevronRight, Filter, RefreshCw, Package } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/contexts/language-context"
import { TranslatedText } from "@/components/translated-text"
import { EnhancedProductCard } from "@/components/enhanced-product-card"
import { ProductListItem } from "@/components/product-list-item"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuickViewDialog } from "@/components/quick-view-dialog"
import { CompareDrawer } from "@/components/compare-drawer"
import { RecentlyViewedProducts } from "@/components/recently-viewed-products"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  category: string
  description?: string
  stock?: number
}

interface ProductStats {
  totalProducts: number
  filteredProducts: number
  categories: { name: string; count: number }[]
  priceRange: [number, number]
}

export function ProductListingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [productStats, setProductStats] = useState<ProductStats>({
    totalProducts: 0,
    filteredProducts: 0,
    categories: [],
    priceRange: [0, 1000],
  })
  const [categories, setCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [compareProducts, setCompareProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [totalFilters, setTotalFilters] = useState<number>(0)
  const { language } = useLanguage()

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const page = Number.parseInt(searchParams.get("page") || "1")
  const perPage = viewMode === "grid" ? 12 : 8
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""
  const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : null
  const maxPrice = searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : null
  const sort = searchParams.get("sort") || "newest"
  const inStock = searchParams.get("inStock") === "true"

  useEffect(() => {
    let count = 0
    if (search) count++
    if (category) count++
    if (minPrice !== null || maxPrice !== null) count++
    if (inStock) count++
    setTotalFilters(count)
  }, [search, category, minPrice, maxPrice, inStock])

  useEffect(() => {
    fetchProducts()
    fetchProductStats()

    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist))
    }

    const savedViewMode = localStorage.getItem("productViewMode")
    if (savedViewMode === "list" || savedViewMode === "grid") {
      setViewMode(savedViewMode)
    }
  }, [page, search, category, minPrice, maxPrice, sort, inStock])

  const fetchProductStats = async () => {
    try {
      setStatsLoading(true)

      const { count: totalCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("active", true)

      let query = supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true)

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (category) {
        query = query.eq("category", category)
      }

      if (minPrice !== null) {
        query = query.gte("price", minPrice)
      }

      if (maxPrice !== null) {
        query = query.lte("price", maxPrice)
      }

      if (inStock) {
        query = query.gt("stock", 0)
      }

      const { count: filteredCount } = await query

      const { data: categoryData } = await supabase
        .from("products")
        .select("category")
        .eq("active", true)
        .not("category", "is", null)

      const categoryMap = new Map<string, number>()

      if (categoryData) {
        categoryData.forEach((item) => {
          if (item.category) {
            const count = categoryMap.get(item.category) || 0
            categoryMap.set(item.category, count + 1)
          }
        })
      }

      const categoryCounts = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      const { data: minPriceData } = await supabase
        .from("products")
        .select("price")
        .eq("active", true)
        .order("price", { ascending: true })
        .limit(1)

      const { data: maxPriceData } = await supabase
        .from("products")
        .select("price")
        .eq("active", true)
        .order("price", { ascending: false })
        .limit(1)

      const minPriceValue = minPriceData && minPriceData.length > 0 ? Math.floor(minPriceData[0].price) : 0
      const maxPriceValue = maxPriceData && maxPriceData.length > 0 ? Math.ceil(maxPriceData[0].price) : 1000

      setProductStats({
        totalProducts: totalCount || 0,
        filteredProducts: filteredCount || 0,
        categories: categoryCounts,
        priceRange: [minPriceValue, maxPriceValue],
      })

      setPriceRange([minPriceValue, maxPriceValue])
      setCategories(categoryCounts.map((c) => c.name))
    } catch (err) {
      console.error("Error fetching product statistics:", err)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const from = (page - 1) * perPage
      const to = from + perPage - 1

      let query = supabase
        .from("products")
        .select("id, name, slug, price, images, category, description, stock", { count: "exact" })
        .eq("active", true)

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (category) {
        query = query.eq("category", category)
      }

      if (minPrice !== null) {
        query = query.gte("price", minPrice)
      }

      if (maxPrice !== null) {
        query = query.lte("price", maxPrice)
      }

      if (inStock) {
        query = query.gt("stock", 0)
      }

      if (sort === "price-asc") {
        query = query.order("price", { ascending: true })
      } else if (sort === "price-desc") {
        query = query.order("price", { ascending: false })
      } else if (sort === "name-asc") {
        query = query.order("name", { ascending: true })
      } else if (sort === "name-desc") {
        query = query.order("name", { ascending: false })
      } else {
        query = query.order("created_at", { ascending: false })
      }

      query = query.range(from, to)

      const { data, count, error } = await query

      if (error) throw error

      setProducts(data || [])

      if (count !== null) {
        setProductStats((prev) => ({
          ...prev,
          filteredProducts: count,
        }))
      }

      if (data && data.length > 0) {
        addToRecentlyViewed(data)
      }
    } catch (err) {
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString())

      if (Object.keys(params).some((k) => k !== "page")) {
        newParams.set("page", "1")
      }

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      })

      router.push(`${pathname}?${newParams.toString()}`)
    },
    [searchParams, router, pathname],
  )

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage.toString() })
  }

  const handleSearch = (term: string) => {
    updateFilters({ search: term || null })
  }

  const handleCategoryChange = (selectedCategory: string) => {
    updateFilters({ category: selectedCategory || null })
  }

  const handlePriceChange = (min: number, max: number) => {
    updateFilters({
      minPrice: min.toString(),
      maxPrice: max.toString(),
    })
  }

  const handleSortChange = (sortOption: string) => {
    updateFilters({ sort: sortOption })
  }

  const handleInStockChange = (inStock: boolean) => {
    updateFilters({ inStock: inStock ? "true" : null })
  }

  const clearAllFilters = () => {
    router.push(pathname)
  }

  const toggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode)
    localStorage.setItem("productViewMode", mode)
  }

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product)
  }

  const toggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const isAlreadyAdded = prev.some((p) => p.id === product.id)

      if (isAlreadyAdded) {
        return prev.filter((p) => p.id !== product.id)
      } else {
        const newList = [...prev, product].slice(0, 4)
        return newList
      }
    })
  }

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const isAlreadyAdded = prev.includes(productId)

      let newWishlist
      if (isAlreadyAdded) {
        newWishlist = prev.filter((id) => id !== productId)
      } else {
        newWishlist = [...prev, productId]
      }

      localStorage.setItem("wishlist", JSON.stringify(newWishlist))
      return newWishlist
    })
  }

  const addToRecentlyViewed = (products: Product[]) => {
    const recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]")

    const updatedRecent = [...recentlyViewed]

    products.forEach((product) => {
      if (product && product.id) {
        const existingIndex = updatedRecent.findIndex((p: any) => p.id === product.id)

        if (existingIndex !== -1) {
          updatedRecent.splice(existingIndex, 1)
        }

        updatedRecent.unshift(product)
      }
    })

    const limitedRecent = updatedRecent.slice(0, 10)

    localStorage.setItem("recentlyViewed", JSON.stringify(limitedRecent))
  }

  const totalPages = Math.ceil(productStats.filteredProducts / perPage)

  const isInWishlist = (productId: string) => wishlist.includes(productId)
  const isInCompare = (productId: string) => compareProducts.some((p) => p.id === productId)

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/" className="flex items-center hover:text-foreground transition-colors">
          <Home className="h-3.5 w-3.5 mr-1" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 mx-2" />
        <span className="text-foreground font-medium">Products</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-3xl font-bold ${language === "bn" ? "bangla-text" : ""}`}>
            <TranslatedText textKey="products.allProducts" fallback="All Products" />

            {!statsLoading && (
              <span className="ml-2 text-lg font-normal text-muted-foreground">({productStats.totalProducts})</span>
            )}
          </h1>

          {!loading && (
            <div className="flex items-center mt-1">
              <p className="text-muted-foreground">
                {productStats.filteredProducts === 0
                  ? "No products found"
                  : productStats.filteredProducts === 1
                    ? "1 product found"
                    : `${productStats.filteredProducts} products found`}
              </p>

              {totalFilters > 0 && (
                <Badge variant="outline" className="ml-2">
                  {totalFilters} {totalFilters === 1 ? "filter" : "filters"} applied
                </Badge>
              )}

              {totalFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 px-2 ml-1">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => toggleViewMode("grid")}
              className="h-9 w-9"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => toggleViewMode("list")}
              className="h-9 w-9"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[440px] overflow-y-auto">
              <ProductFilters
                categories={categories}
                selectedCategory={category}
                priceRange={priceRange}
                selectedMinPrice={minPrice ?? priceRange[0]}
                selectedMaxPrice={maxPrice ?? priceRange[1]}
                selectedSort={sort}
                inStockOnly={inStock}
                onCategoryChange={handleCategoryChange}
                onPriceChange={handlePriceChange}
                onSortChange={handleSortChange}
                onInStockChange={handleInStockChange}
                onClose={() => setShowMobileFilters(false)}
              />
            </SheetContent>
          </Sheet>

          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px] h-9 md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>

          {compareProducts.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="relative h-9 w-9 bg-transparent">
                    <Package className="h-4 w-4" />
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {compareProducts.length}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compare Products</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          initialValue={search}
          onCategorySelect={handleCategoryChange}
          placeholder="Search for products by name, description or category..."
        />
      </div>

      {(search || category || minPrice !== null || maxPrice !== null || inStock) && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-muted-foreground py-1">Active filters:</span>

          {search && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              Search: {search}
              <button onClick={() => updateFilters({ search: null })} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {category && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              Category: {category}
              <button onClick={() => updateFilters({ category: null })} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(minPrice !== null || maxPrice !== null) && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              Price: ৳{minPrice ?? priceRange[0]} - ৳{maxPrice ?? priceRange[1]}
              <button onClick={() => updateFilters({ minPrice: null, maxPrice: null })} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {inStock && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              In Stock Only
              <button onClick={() => updateFilters({ inStock: null })} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button variant="ghost" size="sm" className="h-8" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-4 gap-6">
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilters
            categories={categories}
            selectedCategory={category}
            priceRange={priceRange}
            selectedMinPrice={minPrice ?? priceRange[0]}
            selectedMaxPrice={maxPrice ?? priceRange[1]}
            selectedSort={sort}
            inStockOnly={inStock}
            onCategoryChange={handleCategoryChange}
            onPriceChange={handlePriceChange}
            onSortChange={handleSortChange}
            onInStockChange={handleInStockChange}
          />
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(perPage)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="rounded-lg border">
                      <div className="aspect-square bg-muted/30 animate-pulse rounded-t-lg" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Array(perPage)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex rounded-lg border animate-pulse">
                      <div className="w-40 h-40 bg-muted/30 rounded-l-lg" />
                      <div className="p-4 flex-1 space-y-3">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-10 w-40" />
                      </div>
                    </div>
                  ))}
              </div>
            )
          ) : products.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <EnhancedProductCard
                      key={product.id}
                      product={product}
                      onQuickView={() => openQuickView(product)}
                      onToggleWishlist={() => toggleWishlist(product.id)}
                      onToggleCompare={() => toggleCompare(product)}
                      isInWishlist={isInWishlist(product.id)}
                      isInCompare={isInCompare(product.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <ProductListItem
                      key={product.id}
                      product={product}
                      onQuickView={() => openQuickView(product)}
                      onToggleWishlist={() => toggleWishlist(product.id)}
                      onToggleCompare={() => toggleCompare(product)}
                      isInWishlist={isInWishlist(product.id)}
                      isInCompare={isInCompare(product.id)}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (page > 1) handlePageChange(page - 1)
                          }}
                          isActive={page > 1}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          return (
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - page) <= 1 ||
                            (p === 2 && page === 1) ||
                            (p === totalPages - 1 && page === totalPages)
                          )
                        })
                        .map((p, i, arr) => {
                          const showEllipsisBefore = i > 0 && arr[i - 1] !== p - 1
                          const showEllipsisAfter = i < arr.length - 1 && arr[i + 1] !== p + 1

                          return (
                            <div key={p} className="flex items-center">
                              {showEllipsisBefore && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}

                              <PaginationItem>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handlePageChange(p)
                                  }}
                                  isActive={p === page}
                                >
                                  {p}
                                </PaginationLink>
                              </PaginationItem>

                              {showEllipsisAfter && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}
                            </div>
                          )
                        })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (page < totalPages) handlePageChange(page + 1)
                          }}
                          isActive={page < totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filter criteria</p>
              <Button onClick={clearAllFilters}>Clear all filters</Button>
            </div>
          )}
        </div>
      </div>

      <RecentlyViewedProducts />

      {quickViewProduct && (
        <QuickViewDialog
          product={quickViewProduct}
          open={!!quickViewProduct}
          onOpenChange={() => setQuickViewProduct(null)}
          onToggleWishlist={() => toggleWishlist(quickViewProduct.id)}
          isInWishlist={isInWishlist(quickViewProduct.id)}
        />
      )}

      {compareProducts.length > 0 && (
        <CompareDrawer
          products={compareProducts}
          onRemove={(productId) => {
            setCompareProducts((prev) => prev.filter((p) => p.id !== productId))
          }}
          onClearAll={() => setCompareProducts([])}
        />
      )}
    </div>
  )
}
