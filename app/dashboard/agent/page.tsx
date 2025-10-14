"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Save, Sparkles, Loader2, AlertCircle, Key } from "lucide-react"
import { useAgentConfig, useUpdateAgentConfig } from "@/lib/hooks/use-agent"
import type { AgentConfigInput } from "@/lib/validations/agent"
import { useToast } from "@/lib/hooks/use-toast"

export default function AgentConfigPage() {
  const { data: config, isLoading, error } = useAgentConfig()
  const updateConfig = useUpdateAgentConfig()
  const { toast } = useToast()

  const form = useForm<AgentConfigInput>({
    defaultValues: {
      systemPrompt: "",
      language: "ar",
      tone: "professional",
      personality: "",
      productKnowledge: [],
      autoRespond: true,
      orderConfirmation: true,
      followUp: true,
      escalation: true,
    },
  })

  useEffect(() => {
    if (config) {
      form.reset({
        systemPrompt: config.systemPrompt,
        language: config.language,
        tone: config.tone,
        personality: config.personality,
        productKnowledge: config.productKnowledge,
        autoRespond: config.autoRespond,
        orderConfirmation: config.orderConfirmation,
        followUp: config.followUp,
        escalation: config.escalation,
      })
    }
  }, [config, form])

  const onSubmit = (data: AgentConfigInput) => {
    // Basic validation
    if (!data.systemPrompt || data.systemPrompt.trim().length === 0) {
      toast({
        title: "Validation Error",
        description: "System prompt is required",
        variant: "destructive",
      })
      return
    }

    if (!data.language) {
      toast({
        title: "Validation Error",
        description: "Language is required",
        variant: "destructive",
      })
      return
    }

    updateConfig.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load configuration. Please try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Agent Configuration</h1>
          <p className="text-muted-foreground">Customize your AI sales agent's behavior and personality</p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} className="gap-2" disabled={updateConfig.isPending}>
          {updateConfig.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="personality" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="ai">AI Model</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          <TabsContent value="personality" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Agent Identity
                </CardTitle>
                <CardDescription>Define your AI agent's basic settings and personality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={form.watch("language")}
                    onValueChange={(value) => form.setValue("language", value as "ar" | "fr" | "en")}
                  >
                    <SelectTrigger id="language" className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Conversation Tone</Label>
                  <Select
                    value={form.watch("tone")}
                    onValueChange={(value) => form.setValue("tone", value as "professional" | "friendly" | "casual")}
                  >
                    <SelectTrigger id="tone" className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personality">Personality Description</Label>
                  <Textarea
                    id="personality"
                    placeholder="Describe your agent's personality..."
                    className="bg-secondary"
                    {...form.register("personality")}
                  />
                  <p className="text-sm text-muted-foreground">How should your agent present itself to customers?</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  System Prompt
                </CardTitle>
                <CardDescription>Define how your AI agent should behave and respond to customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">Instructions</Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="Enter system prompt..."
                    className="min-h-[200px] bg-secondary font-mono text-sm"
                    {...form.register("systemPrompt")}
                  />
                  <p className="text-sm text-muted-foreground">
                    This prompt guides your AI agent's behavior. Be specific about tone, goals, and constraints.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-secondary p-4">
                  <h4 className="mb-2 font-medium text-foreground">Prompt Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Define the agent's role and purpose clearly</li>
                    <li>• Specify language preferences and cultural context</li>
                    <li>• Include guidelines for handling objections</li>
                    <li>• Set boundaries for what the agent can and cannot do</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Gemini AI Configuration
                </CardTitle>
                <CardDescription>Configure your Gemini API settings for AI responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Get your Gemini API key from{" "}
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

                <div className="space-y-2">
                  <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                  <Input
                    id="geminiApiKey"
                    type="password"
                    placeholder="Enter your Gemini API key..."
                    className="bg-secondary font-mono"
                    {...form.register("geminiApiKey")}
                  />
                  <p className="text-sm text-muted-foreground">
                    Your API key is stored securely and only used for generating AI responses
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geminiModel">Gemini Model</Label>
                  <Select
                    value={form.watch("geminiModel") || "gemini-2.0-flash-exp"}
                    onValueChange={(value) => form.setValue("geminiModel", value)}
                  >
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
                    Choose the Gemini model that best fits your needs. Flash models are faster and more cost-effective.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Product Knowledge</CardTitle>
                <CardDescription>Configure how your agent understands and recommends products</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("productKnowledge")?.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                    {form.watch("productKnowledge")?.length === 0 && (
                      <p className="text-sm text-muted-foreground">No categories added yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Conversation Workflow</CardTitle>
                <CardDescription>Configure how your agent handles customer interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
                  <div className="space-y-1">
                    <Label htmlFor="autoRespond" className="font-medium">
                      Auto-respond to Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">Agent responds automatically to new messages</p>
                  </div>
                  <Switch
                    id="autoRespond"
                    checked={form.watch("autoRespond")}
                    onCheckedChange={(checked) => form.setValue("autoRespond", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
                  <div className="space-y-1">
                    <Label htmlFor="orderConfirmation" className="font-medium">
                      Order Confirmation
                    </Label>
                    <p className="text-sm text-muted-foreground">Require explicit confirmation before placing orders</p>
                  </div>
                  <Switch
                    id="orderConfirmation"
                    checked={form.watch("orderConfirmation")}
                    onCheckedChange={(checked) => form.setValue("orderConfirmation", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
                  <div className="space-y-1">
                    <Label htmlFor="followUp" className="font-medium">
                      Follow-up Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">Send follow-up messages to inactive conversations</p>
                  </div>
                  <Switch
                    id="followUp"
                    checked={form.watch("followUp")}
                    onCheckedChange={(checked) => form.setValue("followUp", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
                  <div className="space-y-1">
                    <Label htmlFor="escalation" className="font-medium">
                      Human Escalation
                    </Label>
                    <p className="text-sm text-muted-foreground">Allow agent to escalate complex issues to humans</p>
                  </div>
                  <Switch
                    id="escalation"
                    checked={form.watch("escalation")}
                    onCheckedChange={(checked) => form.setValue("escalation", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
