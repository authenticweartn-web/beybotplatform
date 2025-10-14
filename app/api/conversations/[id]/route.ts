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

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (convError) throw convError

    // Fetch messages for this conversation
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", params.id)
      .order("created_at", { ascending: true })

    if (messagesError) throw messagesError

    // Format messages to match expected structure
    const formattedMessages = (messages || []).map((msg) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      sender: msg.sender,
      content: msg.content,
      timestamp: new Date(msg.created_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: true,
    }))

    const conversationData = {
      ...conversation,
      customerName: conversation.customer_name,
      lastMessage: conversation.last_message,
      lastMessageTime: conversation.last_message_at
        ? new Date(conversation.last_message_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      unreadCount: conversation.unread_count || 0,
      messages: formattedMessages,
    }

    return NextResponse.json({
      success: true,
      data: conversationData,
    })
  } catch (error) {
    console.error("[v0] Get conversation error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
