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

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error("[v0] Get profile error:", error)
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

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        full_name: body.full_name,
        company_name: body.company_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) throw error

    // Also update auth metadata
    await supabase.auth.updateUser({
      data: {
        full_name: body.full_name,
        company_name: body.company_name,
      },
    })

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error("[v0] Update profile error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
