# Implementation Plan - Reservations

Add a premium, high-aesthetic reservation system to Gra Pow Riverside.

## Task 1: Supabase Setup (COMPLETED)
**Files:** `supabase/migrations/20260411_reservations.sql`

[x] **Step 1: Create the reservations table.** Use the schema from the reference repo, but tailor it for a single-location restaurant.
[x] **Step 2: Add RLS policies.** Allow public (anon) inserts for guest reservations and authenticated/staff reads.

## Task 2: Core Infrastructure (COMPLETED)
**Files:** `src/lib/supabase.ts`, `src/types/supabase.ts`, `src/store/useReservationStore.ts`

[x] **Step 1: Install dependencies.** `npm install @supabase/supabase-js zustand`.
[x] **Step 2: Configure Supabase client.** 
[x] **Step 3: Define types.** 
[x] **Step 4: Create the Zustand store.** Manage party size, date, time selection status.

## Task 3: Premium UI Components (COMPLETED)
**Files:** `src/components/reservations/GlassCard.tsx`, `src/components/reservations/PartySelector.tsx`, `src/components/reservations/DateTimePicker.tsx`

[x] **Step 1: Build the GlassCard component.** Uses `liquid glass` (blur, subtle border, shine).
[x] **Step 2: Build the PartySelector.** Staggered entrance for guest count buttons.
[x] **Step 3: Build the DateTimePicker.** Custom elegant grid for time slots.

## Task 4: Reservation Page (COMPLETED)
**Files:** `src/app/reservations/page.tsx`

[x] **Step 1: Implement the multi-step reservation flow.**
    - Step 1: Party Size + Date/Time.
    - Step 2: Contact Info.
    - Step 3: Success Confirmation with "analog noise" background.

## Task 5: Site Integration (COMPLETED)
**Files:** `src/components/Header.tsx`, `src/components/Footer.tsx`

[x] **Step 1: Add "Book a Table" to navigation.**
[x] **Step 2: Add Reservation link to footer.**

---

## Task 1: Supabase Setup

### Step 1: Migration
```sql
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
```

### Step 2: Commit
`git commit -m "feat: add reservations schema and RLS policies"`
