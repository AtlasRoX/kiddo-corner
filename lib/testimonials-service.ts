import { supabase } from "@/lib/supabase"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export interface Testimonial {
  id: string
  name: string
  role?: string
  content: string
  avatar?: string
  rating: number
  featured: boolean
  created_at: string
}

export async function getTestimonials(featuredOnly = false) {
  try {
    let query = supabase.from("testimonials").select("*").order("created_at", { ascending: false })

    if (featuredOnly) {
      query = query.eq("featured", true)
    }

    const { data, error } = await query

    if (error) throw error

    return data as Testimonial[]
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return []
  }
}

export async function getTestimonialById(id: string) {
  try {
    const { data, error } = await supabase.from("testimonials").select("*").eq("id", id).single()

    if (error) throw error

    return data as Testimonial
  } catch (error) {
    console.error(`Error fetching testimonial ${id}:`, error)
    return null
  }
}

export async function createTestimonial(testimonial: Omit<Testimonial, "id" | "created_at">, avatarFile?: File) {
  try {
    let avatarUrl = testimonial.avatar || ""

    // Upload avatar if provided
    if (avatarFile) {
      const fileName = `testimonials/${Date.now()}-${avatarFile.name}`
      const storageRef = ref(storage, fileName)
      await uploadBytes(storageRef, avatarFile)
      avatarUrl = await getDownloadURL(storageRef)
    }

    const { data, error } = await supabase
      .from("testimonials")
      .insert([{ ...testimonial, avatar: avatarUrl }])
      .select()

    if (error) throw error

    return data[0] as Testimonial
  } catch (error) {
    console.error("Error creating testimonial:", error)
    throw error
  }
}

export async function updateTestimonial(
  id: string,
  testimonial: Partial<Omit<Testimonial, "id" | "created_at">>,
  avatarFile?: File,
) {
  try {
    const updateData = { ...testimonial }

    // Upload avatar if provided
    if (avatarFile) {
      const fileName = `testimonials/${Date.now()}-${avatarFile.name}`
      const storageRef = ref(storage, fileName)
      await uploadBytes(storageRef, avatarFile)
      updateData.avatar = await getDownloadURL(storageRef)
    }

    const { data, error } = await supabase
      .from("testimonials")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) throw error

    return data[0] as Testimonial
  } catch (error) {
    console.error(`Error updating testimonial ${id}:`, error)
    throw error
  }
}

export async function deleteTestimonial(id: string) {
  try {
    const { error } = await supabase.from("testimonials").delete().eq("id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error(`Error deleting testimonial ${id}:`, error)
    throw error
  }
}

export async function toggleTestimonialFeatured(id: string, featured: boolean) {
  try {
    const { error } = await supabase
      .from("testimonials")
      .update({ featured, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error(`Error updating testimonial ${id} featured status:`, error)
    throw error
  }
}
