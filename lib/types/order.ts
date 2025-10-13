export interface PaymentMethod {
  id: number
  name: string
  type: "cod" | "mobile_banking"
  details: {
    account_number?: string
    account_type?: string
    [key: string]: any
  }
  instructions: string
  active: boolean
  display_order: number
}

export interface SystemMessage {
  id: number
  key: string
  content: string
}

export interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_note?: string
  product_id: number
  variation_id?: number
  quantity: number
  total_amount: number
  payment_method_id?: number
  transaction_id?: string
  status: "pending" | "approved" | "declined" | "completed"
  created_at: string
  updated_at: string
}

export interface OrderWithDetails extends Order {
  product: {
    name: string
    slug: string
    images: string[]
  }
  variation?: {
    color_name: string
    size_name: string
    price: number
  }
  payment_method?: PaymentMethod
}

export interface CheckoutFormData {
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_note?: string
  product_id: number
  variation_id?: number
  quantity: number
  payment_method_id: number
  transaction_id?: string
}
