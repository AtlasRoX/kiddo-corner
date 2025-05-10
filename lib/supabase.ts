import { createClient } from "@supabase/supabase-js"

// Re-export createClient for use in other files
export { createClient } from "@supabase/supabase-js"

// Initialize the Supabase client with error handling
let supabaseInstance: ReturnType<typeof createClient> | null = null

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")
  } else {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
} catch (error) {
  console.error("Error initializing Supabase client:", error)
}

// Ensure we always have a client, even if it's a "disabled" one that will provide clear errors
export const supabase =
  supabaseInstance ||
  ({
    from: () => {
      throw new Error("Supabase client not initialized. Check your environment variables.")
    },
    rpc: () => {
      throw new Error("Supabase client not initialized. Check your environment variables.")
    },
    // Add other methods as needed
  } as any)

// Create a server-side client (for server components and API routes)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables for server client")
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Helper function to check if Supabase connection is working
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("products").select("id").limit(1)
    if (error) {
      throw error
    }
    return { success: true }
  } catch (error) {
    console.error("Supabase connection check failed:", error)
    return { success: false, error }
  }
}
