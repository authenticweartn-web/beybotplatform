import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Activity } from "@/lib/types"

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
      .select("id, customer_name, last_message, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (conversationsError) {
      console.error("[v0] Error fetching conversations:", conversationsError)
    }

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, customer_name, total, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (ordersError) {
      console.error("[v0] Error fetching orders:", ordersError)
    }

    const activities: Activity[] = []

    // Add conversations to activities
    conversations?.forEach((conv) => {
      activities.push({
        id: conv.id,
        type: "conversation",
        customer: conv.customer_name,
        message: conv.last_message || "Started a new conversation",
        time: getRelativeTime(new Date(conv.created_at)),
        createdAt: conv.created_at,
      })
    })

    // Add orders to activities
    orders?.forEach((order) => {
      const statusMessage = getOrderStatusMessage(order.status)
      activities.push({
        id: order.id,
        type: "order",
        customer: order.customer_name,
        message: statusMessage,
        amount: `${order.total} TND`,
        time: getRelativeTime(new Date(order.created_at)),
        createdAt: order.created_at,
      })
    })

    // Sort by creation date (most recent first) and limit to 10
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const recentActivities = activities.slice(0, 10)

    return NextResponse.json({
      success: true,
      data: recentActivities,
    })
  } catch (error) {
    console.error("[v0] Dashboard activity error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  return date.toLocaleDateString()
}

function getOrderStatusMessage(status: string): string {
  switch (status) {
    case "pending":
      return "Placed a new order"
    case "processing":
      return "Order is being processed"
    case "shipped":
      return "Order has been shipped"
    case "delivered":
      return "Order delivered successfully"
    case "cancelled":
      return "Order was cancelled"
    default:
      return "Placed an order"
  }
}
