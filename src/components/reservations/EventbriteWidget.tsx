"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface EventbriteWidgetProps {
  eventId: string;
  onOrderComplete?: () => void;
  className?: string;
}

declare global {
  interface Window {
    EBWidgets: any;
  }
}

export default function EventbriteWidget({ eventId, onOrderComplete, className }: EventbriteWidgetProps) {
  useEffect(() => {
    // Load Eventbrite SDK
    const script = document.createElement('script');
    script.src = 'https://www.eventbrite.com/static/widgets/eb_widgets.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.EBWidgets) {
        window.EBWidgets.createWidget({
          widgetType: 'checkout',
          eventId: eventId,
          modal: true,
          modalTriggerElementId: `eb-trigger-${eventId}`,
          onOrderComplete: onOrderComplete
        });
      }
    };

    return () => {
      // Cleanup script if needed, though usually EB script handles multiple calls
    };
  }, [eventId, onOrderComplete]);

  return (
    <div className={className}>
      <motion.button
        id={`eb-trigger-${eventId}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn-gold w-full flex items-center justify-center gap-3 py-6 px-8 rounded-2xl group relative overflow-hidden"
      >
        <span className="relative z-10 font-black tracking-[0.2em] uppercase">Get Tickets</span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
      </motion.button>
      <p className="mt-4 text-[10px] text-white/40 text-center tracking-widest uppercase italic">
        Secure checkout via Eventbrite
      </p>
    </div>
  );
}
