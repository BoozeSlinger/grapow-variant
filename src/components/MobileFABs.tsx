"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function MobileFABs() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after scrolling 300px
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 inset-x-6 z-50 flex gap-3 md:hidden"
        >
          <a
            href="tel:+19517801132"
            className="flex-1 glass flex items-center justify-center gap-2 py-4 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-white gold-glow"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>
          <button
            onClick={() => {
              // This will trigger the reservation modal (implemented later)
              window.dispatchEvent(new CustomEvent("open-reservation"));
            }}
            className="flex-[1.5] bg-gold flex items-center justify-center gap-2 py-4 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-dark gold-glow shadow-[0_0_20px_rgba(232,160,0,0.4)]"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Now
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
