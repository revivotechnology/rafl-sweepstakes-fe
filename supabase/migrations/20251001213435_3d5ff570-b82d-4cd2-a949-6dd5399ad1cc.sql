-- Add function to calculate purchase-based entries
CREATE OR REPLACE FUNCTION public.calculate_purchase_entries(amount_usd NUMERIC)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT FLOOR(amount_usd)::INTEGER;
$$;

-- Add function to automatically create entries from purchases
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

-- Create trigger for automatic entry creation from purchases
DROP TRIGGER IF EXISTS trigger_create_entries_from_purchase ON public.purchases;
CREATE TRIGGER trigger_create_entries_from_purchase
AFTER INSERT OR UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.create_entries_from_purchase();

-- Add trigger to recalculate giveaway total_entries when participants change
CREATE OR REPLACE FUNCTION public.recalc_giveaway_total_entries()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.giveaways g
    SET total_entries = COALESCE((
      SELECT SUM(entry_count)::INT FROM public.participants p WHERE p.giveaway_id = g.id
    ), 0),
    updated_at = now()
  WHERE g.id = COALESCE(NEW.giveaway_id, OLD.giveaway_id);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_recalc_giveaway_entries ON public.participants;
CREATE TRIGGER trigger_recalc_giveaway_entries
AFTER INSERT OR UPDATE OR DELETE ON public.participants
FOR EACH ROW
EXECUTE FUNCTION public.recalc_giveaway_total_entries();