-- Create the reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_size       INTEGER NOT NULL,
  reservation_time TIMESTAMPTZ NOT NULL,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CONSTRAINT reservations_status_check
                     CHECK (status IN ('pending', 'confirmed', 'cancelled', 'seated', 'no_show')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_time ON public.reservations(reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON public.reservations(email);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "reservations_public_insert" 
  ON public.reservations FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "reservations_staff_all" 
  ON public.reservations FOR ALL 
  TO authenticated 
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('staff', 'admin')
  );
