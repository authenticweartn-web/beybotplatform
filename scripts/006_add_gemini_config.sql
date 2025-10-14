-- Add Gemini API configuration to agent_config table
ALTER TABLE public.agent_config
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT,
ADD COLUMN IF NOT EXISTS gemini_model TEXT DEFAULT 'gemini-2.5-pro',
ADD COLUMN IF NOT EXISTS product_knowledge JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS order_confirmation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS follow_up BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS escalation BOOLEAN DEFAULT true;

-- Create table for webhook subscriptions
CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  verify_token TEXT NOT NULL,
  subscribed_fields TEXT[] DEFAULT ARRAY['messages', 'messaging_postbacks']::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);

-- Enable RLS on webhook_subscriptions
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_subscriptions
CREATE POLICY "Users can view their own webhook subscriptions"
  ON public.webhook_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own webhook subscriptions"
  ON public.webhook_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhook subscriptions"
  ON public.webhook_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhook subscriptions"
  ON public.webhook_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_user_id ON public.webhook_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_page_id ON public.webhook_subscriptions(page_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_webhook_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhook_subscriptions_updated_at
  BEFORE UPDATE ON public.webhook_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_subscriptions_updated_at();

-- Update conversations table to track platform source
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'messenger' CHECK (platform IN ('messenger', 'instagram')),
ADD COLUMN IF NOT EXISTS platform_conversation_id TEXT,
ADD COLUMN IF NOT EXISTS page_id TEXT;

-- Create index for platform lookups
CREATE INDEX IF NOT EXISTS idx_conversations_platform_id ON public.conversations(platform_conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_page_id ON public.conversations(page_id);
