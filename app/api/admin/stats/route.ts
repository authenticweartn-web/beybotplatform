import { NextResponse } from "next/server"
import { withAdmin } from "@/lib/api/middleware"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  return withAdmin(async (user) => {
    try {
      const supabase = await createClient()

      // Get system-wide statistics
      const [usersResult, conversationsResult, ordersResult, productsResult, pagesResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("conversations").select("id", { count: "exact" }),
        supabase.from("orders").select("total"),
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("facebook_pages").select("id", { count: "exact" }),
      ])

      // Calculate total revenue
      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0

      // Get recent activity
      const { data: recentConversations } = await supabase
        .from("conversations")
        .select("*, profiles!inner(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(10)

      const { data: recentOrders } = await supabase
        .from("orders")
        .select("*, profiles!inner(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(10)

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            totalUsers: usersResult.count || 0,
            totalConversations: conversationsResult.count || 0,
            totalOrders: ordersResult.data?.length || 0,
            totalRevenue,
            totalProducts: productsResult.count || 0,
            connectedPages: pagesResult.count || 0,
          },
          recentActivity: {
            conversations: recentConversations || [],
            orders: recentOrders || [],
          },
        },
      })
    } catch (error) {
      console.error("[v0] Admin stats API error:", error)
      return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
  })
}
