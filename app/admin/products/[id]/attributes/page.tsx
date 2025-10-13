"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ChevronLeft, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ProductAttributesForm } from "@/components/product/product-attributes-form"
import { checkSupabaseConnection } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: string
  name: string
  price: number
}

export default function ProductAttributesPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; error?: any } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkSupabaseConnection()
      console.log("Supabase connection status:", status)
      setConnectionStatus(status)

      if (!status.success) {
        setError("Database connection error. Please check your network connection and try again.")
      }
    }

    checkConnection()
  }, [])

  useEffect(() => {
    if (!params.id) {
      setError("Product ID is missing")
      setLoading(false)
      return
    }

    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      console.log("Fetching product with ID:", params.id)
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("products").select("id, name, price").eq("id", params.id).single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      if (!data) {
        throw new Error("Product not found")
      }

      console.log("Product data:", data)
      setProduct(data)
    } catch (err) {
      console.error("Error fetching product:", err)
      setError(err instanceof Error ? err.message : "Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  const handleSaved = () => {
    toast({
      title: "Success",
      description: "Product attributes saved successfully. Returning to product edit page.",
    })

    // Navigate back to the product edit page
    setTimeout(() => {
      router.push(`/admin/products/edit/${params.id}`)
    }, 1500)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
          <p>Loading product data...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error || !connectionStatus?.success) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Database connection error. Please check your network connection and try again."}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              if (connectionStatus?.success === false) {
                window.location.reload()
              } else {
                router.push("/admin/products")
              }
            }}
          >
            {connectionStatus?.success === false ? "Refresh Page" : "Return to Products"}
          </Button>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/admin/products")}>Return to Products</Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.push(`/admin/products/edit/${params.id}`)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Product
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Product Attributes</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Customize Product Attributes</CardTitle>
          <CardDescription>
            Define colors, sizes, and variations for this product. Each variation can have its own price, stock, and
            images.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductAttributesForm productId={product.id} productPrice={product.price} onSaved={handleSaved} />
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
