"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, GripVertical } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import {
  SIZE_SCALES,
  COMMON_CLOTHING_SIZES,
  COMMON_SHOE_SIZES,
  COMMON_AGE_RANGES,
} from "@/lib/types/product-attributes"

interface SizePickerProps {
  sizes: Array<{
    name: string
    scale: string
    displayOrder: number
  }>
  onChange: (
    sizes: Array<{
      name: string
      scale: string
      displayOrder: number
    }>,
  ) => void
}

export function SizePicker({ sizes, onChange }: SizePickerProps) {
  const [newSizeName, setNewSizeName] = useState("")
  const [newSizeScale, setNewSizeScale] = useState("clothing")
  const [showCommonSizes, setShowCommonSizes] = useState(false)

  const addSize = () => {
    if (!newSizeName.trim()) return

    const newSizes = [
      ...sizes,
      {
        name: newSizeName,
        scale: newSizeScale,
        displayOrder: sizes.length,
      },
    ]

    onChange(newSizes)
    setNewSizeName("")
  }

  const removeSize = (index: number) => {
    const newSizes = [...sizes]
    newSizes.splice(index, 1)

    // Update display order
    newSizes.forEach((size, idx) => {
      size.displayOrder = idx
    })

    onChange(newSizes)
  }

  const updateSize = (index: number, field: "name" | "scale", value: string) => {
    const newSizes = [...sizes]
    newSizes[index] = { ...newSizes[index], [field]: value }
    onChange(newSizes)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sizes)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update display order
    const reorderedSizes = items.map((item, index) => ({
      ...item,
      displayOrder: index,
    }))

    onChange(reorderedSizes)
  }

  const addCommonSizes = () => {
    let commonSizes: string[] = []

    switch (newSizeScale) {
      case "clothing":
        commonSizes = COMMON_CLOTHING_SIZES
        break
      case "shoes":
        commonSizes = COMMON_SHOE_SIZES
        break
      case "age":
        commonSizes = COMMON_AGE_RANGES
        break
      default:
        return
    }

    const existingSizeNames = new Set(sizes.map((s) => s.name))
    const newSizesToAdd = commonSizes
      .filter((size) => !existingSizeNames.has(size))
      .map((size, index) => ({
        name: size,
        scale: newSizeScale,
        displayOrder: sizes.length + index,
      }))

    if (newSizesToAdd.length === 0) return

    onChange([...sizes, ...newSizesToAdd])
    setShowCommonSizes(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="space-y-2 flex-1">
          <Label htmlFor="sizeName">Size Name</Label>
          <Input
            id="sizeName"
            value={newSizeName}
            onChange={(e) => setNewSizeName(e.target.value)}
            placeholder="e.g., Small, 3-6M, etc."
          />
        </div>
        <div className="space-y-2 w-40">
          <Label htmlFor="sizeScale">Size Scale</Label>
          <Select value={newSizeScale} onValueChange={setNewSizeScale}>
            <SelectTrigger id="sizeScale">
              <SelectValue placeholder="Select scale" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_SCALES.map((scale) => (
                <SelectItem key={scale.value} value={scale.value}>
                  {scale.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={addSize} className="mb-0.5">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Add sizes individually or use common presets</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowCommonSizes(!showCommonSizes)}>
          {showCommonSizes ? "Hide" : "Show"} Common Sizes
        </Button>
      </div>

      {showCommonSizes && (
        <div className="border rounded-md p-4 bg-muted/30">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium">Common {SIZE_SCALES.find((s) => s.value === newSizeScale)?.label}</h4>
            <Button type="button" size="sm" onClick={addCommonSizes}>
              Add All
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {newSizeScale === "clothing" &&
              COMMON_CLOTHING_SIZES.map((size) => (
                <div key={size} className="bg-background border rounded-md px-3 py-1 text-sm">
                  {size}
                </div>
              ))}
            {newSizeScale === "shoes" &&
              COMMON_SHOE_SIZES.map((size) => (
                <div key={size} className="bg-background border rounded-md px-3 py-1 text-sm">
                  {size}
                </div>
              ))}
            {newSizeScale === "age" &&
              COMMON_AGE_RANGES.map((size) => (
                <div key={size} className="bg-background border rounded-md px-3 py-1 text-sm">
                  {size}
                </div>
              ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="border rounded-md p-4">
          <h4 className="text-sm font-medium mb-3">Size Options</h4>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sizes">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {sizes.map((size, index) => (
                    <Draggable key={index} draggableId={`size-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-3 bg-muted/50 p-2 rounded-md"
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <Input
                            value={size.name}
                            onChange={(e) => updateSize(index, "name", e.target.value)}
                            className="flex-1 h-8"
                          />

                          <Select value={size.scale} onValueChange={(value) => updateSize(index, "scale", value)}>
                            <SelectTrigger className="w-40 h-8">
                              <SelectValue placeholder="Select scale" />
                            </SelectTrigger>
                            <SelectContent>
                              {SIZE_SCALES.map((scale) => (
                                <SelectItem key={scale.value} value={scale.value}>
                                  {scale.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSize(index)}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
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
