"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Star, Trash2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Review {
  id: string
  name: string
  avatar: string
  rating: number
  media_type: string
  media_url: string
  featured: boolean
  created_at: string
  product_id: string
  product_name?: string
  product_price?: number
}

export function ReviewTable() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      // First get all reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })

      if (reviewsError) throw reviewsError

      // Then get product names for each review
      const reviewsWithProducts = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: productData } = await supabase
            .from("products")
            .select("name, price")
            .eq("id", review.product_id)
            .single()

          return {
            ...review,
            product_name: productData?.name || "Unknown Product",
            product_price: productData?.price || 0,
          }
        }),
      )

      setReviews(reviewsWithProducts)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleReviewFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("reviews").update({ featured: !currentStatus }).eq("id", id)

      if (error) throw error

      // Update local state
      setReviews(reviews.map((review) => (review.id === id ? { ...review, featured: !currentStatus } : review)))

      toast({
        title: "Success",
        description: `Review ${!currentStatus ? "featured" : "unfeatured"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating review status:", error)
      toast({
        title: "Error",
        description: "Failed to update review status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id)

      if (error) throw error

      // Update local state
      setReviews(reviews.filter((review) => review.id !== id))

      toast({
        title: "Success",
        description: "Review deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      })
    }
  }

  const viewReview = (review: Review) => {
    setSelectedReview(review)
    setViewDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Media</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No reviews found yet.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="relative w-10 h-10 overflow-hidden rounded-md bg-muted">
                      {review.media_url ? (
                        <Image
                          src={review.media_url || "/placeholder.svg"}
                          alt={`Review by ${review.name}`}
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 overflow-hidden rounded-full bg-muted">
                        {review.avatar ? (
                          <Image
                            src={review.avatar || "/placeholder.svg"}
                            alt={review.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">
                            {review.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{review.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{review.product_name}</TableCell>
                  <TableCell>৳{review.product_price?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    <div className="flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{review.media_type === "image" ? "Photo" : "Video"}</Badge>
                  </TableCell>
                  <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={review.featured ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleReviewFeatured(review.id, review.featured)}
                    >
                      {review.featured ? "Featured" : "Regular"}
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
                        <DropdownMenuItem onClick={() => viewReview(review)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleReviewFeatured(review.id, review.featured)}>
                          {review.featured ? (
                            <>
                              <Star className="w-4 h-4 mr-2" />
                              Unfeature
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 mr-2 fill-amber-400 text-amber-400" />
                              Feature
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteReview(review.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                {selectedReview.media_url && (
                  <Image
                    src={selectedReview.media_url || "/placeholder.svg"}
                    alt={`Review by ${selectedReview.name}`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 overflow-hidden rounded-full bg-muted">
                  {selectedReview.avatar ? (
                    <Image
                      src={selectedReview.avatar || "/placeholder.svg"}
                      alt={selectedReview.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-sm font-medium">
                      {selectedReview.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedReview.name}</p>
                  <div className="flex">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < selectedReview.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Product: {selectedReview.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  Price: ৳{selectedReview.product_price?.toFixed(2) || "0.00"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(selectedReview.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
