-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all agent configs" ON public.agent_config;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all facebook pages" ON public.facebook_pages;
DROP POLICY IF EXISTS "Admins can view all webhook subscriptions" ON public.webhook_subscriptions;

-- Create a security definer function to check admin status
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now recreate the admin policies using the function
-- Profiles: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Agent configs: Admins can view all configs
CREATE POLICY "Admins can view all agent configs"
  ON public.agent_config FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Conversations: Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Messages: Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    ) OR public.is_admin()
  );

-- Orders: Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Products: Admins can view all products
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Facebook pages: Admins can view all pages
CREATE POLICY "Admins can view all facebook pages"
  ON public.facebook_pages FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Webhook subscriptions: Admins can view all webhooks
CREATE POLICY "Admins can view all webhook subscriptions"
  ON public.webhook_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Update admin activity log policies to use the function
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_log;
DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.admin_activity_log;

CREATE POLICY "Admins can view activity logs"
  ON public.admin_activity_log FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert activity logs"
  ON public.admin_activity_log FOR INSERT
  WITH CHECK (public.is_admin());
