import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { DashboardMetrics } from "@/lib/types"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Fetch conversations count
    const { count: totalConversations, error: conversationsError } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if (conversationsError) {
      console.error("[v0] Error fetching conversations:", conversationsError)
    }

    // Fetch orders count and total revenue
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("total, status")
      .eq("user_id", user.id)

    if (ordersError) {
      console.error("[v0] Error fetching orders:", ordersError)
    }

    const ordersGenerated = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0
    const conversionRate =
      totalConversations && totalConversations > 0 ? (ordersGenerated / totalConversations) * 100 : 0

    const metrics: DashboardMetrics = {
      totalConversations: totalConversations || 0,
      conversationsChange: 0, // Will be calculated from historical data once available
      ordersGenerated,
      ordersChange: 0, // Will be calculated from historical data once available
      conversionRate: Number(conversionRate.toFixed(1)),
      conversionChange: 0, // Will be calculated from historical data once available
      totalRevenue,
      revenueChange: 0, // Will be calculated from historical data once available
    }

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    console.error("[v0] Dashboard metrics error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
