"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProductTable } from "@/components/product-table"
import { Plus, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const initialSearchTerm = searchParams.get("search") || ""
  const initialCategory = searchParams.get("category") || "all"
  const initialStatus = searchParams.get("status") || "all"

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [categoryFilter, setCategoryFilter] = useState(initialCategory)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, categoryFilter, statusFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      // Start building the query
      let query = supabase.from("products").select("*")

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      // Apply category filter if not "all"
      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category", categoryFilter)
      }

      // Apply status filter if not "all"
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("active", statusFilter === "active")
      }

      // Order by created_at
      query = query.order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) throw error

      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Button onClick={() => router.push("/admin/products/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Product Filters</CardTitle>
          <CardDescription>Filter and search your product inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Toys">Toys</SelectItem>
                  <SelectItem value="Clothes">Clothes</SelectItem>
                  <SelectItem value="Feeding">Feeding</SelectItem>
                  <SelectItem value="Bedding">Bedding</SelectItem>
                  <SelectItem value="Bath">Bath</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Nursery">Nursery</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("")
                  setCategoryFilter("all")
                  setStatusFilter("all")
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{products.length} products</span>
          </div>
        </div>

        <TabsContent value="grid" className="mt-0">
          <ProductGrid products={products} loading={loading} router={router} />
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <ProductTable searchTerm={searchTerm} categoryFilter={categoryFilter} statusFilter={statusFilter} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}

function ProductGrid({ products, loading, router }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => router.push(`/admin/products/edit/${product.id}`)}
        >
          <div className="relative aspect-square bg-muted/50">
            {product.images && product.images.length > 0 ? (
              <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium line-clamp-1">{product.name}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-muted-foreground">{product.category || "Uncategorized"}</span>
              <span className="text-sm font-semibold text-primary">৳{product.price.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card
        className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => router.push("/admin/products/new")}
      >
        <div className="aspect-square flex items-center justify-center bg-muted/50">
          <Plus className="h-12 w-12 text-muted-foreground" />
        </div>
        <CardContent className="p-4 text-center">
          <h3 className="font-medium">Add New Product</h3>
          <p className="text-sm text-muted-foreground mt-1">Click to add a new product</p>
        </CardContent>
      </Card>
    </div>
  )
}
