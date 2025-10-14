-- Complete MongoDB to Supabase migration
-- This migration adds missing tables and fields to match MongoDB models exactly

-- Create winners table (missing from current schema)
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id UUID NOT NULL REFERENCES public.promos(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  prize_description TEXT NOT NULL,
  prize_amount NUMERIC DEFAULT 0,
  drawn_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE,
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing fields to stores table to match MongoDB Store model
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS shopify_domain TEXT,
ADD COLUMN IF NOT EXISTS shopify_access_token TEXT,
ADD COLUMN IF NOT EXISTS shopify_store_id TEXT,
ADD COLUMN IF NOT EXISTS webhook_ids TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active' CHECK (billing_status IN ('active', 'cancelled', 'past_due')),
ADD COLUMN IF NOT EXISTS installed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS uninstalled_at TIMESTAMP WITH TIME ZONE;

-- Add missing fields to entries table to match MongoDB Entry model
ALTER TABLE public.entries 
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS entry_count INTEGER DEFAULT 1 CHECK (entry_count >= 1),
ADD COLUMN IF NOT EXISTS order_id TEXT,
ADD COLUMN IF NOT EXISTS order_total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS consent_brand BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_rafl BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false;

-- Add missing fields to api_keys table to match MongoDB ApiKey model
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{"read", "write"}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_winners_promo_id ON public.winners(promo_id);
CREATE INDEX IF NOT EXISTS idx_winners_store_id ON public.winners(store_id);
CREATE INDEX IF NOT EXISTS idx_winners_customer_email ON public.winners(customer_email);
CREATE INDEX IF NOT EXISTS idx_winners_drawn_at ON public.winners(drawn_at);
CREATE INDEX IF NOT EXISTS idx_entries_store_id ON public.entries(store_id);
CREATE INDEX IF NOT EXISTS idx_entries_customer_email ON public.entries(customer_email);
CREATE INDEX IF NOT EXISTS idx_entries_source ON public.entries(source);
CREATE INDEX IF NOT EXISTS idx_stores_shopify_domain ON public.stores(shopify_domain);

-- Add updated_at trigger for winners table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_winners_updated_at'
    ) THEN
        CREATE TRIGGER update_winners_updated_at
          BEFORE UPDATE ON public.winners
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Enable RLS on winners table
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for winners
CREATE POLICY "Store owners can manage their winners"
  ON public.winners FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = winners.store_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all winners"
  ON public.winners FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Update RLS policies for entries to include new fields
DROP POLICY IF EXISTS "Store owners can view their entries" ON public.entries;
CREATE POLICY "Store owners can view their entries"
  ON public.entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.promos p
    JOIN public.stores s ON s.id = p.store_id
    WHERE p.id = entries.promo_id AND s.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = entries.store_id AND s.user_id = auth.uid()
  ));

-- Add policy for entries insert/update/delete
CREATE POLICY "Store owners can manage their entries"
  ON public.entries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.promos p
    JOIN public.stores s ON s.id = p.store_id
    WHERE p.id = entries.promo_id AND s.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = entries.store_id AND s.user_id = auth.uid()
  ));

-- Update stores table RLS to include new fields
DROP POLICY IF EXISTS "Users can view their own stores" ON public.stores;
CREATE POLICY "Users can view their own stores"
  ON public.stores FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stores" ON public.stores;
CREATE POLICY "Users can insert their own stores"
  ON public.stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stores" ON public.stores;
CREATE POLICY "Users can update their own stores"
  ON public.stores FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own stores" ON public.stores;
CREATE POLICY "Users can delete their own stores"
  ON public.stores FOR DELETE
  USING (auth.uid() = user_id);

-- Add function to check if user has admin role (if not exists)
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND raw_user_meta_data->>'role' = role_name
  );
$$;

-- Add function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(raw_user_meta_data->>'role', 'merchant')::TEXT
  FROM auth.users 
  WHERE id = user_id;
$$;
