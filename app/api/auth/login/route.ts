// Login API route - Now uses Supabase Auth
// Note: This endpoint is deprecated. Use Supabase signInWithPassword from the client instead.

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 401 },
      )
    }

    if (!data.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    const user = profile
      ? {
          id: profile.id,
          email: profile.email,
          name: profile.full_name || profile.email.split("@")[0],
          role: profile.role || "user",
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        }
      : {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
          role: "user",
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at || data.user.created_at,
        }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: { user },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
