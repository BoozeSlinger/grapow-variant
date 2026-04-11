'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl shadow-2xl ${className}`}
    >
      {/* Shine effect overlay */}
      <div className="pointer-events-none absolute -inset-full rotate-45 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shine_8s_infinite]" />
      
      {/* Grain texture for premium feel */}
      <div className="grain-overlay opacity-[0.05]" />
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
