"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, ChevronLeft, ImageIcon, Video } from "lucide-react"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"

// Mock data - would be replaced with Firebase data
const mockReviews = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    mediaType: "image",
    mediaUrl: "/placeholder.svg?height=300&width=400",
    featured: true,
  },
  {
    id: "2",
    name: "Michael Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    mediaType: "image",
    mediaUrl: "/placeholder.svg?height=300&width=400",
    featured: true,
  },
  {
    id: "3",
    name: "Emily Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    mediaType: "video",
    mediaUrl: "/placeholder.svg?height=300&width=400",
    featured: false,
  },
  {
    id: "4",
    name: "David Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 3,
    mediaType: "image",
    mediaUrl: "/placeholder.svg?height=300&width=400",
    featured: false,
  },
  {
    id: "5",
    name: "Jessica Martinez",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    mediaType: "video",
    mediaUrl: "/placeholder.svg?height=300&width=400",
    featured: false,
  },
  {
    id: "6",
    name: "Robert Taylor",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    mediaType: "image",
    mediaUrl: "/placeholder.svg?height=300&width=400",
    featured: false,
  },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<typeof mockReviews>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")

  useEffect(() => {
    // Simulate loading from Firebase
    const timer = setTimeout(() => {
      setReviews(mockReviews)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredReviews = reviews.filter((review) => {
    if (filter !== "all" && review.mediaType !== filter) return false
    if (ratingFilter !== "all" && review.rating !== Number.parseInt(ratingFilter)) return false
    return true
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center mb-6 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Customer Reviews</h1>
          <p className="mt-2 text-muted-foreground">See what other parents are saying about our products</p>
        </div>

        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-1">
                All
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                Photos
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                Videos
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <span className="text-sm">Rating:</span>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="h-[200px] w-full bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-muted" />
                        <div className="h-4 w-24 bg-muted rounded" />
                      </div>
                      <div className="h-4 w-20 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-colors">
                  <CardContent className="p-0">
                    <div className="relative h-[200px] w-full bg-muted/30">
                      {review.mediaType === "video" ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button variant="outline" size="icon" className="rounded-full bg-background/80">
                            <Video className="w-6 h-6" />
                          </Button>
                          <Image
                            src={review.mediaUrl || "/placeholder.svg"}
                            alt={`Review by ${review.name}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <Image
                          src={review.mediaUrl || "/placeholder.svg"}
                          alt={`Review by ${review.name}`}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative w-10 h-10 overflow-hidden rounded-full">
                          <Image
                            src={review.avatar || "/placeholder.svg"}
                            alt={review.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium">{review.name}</span>
                      </div>
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Footer />
      </div>
    </main>
  )
}
