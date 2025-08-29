-- Create waitlist table for beta giveaway email collection
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'website',
  utm_campaign TEXT,
  utm_source TEXT,
  utm_medium TEXT
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to join the waitlist (INSERT)
CREATE POLICY "Anyone can join waitlist" 
ON public.waitlist 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view waitlist emails
CREATE POLICY "Admins can view waitlist" 
ON public.waitlist 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for email lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);