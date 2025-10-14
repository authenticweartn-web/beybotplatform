-- Add order details and product relationships

-- Create order_items table for detailed order line items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add additional order fields
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax DECIMAL(10, 2) DEFAULT 0;

-- Add user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Africa/Tunis',
  currency TEXT DEFAULT 'TND',
  email_notifications BOOLEAN DEFAULT true,
  order_alerts BOOLEAN DEFAULT true,
  conversation_alerts BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
