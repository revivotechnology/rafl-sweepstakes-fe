-- Fix infinite recursion in stores RLS policy
DROP POLICY IF EXISTS "Managers can view assigned stores" ON public.stores;

CREATE POLICY "Managers can view assigned stores" 
ON public.stores 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM store_members sm
    WHERE sm.store_id = stores.id AND sm.user_id = auth.uid()
  )
);