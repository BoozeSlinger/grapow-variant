'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useReservationStore } from '@/store/useReservationStore';

export const DateTimePicker: React.FC = () => {
  const { date, setDate, time, setTime } = useReservationStore();
  
  const timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', 
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value ? new Date(e.target.value) : null);
  };

  // Format date for the input value
  const dateValue = date ? date.toISOString().split('T')[0] : '';

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold tracking-[0.25em] text-gold uppercase">Select Date</h3>
        <div className="relative">
          <input
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full h-14 bg-white/5 border border-white/20 rounded-none px-6 text-sm text-white focus:outline-none focus:border-gold transition-all duration-300 hover:bg-white/10 [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold tracking-[0.25em] text-gold uppercase">Select Time</h3>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {timeSlots.map((slot, idx) => (
            <motion.button
              key={slot}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + idx * 0.03, ease: 'easeOut' }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTime(slot)}
              className={`flex h-11 items-center justify-center rounded-none border text-[11px] font-bold tracking-widest transition-all duration-300 ${
                time === slot
                  ? 'border-gold bg-gold text-dark shadow-[0_0_20px_rgba(232,160,0,0.5)]'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-gold/50 hover:text-white'
              }`}
            >
              {slot}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
