-- Create stores table for RafflePool store owners
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_url TEXT,
  shopify_domain TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  monthly_revenue INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create giveaways table
CREATE TABLE public.giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prize_amount INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  entry_requirements JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  total_entries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create participants table for giveaway entries
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  entry_count INTEGER DEFAULT 1,
  source TEXT DEFAULT 'widget',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(giveaway_id, email)
);

-- Enable RLS on all tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Users can view their own store"
ON public.stores
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own store"
ON public.stores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own store"
ON public.stores
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for giveaways
CREATE POLICY "Store owners can view their giveaways"
ON public.giveaways
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = giveaways.store_id 
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Store owners can create giveaways"
ON public.giveaways
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = giveaways.store_id 
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Store owners can update their giveaways"
ON public.giveaways
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = giveaways.store_id 
    AND stores.user_id = auth.uid()
  )
);

-- RLS Policies for participants
CREATE POLICY "Store owners can view their participants"
ON public.participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.giveaways g
    INNER JOIN public.stores s ON g.store_id = s.id
    WHERE g.id = participants.giveaway_id
    AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can participate in giveaways"
ON public.participants
FOR INSERT
WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_giveaways_updated_at
  BEFORE UPDATE ON public.giveaways
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically create store profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.stores (user_id, store_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'store_name', 'My Store')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();