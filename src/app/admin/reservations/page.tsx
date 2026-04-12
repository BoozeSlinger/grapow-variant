'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function AdminReservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservations() {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_time', { ascending: true });
      
      if (data) setReservations(data);
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
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-32 px-6">
      <Header />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 uppercase tracking-tighter italic">Incoming Reservations</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-4">
            {reservations.map(res => (
              <div key={res.id} className="bg-white/5 border border-white/10 p-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl font-bold">{res.first_name} {res.last_name}</span>
                    <span className="text-[10px] bg-gold text-black px-2 py-0.5 font-bold uppercase tracking-widest">{res.party_size} GUESTS</span>
                  </div>
                  <p className="text-white/60 text-sm">
                    {new Date(res.reservation_time).toLocaleString()} • {res.phone}
                  </p>
                  {res.notes && <p className="text-white/40 text-xs mt-2 italic">"{res.notes}"</p>}
                </div>

                <div className="flex gap-2">
                  <select 
                    value={res.status}
                    onChange={(e) => updateStatus(res.id, e.target.value)}
                    className="bg-black border border-white/20 text-xs p-2 uppercase tracking-widest"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="seated">Seated</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
