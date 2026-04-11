'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GlassCard } from '@/components/reservations/GlassCard';
import { PartySelector } from '@/components/reservations/PartySelector';
import { DateTimePicker } from '@/components/reservations/DateTimePicker';
import { ContactForm } from '@/components/reservations/ContactForm';
import { useReservationStore } from '@/store/useReservationStore';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReservationsPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const store = useReservationStore();

  const handleNext = () => {
    if (step === 1 && store.date && store.time) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Failed to book reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#111] overflow-hidden">
      <Header />
      
      {/* Background aesthetics */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#111]" />
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-30" />
        <div className="grain-overlay opacity-[0.1]" />
      </div>

      <div className="relative z-10 pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6 uppercase"
          >
            Reservations
          </motion.h1>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-px w-32 bg-gold mx-auto mb-8 origin-center"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[10px] text-gold font-bold tracking-[0.4em] uppercase"
          >
            Riverside Dining Experience
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <GlassCard className="!p-6 md:!p-12">
                <div className="space-y-12">
                  {step === 1 ? (
                    <>
                      <PartySelector />
                      <div className="h-px bg-white/10" />
                      <DateTimePicker />
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={handleNext}
                          disabled={!store.date || !store.time}
                          className="btn-glow w-full md:w-auto disabled:opacity-30 disabled:grayscale transition-all duration-500"
                        >
                          CONTINUE TO DETAILS
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2 mb-8">
                        <h2 className="text-sm font-bold tracking-[0.2em] text-white uppercase italic">
                          Booking for {store.partySize} guests
                        </h2>
                        <p className="text-xs text-white/40">
                          {store.date?.toDateString()} at {store.time}
                        </p>
                      </div>
                      <ContactForm />
                      <div className="flex flex-col-reverse md:flex-row gap-6 justify-between pt-10 border-t border-white/10">
                        <button
                          onClick={() => setStep(1)}
                          className="text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase hover:text-white transition-colors py-4 md:py-0"
                        >
                          ← BACK TO SELECTION
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
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <GlassCard className="py-20">
                <div className="space-y-8">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    className="w-24 h-24 bg-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(232,160,0,0.5)]"
                  >
                    <svg className="w-12 h-12 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-widest uppercase italic">Confirmed</h2>
                  <div className="space-y-4 max-w-sm mx-auto text-white/60 text-sm leading-relaxed">
                    <p>
                      Thank you, <span className="text-white">{store.firstName}</span>. Your table for <span className="text-white">{store.partySize}</span> is scheduled.
                    </p>
                    <p className="text-xs tracking-wider border-y border-white/10 py-4 my-6">
                      {store.date?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} @ {store.time}
                    </p>
                    <p>A confirmation has been sent to {store.email}.</p>
                  </div>
                  <div className="pt-10">
                    <button
                      onClick={() => window.location.href = '/'}
                      className="btn-outline min-w-[200px]"
                    >
                      RETURN HOME
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Footer />
    </main>
  );
}
