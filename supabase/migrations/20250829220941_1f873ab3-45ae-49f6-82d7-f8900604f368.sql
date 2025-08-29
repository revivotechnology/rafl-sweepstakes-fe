-- Restrict participant data visibility to store owners only
DROP POLICY IF EXISTS "Users can view relevant participants" ON public.participants;

CREATE POLICY "Only store owners can view participants"
ON public.participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.giveaways g
    JOIN public.stores s ON s.id = g.store_id
    WHERE g.id = participants.giveaway_id
      AND s.user_id = auth.uid()
  )
);
