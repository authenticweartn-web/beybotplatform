"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Facebook,
  Instagram,
  MessageCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Webhook,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface FacebookPage {
  id: string
  user_id: string
  page_id: string
  page_name: string
  page_access_token: string
  instagram_business_account_id: string | null
  messenger_enabled: boolean
  instagram_enabled: boolean
  created_at: string
}

interface WebhookSubscription {
  id: string
  page_id: string
  is_active: boolean
  webhook_url: string
}

export default function IntegrationsPage() {
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [webhooks, setWebhooks] = useState<Record<string, WebhookSubscription>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [setupingWebhook, setSetupingWebhook] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUserAndPages()
  }, [])

  const loadUserAndPages = async () => {
    const supabase = createClient()

    // Get current user
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    setUser(currentUser)

    if (currentUser) {
      await loadPages()
      await loadWebhooks()
    }
    setIsLoading(false)
  }

  const loadPages = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("facebook_pages").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error loading pages:", error)
      toast.error("Failed to load connected pages")
    } else {
      setPages(data || [])
    }
  }

  const loadWebhooks = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("webhook_subscriptions").select("*")

    if (error) {
      console.error("[v0] Error loading webhooks:", error)
    } else if (data) {
      const webhookMap: Record<string, WebhookSubscription> = {}
      data.forEach((webhook) => {
        webhookMap[webhook.page_id] = webhook
      })
      setWebhooks(webhookMap)
    }
  }

  const handleConnectFacebook = async () => {
    setIsConnecting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          scopes: "pages_show_list,pages_messaging,instagram_basic,instagram_manage_messages,pages_manage_metadata",
        },
      })

      if (error) throw error
    } catch (error: any) {
      console.error("[v0] Facebook connection error:", error)
      toast.error(error.message || "Failed to connect Facebook")
      setIsConnecting(false)
    }
  }

  const handleSyncPages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/facebook/sync-pages", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to sync pages")

      const data = await response.json()
      toast.success(`Synced ${data.count} page(s)`)
      await loadPages()
    } catch (error: any) {
      console.error("[v0] Sync error:", error)
      toast.error("Failed to sync pages")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupWebhook = async (page: FacebookPage) => {
    setSetupingWebhook(page.page_id)
    try {
      const response = await fetch("/api/facebook/setup-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.page_id,
          pageAccessToken: page.page_access_token,
          pageName: page.page_name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to setup webhook")
      }

      const data = await response.json()
      toast.success("Webhook configured successfully!")
      await loadWebhooks()
    } catch (error: any) {
      console.error("[v0] Webhook setup error:", error)
      toast.error(error.message || "Failed to setup webhook")
    } finally {
      setSetupingWebhook(null)
    }
  }

  const handleTogglePlatform = async (pageId: string, platform: "messenger" | "instagram", enabled: boolean) => {
    const supabase = createClient()
    const field = platform === "messenger" ? "messenger_enabled" : "instagram_enabled"

    const { error } = await supabase
      .from("facebook_pages")
      .update({ [field]: enabled })
      .eq("page_id", pageId)

    if (error) {
      console.error("[v0] Error toggling platform:", error)
      toast.error(`Failed to ${enabled ? "enable" : "disable"} ${platform}`)
    } else {
      toast.success(`${platform} ${enabled ? "enabled" : "disabled"}`)
      await loadPages()
    }
  }

  const handleDisconnectPage = async (pageId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("facebook_pages").delete().eq("id", pageId)

    if (error) {
      console.error("[v0] Error disconnecting page:", error)
      toast.error("Failed to disconnect page")
    } else {
      toast.success("Page disconnected")
      await loadPages()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your Facebook pages to enable BeyBot on Instagram and Messenger
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                Facebook Pages
              </CardTitle>
              <CardDescription>
                Connect your Facebook pages to manage Instagram and Messenger conversations
              </CardDescription>
            </div>
            {user && pages.length > 0 && (
              <Button onClick={handleSyncPages} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Pages
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Sign in with Facebook to connect your pages</p>
              <Button onClick={handleConnectFacebook} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Facebook className="mr-2 h-4 w-4" />
                    Connect Facebook
                  </>
                )}
              </Button>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No pages connected yet. Sync your Facebook pages to get started.
              </p>
              <Button onClick={handleSyncPages}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Pages
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pages.map((page) => {
                const webhook = webhooks[page.page_id]
                const isWebhookActive = webhook?.is_active

                return (
                  <Card key={page.id} className="border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Facebook className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="font-semibold text-foreground">{page.page_name}</h3>
                              <p className="text-sm text-muted-foreground">Page ID: {page.page_id}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              {isWebhookActive ? (
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Webhook Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Webhook Not Configured
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-3 pt-2 border-t border-border">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                  <Label htmlFor={`messenger-${page.page_id}`} className="text-sm font-medium">
                                    Messenger
                                  </Label>
                                </div>
                                <Switch
                                  id={`messenger-${page.page_id}`}
                                  checked={page.messenger_enabled}
                                  onCheckedChange={(checked) =>
                                    handleTogglePlatform(page.page_id, "messenger", checked)
                                  }
                                />
                              </div>

                              {page.instagram_business_account_id && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Instagram className="h-4 w-4 text-muted-foreground" />
                                    <Label htmlFor={`instagram-${page.page_id}`} className="text-sm font-medium">
                                      Instagram DMs
                                    </Label>
                                  </div>
                                  <Switch
                                    id={`instagram-${page.page_id}`}
                                    checked={page.instagram_enabled}
                                    onCheckedChange={(checked) =>
                                      handleTogglePlatform(page.page_id, "instagram", checked)
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            {!isWebhookActive && (
                              <Alert>
                                <Webhook className="h-4 w-4" />
                                <AlertDescription className="flex items-center justify-between">
                                  <span className="text-sm">Setup webhook to receive messages automatically</span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSetupWebhook(page)}
                                    disabled={setupingWebhook === page.page_id}
                                  >
                                    {setupingWebhook === page.page_id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Setting up...
                                      </>
                                    ) : (
                                      <>
                                        <Webhook className="h-4 w-4 mr-2" />
                                        Setup Webhook
                                      </>
                                    )}
                                  </Button>
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDisconnectPage(page.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
