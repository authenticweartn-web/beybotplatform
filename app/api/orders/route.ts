import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let query = supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
    }

    const { data: orders, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: orders || [],
    })
  } catch (error) {
    console.error("[v0] Get orders error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: body.order_number,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        total: body.total,
        status: body.status || "pending",
        items: body.items || [],
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("[v0] Create order error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
