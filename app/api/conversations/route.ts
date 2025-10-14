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

    let query = supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: conversations, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: conversations || [],
    })
  } catch (error) {
    console.error("[v0] Get conversations error:", error)
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

    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        status: "active",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: conversation,
    })
  } catch (error) {
    console.error("[v0] Create conversation error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
