"use client";
/**
 * The shared minute clock (spec §9.4). The first client render uses `serverNow` (no hydration
 * mismatch); after mount it corrects to Date.now() and ticks on each minute boundary while the tab
 * is visible and live updates aren't paused.
 */
import { useEffect, useState } from "react";
import { ClockContext, LIVE_PAUSED_KEY, createClockStore } from "@/lib/clock";

export default function ClockProvider({ serverNow, children }: { serverNow: number; children: React.ReactNode }) {
  const [store] = useState(() => createClockStore(serverNow));

  useEffect(() => {
    let paused = false;
    try {
      paused = window.localStorage.getItem(LIVE_PAUSED_KEY) === "1";
    } catch {
      /* storage unavailable */
    }
    store.setState({ paused });

    let timeout: ReturnType<typeof setTimeout> | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;
    const stop = () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
    const tick = () => {
      const s = store.getState();
      if (!s.paused && document.visibilityState === "visible") s.setNow(Date.now());
    };
    const start = () => {
      stop();
      if (store.getState().paused || document.visibilityState !== "visible") return;
      tick();
      timeout = setTimeout(() => {
        tick();
        interval = setInterval(tick, 60_000);
      }, 60_000 - (Date.now() % 60_000) + 50);
    };

    start();
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    document.addEventListener("visibilitychange", onVisibility);
    const unsubscribe = store.subscribe((s, prev) => {
      if (s.paused !== prev.paused) start();
    });
    return () => {
      stop();
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [store]);

  return <ClockContext.Provider value={store}>{children}</ClockContext.Provider>;
}
