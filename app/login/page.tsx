"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Loader2, Facebook } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/dashboard"
  const error = searchParams.get("error")
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)

  if (error && !isFacebookLoading) {
    toast.error(decodeURIComponent(error))
  }

  const handleFacebookLogin = async () => {
    setIsFacebookLoading(true)
    const supabase = createClient()

    try {
      // Get the redirect URL from environment variable or construct from window.location
      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`

      console.log("[v0] Initiating Facebook OAuth with redirect:", redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: redirectUrl,
          // Request necessary permissions for Instagram and Messenger integration
          scopes:
            "pages_show_list,pages_messaging,instagram_basic,instagram_manage_messages,pages_manage_metadata,business_management",
          queryParams: {
            // Request long-lived token
            auth_type: "rerequest",
          },
        },
      })

      if (error) throw error

      // OAuth redirect will happen automatically
      console.log("[v0] Facebook OAuth initiated successfully")
    } catch (error: any) {
      console.error("[v0] Facebook login error:", error)
      toast.error(error.message || "Facebook login failed. Please try again.")
      setIsFacebookLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">BeyBot</h1>
          </Link>
          <p className="text-center text-muted-foreground">AI-Powered Sales Agents for E-commerce</p>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to BeyBot</CardTitle>
            <CardDescription>Sign in with Facebook to connect your Instagram and Messenger pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              type="button"
              className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white h-12 text-base"
              onClick={handleFacebookLogin}
              disabled={isFacebookLoading}
            >
              {isFacebookLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting to Facebook...
                </>
              ) : (
                <>
                  <Facebook className="mr-2 h-5 w-5 fill-white" />
                  Continue with Facebook
                </>
              )}
            </Button>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="text-center">By signing in, you'll be able to:</p>
              <ul className="space-y-2 text-left list-disc list-inside">
                <li>Connect your Facebook pages</li>
                <li>Link Instagram Business accounts</li>
                <li>Manage Messenger conversations</li>
                <li>Automate responses with AI</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to BeyBot's Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
