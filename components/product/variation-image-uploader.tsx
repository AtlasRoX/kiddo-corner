"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Upload, Link2, GripVertical, Star, StarOff } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import Image from "next/image"

interface VariationImage {
  file?: File
  url?: string
  isPrimary: boolean
  mediaType: "image" | "video"
  displayOrder: number
}

interface VariationImageUploaderProps {
  images: VariationImage[]
  onChange: (images: VariationImage[]) => void
}

export function VariationImageUploader({ images, onChange }: VariationImageUploaderProps) {
  const [uploadMethod, setUploadMethod] = useState<"file" | "link">("file")
  const [imageUrl, setImageUrl] = useState("")
  const [mediaType, setMediaType] = useState<"image" | "video">("image")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = [...images]

      Array.from(e.target.files).forEach((file) => {
        // Determine if it's an image or video based on file type
        const fileType = file.type.startsWith("video/") ? "video" : "image"

        newImages.push({
          file,
          isPrimary: newImages.length === 0, // First image is primary by default
          mediaType: fileType,
          displayOrder: newImages.length,
        })
      })

      onChange(newImages)

      // Reset the input
      e.target.value = ""
    }
  }

  const addImageUrl = () => {
    if (!imageUrl) return

    try {
      new URL(imageUrl) // Validate URL

      const newImages = [...images]
      newImages.push({
        url: imageUrl,
        isPrimary: newImages.length === 0, // First image is primary by default
        mediaType,
        displayOrder: newImages.length,
      })

      onChange(newImages)
      setImageUrl("")
    } catch (e) {
      alert("Please enter a valid URL")
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    const removedImage = newImages.splice(index, 1)[0]

    // If we removed the primary image, make the first remaining image primary
    if (removedImage.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true
    }

    // Update display order
    newImages.forEach((img, idx) => {
      img.displayOrder = idx
    })

    onChange(newImages)
  }

  const togglePrimary = (index: number) => {
    const newImages = [...images]

    // Set all images to non-primary
    newImages.forEach((img) => (img.isPrimary = false))

    // Set the selected image to primary
    newImages[index].isPrimary = true

    onChange(newImages)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(images)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update display order
    const reorderedImages = items.map((item, index) => ({
      ...item,
      displayOrder: index,
    }))

    onChange(reorderedImages)
  }

  return (
    <div className="space-y-4">
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
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground mt-2">
            You can upload multiple images and videos at once. The first image will be set as the primary image.
          </p>
        </TabsContent>

        <TabsContent value="link" className="pt-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter image or video URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button type="button" onClick={addImageUrl} className="shrink-0">
                Add
              </Button>
            </div>

            <RadioGroup
              value={mediaType}
              onValueChange={(value) => setMediaType(value as "image" | "video")}
              className="flex"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="media-image" />
                <Label htmlFor="media-image">Image</Label>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <RadioGroupItem value="video" id="media-video" />
                <Label htmlFor="media-video">Video</Label>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>
      </Tabs>

      {images.length > 0 && (
        <div className="border rounded-md p-4">
          <h4 className="text-sm font-medium mb-3">Variation Images</h4>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
                >
                  {images.map((image, index) => (
                    <Draggable key={index} draggableId={`image-${index}`} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="relative group">
                          <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                            {image.file ? (
                              image.mediaType === "video" ? (
                                <div className="flex items-center justify-center h-full">
                                  <span className="text-sm">Video Preview</span>
                                </div>
                              ) : (
                                <Image
                                  src={URL.createObjectURL(image.file) || "/placeholder.svg"}
                                  alt={`Variation image ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              )
                            ) : image.url ? (
                              image.mediaType === "video" ? (
                                <div className="flex items-center justify-center h-full">
                                  <span className="text-sm">Video: {image.url.substring(0, 20)}...</span>
                                </div>
                              ) : (
                                <Image
                                  src={image.url || "/placeholder.svg"}
                                  alt={`Variation image ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              )
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <span className="text-sm">No preview</span>
                              </div>
                            )}
                          </div>

                          <div
                            {...provided.dragHandleProps}
                            className="absolute top-1 left-1 cursor-grab bg-background/80 rounded-full p-1 shadow-sm"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>

                          <button
                            type="button"
                            onClick={() => togglePrimary(index)}
                            className="absolute bottom-1 left-1 bg-background/80 rounded-full p-1 shadow-sm"
                            title={image.isPrimary ? "Primary image" : "Set as primary"}
                          >
                            {image.isPrimary ? (
                              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-background/80 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  )
}
