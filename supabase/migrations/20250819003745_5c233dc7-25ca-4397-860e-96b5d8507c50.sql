-- Expand stores SELECT visibility for admin and managers

-- Allow admins to view all stores
CREATE POLICY "Admins can view all stores"
  ON public.stores FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow managers to view assigned stores
CREATE POLICY "Managers can view assigned stores"
  ON public.stores FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.store_members sm WHERE sm.store_id = id AND sm.user_id = auth.uid()
  ));