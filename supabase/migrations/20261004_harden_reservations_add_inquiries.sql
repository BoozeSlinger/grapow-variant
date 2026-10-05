-- Harden the public booking table and add the inquiries table the event form posts to.
-- Visitors (anon) may only CREATE pending rows; they can never read, change or delete them.

-- Field limits (the server validates too; this is the backstop for direct API calls)
ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_party_size_check CHECK (party_size BETWEEN 1 AND 20),
  ADD CONSTRAINT reservations_first_name_len  CHECK (char_length(first_name) BETWEEN 1 AND 80),
  ADD CONSTRAINT reservations_last_name_len   CHECK (char_length(last_name) <= 80),
  ADD CONSTRAINT reservations_email_len       CHECK (char_length(email) BETWEEN 3 AND 254),
  ADD CONSTRAINT reservations_phone_len       CHECK (char_length(phone) BETWEEN 7 AND 32),
  ADD CONSTRAINT reservations_notes_len       CHECK (notes IS NULL OR char_length(notes) <= 1000);

-- Explicit grants instead of relying on platform defaults
REVOKE ALL ON public.reservations FROM anon, authenticated;
GRANT INSERT ON public.reservations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;

DROP POLICY "reservations_public_insert" ON public.reservations;
CREATE POLICY "reservations_public_insert"
  ON public.reservations FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

DROP POLICY "reservations_staff_all" ON public.reservations;
CREATE POLICY "reservations_staff_all"
  ON public.reservations FOR ALL
  TO authenticated
  USING (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('staff', 'admin'))
  WITH CHECK (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('staff', 'admin'));

-- Event / group inquiries (posted by /api/inquiry)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 80),
  last_name   TEXT NOT NULL DEFAULT '' CHECK (char_length(last_name) <= 80),
  email       TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  phone       TEXT NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 32),
  message     TEXT CHECK (message IS NULL OR char_length(message) <= 2000),
  type        TEXT NOT NULL DEFAULT 'general_inquiry' CHECK (char_length(type) <= 40),
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.inquiries FROM anon, authenticated;
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;

CREATE POLICY "inquiries_public_insert"
  ON public.inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'new');

CREATE POLICY "inquiries_staff_all"
  ON public.inquiries FOR ALL
  TO authenticated
  USING (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('staff', 'admin'))
  WITH CHECK (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') IN ('staff', 'admin'));
