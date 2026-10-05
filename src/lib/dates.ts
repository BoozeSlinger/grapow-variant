// Calendar dates as plain "YYYY-MM-DD" strings. Never `new Date("YYYY-MM-DD")`:
// that parses as UTC midnight, which is the previous evening in Riverside.

export const RESTAURANT_TZ = "America/Los_Angeles";

/** Today's date in Riverside, e.g. "2026-10-04". */
export function laTodayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: RESTAURANT_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** A Date at local midnight → "YYYY-MM-DD" using its local calendar parts. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" → a Date at local midnight on that calendar day. */
export function fromISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "19:30" → "7:30 PM". */
export function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
