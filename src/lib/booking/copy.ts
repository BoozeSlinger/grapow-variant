/** Booking UI strings (spec §2.3, §9.7). Built from COPY so every booking surface says the same thing. */
import { COPY } from "@/data/venue";
import { formatDateShort, formatSlot } from "@/lib/la-time";
import { normalizePhone } from "./validate";

const DASH = "—";

/** "Table for 4 · Sat, Oct 3 · 7:00 PM"; missing parts show "—". */
export function bookingSummary(p: { partySize?: number; date?: string; time?: string }): string {
  const n = p.partySize ? String(p.partySize) : DASH;
  const date = p.date ? formatDateShort(p.date) : DASH;
  const time = p.time ? formatSlot(p.time) : DASH;
  return `Table for ${n} · ${date} · ${time}`;
}

export const BOOKING_COPY: {
  pending: string; failed: string; notConfigured: string; groups: string; standfirst: string;
  success(p: { phone: string; partySize: number; date: string; time: string }): string;
} = {
  pending: COPY.bookingPending,
  failed: COPY.bookingFailed,
  notConfigured: COPY.bookingNotConfigured,
  groups: COPY.bookingGroups,
  standfirst: COPY.bookingStandfirst,
  success: ({ phone, partySize, date, time }) =>
    COPY.bookingSuccess
      .replace("{phone}", normalizePhone(phone) ?? phone)
      .replace("{n}", String(partySize))
      .replace("{date}", formatDateShort(date))
      .replace("{time}", formatSlot(time)),
};
