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

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    // Get all system settings
    const { data: settings, error } = await supabase.from("system_settings").select("*").order("setting_key")

    if (error) throw error

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error("[v0] Get system settings error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { settingKey, settingValue } = body

    if (!settingKey) {
      return NextResponse.json({ success: false, message: "Setting key is required" }, { status: 400 })
    }

    // Update or insert setting
    const { data, error } = await supabase
      .from("system_settings")
      .upsert(
        {
          setting_key: settingKey,
          setting_value: settingValue,
          updated_by: user.id,
        },
        {
          onConflict: "setting_key",
        },
      )
      .select()
      .single()

    if (error) throw error

    // Log admin activity
    await supabase.from("admin_activity_log").insert({
      admin_id: user.id,
      action: "update_system_setting",
      details: { setting_key: settingKey },
    })

    return NextResponse.json({
      success: true,
      message: "System setting updated successfully",
      data,
    })
  } catch (error) {
    console.error("[v0] Update system settings error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
