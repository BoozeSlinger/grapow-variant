"use client";

import { useState, useEffect } from "react";

// ── Restaurant close hour by day (0 = Sun … 6 = Sat) ─────────────────
const CLOSE_BY_DAY = [21, 21, 21, 21, 21, 22, 22]; // 9 PM Sun-Thu, 10 PM Fri-Sat
const OPEN_HOUR    = 11;

export type HoursStatus = { 
  isOpen: boolean; 
  status: string; 
  color: string;
  isHappyHour?: boolean;
};

export function useHoursStatus(): HoursStatus {
  // Use a default closed state that is safe for hydration and initial render
  const [status, setStatus] = useState<HoursStatus>({
    isOpen: false,
    status: "Checking hours...",
    color: "#6B7280",
    isHappyHour: false
  });

  useEffect(() => {
    function compute() {
      const now   = new Date();
      const day   = now.getDay();
      const hour  = now.getHours() + now.getMinutes() / 60;
      const close = CLOSE_BY_DAY[day];
      const closeLabel = close === 21 ? "9 PM" : "10 PM";

      // Happy Hour: Daily 3–6 PM & 9 PM–Close
      const isHH = (hour >= 15 && hour < 18) || (hour >= 21);

      if (hour >= OPEN_HOUR && hour < close) {
        const minsLeft = (close - hour) * 60;
        if (minsLeft <= 60) {
          setStatus({ isOpen: true,  status: `Closing Soon · ${closeLabel}`, color: "#F59E0B", isHappyHour: isHH });
        } else {
          setStatus({ isOpen: true,  status: `Open Now · Closes ${closeLabel}`, color: "#22C55E", isHappyHour: isHH });
        }
      } else if (hour < OPEN_HOUR) {
        setStatus({ isOpen: false, status: "Opens at 11 AM", color: "#E8A000", isHappyHour: isHH });
      } else {
        setStatus({ isOpen: false, status: "Closed · Opens at 11 AM", color: "#6B7280", isHappyHour: isHH });
      }
    }

    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, []);

  return status;
}
