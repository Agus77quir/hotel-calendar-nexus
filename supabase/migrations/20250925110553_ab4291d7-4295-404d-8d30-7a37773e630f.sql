-- Enable RLS on all main tables
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations_audit ENABLE ROW LEVEL SECURITY;

-- Create public access policies for the main application tables
-- Guests table - allow public read/write
CREATE POLICY "Public access" ON public.guests FOR ALL USING (true) WITH CHECK (true);

-- Rooms table - allow public read/write
CREATE POLICY "Public access" ON public.rooms FOR ALL USING (true) WITH CHECK (true);

-- Reservations table - allow public read/write
CREATE POLICY "Public access" ON public.reservations FOR ALL USING (true) WITH CHECK (true);

-- Audit tables - allow public read access only for transparency
CREATE POLICY "Public read access" ON public.guests_audit FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.rooms_audit FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.reservations_audit FOR SELECT USING (true);