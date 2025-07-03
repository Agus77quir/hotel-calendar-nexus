-- Add missing fields to guests table
ALTER TABLE public.guests 
ADD COLUMN is_associated BOOLEAN DEFAULT false,
ADD COLUMN discount_percentage INTEGER DEFAULT 0;