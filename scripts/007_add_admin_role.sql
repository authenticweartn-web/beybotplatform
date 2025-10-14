-- Add role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Set user with ID matching the first user as admin
-- This will be user ID 1 in most cases, but we'll use a more flexible approach
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Get the first user ID (oldest created user)
  SELECT id INTO first_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Update their profile to admin if they exist
  IF first_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = first_user_id;
  END IF;
END $$;

-- Add admin policies to all tables
-- Profiles: Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Agent configs: Admins can view all configs
DROP POLICY IF EXISTS "Admins can view all agent configs" ON public.agent_config;
CREATE POLICY "Admins can view all agent configs"
  ON public.agent_config FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Conversations: Admins can view all conversations
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
CREATE POLICY "Admins can view all conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Messages: Admins can view all messages
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- Orders: Admins can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Products: Admins can view all products
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Facebook pages: Admins can view all pages
DROP POLICY IF EXISTS "Admins can view all facebook pages" ON public.facebook_pages;
CREATE POLICY "Admins can view all facebook pages"
  ON public.facebook_pages FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Webhook subscriptions: Admins can view all webhooks
DROP POLICY IF EXISTS "Admins can view all webhook subscriptions" ON public.webhook_subscriptions;
CREATE POLICY "Admins can view all webhook subscriptions"
  ON public.webhook_subscriptions FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin activity log
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view activity logs"
  ON public.admin_activity_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Only admins can insert activity logs
CREATE POLICY "Admins can insert activity logs"
  ON public.admin_activity_log FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON public.admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON public.admin_activity_log(created_at DESC);
