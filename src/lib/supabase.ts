import { createClient } from '@supabase/supabase-js';

// Imported only by /admin (staff view). Public routes never ship supabase-js; the booking
// pipeline talks to Supabase REST with fetch on the server (src/lib/booking/channels.ts).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/** False when the public Supabase env isn't set (the client would only hit the placeholder host). */
export const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
