// Zod schemas for AI agent configuration validation

import { z } from "zod"

export const agentConfigSchema = z.object({
  systemPrompt: z.string().min(10, "System prompt must be at least 10 characters"),
  language: z.enum(["ar", "fr", "en"]),
  tone: z.enum(["professional", "friendly", "casual"]),
  personality: z.string().min(10, "Personality description must be at least 10 characters"),
  productKnowledge: z.array(z.string()),
  autoRespond: z.boolean(),
  orderConfirmation: z.boolean(),
  followUp: z.boolean(),
  escalation: z.boolean(),
  geminiApiKey: z.string().optional(),
  geminiModel: z.string().optional(),
})

export type AgentConfigInput = z.infer<typeof agentConfigSchema>
