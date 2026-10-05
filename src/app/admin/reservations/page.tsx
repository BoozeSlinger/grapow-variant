'use client';

// FLAGGED (spec §18, H2): this staff view reads with the anon key from the client, so RLS returns
// nothing until auth and a server-side data path exist. Functionally unchanged otherwise.
import React, { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { formatClock, formatDateShort, laParts } from '@/lib/la-time';
import type { Reservation } from '@/types/reservations';

function laWhen(iso: string): string {
  const p = laParts(new Date(iso));
  return `${formatDateShort(p.dateISO)} · ${formatClock(p.minutes)} PT`;
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    async function fetchReservations() {
      const { data } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_time', { ascending: true });

      if (data) setReservations(data as Reservation[]);
      setLoading(false);
    }
    fetchReservations();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: status as Reservation['status'] } : r));
    }
  };

  return (
    <main>
      <h1 className="t-d2 mb-8">Incoming reservations</h1>

      {!supabaseConfigured ? (
        <p className="t-body text-fg-muted">Supabase isn&rsquo;t configured for this deployment.</p>
      ) : loading ? (
        <p className="t-body">Loading…</p>
      ) : reservations.length === 0 ? (
        <p className="t-body text-fg-muted">No reservations to show.</p>
      ) : (
        <div className="grid gap-4">
          {reservations.map(res => (
            <div key={res.id} className="bg-bg-raised border border-line p-6 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="t-title">{res.first_name} {res.last_name}</span>
                  <span className="t-label bg-yolk text-char px-2 py-0.5 rounded-sm">{res.party_size} guests</span>
                </div>
                <p className="t-small text-fg-muted tnum">
                  {laWhen(res.reservation_time)} · {res.phone}
                </p>
                {res.notes && <p className="t-small text-fg-muted mt-2">&ldquo;{res.notes}&rdquo;</p>}
              </div>

              <div className="flex gap-2">
                <label className="sr-only" htmlFor={`status-${res.id}`}>Status</label>
                <select
                  id={`status-${res.id}`}
                  value={res.status}
                  onChange={(e) => res.id && updateStatus(res.id, e.target.value)}
                  className="bg-bg border border-line t-label h-11 px-3 rounded-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Booked (confirmed)</option>
                  <option value="seated">Seated</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
