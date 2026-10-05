/**
 * One overlay at a time (spec §9.6): nav sheet, hours sheet, menu panel, booking sheet, concierge.
 * Client store (zustand). Opening any overlay replaces the current one.
 */
import { create } from "zustand";

export type BookingSourceTag = "header" | "hero" | "dock" | "nav" | "menu" | "page" | "gameday" | "host" | "footer" | "visit" | "about" | "hours";
export type OpenBookingDetail = { partySize?: number; date?: string /* YYYY-MM-DD */; time?: string /* HH:mm */; source?: BookingSourceTag };
export type Overlay =
  | { kind: "nav" } | { kind: "hours" } | { kind: "menu-panel" }
  | { kind: "booking"; detail: OpenBookingDetail }
  | { kind: "concierge"; prompt?: string };
export type OverlayState = { overlay: Overlay | null; trigger: HTMLElement | null; bookingPrefill: (OpenBookingDetail & { nonce: number }) | null };

export const BOOKING_FORM_ID = "request-form";
const RESERVATIONS_PATH = "/reservations";

export const useOverlay = create<OverlayState>()(() => ({ overlay: null, trigger: null, bookingPrefill: null }));

function activeElement(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const el = document.activeElement;
  return el instanceof HTMLElement && el !== document.body ? el : null;
}

/** Replaces whatever is open. `trigger` (default: the focused element) is where focus returns on close. */
export function openOverlay(o: Overlay, trigger?: HTMLElement | null): void {
  useOverlay.setState({ overlay: o, trigger: trigger ?? activeElement() });
}

/** Closes the open overlay. `trigger` is kept so the closing sheet can return focus to it. */
export function closeOverlay(): void {
  useOverlay.setState({ overlay: null });
}

/**
 * On /reservations: no sheet — set `bookingPrefill` (new nonce), scroll #request-form into view
 * and focus its first control. Everywhere else: open the booking sheet.
 */
export function openBooking(detail: OpenBookingDetail = {}, trigger?: HTMLElement | null): void {
  if (typeof window !== "undefined" && window.location.pathname === RESERVATIONS_PATH) {
    useOverlay.setState({ overlay: null, bookingPrefill: { ...detail, nonce: Date.now() } });
    const form = document.getElementById(BOOKING_FORM_ID);
    if (form) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      const first = form.querySelector<HTMLElement>("input:not([type=hidden]):not([tabindex='-1']), select, textarea, button");
      first?.focus({ preventScroll: true });
    }
    return;
  }
  openOverlay({ kind: "booking", detail }, trigger);
}

export function openConcierge(prompt?: string, trigger?: HTMLElement | null): void {
  openOverlay(prompt ? { kind: "concierge", prompt } : { kind: "concierge" }, trigger);
}
