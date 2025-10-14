import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
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
    // Get user's Facebook access token from Supabase auth
    const { data: sessionData } = await supabase.auth.getSession()
    const providerToken = sessionData.session?.provider_token

    if (!providerToken) {
      return NextResponse.json(
        { error: "No Facebook access token found. Please reconnect your Facebook account." },
        { status: 400 },
      )
    }

    // Fetch user's Facebook pages
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${providerToken}`)

    if (!pagesResponse.ok) {
      throw new Error("Failed to fetch Facebook pages")
    }

    const pagesData = await pagesResponse.json()

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.json({ count: 0, message: "No pages found" })
    }

    // For each page, check if it has an Instagram business account
    const pagesToInsert = await Promise.all(
      pagesData.data.map(async (page: any) => {
        let instagramAccountId = null

        try {
          const igResponse = await fetch(
            `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`,
          )
          const igData = await igResponse.json()
          instagramAccountId = igData.instagram_business_account?.id || null
        } catch (error) {
          console.error(`[v0] Error fetching Instagram account for page ${page.id}:`, error)
        }

        return {
          user_id: user.id,
          page_id: page.id,
          page_name: page.name,
          page_access_token: page.access_token,
          instagram_business_account_id: instagramAccountId,
          messenger_enabled: true,
          instagram_enabled: !!instagramAccountId,
        }
      }),
    )

    // Upsert pages into database
    const { error: insertError } = await supabase.from("facebook_pages").upsert(pagesToInsert, {
      onConflict: "user_id,page_id",
      ignoreDuplicates: false,
    })

    if (insertError) {
      console.error("[v0] Error inserting pages:", insertError)
      throw insertError
    }

    return NextResponse.json({
      count: pagesToInsert.length,
      message: `Successfully synced ${pagesToInsert.length} page(s)`,
    })
  } catch (error: any) {
    console.error("[v0] Sync pages error:", error)
    return NextResponse.json({ error: error.message || "Failed to sync pages" }, { status: 500 })
  }
}
