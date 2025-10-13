"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"

interface ColorPickerProps {
  colors: Array<{
    name: string
    hex_code: string
    display_order: number
  }>
  onChange: (
    colors: Array<{
      name: string
      hex_code: string
      display_order: number
    }>,
  ) => void
}

export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  const [newColorName, setNewColorName] = useState("")
  const [newColorHex, setNewColorHex] = useState("#000000") // Default to black

  const handleAddColor = () => {
    // Validate color name and hex code
    if (!newColorName.trim()) {
      alert("Please enter a color name")
      return
    }

    if (!newColorHex || !newColorHex.trim() || !isValidHexCode(newColorHex)) {
      alert("Please enter a valid hex color code (e.g., #FF0000)")
      return
    }

    const newColor = {
      name: newColorName.trim(),
      hex_code: newColorHex.trim(),
      display_order: colors.length,
    }

    onChange([...colors, newColor])
    setNewColorName("")
    setNewColorHex("#000000") // Reset to default
  }

  const handleRemoveColor = (index: number) => {
    const updatedColors = [...colors]
    updatedColors.splice(index, 1)

    // Update display order for remaining colors
    const reorderedColors = updatedColors.map((color, idx) => ({
      ...color,
      display_order: idx,
    }))

    onChange(reorderedColors)
  }

  const handleColorChange = (index: number, field: "name" | "hex_code", value: string) => {
    // Don't allow empty hex codes
    if (field === "hex_code" && (!value || !value.trim())) {
      value = "#000000" // Default to black if empty
    }

    // Validate hex code
    if (field === "hex_code" && !isValidHexCode(value)) {
      return // Don't update if invalid
    }

    const updatedColors = [...colors]
    updatedColors[index] = {
      ...updatedColors[index],
      [field]: value,
    }
    onChange(updatedColors)
  }

  // Function to validate hex color code
  const isValidHexCode = (hex: string): boolean => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {colors.map((color, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1">
              <Label htmlFor={`color-name-${index}`} className="sr-only">
                Color Name
              </Label>
              <Input
                id={`color-name-${index}`}
                value={color.name}
                onChange={(e) => handleColorChange(index, "name", e.target.value)}
                placeholder="Color name"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`color-hex-${index}`} className="sr-only">
                Color Hex Code
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`color-hex-${index}`}
                  value={color.hex_code}
                  onChange={(e) => handleColorChange(index, "hex_code", e.target.value)}
                  placeholder="#000000"
                />
                <div className="h-8 w-8 rounded border" style={{ backgroundColor: color.hex_code || "#000000" }} />
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveColor(index)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="new-color-name">Color Name</Label>
          <Input
            id="new-color-name"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            placeholder="e.g., Red"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="new-color-hex">Color Hex Code</Label>
          <div className="flex items-center gap-2">
            <Input
              id="new-color-hex"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              placeholder="#FF0000"
              type="color"
            />
            <div className="h-8 w-8 rounded border" style={{ backgroundColor: newColorHex || "#000000" }} />
          </div>
        </div>
        <Button type="button" onClick={handleAddColor}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  )
}
