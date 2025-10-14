import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { conversationId, messageText, agentConfig, pageData, senderId } = await request.json()

    console.log("[v0] Generating AI response for conversation:", conversationId)
    console.log("[v0] Message text:", messageText)

    const supabase = await createClient()

    // Get conversation history for context
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20)

    if (messagesError) {
      console.error("[v0] Error fetching messages:", messagesError)
    }

    // Build conversation context
    const conversationHistory = messages
      ?.map((msg) => ({
        role: msg.sender === "customer" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))
      .slice(0, -1) // Remove the last message since we'll add it separately

    console.log("[v0] Conversation history length:", conversationHistory?.length || 0)

    // Get products for context
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("name, description, price, stock, category")
      .eq("user_id", pageData.user_id)
      .limit(50)

    if (productsError) {
      console.error("[v0] Error fetching products:", productsError)
    }

    console.log("[v0] Products count:", products?.length || 0)

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(agentConfig, products || [])

    const { data: geminiKeySetting } = await supabase
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", "gemini_api_key")
      .single()

    const { data: geminiModelSetting } = await supabase
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", "gemini_model")
      .single()

    const geminiApiKey = geminiKeySetting?.setting_value || process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      console.error("[v0] No Gemini API key configured in system settings")
      return NextResponse.json({ error: "Gemini API key not configured by admin" }, { status: 500 })
    }

    const geminiModel = geminiModelSetting?.setting_value || "gemini-2.0-flash-exp"

    console.log("[v0] Using Gemini model:", geminiModel)

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            ...(conversationHistory || []),
            {
              role: "user",
              parts: [{ text: messageText }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const error = await geminiResponse.json()
      console.error("[v0] Gemini API error:", JSON.stringify(error))
      throw new Error(error.error?.message || "Failed to generate response")
    }

    const geminiData = await geminiResponse.json()
    console.log("[v0] Gemini response received")

    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      console.error("[v0] No response generated from Gemini")
      throw new Error("No response generated from Gemini")
    }

    console.log("[v0] AI response generated:", aiResponse.substring(0, 100) + "...")

    // Save AI response to database
    const { error: saveError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender: "agent",
      content: aiResponse,
    })

    if (saveError) {
      console.error("[v0] Error saving AI message:", saveError)
    } else {
      console.log("[v0] AI message saved to database")
    }

    // Update conversation
    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        last_message: aiResponse,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversationId)

    if (updateError) {
      console.error("[v0] Error updating conversation:", updateError)
    }

    try {
      await sendMessageToPlatform(senderId, aiResponse, pageData)
      console.log("[v0] Message sent to platform successfully")
    } catch (sendError) {
      console.error("[v0] Failed to send message to platform:", sendError)
      // Don't throw - we still want to return success since message was saved
    }

    return NextResponse.json({ success: true, response: aiResponse })
  } catch (error: any) {
    console.error("[v0] AI response error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 })
  }
}

function buildSystemPrompt(agentConfig: any, products: any[]): string {
  const basePrompt = agentConfig.system_prompt || "You are a helpful AI sales assistant."

  const languageInstruction = `You must respond in ${agentConfig.language === "ar" ? "Arabic" : agentConfig.language === "fr" ? "French" : "English"}.`

  const toneInstruction = `Your tone should be ${agentConfig.tone}.`

  const personalityInstruction = agentConfig.personality ? `Your personality: ${agentConfig.personality}` : ""

  const productContext =
    products.length > 0
      ? `\n\nAvailable Products:\n${products
          .map(
            (p) =>
              `- ${p.name}: ${p.description || "No description"} | Price: ${p.price} TND | Stock: ${p.stock} | Category: ${p.category || "Uncategorized"}`,
          )
          .join("\n")}`
      : ""

  const workflowInstructions = `

Workflow Guidelines:
- ${agentConfig.auto_respond ? "Respond automatically to customer messages" : "Wait for manual approval before responding"}
- ${agentConfig.order_confirmation ? "Always confirm order details before processing" : "Process orders without explicit confirmation"}
- ${agentConfig.follow_up ? "Send follow-up messages to inactive conversations" : "Do not send follow-up messages"}
- ${agentConfig.escalation ? "Escalate complex issues to human agents when necessary" : "Handle all issues independently"}
`

  return `${basePrompt}

${languageInstruction}
${toneInstruction}
${personalityInstruction}
${productContext}
${workflowInstructions}

Remember to be helpful, accurate, and focused on assisting customers with their needs.`
}

async function sendMessageToPlatform(recipientId: string, message: string, pageData: any) {
  try {
    const platform = recipientId.includes("_") ? "instagram" : "messenger"
    const endpoint = `https://graph.facebook.com/v18.0/me/messages`

    console.log("[v0] Sending message to", platform, "recipient:", recipientId)

    const response = await fetch(`${endpoint}?access_token=${pageData.page_access_token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Failed to send message:", JSON.stringify(error))
      throw new Error(error.error?.message || "Failed to send message")
    }

    const result = await response.json()
    console.log("[v0] Message sent successfully:", result)
  } catch (error) {
    console.error("[v0] Error sending message to platform:", error)
    throw error
  }
}
