-- Allow inserts into rooms_audit table for audit tracking
CREATE POLICY "Allow inserts into rooms_audit" 
ON public.rooms_audit 
FOR INSERT 
WITH CHECK (true);