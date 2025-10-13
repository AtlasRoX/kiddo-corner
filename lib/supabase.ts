import { createClient } from "@supabase/supabase-js"

// Re-export createClient for use in other files
export { createClient } from "@supabase/supabase-js"

// Initialize the Supabase client with error handling
let supabaseInstance: ReturnType<typeof createClient> | null = null

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables - check your env setup")
  } else {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      // Add global error handler
      global: {
        headers: {
          "Content-Type": "application/json",
        },
      },
      // Add fetch options for better network handling
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          // Add timeout (5 seconds)
          signal: AbortSignal.timeout(5000),
        }).catch((error) => {
          console.error("Fetch error in Supabase client:", error)
          throw error
        })
      },
    })

    console.log("Supabase client initialized successfully")
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
    // Using a simple query that should work even with no data
    const { error } = await supabase.from("site_settings").select("count").limit(1)

    if (error && error.code !== "PGRST116") {
      // PGRST116 is just "no rows returned"
      throw error
    }
    return { success: true }
  } catch (error) {
    console.error("Supabase connection check failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
