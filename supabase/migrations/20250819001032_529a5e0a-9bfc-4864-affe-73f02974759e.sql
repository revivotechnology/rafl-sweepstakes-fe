-- Fix security warnings by setting search_path for functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.recalc_giveaway_total_entries() SET search_path = public;