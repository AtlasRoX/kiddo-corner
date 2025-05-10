"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Star, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialFeatured,
  type Testimonial,
} from "@/lib/testimonials-service"

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState<Partial<Testimonial>>({
    name: "",
    role: "",
    content: "",
    rating: 5,
    featured: false,
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "featured">("all")

  const { toast } = useToast()

  useEffect(() => {
    fetchTestimonials()
  }, [activeTab])

  const fetchTestimonials = async () => {
    setLoading(true)
    const data = await getTestimonials(activeTab === "featured")
    setTestimonials(data)
    setLoading(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setCurrentTestimonial({
      name: "",
      role: "",
      content: "",
      rating: 5,
      featured: false,
    })
    setAvatarFile(null)
    setAvatarPreview("")
    setIsEditing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (!currentTestimonial.name || !currentTestimonial.content) {
        toast({
          title: "Error",
          description: "Name and content are required.",
          variant: "destructive",
        })
        return
      }

      if (isEditing && currentTestimonial.id) {
        await updateTestimonial(
          currentTestimonial.id,
          {
            name: currentTestimonial.name,
            role: currentTestimonial.role,
            content: currentTestimonial.content,
            rating: currentTestimonial.rating || 5,
            featured: currentTestimonial.featured || false,
          },
          avatarFile || undefined,
        )

        toast({
          title: "Success",
          description: "Testimonial updated successfully.",
        })
      } else {
        await createTestimonial(
          {
            name: currentTestimonial.name || "",
            role: currentTestimonial.role,
            content: currentTestimonial.content || "",
            rating: currentTestimonial.rating || 5,
            featured: currentTestimonial.featured || false,
          },
          avatarFile || undefined,
        )

        toast({
          title: "Success",
          description: "Testimonial created successfully.",
        })
      }

      resetForm()
      setDialogOpen(false)
      fetchTestimonials()
    } catch (error) {
      console.error("Error saving testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to save testimonial. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setCurrentTestimonial(testimonial)
    setAvatarPreview(testimonial.avatar || "")
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) {
      return
    }

    try {
      await deleteTestimonial(id)
      toast({
        title: "Success",
        description: "Testimonial deleted successfully.",
      })
      fetchTestimonials()
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to delete testimonial. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await toggleTestimonialFeatured(id, !featured)
      toast({
        title: "Success",
        description: `Testimonial ${!featured ? "featured" : "unfeatured"} successfully.`,
      })
      fetchTestimonials()
    } catch (error) {
      console.error("Error updating testimonial featured status:", error)
      toast({
        title: "Error",
        description: "Failed to update testimonial status. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the testimonial information below."
                  : "Add a new parent testimonial to showcase on your website."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={currentTestimonial.name || ""}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={currentTestimonial.role || ""}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, role: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g. Parent of 2, New Mom, etc."
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    value={currentTestimonial.content || ""}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, content: e.target.value })}
                    className="col-span-3"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rating" className="text-right">
                    Rating
                  </Label>
                  <Select
                    value={String(currentTestimonial.rating || 5)}
                    onValueChange={(value) =>
                      setCurrentTestimonial({ ...currentTestimonial, rating: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="featured" className="text-right">
                    Featured
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={currentTestimonial.featured || false}
                      onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, featured: e.target.checked })}
                      className="mr-2 h-4 w-4"
                    />
                    <Label htmlFor="featured" className="text-sm font-normal">
                      Show on homepage
                    </Label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="avatar" className="text-right pt-2">
                    Avatar
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="col-span-3"
                    />
                    {(avatarPreview || currentTestimonial.avatar) && (
                      <div className="relative w-16 h-16 overflow-hidden rounded-full border">
                        <Image
                          src={avatarPreview || currentTestimonial.avatar || ""}
                          alt="Avatar preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update" : "Add"} Testimonial
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "featured")}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Testimonials</TabsTrigger>
          <TabsTrigger value="featured">Featured Only</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Parent Testimonials</CardTitle>
            <CardDescription>Manage testimonials from parents that will be displayed on your website.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No testimonials found. Add your first testimonial to get started.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 overflow-hidden rounded-full bg-primary/10">
                            {testimonial.avatar ? (
                              <Image
                                src={testimonial.avatar || "/placeholder.svg"}
                                alt={testimonial.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-sm font-bold text-primary">
                                {testimonial.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{testimonial.name}</h3>
                            {testimonial.role && <p className="text-xs text-muted-foreground">{testimonial.role}</p>}
                          </div>
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFeatured(testimonial.id, testimonial.featured)}
                            title={testimonial.featured ? "Remove from featured" : "Add to featured"}
                          >
                            <Star
                              className={`h-4 w-4 ${testimonial.featured ? "fill-amber-400 text-amber-400" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3">{testimonial.content}</p>

                      <div className="flex justify-between items-center">
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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(testimonial)}
                            title="Edit testimonial"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(testimonial.id)}
                            title="Delete testimonial"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </AdminLayout>
  )
}
