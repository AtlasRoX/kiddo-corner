import { supabase } from "@/lib/supabase"
import type { PaymentMethod } from "@/lib/types/order"
import type { SystemMessage } from "@/lib/types/system-message"

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true })

    if (error) throw error

    return data as PaymentMethod[]
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return []
  }
}

export async function getSystemMessage(key: string): Promise<string> {
  try {
    const { data, error } = await supabase.from("system_messages").select("content").eq("key", key).single()

    if (error) {
      console.warn(`System message with key ${key} not found:`, error)
      return ""
    }

    return data.content
  } catch (error) {
    console.error(`Error fetching system message with key ${key}:`, error)
    return ""
  }
}

interface OrderData {
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_note?: string
  product_id: string
  variation_id?: string
  quantity: number
  payment_method_id: number
  transaction_id?: string
  shipping_location: string
  shipping_cost: number
}

export async function createOrder(data: OrderData): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate a unique order number
    const orderNumber = generateOrderNumber()

    // Calculate total amount
    let productPrice = 0

    // Get product price
    if (data.variation_id) {
      // If variation is provided, get price from variation
      const { data: variationData, error: variationError } = await supabase
        .from("product_variations")
        .select("price")
        .eq("id", data.variation_id)
        .single()

      if (variationError) throw variationError
      productPrice = variationData.price
    } else {
      // Otherwise get price from product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("price")
        .eq("id", data.product_id)
        .single()

      if (productError) throw productError
      productPrice = productData.price
    }

    // Calculate total amount
    const totalAmount = productPrice * data.quantity + data.shipping_cost

    // Insert order
    const { error } = await supabase.from("orders").insert({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_address: data.customer_address,
      customer_note: data.customer_note,
      product_id: data.product_id,
      variation_id: data.variation_id,
      quantity: data.quantity,
      payment_method_id: data.payment_method_id,
      transaction_id: data.transaction_id,
      total_amount: totalAmount,
      status: "pending",
      order_number: orderNumber,
      shipping_location: data.shipping_location,
      shipping_cost: data.shipping_cost,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error creating order:", error)
    return { success: false, error: error.message }
  }
}

// Helper function to generate a unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `ORD-${timestamp}${random}`
}

export async function getOrders() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        payment_method:payment_methods(name, type),
        product:products(name, images)
      `,
      )
      .order("created_at", { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

export async function getOrderById(id: string) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        payment_method:payment_methods(name, type, instructions),
        product:products(name, images, price),
        variation:product_variations(id, price, color:color_id(name), size:size_id(name))
      `,
      )
      .eq("id", id)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error)
    return null
  }
}

export async function updateOrderStatus(id: number, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error updating order status:", error)
    return { success: false, error: error.message }
  }
}

// Get all payment methods (active and inactive)
export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) throw error

    return data as PaymentMethod[]
  } catch (error) {
    console.error("Error fetching all payment methods:", error)
    return []
  }
}

// Create a new payment method
export async function createPaymentMethod(
  paymentMethod: Partial<PaymentMethod>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("payment_methods").insert(paymentMethod)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error creating payment method:", error)
    return { success: false, error: error.message }
  }
}

// Update an existing payment method
export async function updatePaymentMethod(
  id: number,
  paymentMethod: Partial<PaymentMethod>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("payment_methods")
      .update({ ...paymentMethod, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error updating payment method:", error)
    return { success: false, error: error.message }
  }
}

// Delete a payment method
export async function deletePaymentMethod(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("payment_methods").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting payment method:", error)
    return { success: false, error: error.message }
  }
}

// Get all system messages
export async function getSystemMessages(): Promise<SystemMessage[]> {
  try {
    const { data, error } = await supabase.from("system_messages").select("*")

    if (error) throw error

    return data as SystemMessage[]
  } catch (error) {
    console.error("Error fetching system messages:", error)
    return []
  }
}

// Update a system message
export async function updateSystemMessage(key: string, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("system_messages")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("key", key)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error updating system message:", error)
    return { success: false, error: error.message }
  }
}
