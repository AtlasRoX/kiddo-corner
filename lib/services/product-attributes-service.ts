import { supabase } from "@/lib/supabase"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import type {
  ProductColor,
  ProductSize,
  ProductVariation,
  ProductVariationImage,
  ProductAttributesFormData,
} from "@/lib/types/product-attributes"

// Color management
export async function getProductColors(productId: string): Promise<ProductColor[]> {
  try {
    const { data, error } = await supabase
      .from("product_colors")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching product colors:", error)
      throw new Error(`Failed to fetch product colors: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getProductColors:", error)
    throw error
  }
}

export async function addProductColor(
  productId: string,
  color: Omit<ProductColor, "id" | "product_id" | "created_at" | "updated_at">,
): Promise<ProductColor> {
  try {
    if (!color.hex_code || !color.hex_code.trim()) {
      color.hex_code = "#000000"
    }
    if (!color.name || !color.name.trim()) {
      color.name = "Unnamed Color"
    }

    const { data, error } = await supabase
      .from("product_colors")
      .insert([
        {
          name: color.name.trim(),
          hex_code: color.hex_code.trim(),
          display_order: color.display_order,
          product_id: productId,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding product color:", error)
      throw new Error(`Failed to add product color: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in addProductColor:", error)
    throw error
  }
}

export async function updateProductColor(colorId: string, color: Partial<ProductColor>): Promise<ProductColor> {
  try {
    const updateData: any = { updated_at: new Date().toISOString() }

    if (color.name !== undefined) updateData.name = color.name.trim() || "Unnamed Color"
    if (color.hex_code !== undefined) updateData.hex_code = color.hex_code.trim() || "#000000"
    if (color.display_order !== undefined) updateData.display_order = color.display_order

    const { data, error } = await supabase.from("product_colors").update(updateData).eq("id", colorId).select().single()

    if (error) {
      console.error("Error updating product color:", error)
      throw new Error(`Failed to update product color: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in updateProductColor:", error)
    throw error
  }
}

export async function deleteProductColor(colorId: string): Promise<void> {
  try {
    const { error } = await supabase.from("product_colors").delete().eq("id", colorId)

    if (error) {
      console.error("Error deleting product color:", error)
      throw new Error(`Failed to delete product color: ${error.message}`)
    }
  } catch (error) {
    console.error("Error in deleteProductColor:", error)
    throw error
  }
}

// Size management
export async function getProductSizes(productId: string): Promise<ProductSize[]> {
  try {
    const { data, error } = await supabase
      .from("product_sizes")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching product sizes:", error)
      throw new Error(`Failed to fetch product sizes: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getProductSizes:", error)
    throw error
  }
}

export async function addProductSize(
  productId: string,
  size: Omit<ProductSize, "id" | "product_id" | "created_at" | "updated_at">,
): Promise<ProductSize> {
  try {
    if (!size.name || !size.name.trim()) {
      size.name = "Unnamed Size"
    }
    if (!size.scale || !size.scale.trim()) {
      size.scale = "custom"
    }

    const { data, error } = await supabase
      .from("product_sizes")
      .insert([
        {
          name: size.name.trim(),
          scale: size.scale.trim(),
          display_order: size.display_order,
          product_id: productId,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding product size:", error)
      throw new Error(`Failed to add product size: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in addProductSize:", error)
    throw error
  }
}

export async function updateProductSize(sizeId: string, size: Partial<ProductSize>): Promise<ProductSize> {
  try {
    const updateData: any = { updated_at: new Date().toISOString() }

    if (size.name !== undefined) updateData.name = size.name.trim() || "Unnamed Size"
    if (size.scale !== undefined) updateData.scale = size.scale.trim() || "custom"
    if (size.display_order !== undefined) updateData.display_order = size.display_order

    const { data, error } = await supabase.from("product_sizes").update(updateData).eq("id", sizeId).select().single()

    if (error) {
      console.error("Error updating product size:", error)
      throw new Error(`Failed to update product size: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in updateProductSize:", error)
    throw error
  }
}

export async function deleteProductSize(sizeId: string): Promise<void> {
  try {
    const { error } = await supabase.from("product_sizes").delete().eq("id", sizeId)

    if (error) {
      console.error("Error deleting product size:", error)
      throw new Error(`Failed to delete product size: ${error.message}`)
    }
  } catch (error) {
    console.error("Error in deleteProductSize:", error)
    throw error
  }
}

// Variation management
export async function getProductVariations(productId: string): Promise<ProductVariation[]> {
  try {
    const { data, error } = await supabase
      .from("product_variations")
      .select(`
        *,
        color:color_id(id, name, hex_code),
        size:size_id(id, name, scale)
      `)
      .eq("product_id", productId)

    if (error) {
      console.error("Error fetching product variations:", error)
      throw new Error(`Failed to fetch product variations: ${error.message}`)
    }

    const variations = data || []
    for (const variation of variations) {
      try {
        const { data: images, error: imagesError } = await supabase
          .from("product_variation_images")
          .select("*")
          .eq("variation_id", variation.id)
          .order("display_order", { ascending: true })

        if (imagesError) {
          console.warn(`Error fetching images for variation ${variation.id}:`, imagesError)
        }

        variation.images = images || []
      } catch (imageError) {
        console.error(`Error fetching images for variation ${variation.id}:`, imageError)
        variation.images = []
      }
    }

    return variations
  } catch (error) {
    console.error("Error in getProductVariations:", error)
    throw error
  }
}

export async function addProductVariation(
  productId: string,
  variation: {
    colorId: string | null
    sizeId: string | null
    sku: string | null
    price: number
    salePrice: number | null
    stock: number
    isDefault: boolean
  },
): Promise<ProductVariation> {
  try {
    const price = Number(variation.price) || 0
    const salePrice = variation.salePrice ? Number(variation.salePrice) : null
    const stock = Number(variation.stock) || 0
    const colorId = variation.colorId && variation.colorId.toString().startsWith("temp-") ? null : variation.colorId
    const sizeId = variation.sizeId && variation.sizeId.toString().startsWith("temp-") ? null : variation.sizeId

    const { data, error } = await supabase
      .from("product_variations")
      .insert([
        {
          product_id: productId,
          color_id: colorId,
          size_id: sizeId,
          sku: variation.sku,
          price,
          sale_price: salePrice,
          stock,
          is_default: variation.isDefault,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding product variation:", error)
      throw new Error(`Failed to add product variation: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in addProductVariation:", error)
    throw error
  }
}

export async function updateProductVariation(
  variationId: string,
  variation: Partial<{ colorId: string | null; sizeId: string | null; sku: string | null; price: number; salePrice: number | null; stock: number; isDefault: boolean }>,
): Promise<ProductVariation> {
  try {
    const updateData: any = { updated_at: new Date().toISOString() }
    if (variation.colorId !== undefined) {
      updateData.color_id = variation.colorId && variation.colorId.toString().startsWith("temp-") ? null : variation.colorId
    }
    if (variation.sizeId !== undefined) {
      updateData.size_id = variation.sizeId && variation.sizeId.toString().startsWith("temp-") ? null : variation.sizeId
    }
    if (variation.sku !== undefined) updateData.sku = variation.sku
    if (variation.price !== undefined) updateData.price = Number(variation.price) || 0
    if (variation.salePrice !== undefined) updateData.sale_price = variation.salePrice ? Number(variation.salePrice) : null
    if (variation.stock !== undefined) updateData.stock = Number(variation.stock) || 0
    if (variation.isDefault !== undefined) updateData.is_default = variation.isDefault

    const { data, error } = await supabase
      .from("product_variations")
      .update(updateData)
      .eq("id", variationId)
      .select()
      .single()

    if (error) {
      console.error("Error updating product variation:", error)
      throw new Error(`Failed to update product variation: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in updateProductVariation:", error)
    throw error
  }
}

export async function deleteProductVariation(variationId: string): Promise<void> {
  try {
    // 1) Delete related images
    const { error: imagesError } = await supabase
      .from("product_variation_images")
      .delete()
      .eq("variation_id", variationId)
    if (imagesError) {
      console.warn(`Error deleting images for variation ${variationId}:`, imagesError)
    }

    // 2) Null out any orders referencing this variation
    const { error: ordersError } = await supabase
      .from("orders")
      .update({ variation_id: null })
      .eq("variation_id", variationId)
    if (ordersError) {
      console.warn(`Error nulling orders for variation ${variationId}:`, ordersError)
    }

    // 3) Delete the variation record
    const { error } = await supabase
      .from("product_variations")
      .delete()
      .eq("id", variationId)

    if (error) {
      console.error("Error deleting product variation:", error)
      throw new Error(`Failed to delete product variation: ${error.message}`)
    }
  } catch (error) {
    console.error("Error in deleteProductVariation:", error)
    throw error
  }
}

// Variation images management
export async function addVariationImage(
  variationId: string,
  imageFile: File,
  isPrimary = false,
  mediaType: "image" | "video" = "image",
  displayOrder = 0,
): Promise<ProductVariationImage> {
  try {
    const fileName = `product-variations/${Date.now()}-${imageFile.name}`
    const storageRef = ref(storage, fileName)
    await uploadBytes(storageRef, imageFile)
    const imageUrl = await getDownloadURL(storageRef)

    const { data, error } = await supabase
      .from("product_variation_images")
      .insert([
        {
          variation_id: variationId,
          image_url: imageUrl,
          is_primary: isPrimary,
          media_type: mediaType,
          display_order: displayOrder,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding variation image:", error)
      throw new Error(`Failed to add variation image: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in addVariationImage:", error)
    throw error
  }
}

export async function updateVariationImage(
  imageId: string,
  updates: Partial<{ isPrimary: boolean; displayOrder: number }>,
): Promise<ProductVariationImage> {
  try {
    const updateData: any = {}
    if (updates.isPrimary !== undefined) updateData.is_primary = updates.isPrimary
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder

    const { data, error } = await supabase
      .from("product_variation_images")
      .update(updateData)
      .eq("id", imageId)
      .select()
      .single()

    if (error) {
      console.error("Error updating variation image:", error)
      throw new Error(`Failed to update variation image: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in updateVariationImage:", error)
    throw error
  }
}

export async function deleteVariationImage(imageId: string): Promise<void> {
  try {
    const { error } = await supabase.from("product_variation_images").delete().eq("id", imageId)

    if (error) {
      console.error("Error deleting variation image:", error)
      throw new Error(`Failed to delete variation image: ${error.message}`)
    }
  } catch (error) {
    console.error("Error in deleteVariationImage:", error)
    throw error
  }
}

// Save all product attributes at once
export async function saveProductAttributes(productId: string, formData: ProductAttributesFormData): Promise<void> {
  console.log("Starting saveProductAttributes with productId:", productId)
  console.log("Form data:", JSON.stringify(formData, null, 2))

  try {
    // 1. Clear existing data for this product
    console.log("Clearing existing product attributes")

    const { data: existingVariations } = await supabase
      .from("product_variations")
      .select("id")
      .eq("product_id", productId)

    if (existingVariations && existingVariations.length > 0) {
      console.log(`Deleting ${existingVariations.length} existing variations`)
      for (const variation of existingVariations) {
        await deleteProductVariation(variation.id)
      }
    }

    const { error: colorDeleteError } = await supabase.from("product_colors").delete().eq("product_id", productId)
    if (colorDeleteError) console.warn("Error clearing product colors:", colorDeleteError)

    const { error: sizeDeleteError } = await supabase.from("product_sizes").delete().eq("product_id", productId)
    if (sizeDeleteError) console.warn("Error clearing product sizes:", sizeDeleteError)

    // 2. Save new colors
    console.log(`Adding ${formData.colors.length} colors`)
    const savedColors = []
    for (const color of formData.colors) {
      if (!color.hex_code || !color.hex_code.trim()) color.hex_code = "#000000"
      const savedColor = await addProductColor(productId, color)
      savedColors.push(savedColor)
    }

    // 3. Save new sizes
    console.log(`Adding ${formData.sizes.length} sizes`)
    const savedSizes = []
    for (const size of formData.sizes) {
      const savedSize = await addProductSize(productId, size)
      savedSizes.push(savedSize)
    }

    // 4. Save variations
    console.log(`Adding ${formData.variations.length} variations`)
    for (const variation of formData.variations) {
      let colorId = variation.colorId
      let sizeId = variation.sizeId

      if (colorId && colorId.toString().startsWith("temp-")) {
        const idx = parseInt(colorId.toString().replace("temp-", ""), 10)
        colorId = !isNaN(idx) && idx < savedColors.length ? savedColors[idx].id : null
      }

      if (sizeId && sizeId.toString().startsWith("temp-")) {
        const idx = parseInt(sizeId.toString().replace("temp-", ""), 10)
        sizeId = !isNaN(idx) && idx < savedSizes.length ? savedSizes[idx].id : null
      }

      const savedVariation = await addProductVariation(productId, {
        colorId,
        sizeId,
        sku: variation.sku,
        price: variation.price,
        salePrice: variation.salePrice,
        stock: variation.stock,
        isDefault: variation.isDefault,
      })

      if (variation.images?.length && savedVariation.id) {
        console.log(`Adding ${variation.images.length} images for variation ${savedVariation.id}`)
        for (const image of variation.images) {
          if (image.file) {
            await addVariationImage(savedVariation.id, image.file, image.isPrimary, image.mediaType, image.displayOrder)
          } else if (image.url) {
            await supabase.from("product_variation_images").insert([{ variation_id: savedVariation.id, image_url: image.url, is_primary: image.isPrimary, media_type: image.mediaType || "image", display_order: image.displayOrder || 0 }])
          }
        }
      }
    }

    console.log("Product attributes saved successfully")
  } catch (error) {
    console.error("Error in saveProductAttributes:", error)
    throw error
  }
}
