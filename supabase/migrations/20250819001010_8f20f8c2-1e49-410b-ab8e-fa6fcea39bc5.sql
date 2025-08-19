-- Create enums
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'store_status') THEN
    CREATE TYPE public.store_status AS ENUM ('active', 'suspended');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'giveaway_status') THEN
    CREATE TYPE public.giveaway_status AS ENUM ('draft', 'active', 'completed');
  END IF;
END $$;

-- Stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  store_name TEXT NOT NULL,
  store_url TEXT NOT NULL,
  subscription_tier public.subscription_tier NOT NULL DEFAULT 'free',
  status public.store_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);

-- RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own stores" ON public.stores;
CREATE POLICY "Users can view their own stores"
  ON public.stores FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stores" ON public.stores;
CREATE POLICY "Users can insert their own stores"
  ON public.stores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stores" ON public.stores;
CREATE POLICY "Users can update their own stores"
  ON public.stores FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own stores" ON public.stores;
CREATE POLICY "Users can delete their own stores"
  ON public.stores FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Giveaways table
CREATE TABLE IF NOT EXISTS public.giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prize_amount INTEGER NOT NULL DEFAULT 0,
  status public.giveaway_status NOT NULL DEFAULT 'draft',
  total_entries INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_giveaways_store_id ON public.giveaways(store_id);

-- RLS
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view their giveaways" ON public.giveaways;
CREATE POLICY "Owners can view their giveaways"
  ON public.giveaways FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can insert giveaways" ON public.giveaways;
CREATE POLICY "Owners can insert giveaways"
  ON public.giveaways FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can update their giveaways" ON public.giveaways;
CREATE POLICY "Owners can update their giveaways"
  ON public.giveaways FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can delete their giveaways" ON public.giveaways;
CREATE POLICY "Owners can delete their giveaways"
  ON public.giveaways FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()
  ));

-- Participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  entry_count INTEGER NOT NULL DEFAULT 1 CHECK (entry_count >= 1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_participants_giveaway_id ON public.participants(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);

-- RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view participants" ON public.participants;
CREATE POLICY "Owners can view participants"
  ON public.participants FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.giveaways g
    JOIN public.stores s ON s.id = g.store_id
    WHERE g.id = giveaway_id AND s.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can insert participants" ON public.participants;
CREATE POLICY "Owners can insert participants"
  ON public.participants FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.giveaways g
    JOIN public.stores s ON s.id = g.store_id
    WHERE g.id = giveaway_id AND s.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can update participants" ON public.participants;
CREATE POLICY "Owners can update participants"
  ON public.participants FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.giveaways g
    JOIN public.stores s ON s.id = g.store_id
    WHERE g.id = giveaway_id AND s.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can delete participants" ON public.participants;
CREATE POLICY "Owners can delete participants"
  ON public.participants FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.giveaways g
    JOIN public.stores s ON s.id = g.store_id
    WHERE g.id = giveaway_id AND s.user_id = auth.uid()
  ));

-- Updated_at helper function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trg_update_stores_updated_at ON public.stores;
CREATE TRIGGER trg_update_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_giveaways_updated_at ON public.giveaways;
CREATE TRIGGER trg_update_giveaways_updated_at
BEFORE UPDATE ON public.giveaways
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Keep giveaways.total_entries in sync
CREATE OR REPLACE FUNCTION public.recalc_giveaway_total_entries()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.giveaways g
    SET total_entries = COALESCE((
      SELECT SUM(entry_count)::INT FROM public.participants p WHERE p.giveaway_id = g.id
    ), 0),
    updated_at = now()
  WHERE g.id = COALESCE(NEW.giveaway_id, OLD.giveaway_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_participants_after_insert ON public.participants;
CREATE TRIGGER trg_participants_after_insert
AFTER INSERT ON public.participants
FOR EACH ROW EXECUTE FUNCTION public.recalc_giveaway_total_entries();

DROP TRIGGER IF EXISTS trg_participants_after_update ON public.participants;
CREATE TRIGGER trg_participants_after_update
AFTER UPDATE ON public.participants
FOR EACH ROW EXECUTE FUNCTION public.recalc_giveaway_total_entries();

DROP TRIGGER IF EXISTS trg_participants_after_delete ON public.participants;
CREATE TRIGGER trg_participants_after_delete
AFTER DELETE ON public.participants
FOR EACH ROW EXECUTE FUNCTION public.recalc_giveaway_total_entries();