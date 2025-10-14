import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Webhook verification (GET request from Facebook)
export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  console.log("[v0] Webhook verification request:", { mode, token, challenge })

  if (mode === "subscribe") {
    if (token) {
      console.log("[v0] Webhook verified successfully")
      return new NextResponse(challenge, { status: 200 })
    }
  }

  console.log("[v0] Webhook verification failed")
  return NextResponse.json({ error: "Verification failed" }, { status: 403 })
}

// Webhook event handler (POST request from Facebook)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] Webhook event received:", JSON.stringify(body, null, 2))

    // Verify this is a page subscription
    if (body.object !== "page") {
      return NextResponse.json({ error: "Invalid object type" }, { status: 400 })
    }

    // Process each entry
    for (const entry of body.entry) {
      const pageId = entry.id

      // Get the page and user info from database
      const supabase = await createClient()
      const { data: pageData, error: pageError } = await supabase
        .from("facebook_pages")
        .select("*")
        .eq("page_id", pageId)
        .single()

      if (pageError || !pageData) {
        console.error("[v0] Page not found:", pageId, pageError)
        continue
      }

      // Process messaging events
      if (entry.messaging) {
        for (const event of entry.messaging) {
          await handleMessagingEvent(event, pageData, supabase)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}

async function handleMessagingEvent(event: any, pageData: any, supabase: any) {
  const senderId = event.sender.id
  const recipientId = event.recipient.id
  const timestamp = event.timestamp

  console.log("[v0] Processing message from:", senderId, "Event:", JSON.stringify(event))

  // Check if this is a message event
  if (event.message) {
    const messageText = event.message.text
    const messageId = event.message.mid

    if (!messageText) {
      console.log("[v0] No text in message, skipping")
      return
    }

    // Determine platform (messenger or instagram)
    const platform = senderId.toString().includes("_") ? "instagram" : "messenger"

    console.log("[v0] Detected platform:", platform)

    const platformEnabled = platform === "messenger" ? pageData.messenger_enabled : pageData.instagram_enabled

    if (!platformEnabled) {
      console.log(`[v0] ${platform} is disabled for this page`)
      return
    }

    // Find or create conversation
    let conversation = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", pageData.user_id)
      .eq("platform_conversation_id", senderId)
      .eq("page_id", pageData.page_id)
      .single()

    if (!conversation.data) {
      // Create new conversation
      console.log("[v0] Creating new conversation for sender:", senderId)
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: pageData.user_id,
          customer_name: `${platform} User ${senderId.toString().slice(-6)}`,
          platform,
          platform_conversation_id: senderId.toString(),
          page_id: pageData.page_id,
          status: "active",
          last_message: messageText,
          last_message_at: new Date(timestamp).toISOString(),
          unread_count: 1,
        })
        .select()
        .single()

      if (convError) {
        console.error("[v0] Error creating conversation:", convError)
        return
      }
      conversation = { data: newConv }
      console.log("[v0] Created conversation:", conversation.data.id)
    } else {
      // Update existing conversation
      console.log("[v0] Updating existing conversation:", conversation.data.id)
      await supabase
        .from("conversations")
        .update({
          last_message: messageText,
          last_message_at: new Date(timestamp).toISOString(),
          unread_count: (conversation.data.unread_count || 0) + 1,
          status: "active",
        })
        .eq("id", conversation.data.id)
    }

    // Save the message
    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversation.data.id,
      sender: "customer",
      content: messageText,
      created_at: new Date(timestamp).toISOString(),
    })

    if (msgError) {
      console.error("[v0] Error saving message:", msgError)
    } else {
      console.log("[v0] Message saved successfully")
    }

    triggerAIResponse(conversation.data.id, messageText, pageData, senderId.toString(), supabase).catch((error) => {
      console.error("[v0] AI response trigger failed:", error)
    })
  }
}

async function triggerAIResponse(
  conversationId: string,
  messageText: string,
  pageData: any,
  senderId: string,
  supabase: any,
) {
  try {
    console.log("[v0] Triggering AI response for conversation:", conversationId)

    // Get agent config
    const { data: agentConfig, error: configError } = await supabase
      .from("agent_config")
      .select("*")
      .eq("user_id", pageData.user_id)
      .single()

    if (configError) {
      console.error("[v0] Error fetching agent config:", configError)
      return
    }

    if (!agentConfig) {
      console.log("[v0] No agent config found")
      return
    }

    console.log("[v0] Agent config:", {
      auto_respond: agentConfig.auto_respond,
      has_gemini_key: !!agentConfig.gemini_api_key,
    })

    if (!agentConfig.auto_respond) {
      console.log("[v0] Auto-respond is disabled")
      return
    }

    if (!agentConfig.gemini_api_key && !process.env.GEMINI_API_KEY) {
      console.error("[v0] No Gemini API key configured")
      return
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

    console.log("[v0] Calling AI service at:", `${baseUrl}/api/ai/respond`)

    const response = await fetch(`${baseUrl}/api/ai/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        messageText,
        agentConfig,
        pageData,
        senderId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] AI response failed:", response.status, errorText)
    } else {
      console.log("[v0] AI response triggered successfully")
    }
  } catch (error) {
    console.error("[v0] Error triggering AI response:", error)
  }
}
