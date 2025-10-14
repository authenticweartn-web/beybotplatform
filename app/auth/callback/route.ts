import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin
  const next = requestUrl.searchParams.get("next") || "/dashboard/integrations"

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] Auth callback error:", error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data.session) {
      console.log("[v0] Auth successful for user:", data.user?.email)
      console.log("[v0] Provider:", data.session.user.app_metadata.provider)

      if (data.session.provider_token) {
        console.log("[v0] Facebook access token received")

        // Store Facebook user info in profile if it doesn't exist
        const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

        if (!profile) {
          // Create profile with Facebook data
          const fullName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0] ||
            "Facebook User"

          await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email || "",
            full_name: fullName,
            company_name: "",
          })

          console.log("[v0] Created profile for Facebook user:", fullName)
        }
      }
    }
  }

  // Redirect to the specified next page or integrations dashboard
  return NextResponse.redirect(`${origin}${next}`)
}
