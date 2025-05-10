import { supabase } from "@/lib/supabase"

export interface FooterSection {
  id: number
  section_name: string
  title: string
  content: any
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getFooterSections(): Promise<FooterSection[]> {
  try {
    const { data, error, status, statusText } = await supabase
      .from("footer_settings")
      .select("*")
      .order("display_order", { ascending: true })

    if (error || !data) {
      console.error("Supabase error fetching footer sections:", {
        error,
        data,
        status,
        statusText,
      })
      return []
    }

    return data as FooterSection[]
  } catch (error) {
    console.error("Exception in getFooterSections:", error)
    return []
  }
}



export async function getActiveFooterSections(): Promise<FooterSection[]> {
  try {
    const { data, error } = await supabase
      .from("footer_settings")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching active footer sections:", error)
      return []
    }

    return data as FooterSection[]
  } catch (error) {
    console.error("Error in getActiveFooterSections:", error)
    return []
  }
}

export async function getFooterSectionById(id: number): Promise<FooterSection | null> {
  try {
    const { data, error } = await supabase.from("footer_settings").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching footer section with ID ${id}:`, error)
      return null
    }

    return data as FooterSection
  } catch (error) {
    console.error(`Error in getFooterSectionById for ID ${id}:`, error)
    return null
  }
}

export async function updateFooterSection(
  id: number,
  updates: Partial<FooterSection>,
): Promise<{ success: boolean; error?: string; updatedSection?: FooterSection }> {
  try {
    // Ensure required fields are correct, especially when dealing with unknown frontend props
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    console.log(`Updating footer section ID ${id} with:`, updatedData)

    const { data, error } = await supabase
      .from("footer_settings")
      .update(updatedData)
      .eq("id", id)
      .select()
      .single() // Ensures we only expect one result

    if (error) {
      console.error(`Error from Supabase when updating section ${id}:`, {
        message: error.message,
        details: error.details,
        code: error.code,
      })
      return { success: false, error: error.message }
    }

    if (!data) {
      console.warn(`No data returned from Supabase after updating section ID ${id}`)
      return { success: false, error: "No section updated. ID may not exist." }
    }

    return { success: true, updatedSection: data as FooterSection }
  } catch (error: any) {
    console.error(`Unhandled error updating footer section ID ${id}:`, {
      message: error?.message,
      stack: error?.stack,
      full: error,
    })
    return { success: false, error: error?.message || "Unknown error" }
  }
}



export async function createFooterSection(
  section: Omit<FooterSection, "id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const { data, error } = await supabase
      .from("footer_settings")
      .insert({
        ...section,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      throw error
    }

    return { success: true, id: data.id }
  } catch (error: any) {
    console.error("Error creating footer section:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteFooterSection(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("footer_settings").delete().eq("id", id)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error(`Error deleting footer section with ID ${id}:`, error)
    return { success: false, error: error.message }
  }
}

export async function updateFooterSectionOrder(
  sections: { id: number; display_order: number }[],
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use Promise.all to update all sections in parallel
    await Promise.all(
      sections.map((section) =>
        supabase
          .from("footer_settings")
          .update({ display_order: section.display_order, updated_at: new Date().toISOString() })
          .eq("id", section.id),
      ),
    )

    return { success: true }
  } catch (error: any) {
    console.error("Error updating footer section order:", error)
    return { success: false, error: error.message }
  }
}
