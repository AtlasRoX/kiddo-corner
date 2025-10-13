"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
  stock: number
  active: boolean
}

interface ProductTableProps {
  searchTerm?: string
  categoryFilter?: string
  statusFilter?: string
}

export function ProductTable({ searchTerm = "", categoryFilter = "all", statusFilter = "all" }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

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
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("products").update({ active: !currentStatus }).eq("id", id)

      if (error) throw error

      // Update local state
      setProducts(products.map((product) => (product.id === id ? { ...product, active: !currentStatus } : product)))

      toast({
        title: "Success",
        description: `Product ${!currentStatus ? "activated" : "deactivated"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating product status:", error)
      toast({
        title: "Error",
        description: "Failed to update product status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const copyProductLink = (slug: string) => {
    const url = `${window.location.origin}/products/${slug}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Link Copied",
      description: "Product link copied to clipboard.",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No products found. Add your first product to get started.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative w-10 h-10 overflow-hidden rounded-md bg-muted">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">
                        No img
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category || "Uncategorized"}</TableCell>
                <TableCell className="text-right">৳{product.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell>
                  <Badge
                    variant={product.active ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleProductStatus(product.id, product.active)}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyProductLink(product.slug)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/edit/${product.id}`}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => toggleProductStatus(product.id, product.active)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {product.active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
