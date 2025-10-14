import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { pageId, pageAccessToken, pageName } = await request.json()

    if (!pageId || !pageAccessToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique verify token for this webhook
    const verifyToken = crypto.randomBytes(32).toString("hex")

    // Construct webhook URL (this will be your public endpoint)
    const webhookUrl = `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || process.env.VERCEL_URL || "http://localhost:3000"}/api/facebook/webhook`

    // Subscribe the page to webhook events
    const subscribeResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks&access_token=${pageAccessToken}`,
      {
        method: "POST",
      },
    )

    if (!subscribeResponse.ok) {
      const error = await subscribeResponse.json()
      console.error("[v0] Facebook subscription error:", error)
      throw new Error(error.error?.message || "Failed to subscribe to webhook")
    }

    // Save webhook subscription to database
    const { error: dbError } = await supabase.from("webhook_subscriptions").upsert(
      {
        user_id: user.id,
        page_id: pageId,
        webhook_url: webhookUrl,
        verify_token: verifyToken,
        subscribed_fields: ["messages", "messaging_postbacks"],
        is_active: true,
      },
      {
        onConflict: "user_id,page_id",
      },
    )

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      throw dbError
    }

    return NextResponse.json({
      success: true,
      message: "Webhook configured successfully",
      webhookUrl,
    })
  } catch (error: any) {
    console.error("[v0] Setup webhook error:", error)
    return NextResponse.json({ error: error.message || "Failed to setup webhook" }, { status: 500 })
  }
}
