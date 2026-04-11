'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useReservationStore } from '@/store/useReservationStore';

export const PartySelector: React.FC = () => {
  const { partySize, setPartySize } = useReservationStore();
  const sizes = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold tracking-[0.25em] text-gold uppercase">Party Size</h3>
      <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
        {sizes.map((size, idx) => (
          <motion.button
            key={size}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04, ease: [0.34, 1.56, 0.64, 1] }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPartySize(size)}
            className={`flex h-12 items-center justify-center rounded-none border text-xs font-bold transition-all duration-300 ${
              partySize === size
                ? 'border-gold bg-gold text-dark shadow-[0_0_20px_rgba(232,160,0,0.5)]'
                : 'border-white/20 bg-white/5 text-white hover:border-gold/60'
            }`}
          >
            {size}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
