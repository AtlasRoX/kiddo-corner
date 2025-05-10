"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Trash, Upload, AlertTriangle, Youtube } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import Image from "next/image"
import { MarkdownEditor } from "@/components/markdown-editor"
import { AttributesPreview } from "@/components/product/attributes-preview"
import { DescriptionGenerator } from "@/components/product/description-generator"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState("")
  const [active, setActive] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [error, setError] = useState<string | null>(null)
  const [availableColumns, setAvailableColumns] = useState<string[]>([])

  useEffect(() => {
    if (!params.id) {
      setError("Product ID is missing")
      setLoading(false)
      return
    }

    fetchProduct()
    fetchTableColumns()
  }, [params.id])



  const fetchTableColumns = async () => {
    try {
      // Get the table information to check available columns
      const { data, error } = await supabase.rpc("get_table_columns", { p_table_name: "products" })

      if (error) {
        console.error("Error fetching table columns:", error)
        return
      }

      if (data) {
        const columnNames = data.map((col: any) => col.column_name)
        console.log("Available columns:", columnNames)
        setAvailableColumns(columnNames)
      }
    } catch (error) {
      console.error("Error checking table schema:", error)
    }
  }

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching product with ID:", params.id)
      const { data, error } = await supabase.from("products").select("*").eq("id", params.id).single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      if (!data) {
        throw new Error("Product not found")
      }

      console.log("Product data:", data)
      setProduct(data)
      setName(data.name || "")
      setSlug(data.slug || "")
      setPrice(data.price?.toString() || "")
      setDescription(data.description || "")
      setCategory(data.category || "")
      setStock(data.stock?.toString() || "")
      setActive(data.active !== false) // Default to true if undefined
      setImages(data.images || [])

      // Only set videoUrl if it exists in the data
      if ("video_url" in data) {
        setVideoUrl(data.video_url || "")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setError(error instanceof Error ? error.message : "Failed to load product")
      toast({
        title: "Error",
        description: "Failed to load product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setNewImages((prev) => [...prev, ...filesArray])

      // Create previews
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setImages((prev) => prev.filter((_, i) => i !== index))
    } else {
      // For new images, we need to revoke the object URL and update state
      const previewUrl = imagePreviews[index]
      URL.revokeObjectURL(previewUrl)

      setNewImages((prev) => prev.filter((_, i) => i !== index))
      setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const validateForm = () => {
    if (!name) return "Product name is required"
    if (!slug) return "Slug is required"
    if (!price || isNaN(Number(price))) return "Valid price is required"
    if (!stock || isNaN(Number(stock))) return "Valid stock quantity is required"
    return null
  }

  const handleSave = async () => {
    try {
      const validationError = validateForm()
      if (validationError) {
        toast({
          title: "Validation Error",
          description: validationError,
          variant: "destructive",
        })
        return
      }

      setSaving(true)
      setError(null)

      // Upload new images
      const allImages = [...images]
      if (newImages.length > 0) {
        for (const file of newImages) {
          try {
            const fileName = `products/${Date.now()}-${file.name}`
            const storageRef = ref(storage, fileName)
            await uploadBytes(storageRef, file)
            const imageUrl = await getDownloadURL(storageRef)
            allImages.push(imageUrl)
          } catch (imageError) {
            console.error("Error uploading image:", imageError)
            // Continue with other images
          }
        }
      }

      // Prepare product data
      const productData: Record<string, any> = {
        name,
        slug,
        price: Number.parseFloat(price),
        description,
        category,
        stock: Number.parseInt(stock, 10) || 0,
        active,
        images: allImages,
        updated_at: new Date().toISOString(),
      }

      // Only include video_url if the column exists
      if (availableColumns.includes("video_url")) {
        productData.video_url = videoUrl
      }

      console.log("Updating product with data:", productData)

      // Update product in database
      const { error } = await supabase.from("products").update(productData).eq("id", params.id)

      if (error) {
        console.error("Supabase update error:", error)
        throw error
      }

      toast({
        title: "Success",
        description: "Product updated successfully.",
      })

      // Clear new images
      setNewImages([])
      setImagePreviews([])

      // Refresh product data
      fetchProduct()
    } catch (error) {
      console.error("Error updating product:", error)
      setError(error instanceof Error ? error.message : "Failed to update product")
      toast({
        title: "Error",
        description: `Failed to update product: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Delete product from database
      const { error } = await supabase.from("products").delete().eq("id", params.id)

      if (error) {
        console.error("Supabase delete error:", error)
        throw error
      }

      toast({
        title: "Success",
        description: "Product deleted successfully.",
      })

      // Redirect to products page
      router.push("/admin/products")
    } catch (error) {
      console.error("Error deleting product:", error)
      setError(error instanceof Error ? error.message : "Failed to delete product")
      toast({
        title: "Error",
        description: `Failed to delete product: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      setSaving(false)
    }
  }

  const handleDescriptionUpdate = (newDescription: string) => {
    setDescription(newDescription)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/products")}>
            Return to Products
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
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="images">Images & Media</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Edit the basic details of your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug <span className="text-xs text-muted-foreground">(URL-friendly name)</span>
                    </Label>
                    <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (৳)</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="active" checked={active} onCheckedChange={setActive} />
                  <Label htmlFor="active">Active (visible on store)</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/admin/products")}>
                  Cancel
                </Button>
                <div className="flex space-x-2">
                  <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Images & Media</CardTitle>
                <CardDescription>Manage product images and media content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Product Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square relative rounded-md overflow-hidden border">
                          <Image
                            src={image || "/placeholder.svg?height=200&width=200"}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index, true)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div className="aspect-square relative rounded-md overflow-hidden border">
                          <Image
                            src={preview || "/placeholder.svg?height=200&width=200"}
                            alt={`New product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded">New</span>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index, false)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <label className="aspect-square flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Add Image</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    The first image will be used as the product thumbnail.
                  </p>
                </div>

                {availableColumns.includes("video_url") && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">YouTube Video</h3>
                    <div className="space-y-2">
                      <Label htmlFor="video-url">YouTube Video URL</Label>
                      <div className="flex items-center space-x-2">
                        <Youtube className="h-5 w-5 text-red-500" />
                        <Input
                          id="video-url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enter a YouTube video URL to display on the product page.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} disabled={saving} className="ml-auto">
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="description">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                  <CardDescription>Write a detailed description of your product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MarkdownEditor value={description} onChange={setDescription} />
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={saving} className="ml-auto">
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

                <div className="space-y-6">
                <DescriptionGenerator
                  productName={name}
                  productCategory={category}
                  onDescriptionGenerated={handleDescriptionUpdate}
                />
                </div>
            </div>
          </TabsContent>

          <TabsContent value="attributes">
            <div className="grid gap-6 grid-cols-1">
              <AttributesPreview productId={params.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
