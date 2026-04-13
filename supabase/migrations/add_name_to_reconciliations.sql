-- Add name field to reconciliations table
ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS name TEXT;
