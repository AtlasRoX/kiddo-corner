"use client"

import { AdminLayout } from "@/components/admin-layout"
import { ReviewTable } from "@/components/review-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Loader2, Link2, Upload } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  rating: z.string().min(1, {
    message: "Please select a rating.",
  }),
  productId: z.string().min(1, {
    message: "Please select a product.",
  }),
  mediaType: z.string().min(1, {
    message: "Please select media type.",
  }),
})

interface Product {
  id: string
  name: string
}

export default function ReviewsPage() {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [mediaUrl, setMediaUrl] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [uploadMethod, setUploadMethod] = useState<"file" | "link">("file")
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rating: "",
      productId: "",
      mediaType: "image",
    },
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("id, name").order("name")

      if (error) throw error

      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    }
  }

  const uploadFile = async (file: File, path: string) => {
    const fileName = `${path}/${Date.now()}-${file.name}`
    const storageRef = ref(storage, fileName)

    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate that we have either a file or URL for media
    if (uploadMethod === "file" && !mediaFile) {
      toast({
        title: "Error",
        description: "Please upload media (image or video).",
        variant: "destructive",
      })
      return
    }

    if (uploadMethod === "link" && !mediaUrl) {
      toast({
        title: "Error",
        description: "Please provide a media URL.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      let finalMediaUrl = ""
      let finalAvatarUrl = ""

      // Handle media upload or URL
      if (uploadMethod === "file" && mediaFile) {
        finalMediaUrl = await uploadFile(mediaFile, "reviews")
      } else {
        finalMediaUrl = mediaUrl
      }

      // Handle avatar upload or URL
      if (avatarFile) {
        finalAvatarUrl = await uploadFile(avatarFile, "avatars")
      } else if (avatarUrl) {
        finalAvatarUrl = avatarUrl
      }

      // Create review in Supabase
      const { error } = await supabase.from("reviews").insert([
        {
          name: values.name,
          rating: Number.parseInt(values.rating),
          product_id: values.productId,
          media_type: values.mediaType,
          media_url: finalMediaUrl,
          avatar: finalAvatarUrl || null,
          featured: false,
        },
      ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Review added successfully.",
      })

      // Reset form and close dialog
      form.reset()
      setMediaFile(null)
      setAvatarFile(null)
      setMediaUrl("")
      setAvatarUrl("")
      setOpen(false)

      // Refresh the review table
      window.location.reload()
    } catch (error) {
      console.error("Error adding review:", error)
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Review</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Review</DialogTitle>
              <DialogDescription>Create a new customer review for a product.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="1">1 Star</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mediaType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select media type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Media</FormLabel>
                  <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "file" | "link")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="file" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload File
                      </TabsTrigger>
                      <TabsTrigger value="link" className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Add URL
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="file" className="pt-2">
                      <Input
                        type="file"
                        accept={form.watch("mediaType") === "image" ? "image/*" : "video/*"}
                        onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                    </TabsContent>

                    <TabsContent value="link" className="pt-2">
                      <Input
                        placeholder="Enter media URL"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <FormLabel>Customer Avatar (Optional)</FormLabel>
                  <Tabs defaultValue="file">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="file" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload File
                      </TabsTrigger>
                      <TabsTrigger value="link" className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Add URL
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="file" className="pt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                    </TabsContent>

                    <TabsContent value="link" className="pt-2">
                      <Input
                        placeholder="Enter avatar URL"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Adding..." : "Add Review"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>Manage customer reviews for your products.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewTable />
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
