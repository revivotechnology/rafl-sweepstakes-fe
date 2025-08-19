-- Create user roles and enhanced analytics system (Fixed)

-- Create app_role enum for users
CREATE TYPE public.app_role AS ENUM ('admin', 'store_manager', 'store_owner');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'store_owner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Store members table (many-to-many for managers)
CREATE TABLE public.store_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'store_manager',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- Enable RLS
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for store_members
CREATE POLICY "Store owners can manage their store members"
  ON public.store_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Store managers can view their assignments"
  ON public.store_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all store members"
  ON public.store_members FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Shopify shops table
CREATE TABLE public.shopify_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  access_token TEXT,
  webhook_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_domain)
);

-- Enable RLS
ALTER TABLE public.shopify_shops ENABLE ROW LEVEL SECURITY;

-- RLS policies for shopify_shops
CREATE POLICY "Store owners can manage their shopify shops"
  ON public.shopify_shops FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Store managers can view assigned shopify shops"
  ON public.shopify_shops FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.store_members sm 
    JOIN public.stores s ON s.id = sm.store_id 
    WHERE s.id = store_id AND sm.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all shopify shops"
  ON public.shopify_shops FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Purchases table for Shopify order data
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_shop_id UUID NOT NULL REFERENCES public.shopify_shops(id) ON DELETE CASCADE,
  shopify_order_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total_amount_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shopify_shop_id, shopify_order_id)
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for purchases
CREATE POLICY "Store owners can view their purchases"
  ON public.purchases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.shopify_shops ss
    JOIN public.stores s ON s.id = ss.store_id
    WHERE ss.id = shopify_shop_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Store managers can view assigned store purchases"
  ON public.purchases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.shopify_shops ss
    JOIN public.store_members sm ON sm.store_id = ss.store_id
    WHERE ss.id = shopify_shop_id AND sm.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all purchases"
  ON public.purchases FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add purchase tracking to participants table
ALTER TABLE public.participants 
ADD COLUMN purchase_id UUID REFERENCES public.purchases(id),
ADD COLUMN entry_type TEXT NOT NULL DEFAULT 'no_purchase_necessary' CHECK (entry_type IN ('no_purchase_necessary', 'purchase'));

-- Create unique constraint for one entry per email per giveaway (will handle NPN logic in app)
CREATE UNIQUE INDEX idx_participants_giveaway_email ON public.participants(giveaway_id, email);

-- Function to calculate purchase entries
CREATE OR REPLACE FUNCTION public.calculate_purchase_entries(amount_usd DECIMAL)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
SET search_path = public
AS $$
  SELECT FLOOR(amount_usd)::INTEGER;
$$;

-- Trigger to auto-create entries from purchases
CREATE OR REPLACE FUNCTION public.create_entries_from_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  giveaway_record RECORD;
  entry_count INTEGER;
BEGIN
  -- Find active giveaways for this shop during the purchase date
  FOR giveaway_record IN 
    SELECT g.id, g.store_id
    FROM public.giveaways g
    JOIN public.shopify_shops ss ON ss.store_id = g.store_id
    WHERE ss.id = NEW.shopify_shop_id
      AND g.status = 'active'
      AND (g.start_date IS NULL OR NEW.order_date >= g.start_date)
      AND (g.end_date IS NULL OR NEW.order_date <= g.end_date)
  LOOP
    -- Calculate entries (floor of USD amount)
    entry_count := public.calculate_purchase_entries(NEW.total_amount_usd);
    
    -- Insert or update participant entry
    INSERT INTO public.participants (giveaway_id, email, entry_count, purchase_id, entry_type)
    VALUES (giveaway_record.id, NEW.customer_email, entry_count, NEW.id, 'purchase')
    ON CONFLICT (giveaway_id, email) DO UPDATE SET
      entry_count = GREATEST(participants.entry_count, entry_count),
      purchase_id = CASE WHEN NEW.total_amount_usd > COALESCE((SELECT total_amount_usd FROM public.purchases WHERE id = participants.purchase_id), 0) THEN NEW.id ELSE participants.purchase_id END,
      entry_type = 'purchase';
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for purchase entries
CREATE TRIGGER trg_create_entries_from_purchase
  AFTER INSERT ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.create_entries_from_purchase();

-- Update admin and manager RLS policies for broader access
DROP POLICY "Owners can view their giveaways" ON public.giveaways;
CREATE POLICY "Users can view their relevant giveaways"
  ON public.giveaways FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.store_members sm WHERE sm.store_id = store_id AND sm.user_id = auth.uid()
    )
  );

DROP POLICY "Owners can view participants" ON public.participants;
CREATE POLICY "Users can view relevant participants"
  ON public.participants FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.giveaways g
      JOIN public.stores s ON s.id = g.store_id
      WHERE g.id = giveaway_id AND s.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.giveaways g
      JOIN public.store_members sm ON sm.store_id = g.store_id
      WHERE g.id = giveaway_id AND sm.user_id = auth.uid()
    )
  );

-- Insert admin role for bjd.boggs@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'bjd.boggs@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Add indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_store_members_store_id ON public.store_members(store_id);
CREATE INDEX idx_store_members_user_id ON public.store_members(user_id);
CREATE INDEX idx_shopify_shops_store_id ON public.shopify_shops(store_id);
CREATE INDEX idx_purchases_shopify_shop_id ON public.purchases(shopify_shop_id);
CREATE INDEX idx_purchases_customer_email ON public.purchases(customer_email);
CREATE INDEX idx_purchases_order_date ON public.purchases(order_date);
CREATE INDEX idx_participants_purchase_id ON public.participants(purchase_id);

-- Add updated_at trigger for shopify_shops
CREATE TRIGGER trg_update_shopify_shops_updated_at
  BEFORE UPDATE ON public.shopify_shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();