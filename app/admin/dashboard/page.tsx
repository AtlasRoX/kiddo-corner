"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ShoppingBag, Star, Users } from "lucide-react"
import { ProductTable } from "@/components/product-table"
import { ReviewTable } from "@/components/review-table"
import { supabase } from "@/lib/supabase"

interface Review {
  id: number;
  featured: boolean;
}

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalReviews: 0,
    featuredReviews: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get product stats
      const { data: products, error: productsError } = await supabase.from("products").select("id, active")

      if (productsError) throw productsError

      // Get review stats
      const { data: reviews, error: reviewsError } = await supabase.from("reviews").select("id, featured")

      if (reviewsError) throw reviewsError
        featuredReviews: reviews?.filter((r: Review) => r.featured).length || 0,
      setStats({
        totalProducts: products?.length || 0,
        activeProducts: products?.filter((p) => p.active).length || 0,
        totalReviews: reviews?.length || 0,
        featuredReviews: reviews?.filter((r) => r.featured).length || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) {
    return null // Prevents hydration errors
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <a href="/admin/products/new">Add New Product</a>
        </Button>
      </div>

      <div className="grid gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "..." : `${stats.activeProducts} active products`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "..." : `${stats.featuredReviews} featured reviews`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="p-0 mt-4">
          <ProductTable />
        </TabsContent>
        <TabsContent value="reviews" className="p-0 mt-4">
          <ReviewTable />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
