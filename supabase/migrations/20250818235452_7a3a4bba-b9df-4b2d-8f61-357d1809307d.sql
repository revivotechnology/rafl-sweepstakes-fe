-- Minimal base function and table to initialize Supabase types for the project
-- Create update_updated_at_column() helper if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a lightweight app_meta table to bootstrap schema/types
CREATE TABLE IF NOT EXISTS public.app_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'RafflePool',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to keep updated_at fresh
DROP TRIGGER IF EXISTS update_app_meta_updated_at ON public.app_meta;
CREATE TRIGGER update_app_meta_updated_at
BEFORE UPDATE ON public.app_meta
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS and set safe, public read-only access
ALTER TABLE public.app_meta ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplicates
DROP POLICY IF EXISTS "App meta is readable by everyone" ON public.app_meta;
DROP POLICY IF EXISTS "Restrict inserts on app_meta" ON public.app_meta;
DROP POLICY IF EXISTS "Restrict updates on app_meta" ON public.app_meta;
DROP POLICY IF EXISTS "Restrict deletes on app_meta" ON public.app_meta;

-- Allow read for everyone (no auth required)
CREATE POLICY "App meta is readable by everyone"
ON public.app_meta
FOR SELECT
USING (true);

-- Disallow writes for now until auth is implemented
CREATE POLICY "Restrict inserts on app_meta"
ON public.app_meta
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Restrict updates on app_meta"
ON public.app_meta
FOR UPDATE
USING (false);

CREATE POLICY "Restrict deletes on app_meta"
ON public.app_meta
FOR DELETE
USING (false);