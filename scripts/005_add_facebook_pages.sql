-- Create table for storing connected Facebook pages
CREATE TABLE IF NOT EXISTS public.facebook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  page_access_token TEXT NOT NULL,
  instagram_business_account_id TEXT,
  messenger_enabled BOOLEAN DEFAULT true,
  instagram_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);

-- Enable RLS
ALTER TABLE public.facebook_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own Facebook pages"
  ON public.facebook_pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Facebook pages"
  ON public.facebook_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Facebook pages"
  ON public.facebook_pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Facebook pages"
  ON public.facebook_pages FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_facebook_pages_user_id ON public.facebook_pages(user_id);
CREATE INDEX idx_facebook_pages_page_id ON public.facebook_pages(page_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_facebook_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER facebook_pages_updated_at
  BEFORE UPDATE ON public.facebook_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_facebook_pages_updated_at();
