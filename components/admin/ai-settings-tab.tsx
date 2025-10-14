"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"

interface SystemSetting {
  id: string
  setting_key: string
  setting_value: string | null
  description: string
}

export function AISettingsTab() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash-exp")
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/system-settings")
      const data = await response.json()

      if (data.success) {
        setSettings(data.data)
        const apiKeySetting = data.data.find((s: SystemSetting) => s.setting_key === "gemini_api_key")
        const modelSetting = data.data.find((s: SystemSetting) => s.setting_key === "gemini_model")

        if (apiKeySetting) setGeminiApiKey(apiKeySetting.setting_value || "")
        if (modelSetting) setGeminiModel(modelSetting.setting_value || "gemini-2.0-flash-exp")
      }
    } catch (error) {
      console.error("[v0] Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load AI settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Save API key
      const apiKeyResponse = await fetch("/api/admin/system-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settingKey: "gemini_api_key",
          settingValue: geminiApiKey,
        }),
      })

      // Save model
      const modelResponse = await fetch("/api/admin/system-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settingKey: "gemini_model",
          settingValue: geminiModel,
        }),
      })

      if (apiKeyResponse.ok && modelResponse.ok) {
        toast({
          title: "Success",
          description: "AI settings updated successfully",
        })
        fetchSettings()
      } else {
        throw new Error("Failed to update settings")
      }
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save AI settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          AI Model Configuration
        </CardTitle>
        <CardDescription>Configure Gemini API settings for all users (Admin Only)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These settings apply to all users on the platform. Get your Gemini API key from{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google AI Studio
            </a>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="geminiApiKey">Gemini API Key</Label>
            <Input
              id="geminiApiKey"
              type="password"
              placeholder="Enter Gemini API key..."
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="bg-secondary font-mono"
            />
            <p className="text-sm text-muted-foreground">
              This API key will be used for all AI responses across the platform
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="geminiModel">Gemini Model</Label>
            <Select value={geminiModel} onValueChange={setGeminiModel}>
              <SelectTrigger id="geminiModel" className="bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose the Gemini model for AI responses. Flash models are faster and more cost-effective.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save AI Settings
              </>
            )}
          </Button>

          {geminiApiKey && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Gemini API key is configured and ready to use</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
