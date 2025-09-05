-- Ensure RLS is enabled and tighten SELECT access on participants table
BEGIN;

-- Enable Row Level Security on participants (safe if already enabled)
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Remove any existing broad/select policies to avoid overlap
DROP POLICY IF EXISTS "Only store owners can view participants" ON public.participants;

-- Allow store owners to view only their own participants
CREATE POLICY "Store owners can view their participants"
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

-- Optionally allow admins to view all participants for audits/support
CREATE POLICY "Admins can view all participants"
ON public.participants
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

COMMIT;