import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { agentConfigSchema } from "@/lib/validations/agent"

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

    const { data: config, error } = await supabase.from("agent_config").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") throw error

    // If no config exists, return default
    if (!config) {
      return NextResponse.json({
        success: true,
        data: {
          system_prompt: "You are a helpful AI sales assistant for an e-commerce business.",
          personality: "professional",
          language: "fr",
          tone: "friendly",
          auto_respond: true,
          collect_email: true,
          handle_orders: true,
          escalate_complex: false,
          gemini_model: "gemini-2.0-flash-exp",
          product_knowledge: [],
          order_confirmation: true,
          follow_up: true,
          escalation: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: config,
    })
  } catch (error) {
    console.error("[v0] Get agent config error:", error)
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

    const body = await request.json()

    // Validate input
    const result = agentConfigSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { data: config, error } = await supabase
      .from("agent_config")
      .upsert({
        user_id: user.id,
        ...result.data,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Configuration updated successfully",
      data: config,
    })
  } catch (error) {
    console.error("[v0] Update agent config error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
