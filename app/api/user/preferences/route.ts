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

    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("[v0] Get preferences error:", error)
      throw error
    }

    // Return default preferences if none exist
    if (!preferences) {
      return NextResponse.json({
        success: true,
        data: {
          language: "en",
          timezone: "Africa/Tunis",
          currency: "TND",
          email_notifications: true,
          order_alerts: true,
          conversation_alerts: true,
          weekly_reports: false,
          two_factor_enabled: false,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: preferences,
    })
  } catch (error) {
    console.error("[v0] Get preferences error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
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

    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          ...body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: preferences,
    })
  } catch (error) {
    console.error("[v0] Update preferences error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
