"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

// Mock data - would be replaced with Firebase data
const mockReviews = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    mediaType: "image",
    mediaUrl: "/placeholder.svg?height=200&width=300",
    featured: true,
  },
  {
    id: "2",
    name: "Michael Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    mediaType: "image",
    mediaUrl: "/placeholder.svg?height=200&width=300",
    featured: true,
  },
]

export function FeaturedReviews() {
  const [reviews, setReviews] = useState<typeof mockReviews>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading from Firebase
    const timer = setTimeout(() => {
      setReviews(mockReviews)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-[200px] w-full" />
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {reviews.map((review) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-2 border-primary/10">
            <CardContent className="p-0">
              <div className="relative h-[200px] w-full bg-muted/30">
                <Image
                  src={review.mediaUrl || "/placeholder.svg"}
                  alt={`Review by ${review.name}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-10 h-10 overflow-hidden rounded-full">
                    <Image src={review.avatar || "/placeholder.svg"} alt={review.name} fill className="object-cover" />
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
  )
}
