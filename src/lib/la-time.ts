/**
 * America/Los_Angeles calendar + clock helpers. Pure TypeScript, no React.
 * Every venue time on the site is LA wall-clock time, whatever the visitor's or server's TZ.
 */
export const TZ = "America/Los_Angeles";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** Date.now(), wrapped so Server Components can read the request time without tripping react-hooks/purity. */
export function requestTime(): number {
  return Date.now();
}

export type LaParts = {
  dateISO: string; year: number; month: number; day: number;
  weekday: Weekday; hour: number; minute: number; minutes: number;
};

let partsFormatter: Intl.DateTimeFormat | null = null;
let offsetFormatter: Intl.DateTimeFormat | null = null;
const WEEKDAY_INDEX: Record<string, Weekday> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function laParts(at: Date | number): LaParts {
  partsFormatter ??= new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hourCycle: "h23", weekday: "short",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
  const date = typeof at === "number" ? new Date(at) : at;
  const get: Record<string, string> = {};
  for (const p of partsFormatter.formatToParts(date)) get[p.type] = p.value;
  const year = Number(get.year), month = Number(get.month), day = Number(get.day);
  const hour = Number(get.hour) % 24, minute = Number(get.minute);
  return {
    dateISO: `${year}-${pad2(month)}-${pad2(day)}`,
    year, month, day, weekday: WEEKDAY_INDEX[get.weekday] ?? 0,
    hour, minute, minutes: hour * 60 + minute,
  };
}

function parseISO(dateISO: string): [number, number, number] {
  const [y, m, d] = dateISO.split("-").map(Number);
  return [y, m, d];
}

/** Pure calendar math (no DST involvement). */
export function addDaysISO(dateISO: string, days: number): string {
  const [y, m, d] = parseISO(dateISO);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`;
}

export function weekdayOfISO(dateISO: string): Weekday {
  const [y, m, d] = parseISO(dateISO);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() as Weekday;
}

/** The instant at which LA wall-clock reads `dateISO hhmm`. DST-safe: guess as UTC, then correct twice. */
export function toLaInstant(dateISO: string, hhmm: string): Date {
  const [y, m, d] = parseISO(dateISO);
  const [hh, mm] = hhmm.split(":").map(Number);
  const target = Date.UTC(y, m - 1, d, hh, mm);
  let t = target;
  for (let i = 0; i < 2; i++) {
    const p = laParts(t);
    t += target - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  }
  return new Date(t);
}

/** "2026-10-03T19:00:00-07:00" — the timestamp the booking pipeline stores. */
export function toLaOffsetISO(dateISO: string, hhmm: string): string {
  offsetFormatter ??= new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" });
  const instant = toLaInstant(dateISO, hhmm);
  const name = offsetFormatter.formatToParts(instant).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const offset = name === "GMT" ? "+00:00" : name.replace("GMT", "");
  const p = laParts(instant);
  return `${p.dateISO}T${pad2(p.hour)}:${pad2(p.minute)}:00${offset}`;
}

/** 1170 → "19:30" (mod 1440). */
export function minutesToHHMM(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
}

/** 540→"9 AM", 1170→"7:30 PM", 0|1440→"midnight", 720→"noon", 1560→"2 AM". */
export function formatClock(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  if (m === 0) return "midnight";
  if (m === 720) return "noon";
  const h = Math.floor(m / 60), mi = m % 60;
  const mer = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return mi === 0 ? `${h12} ${mer}` : `${h12}:${pad2(mi)} ${mer}`;
}

/**
 * "3–6 PM", "11 AM–9 PM", "9 PM–close", "11 AM–midnight". En dash, no spaces.
 * The first meridiem is dropped only when both ends fall in the same half-day.
 */
export function formatRange(start: number, end: number, opts?: { endWord?: "close" }): string {
  const s = formatClock(start);
  if (opts?.endWord === "close") return `${s}–close`;
  const e = formatClock(end);
  const sameHalf = Math.floor(start / 720) === Math.floor(end / 720);
  const sm = s.match(/ (AM|PM)$/), em = e.match(/ (AM|PM)$/);
  if (sameHalf && sm && em && sm[1] === em[1]) return `${s.slice(0, -3)}–${e}`;
  return `${s}–${e}`;
}

/** "19:00" → "7:00 PM" (slots always show minutes). */
export function formatSlot(hhmm: string): string {
  const [hh, mm] = hhmm.split(":").map(Number);
  const mer = hh < 12 ? "AM" : "PM";
  return `${hh % 12 || 12}:${pad2(mm)} ${mer}`;
}

/** "Sat, Oct 3" */
export function formatDateShort(dateISO: string): string {
  const [, m, d] = parseISO(dateISO);
  return `${WEEKDAY_SHORT[weekdayOfISO(dateISO)]}, ${MONTH_SHORT[m - 1]} ${d}`;
}

/** "Saturday, October 3" */
export function formatDateLong(dateISO: string): string {
  const [, m, d] = parseISO(dateISO);
  return `${WEEKDAY_LONG[weekdayOfISO(dateISO)]}, ${MONTH_LONG[m - 1]} ${d}`;
}
