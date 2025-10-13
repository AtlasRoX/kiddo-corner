"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { getTestimonials, type Testimonial } from "@/lib/testimonials-service"

interface TestimonialsSectionProps {
  featuredOnly?: boolean
  maxItems?: number
  showTitle?: boolean
}

export function TestimonialsSection({ featuredOnly = true, maxItems = 3, showTitle = true }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true)
      const data = await getTestimonials(featuredOnly)
      setTestimonials(data.slice(0, maxItems))
      setLoading(false)
    }

    fetchTestimonials()
  }, [featuredOnly, maxItems])

  if (loading) {
    return (
      <div className="space-y-6">
        {showTitle && <Skeleton className="h-8 w-64 mx-auto mb-6" />}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(maxItems)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <h2 className="text-2xl font-bold tracking-tight text-center mb-6 bangla-text">
          পিতামাতারা কি বলেন <span className="font-sans">(What Parents Say)</span>
        </h2>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-2 border-primary/10 h-full">
              <CardContent className="p-6 space-y-4 flex flex-col h-full">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 overflow-hidden rounded-full bg-primary/10">
                    {testimonial.avatar ? (
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-lg font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium bangla-text">{testimonial.name}</h3>
                    {testimonial.role && <p className="text-sm text-muted-foreground">{testimonial.role}</p>}
                  </div>
                </div>

                <div className="flex-1 relative">
                  <Quote className="absolute -left-1 -top-1 w-6 h-6 text-primary/20 rotate-180" />
                  <p className="text-muted-foreground pt-4 px-2 bangla-text">{testimonial.content}</p>
                </div>

                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
