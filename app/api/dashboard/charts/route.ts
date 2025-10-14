import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { ConversationData, RevenueData } from "@/lib/types"

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

    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (conversationsError) {
      console.error("[v0] Error fetching conversations:", conversationsError)
    }

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("created_at, total")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (ordersError) {
      console.error("[v0] Error fetching orders:", ordersError)
    }

    const conversationData: ConversationData[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const conversationsCount =
        conversations?.filter((c) => {
          const createdAt = new Date(c.created_at)
          return createdAt >= dayStart && createdAt <= dayEnd
        }).length || 0

      const ordersCount =
        orders?.filter((o) => {
          const createdAt = new Date(o.created_at)
          return createdAt >= dayStart && createdAt <= dayEnd
        }).length || 0

      conversationData.push({
        date: dateStr,
        conversations: conversationsCount,
        orders: ordersCount,
      })
    }

    const revenueData: RevenueData[] = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today)
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toLocaleDateString("en-US", { month: "short" })

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

      const monthRevenue =
        orders
          ?.filter((o) => {
            const createdAt = new Date(o.created_at)
            return createdAt >= monthStart && createdAt <= monthEnd
          })
          .reduce((sum, order) => sum + Number(order.total), 0) || 0

      revenueData.push({
        month: monthStr,
        revenue: monthRevenue,
      })
    }

    return NextResponse.json({
      success: true,
      data: { conversationData, revenueData },
    })
  } catch (error) {
    console.error("[v0] Dashboard charts error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
