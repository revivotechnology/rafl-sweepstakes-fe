-- Create enums for entry sources and promo status
CREATE TYPE entry_source AS ENUM ('klaviyo', 'mailchimp', 'aweber', 'sendgrid', 'amoe', 'purchase', 'direct');
CREATE TYPE promo_status AS ENUM ('draft', 'active', 'paused', 'ended');

-- Promos/Giveaways configuration table
CREATE TABLE public.promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prize_description TEXT NOT NULL,
  prize_amount NUMERIC NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status promo_status NOT NULL DEFAULT 'draft',
  rules_text TEXT,
  amoe_instructions TEXT,
  eligibility_text TEXT,
  max_entries_per_email INTEGER DEFAULT 1,
  max_entries_per_ip INTEGER DEFAULT 5,
  enable_purchase_entries BOOLEAN DEFAULT false,
  entries_per_dollar INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Entries table (hashed emails for privacy)
CREATE TABLE public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id UUID NOT NULL REFERENCES public.promos(id) ON DELETE CASCADE,
  hashed_email TEXT NOT NULL,
  source entry_source NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Consent logs (immutable audit trail)
CREATE TABLE public.consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
  consent_brand BOOLEAN NOT NULL DEFAULT false,
  consent_rafl BOOLEAN NOT NULL DEFAULT false,
  consent_text TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API keys for merchant authentication
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default Key',
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_promos_store_id ON public.promos(store_id);
CREATE INDEX idx_promos_status ON public.promos(status);
CREATE INDEX idx_entries_promo_id ON public.entries(promo_id);
CREATE INDEX idx_entries_hashed_email ON public.entries(hashed_email);
CREATE INDEX idx_entries_created_at ON public.entries(created_at);
CREATE INDEX idx_consent_logs_entry_id ON public.consent_logs(entry_id);
CREATE INDEX idx_api_keys_store_id ON public.api_keys(store_id);
CREATE INDEX idx_api_keys_key_prefix ON public.api_keys(key_prefix);

-- Trigger for updated_at
CREATE TRIGGER update_promos_updated_at
  BEFORE UPDATE ON public.promos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promos
CREATE POLICY "Store owners can manage their promos"
  ON public.promos FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = promos.store_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Store managers can view assigned store promos"
  ON public.promos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.store_members sm
    WHERE sm.store_id = promos.store_id AND sm.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all promos"
  ON public.promos FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for entries
CREATE POLICY "Store owners can view their entries"
  ON public.entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.promos p
    JOIN public.stores s ON s.id = p.store_id
    WHERE p.id = entries.promo_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Store managers can view assigned store entries"
  ON public.entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.promos p
    JOIN public.store_members sm ON sm.store_id = p.store_id
    WHERE p.id = entries.promo_id AND sm.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all entries"
  ON public.entries FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for consent_logs
CREATE POLICY "Store owners can view their consent logs"
  ON public.consent_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.entries e
    JOIN public.promos p ON p.id = e.promo_id
    JOIN public.stores s ON s.id = p.store_id
    WHERE e.id = consent_logs.entry_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all consent logs"
  ON public.consent_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for api_keys
CREATE POLICY "Store owners can manage their API keys"
  ON public.api_keys FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = api_keys.store_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all API keys"
  ON public.api_keys FOR SELECT
  USING (has_role(auth.uid(), 'admin'));