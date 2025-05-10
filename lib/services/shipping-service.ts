import { supabase } from "@/lib/supabase"

export interface ShippingCost {
  id: number
  location_key: string
  location_name: string
  cost: number
  created_at?: string
  updated_at?: string
}

export async function getShippingCosts(): Promise<ShippingCost[]> {
  try {
    const { data, error } = await supabase
      .from("shipping_costs")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) throw error

    // If no shipping costs exist, create default ones
    if (!data || data.length === 0) {
      await createDefaultShippingCosts()
      const { data: newData, error: newError } = await supabase
        .from("shipping_costs")
        .select("*")
        .order("display_order", { ascending: true })

      if (newError) throw newError
      return newData || []
    }

    return data
  } catch (error) {
    console.error("Error fetching shipping costs:", error)
    // Return default shipping costs if database query fails
    return [
      {
        id: 1,
        location_key: "inside_dhaka",
        location_name: "Inside Dhaka",
        cost: 80,
        display_order: 1,
      },
      {
        id: 2,
        location_key: "outside_dhaka",
        location_name: "Outside Dhaka",
        cost: 130,
        display_order: 2,
      },
    ]
  }
}

export async function updateShippingCost(id: number, cost: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("shipping_costs")
      .update({ cost, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error updating shipping cost:", error)
    return { success: false, error: error.message }
  }
}

async function createDefaultShippingCosts() {
  try {
    const defaultCosts = [
      {
        location_key: "inside_dhaka",
        location_name: "Inside Dhaka",
        cost: 80,
        display_order: 1,
      },
      {
        location_key: "outside_dhaka",
        location_name: "Outside Dhaka",
        cost: 130,
        display_order: 2,
      },
    ]

    const { error } = await supabase.from("shipping_costs").insert(defaultCosts)

    if (error) throw error
  } catch (error) {
    console.error("Error creating default shipping costs:", error)
  }
}

export async function getShippingCostByLocation(locationKey: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("shipping_costs")
      .select("cost")
      .eq("location_key", locationKey)
      .single()

    if (error) throw error

    return data.cost
  } catch (error) {
    console.error(`Error fetching shipping cost for location ${locationKey}:`, error)
    // Return default costs if query fails
    return locationKey === "inside_dhaka" ? 80 : 130
  }
}
