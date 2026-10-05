/**
 * The shared minute clock (spec §9.4). One store per <ClockProvider> (no module-level store, so
 * nothing leaks between server requests). Client-only: import from client components.
 */
import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import { getVenueStatus, type VenueStatus } from "@/lib/hours";

export type ClockState = { now: number; paused: boolean; setNow(n: number): void; setPaused(p: boolean): void };

/** localStorage key for the global Live/Paused choice (WCAG 2.2.2). */
export const LIVE_PAUSED_KEY = "gp:live-paused";

export const ClockContext = createContext<StoreApi<ClockState> | null>(null);

export function createClockStore(serverNow: number): StoreApi<ClockState> {
  return createStore<ClockState>()((set) => ({
    now: serverNow,
    paused: false,
    setNow: (n) => set({ now: n }),
    setPaused: (p) => {
      try {
        if (p) window.localStorage.setItem(LIVE_PAUSED_KEY, "1");
        else window.localStorage.removeItem(LIVE_PAUSED_KEY);
      } catch {
        /* storage unavailable: the choice lasts for this page view */
      }
      set(p ? { paused: true } : { paused: false, now: Date.now() });
    },
  }));
}

function useClockStore(): StoreApi<ClockState> {
  const store = useContext(ClockContext);
  if (!store) throw new Error("useNow/useVenueStatus must be used inside <ClockProvider> (mounted by src/app/(site)/layout.tsx).");
  return store;
}

/** Epoch ms of the shared clock. Equals the server snapshot on the first client render. */
export function useNow(): number {
  return useStore(useClockStore(), (s) => s.now);
}

export function useLivePaused(): [paused: boolean, setPaused: (p: boolean) => void] {
  const store = useClockStore();
  const paused = useStore(store, (s) => s.paused);
  const setPaused = useStore(store, (s) => s.setPaused);
  return [paused, setPaused];
}

/** getVenueStatus(now, { route: usePathname() }), memoised per minute and route. */
export function useVenueStatus(): VenueStatus {
  const now = useNow();
  const route = usePathname();
  return useMemo(() => getVenueStatus(now, { route }), [now, route]);
}
