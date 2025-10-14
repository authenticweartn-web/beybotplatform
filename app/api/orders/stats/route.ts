import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Get total orders count
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Get pending orders
    const { count: pending } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending")

    // Get processing orders
    const { count: processing } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "processing")

    // Get completed orders (delivered)
    const { count: completed } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "delivered")

    return NextResponse.json({
      success: true,
      data: {
        total: totalOrders || 0,
        pending: pending || 0,
        processing: processing || 0,
        completed: completed || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Get order stats error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
