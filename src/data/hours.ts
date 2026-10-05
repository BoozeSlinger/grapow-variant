/**
 * Opening hours — data only. Minutes from service-day midnight (LA time); `close` may exceed 1440
 * (1560 = 2 AM the next calendar day). Every string the site shows about hours is derived from
 * this file by src/lib/hours.ts — no other file may hard-code a time.
 */
import type { Weekday } from "@/lib/la-time";

export type TrackId = "kitchen" | "bar" | "lunch" | "sushi" | "happyHour";
export type ServiceWindow = { open: number; close: number; endWord?: "close"; uncertainClose?: boolean };

/** Before 4:00 AM, a moment belongs to the previous service day (+1440 min). */
export const SERVICE_DAY_CUTOFF = 240;

export const TRACKS: Record<TrackId, { label: string; href: string }> = {
  kitchen: { label: "Kitchen", href: "/menu/food" },
  lunch: { label: "Lunch specials", href: "/menu/food#lunch" },
  happyHour: { label: "Happy hour", href: "/menu/happy-hour" },
  sushi: { label: "Sushi bar", href: "/menu/sushi" },
  bar: { label: "Bar", href: "/menu/drinks" },
};

type Week = Record<Weekday, ServiceWindow[]>;
const daily = (w: ServiceWindow[]): Week => ({ 0: w, 1: w, 2: w, 3: w, 4: w, 5: w, 6: w });
const sunThuFriSat = (sunThu: ServiceWindow[], friSat: ServiceWindow[]): Week => ({
  0: sunThu, 1: sunThu, 2: sunThu, 3: sunThu, 4: sunThu, 5: friSat, 6: friSat,
});

const KITCHEN_SUN_THU: ServiceWindow[] = [{ open: 660, close: 1260 }]; // 11 AM–9 PM
const KITCHEN_FRI_SAT: ServiceWindow[] = [{ open: 660, close: 1320 }]; // 11 AM–10 PM
const SUSHI_TUE_THU: ServiceWindow[] = [{ open: 1020, close: 1260, uncertainClose: true }]; // OWNER-CONFIRM(C-4): sushi closing time assumed to equal kitchen close
const SUSHI_FRI_SAT: ServiceWindow[] = [{ open: 1020, close: 1320, uncertainClose: true }]; // OWNER-CONFIRM(C-4): sushi closing time assumed to equal kitchen close

export const SCHEDULE: Record<TrackId, Week> = {
  kitchen: sunThuFriSat(KITCHEN_SUN_THU, KITCHEN_FRI_SAT), // C-4
  bar: sunThuFriSat(
    [{ open: 660, close: 1440 }], // OWNER-CONFIRM(C-4): bar opening time assumed 11 AM
    [{ open: 660, close: 1560 }], // OWNER-CONFIRM(C-4): bar opening time assumed 11 AM
  ),
  lunch: daily([{ open: 660, close: 900 }]), // C-4: lunch specials daily 11 AM–3 PM
  sushi: { 0: [], 1: [], 2: SUSHI_TUE_THU, 3: SUSHI_TUE_THU, 4: SUSHI_TUE_THU, 5: SUSHI_FRI_SAT, 6: SUSHI_FRI_SAT },
  happyHour: sunThuFriSat(
    [{ open: 900, close: 1080 }, { open: 1260, close: 1440, endWord: "close" }], // OWNER-CONFIRM(C-5): late happy hour runs till close (= bar close)
    [{ open: 900, close: 1080 }, { open: 1260, close: 1560, endWord: "close" }], // OWNER-CONFIRM(C-5): late happy hour runs till close (= bar close)
  ),
};

export const BOOKING_RULES = { minParty: 1, maxParty: 8, windowDays: 30, leadMinutes: 30, slotStep: 30, lastSlotBeforeClose: 60 } as const; // OWNER-CONFIRM(C-13): party 1–8, 30-day window, 30-min lead, last slot 60 min before kitchen close
