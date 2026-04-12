"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './reservations/GlassCard';
import { PartySelector } from './reservations/PartySelector';
import { DateTimePicker } from './reservations/DateTimePicker';
import { ContactForm } from './reservations/ContactForm';
import { useReservationStore } from '@/store/useReservationStore';
import { supabase } from '@/lib/supabase';

export default function ReservationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const store = useReservationStore();

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setStep(1);
      setSuccess(false);
    };
    window.addEventListener("open-reservation", handleOpen);
    return () => window.removeEventListener("open-reservation", handleOpen);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step === 1 && store.date && store.time) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!store.firstName || !store.email || !store.phone) return;
    
    setLoading(true);
    try {
      if (!store.date || !store.time) return;
      
      const [hours, minutes] = store.time.split(':');
      const reservationTime = new Date(store.date);
      reservationTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase.from('reservations').insert({
        party_size: store.partySize,
        reservation_time: reservationTime.toISOString(),
        first_name: store.firstName,
        last_name: store.lastName,
        email: store.email,
        phone: store.phone,
        notes: store.notes,
      });

      if (error) throw error;

      // Trigger notification
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_reservation',
          data: {
            party_size: store.partySize,
            reservation_time: reservationTime.toISOString(),
            first_name: store.firstName,
            last_name: store.lastName,
            email: store.email,
            phone: store.phone,
            notes: store.notes,
          }
        })
      }).catch(err => console.error('Failed to trigger notification:', err));

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to book reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#111] overflow-hidden rounded-3xl border border-white/10"
          >
            <div className="absolute top-6 right-6 z-20">
              <button 
                onClick={handleClose}
                className="p-2 text-white/40 hover:text-white transition-colors"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[85vh] overflow-y-auto p-6 md:p-12">
              {!success ? (
                <div className="space-y-12">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white tracking-widest uppercase italic mb-2">Book a Table</h2>
                    <p className="text-[10px] text-gold font-bold tracking-[0.4em] uppercase">Riverside Dining Experience</p>
                  </div>

                  {step === 1 ? (
                    <>
                      <PartySelector />
                      <div className="h-px bg-white/10" />
                      <DateTimePicker />
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={handleNext}
                          disabled={!store.date || !store.time}
                          className="btn-glow w-full disabled:opacity-30 disabled:grayscale transition-all duration-500"
                        >
                          CONTINUE TO DETAILS
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2 mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic">
                          Booking for {store.partySize} guests
                        </h3>
                        <p className="text-[10px] text-white/40 tracking-widest">
                          {store.date?.toDateString()} at {store.time}
                        </p>
                      </div>
                      <ContactForm />
                      <div className="flex flex-col-reverse md:flex-row gap-6 justify-between pt-10 border-t border-white/10">
                        <button
                          onClick={() => setStep(1)}
                          className="text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase hover:text-white transition-colors py-4 md:py-0"
                        >
                          ← BACK
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={loading || !store.firstName || !store.email || !store.phone}
                          className="btn-glow min-w-[240px]"
                        >
                          {loading ? 'BOOKING...' : 'CONFIRM RESERVATION'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(232,160,0,0.5)]"
                  >
                    <svg className="w-10 h-10 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white tracking-widest uppercase italic mb-4">Confirmed</h2>
                  <div className="space-y-4 max-w-sm mx-auto text-white/60 text-sm leading-relaxed">
                    <p>
                      Thank you, <span className="text-white">{store.firstName}</span>. Your table for <span className="text-white">{store.partySize}</span> is scheduled.
                    </p>
                    <p className="text-xs tracking-wider border-y border-white/10 py-4 my-6 uppercase">
                      {store.date?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} @ {store.time}
                    </p>
                    <p>A confirmation email has been sent.</p>
                  </div>
                  <div className="pt-10">
                    <button
                      onClick={handleClose}
                      className="btn-outline w-full"
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="grain-overlay opacity-[0.05] pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
