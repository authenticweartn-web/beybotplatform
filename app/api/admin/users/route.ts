import { NextResponse } from "next/server"
import { withAdmin } from "@/lib/api/middleware"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  return withAdmin(async (user) => {
    try {
      const supabase = await createClient()

      // Fetch all users with their profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching users:", error)
        return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 })
      }

      // Get additional stats for each user
      const usersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const [conversationsResult, ordersResult, productsResult] = await Promise.all([
            supabase.from("conversations").select("id", { count: "exact" }).eq("user_id", profile.id),
            supabase.from("orders").select("id", { count: "exact" }).eq("user_id", profile.id),
            supabase.from("products").select("id", { count: "exact" }).eq("user_id", profile.id),
          ])

          return {
            ...profile,
            stats: {
              conversations: conversationsResult.count || 0,
              orders: ordersResult.count || 0,
              products: productsResult.count || 0,
            },
          }
        }),
      )

      return NextResponse.json({
        success: true,
        data: usersWithStats,
      })
    } catch (error) {
      console.error("[v0] Admin users API error:", error)
      return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
  })
}
