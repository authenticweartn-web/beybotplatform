// Session management utilities using Supabase

import { createClient as createServerClient } from "@/lib/supabase/server"
import type { User } from "@/lib/types"

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      console.log("[v0] No authenticated user found")
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single()

    if (profileError) {
      console.error("[v0] Error fetching user profile:", profileError)
      // Return basic user info from auth if profile doesn't exist
      return {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.full_name || authUser.email!.split("@")[0],
        role: "user",
        createdAt: authUser.created_at,
        updatedAt: authUser.updated_at || authUser.created_at,
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.full_name || profile.email.split("@")[0],
      role: profile.role || "user",
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }
  } catch (error) {
    console.error("[v0] Error getting current user:", error)
    return null
  }
}
