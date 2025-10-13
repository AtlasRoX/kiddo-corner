"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Loader2, X, Link2, Upload } from "lucide-react"
import Image from "next/image"
import { MarkdownEditor } from "@/components/markdown-editor"

const categories = ["Toys", "Clothes", "Feeding", "Bedding", "Bath", "Safety", "Travel", "Nursery", "Other"]

export default function NewProductPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState("")
  const [active, setActive] = useState(true)
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageLinks, setImageLinks] = useState<string[]>([])
  const [currentImageLink, setCurrentImageLink] = useState("")
  const [imageUploading, setImageUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"file" | "link">("file")
  // New state for reviews customization
  const [defaultRating, setDefaultRating] = useState("5")
  const [reviewCount, setReviewCount] = useState("0")

  const router = useRouter()
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setImages((prev) => [...prev, ...selectedFiles])

      // Create preview URLs
      const newImageUrls = selectedFiles.map((file) => URL.createObjectURL(file))
      setImageUrls((prev) => [...prev, ...newImageUrls])
    }
  }

  const addImageLink = () => {
    if (!currentImageLink) return

    // Basic URL validation
    try {
      new URL(currentImageLink)
      setImageLinks((prev) => [...prev, currentImageLink])
      setCurrentImageLink("")
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index])
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const removeImageLink = (index: number) => {
    setImageLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    if (images.length === 0) return []

    setImageUploading(true)
    const uploadedUrls = []

    try {
      for (const image of images) {
        const fileName = `products/${Date.now()}-${image.name}`
        const storageRef = ref(storage, fileName)

        await uploadBytes(storageRef, image)
        const url = await getDownloadURL(storageRef)
        uploadedUrls.push(url)
      }

      return uploadedUrls
    } catch (error) {
      console.error("Error uploading images:", error)
      throw error
    } finally {
      setImageUploading(false)
    }
  }

  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !price || !stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages()

      // Combine uploaded images with image links
      const allImageUrls = [...uploadedImageUrls, ...imageLinks]

      // Create product in Supabase
      const productData = {
        name,
        slug: createSlug(name),
        description,
        price: Number.parseFloat(price),
        category,
        stock: Number.parseInt(stock),
        active,
        images: allImageUrls,
      }

      // Only add these fields if they exist in the schema
      try {
        productData.default_rating = Number.parseInt(defaultRating)
        productData.review_count = Number.parseInt(reviewCount)
      } catch (e) {
        console.warn("Rating columns might not exist in schema, continuing without them")
      }

      const { data, error } = await supabase.from("products").insert([productData]).select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Product created successfully.",
      })

      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              <p className="text-xs text-muted-foreground">
                You can use both English and <span className="font-bengali">বাংলা</span> for product names.
              </p>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <MarkdownEditor
                value={description}
                onChange={setDescription}
                placeholder="Write your product description here. You can use Markdown formatting."
              />
              <p className="text-xs text-muted-foreground">
                Use the toolbar to format your description. You can use both English and{" "}
                <span className="font-bengali">বাংলা</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="grid gap-3">
                <Label htmlFor="price">Price (৳) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="active" checked={active} onCheckedChange={setActive} />
              <Label htmlFor="active">Active (visible to customers)</Label>
            </div>

            <div className="grid gap-6 pt-4 border-t">
              <h3 className="text-lg font-medium">Reviews Customization</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="defaultRating">Default Rating</Label>
                  <Select value={defaultRating} onValueChange={setDefaultRating}>
                    <SelectTrigger id="defaultRating">
                      <SelectValue placeholder="Select default rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This rating will be shown until real reviews are added.
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="reviewCount">Initial Review Count</Label>
                  <Input
                    id="reviewCount"
                    type="number"
                    min="0"
                    max="999"
                    value={reviewCount}
                    onChange={(e) => setReviewCount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of reviews to display before real reviews are added.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <Label>Product Images</Label>

              <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "file" | "link")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Add Image URLs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="pt-4">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 md:grid-cols-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-background/80 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="link" className="pt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter image URL"
                      value={currentImageLink}
                      onChange={(e) => setCurrentImageLink(e.target.value)}
                    />
                    <Button type="button" onClick={addImageLink} className="shrink-0">
                      Add
                    </Button>
                  </div>

                  {imageLinks.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 md:grid-cols-4">
                      {imageLinks.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={`Product image link ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImageLink(index)}
                            className="absolute top-1 right-1 bg-background/80 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting || imageUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || imageUploading}>
              {(submitting || imageUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "Creating..." : "Create Product"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AdminLayout>
  )
}
