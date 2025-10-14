"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/lib/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchPreferences()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
      }
    } catch (err) {
      console.error("Failed to load profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/user/preferences")
      const data = await response.json()
      if (data.success) {
        setPreferences(data.data)
      }
    } catch (err) {
      console.error("Failed to load preferences:", err)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: "Profile updated successfully" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    }
  }

  const handleSavePreferences = async () => {
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: "Preferences updated successfully" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update preferences", variant: "destructive" })
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={profile?.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={profile?.company_name || ""}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                className="bg-secondary"
              />
            </div>
            <Button className="w-full" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={preferences?.email_notifications ?? true}
                onCheckedChange={(checked) => setPreferences({ ...preferences, email_notifications: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">New Order Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified of new orders</p>
              </div>
              <Switch
                checked={preferences?.order_alerts ?? true}
                onCheckedChange={(checked) => setPreferences({ ...preferences, order_alerts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Conversation Alerts</p>
                <p className="text-sm text-muted-foreground">Alerts for new conversations</p>
              </div>
              <Switch
                checked={preferences?.conversation_alerts ?? true}
                onCheckedChange={(checked) => setPreferences({ ...preferences, conversation_alerts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Weekly Reports</p>
                <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
              </div>
              <Switch
                checked={preferences?.weekly_reports ?? false}
                onCheckedChange={(checked) => setPreferences({ ...preferences, weekly_reports: checked })}
              />
            </div>
            <Button className="w-full" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" className="bg-secondary" />
            </div>
            <Button className="w-full">Update Password</Button>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>Configure language and timezone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences?.language || "en"}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
              >
                <SelectTrigger id="language" className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={preferences?.timezone || "Africa/Tunis"}
                onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
              >
                <SelectTrigger id="timezone" className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Tunis">Africa/Tunis (GMT+1)</SelectItem>
                  <SelectItem value="Africa/Casablanca">Africa/Casablanca (GMT+1)</SelectItem>
                  <SelectItem value="Africa/Cairo">Africa/Cairo (GMT+2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={preferences?.currency || "TND"}
                onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
              >
                <SelectTrigger id="currency" className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TND">TND - Tunisian Dinar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
