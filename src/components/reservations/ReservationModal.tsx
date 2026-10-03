"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { PartySelector } from './PartySelector';
import { DateTimePicker } from './DateTimePicker';
import { ContactForm } from './ContactForm';
import { useReservationStore } from '@/store/useReservationStore';
import { supabase } from '@/lib/supabase';
import EventbriteWidget from './EventbriteWidget';

export default function ReservationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'dinner' | 'event'>('dinner');
  const store = useReservationStore();

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      setStep(1);
      setSuccess(false);
      if (e.detail?.type) setType(e.detail.type);
    };
    window.addEventListener("open-reservation", handleOpen);
    return () => window.removeEventListener("open-reservation", handleOpen);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNext = () => {
    if (type === 'dinner') {
      if (store.date && store.time) setStep(2);
    } else {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!store.firstName || !store.email || !store.phone) return;
    
    setLoading(true);
    try {
      if (type === 'dinner') {
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
      } else {
        await fetch('/api/inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: store.firstName,
            lastName: store.lastName,
            email: store.email,
            phone: store.phone,
            notes: store.notes,
            type: 'event_interest',
          })
        });
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden text-white">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,1)]"
          >
            <div className="absolute top-8 right-8 z-30">
              <button 
                onClick={handleClose}
                className="p-3 bg-white/5 hover:bg-gold hover:text-black rounded-full text-white/40 transition-all duration-300"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[90vh] overflow-y-auto px-6 py-12 md:p-16">
              {!success ? (
                <div className="space-y-12">
                  <div className="text-center">
                    <p className="text-gold font-black tracking-[0.5em] uppercase text-[9px] mb-4">Riverside, CA</p>
                    <h2 className="text-5xl md:text-6xl font-[family-name:var(--font-dancing)] text-white mb-8">
                      {type === 'dinner' ? 'Reserve a Table' : 'Event Inquiry'}
                    </h2>
                    
                    <div className="inline-flex p-1 bg-white/5 rounded-full border border-white/10 mb-4">
                      {['dinner', 'event'].map((m) => (
                        <button
                          key={m}
                          onClick={() => setType(m as any)}
                          className={`px-8 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${type === m ? 'bg-gold text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {step === 1 ? (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-12"
                    >
                      {type === 'dinner' ? (
                        <>
                          <PartySelector />
                          <div className="h-px bg-white/5" />
                          <DateTimePicker />
                        </>
                      ) : (
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center space-y-4">
                          <p className="font-[family-name:var(--font-baskerville)] text-lg italic text-white/80">
                            Planning a celebration or watch party?
                          </p>
                          <p className="text-xs text-white/40 leading-relaxed">
                            Fill out your details and we'll get back to you within 24 hours with package options and availability.
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={handleNext}
                        disabled={type === 'dinner' && (!store.date || !store.time)}
                        className="btn-gold w-full p-6 text-xs font-black tracking-[0.3em] disabled:opacity-20 transition-all duration-500 rounded-2xl"
                      >
                        CONTINUE TO DETAILS
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                      <div className="bg-gold/10 p-6 rounded-2xl border border-gold/20 flex justify-between items-center">
                        <div>
                          <h3 className="text-[10px] font-black tracking-[0.2em] text-gold uppercase opacity-60 mb-1">
                            {type === 'dinner' ? 'Standard Table' : 'Custom Event'}
                          </h3>
                          <p className="text-sm font-bold text-white">
                            {type === 'dinner' ? `${store.partySize} Guests · ${store.date?.toDateString()} @ ${store.time}` : 'Event & Group Inquiry'}
                          </p>
                        </div>
                        <button onClick={() => setStep(1)} className="text-[9px] font-black tracking-[0.1em] text-white/40 hover:text-gold transition-colors underline">EDIT</button>
                      </div>
                      <ContactForm />
                      <div className="flex flex-col-reverse md:flex-row gap-6 justify-between pt-10 border-t border-white/10">
                        <button
                          onClick={handleSubmit}
                          disabled={loading || !store.firstName || !store.email || !store.phone}
                          className="btn-gold w-full p-6 text-xs font-black tracking-[0.3em] shadow-[0_15px_30px_rgba(232,160,0,0.3)]"
                        >
                          {loading ? 'PROCESSING...' : (type === 'dinner' ? 'CONFIRM RESERVATION' : 'SEND INQUIRY')}
                        </button>
                      </div>
                    </motion.div>
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
                    <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white tracking-widest uppercase italic mb-4">{type === 'dinner' ? 'Confirmed' : 'Inquiry Sent'}</h2>
                  <div className="space-y-4 max-w-sm mx-auto text-white/60 text-sm leading-relaxed mb-10">
                    {type === 'dinner' ? (
                      <>
                        <p>
                          Thank you, <span className="text-white">{store.firstName}</span>. Your table for <span className="text-white">{store.partySize}</span> is scheduled.
                        </p>
                        <p className="text-xs tracking-wider border-y border-white/10 py-4 my-6 uppercase">
                          {store.date?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} @ {store.time}
                        </p>
                        <p>A confirmation email has been sent.</p>
                      </>
                    ) : (
                      <>
                        <p>
                          Thank you, <span className="text-white">{store.firstName}</span>. We've received your event inquiry and will contact you shortly.
                        </p>
                        <div className="py-8">
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-6">Or get tickets now for upcoming matches:</p>
                          <EventbriteWidget eventId="123456789" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="pt-10">
                    <button
                      onClick={handleClose}
                      className="btn-outline w-full p-4 text-[10px] font-black tracking-widest"
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
