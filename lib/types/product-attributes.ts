// Product color type
export interface ProductColor {
  id: string
  product_id: string
  name: string
  hex_code: string
  display_order: number
  created_at: string
  updated_at: string
}

// Product size type
export interface ProductSize {
  id: string
  product_id: string
  name: string
  scale: string
  display_order: number
  created_at: string
  updated_at: string
}

// Product variation image type
export interface ProductVariationImage {
  id?: string
  variation_id?: string
  image_url: string
  is_primary: boolean
  media_type: "image" | "video"
  display_order: number
  created_at?: string
  file?: File | null
  url?: string
  isPrimary?: boolean
  mediaType?: "image" | "video"
  displayOrder?: number
}

// Product variation type
export interface ProductVariation {
  id?: string
  product_id?: string
  color_id: string | null
  size_id: string | null
  sku: string | null
  price: number
  sale_price: number | null
  stock: number
  is_default: boolean
  created_at?: string
  updated_at?: string
  color?: ProductColor
  size?: ProductSize
  images?: ProductVariationImage[]
  colorId?: string | null
  sizeId?: string | null
  salePrice?: number | null
  isDefault?: boolean
}

// Form data for product attributes
export interface ProductAttributesFormData {
  colors: Array<{
    name: string
    hex_code: string
    display_order: number
  }>
  sizes: Array<{
    name: string
    scale: string
    display_order: number
  }>
  variations: Array<{
    colorId: string | null
    sizeId: string | null
    sku: string | null
    price: number
    salePrice: number | null
    stock: number
    isDefault: boolean
    colorIndex?: number
    sizeIndex?: number
    images: Array<{
      url?: string
      file?: File | null
      isPrimary: boolean
      mediaType: "image" | "video"
      displayOrder: number
    }>
  }>
}

export const SIZE_SCALES = [
  { value: "clothing", label: "Clothing Sizes" },
  { value: "shoes", label: "Shoe Sizes" },
  { value: "age", label: "Age Ranges" },
]

export const COMMON_CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
export const COMMON_SHOE_SIZES = ["5", "6", "7", "8", "9", "10", "11"]
export const COMMON_AGE_RANGES = ["Newborn", "0-3M", "3-6M", "6-12M", "12-18M", "18-24M"]
