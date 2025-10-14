import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (orderError) throw orderError

    // Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", params.id)

    if (itemsError) throw itemsError

    // Format the response to match the expected structure
    const orderDetails = {
      ...order,
      products: orderItems || [],
    }

    return NextResponse.json({
      success: true,
      data: orderDetails,
    })
  } catch (error) {
    console.error("[v0] Get order error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
