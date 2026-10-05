/**
 * Party, date and time parsing for the host (spec §13.4 parser CONTRACT). LA wall-clock throughout.
 * Minutes are service-day minutes, like SCHEDULE: a time before the 4:00 cutoff belongs to the night
 * before ("saturday at 1am" = Saturday night), so `minutes` may exceed 1440.
 * Bare hours: "7"–"11" → PM, "12" → noon (and "1"–"6" → PM: the kitchen opens at lunch).
 */
import { SERVICE_DAY_CUTOFF } from "@/data/hours";
import { getBookableSlots, getServiceDay, isBookable } from "@/lib/hours";
import { WEEKDAY_LONG, addDaysISO, formatDateShort, laParts, minutesToHHMM, toLaInstant, type Weekday } from "@/lib/la-time";
import type { OpenBookingDetail } from "@/lib/overlay";
import { normText } from "./normalize";

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, dozen: 12,
};
const WEEKDAY_WORDS: Record<string, Weekday> = {
  sunday: 0, sundays: 0, sun: 0, monday: 1, mondays: 1, mon: 1, tuesday: 2, tuesdays: 2, tue: 2, tues: 2,
  wednesday: 3, wednesdays: 3, wed: 3, weds: 3, thursday: 4, thursdays: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fridays: 5, fri: 5, saturday: 6, saturdays: 6, sat: 6,
};
const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};
const WD = Object.keys(WEEKDAY_WORDS).join("|");
const NUM = `(\\d{1,3}|${Object.keys(NUMBER_WORDS).join("|")})`;
/** A bare number followed by one of these is a head count, never a time. */
const NOT_TIME = "(?!\\s?(?:people|persons|person|guests|guest|of us|adults|kids|seats|top|pc|pcs|piece|pieces|oz|dollars|bucks|min|mins|minutes|hours|hour|days))";

/** Lowercase; "p.m." → "pm"; keep ":" and "/" for times and dates; chat shorthand via normText (words only). */
function prep(text: string): string {
  return text.toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\b([ap])\.\s?m\b\.?/g, (_, x: string) => `${x}m`)
    .replace(/[^a-z0-9:/ ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (/[\d:/]/.test(w) ? w : normText(w)))
    .join(" ");
}

const toNumber = (s: string): number => NUMBER_WORDS[s] ?? Number(s);

type ClockHit = { minutes: number; ambiguous: boolean; hour12: number };

/** Clock minutes 0–1440 (midnight = 1440), or undefined. `ambiguous` = no meridiem was given. */
function parseClock(t: string): ClockHit | undefined {
  const withMer = (h: number, mi: number, mer: string): ClockHit => ({ minutes: ((h % 12) + (mer === "pm" ? 12 : 0)) * 60 + mi, ambiguous: false, hour12: h % 12 || 12 });
  const bare = (h: number, mi: number): ClockHit | undefined => {
    if (h >= 13 && h <= 23) return { minutes: h * 60 + mi, ambiguous: false, hour12: h - 12 };
    if (h === 0) return { minutes: mi, ambiguous: false, hour12: 12 };
    if (h === 12) return { minutes: 720 + mi, ambiguous: false, hour12: 12 };
    if (h >= 1 && h <= 11) return { minutes: (h + 12) * 60 + mi, ambiguous: true, hour12: h };
    return undefined;
  };
  let m = t.match(/\b(\d{1,2}):(\d{2})\s?(am|pm)?\b/);
  if (m) {
    const h = Number(m[1]), mi = Number(m[2]);
    if (mi > 59) return undefined;
    return m[3] && h >= 1 && h <= 12 ? withMer(h, mi, m[3]) : bare(h, mi);
  }
  m = t.match(/\b(\d{1,2})\s?(am|pm)\b/);
  if (m && Number(m[1]) >= 1 && Number(m[1]) <= 12) return withMer(Number(m[1]), 0, m[2]);
  if (/\b(noon|midday)\b/.test(t)) return { minutes: 720, ambiguous: false, hour12: 12 };
  if (/\bmidnight\b/.test(t)) return { minutes: 1440, ambiguous: false, hour12: 12 };
  m = t.match(/\b(\d{1,2})\s?oclock\b/)
    ?? t.match(new RegExp(`\\b(?:at|around|about|by|after|before|til|till|until|from|@)\\s(\\d{1,2})\\b${NOT_TIME}(?![:/])`))
    ?? t.match(new RegExp(`\\b(?:${WD}|today|tonight|tomorrow)\\s(\\d{1,2})\\b${NOT_TIME}(?![:/])`));
  if (m) return bare(Number(m[1]), 0);
  return undefined;
}

type WhenFull = { dateISO?: string; minutes?: number; label?: string; ambiguous: boolean };

function whenFull(text: string, now: number): WhenFull {
  const t = prep(text);
  const sd = getServiceDay(now);
  const clock = parseClock(t);
  let minutes = clock?.minutes;
  const tonight = /\btonight\b/.test(t);
  // "tonight at 1" is 1 AM after midnight, not 1 PM.
  if (clock && tonight && clock.ambiguous && clock.hour12 <= 3) minutes = clock.hour12 * 60;
  if (minutes !== undefined && minutes < SERVICE_DAY_CUTOFF) minutes += 1440;

  let dateISO: string | undefined, label: string | undefined;
  const wd = t.match(new RegExp(`\\b(next |this )?(${WD})\\b`));
  const md = [...t.matchAll(/\b([a-z]{3,9})\s(\d{1,2})(?:st|nd|rd|th)?\b/g)].find((x) => MONTHS[x[1]]);
  const slash = t.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  const month = md ? MONTHS[md[1]] : slash ? Number(slash[1]) : 0;
  const day = md ? Number(md[2]) : slash ? Number(slash[2]) : 0;

  if (/\btomorrow\b/.test(t)) {
    dateISO = addDaysISO(sd.dateISO, 1);
    label = "Tomorrow";
  } else if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    const today = laParts(now);
    let iso = `${today.year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (iso < sd.dateISO) iso = `${today.year + 1}${iso.slice(4)}`;
    if (addDaysISO(iso, 0) === iso) {
      dateISO = iso;
      label = formatDateShort(iso);
    }
  } else if (wd) {
    const target = WEEKDAY_WORDS[wd[2]];
    let diff = (target - sd.weekday + 7) % 7;
    if (diff === 0 && (wd[1] === "next " || (minutes !== undefined && minutes <= sd.minutes))) diff = 7;
    dateISO = addDaysISO(sd.dateISO, diff);
    label = WEEKDAY_LONG[target];
  } else if (tonight) {
    dateISO = sd.dateISO;
    label = "Tonight";
  } else if (/\btoday\b/.test(t)) {
    dateISO = sd.dateISO;
    label = "Today";
  } else if (minutes !== undefined) {
    const later = minutes > sd.minutes;
    dateISO = later ? sd.dateISO : addDaysISO(sd.dateISO, 1);
    label = later ? (minutes >= 1020 ? "Tonight" : "Today") : "Tomorrow";
  }
  return { dateISO, minutes, label, ambiguous: !!clock?.ambiguous };
}

/**
 * today|tonight, tomorrow, weekday names/abbr (next occurrence incl. today if later), "this|next <weekday>",
 * "oct 3" / "10/3", and times "7", "7pm", "7:30 pm", "19:00", "noon", "midnight".
 * Tonight without a time gets no minutes here; status.at reads it as the evening (see replies.ts).
 */
export function parseWhen(text: string, now: number): { dateISO?: string; minutes?: number; label?: string } {
  const { dateISO, minutes, label } = whenFull(text, now);
  return { ...(dateISO ? { dateISO } : {}), ...(minutes !== undefined ? { minutes } : {}), ...(label ? { label } : {}) };
}

/** "for 4", "4 people", "party of 6", "table for two" (one…twelve). Never a time ("for 7pm"). */
export function parseParty(text: string): number | undefined {
  const t = prep(text);
  const pats = [
    new RegExp(`\\b(?:party|group|table|reservation|booking|seats?|room)\\s(?:of|for)\\s(?:a\\s)?${NUM}\\b(?![:/])`),
    new RegExp(`\\b${NUM}\\s(?:people|persons|person|guests|guest|of us|adults|diners|heads)\\b`),
    new RegExp(`\\bfor\\s(?:a\\s)?${NUM}\\b(?!\\s?(?:am|pm|oclock))(?![:/])`),
    new RegExp(`\\bwe\\s(?:are|will be|ll be)\\s${NUM}\\b(?!\\s?(?:am|pm))(?![:/])`),
  ];
  for (const re of pats) {
    const m = t.match(re);
    if (m) {
      const n = toNumber(m[1]);
      if (Number.isInteger(n) && n > 0) return n;
    }
  }
  if (/\b(just me|only me|myself|solo|by myself)\b/.test(t)) return 1;
  return undefined;
}

/** The instant for a parsed date + service-day minutes (minutes ≥ 1440 fall after midnight). */
export function whenInstant(dateISO: string, minutes: number): number {
  return minutes >= 1440
    ? toLaInstant(addDaysISO(dateISO, 1), minutesToHHMM(minutes - 1440)).getTime()
    : toLaInstant(dateISO, minutesToHHMM(minutes)).getTime();
}

/** The time the guest asked for (HH:mm, same day), bookable or not — for "7:00 PM isn't available". */
export function requestedTime(text: string, now: number): string | undefined {
  const w = whenFull(text, now);
  return w.minutes !== undefined && w.minutes < 1440 ? minutesToHHMM(w.minutes) : undefined;
}

/** party + date + time (time → HH:mm only if isBookable; an ambiguous "11:30" may resolve to the morning). */
export function parseBooking(text: string, now: number): OpenBookingDetail {
  const out: OpenBookingDetail = { source: "host" };
  const party = parseParty(text);
  if (party !== undefined) out.partySize = party;
  const w = whenFull(text, now);
  const calendarToday = laParts(now).dateISO;
  const date = w.dateISO && w.dateISO < calendarToday ? calendarToday : w.dateISO;
  if (date && getBookableSlots(date, now).length > 0) out.date = date;
  if (out.date && w.minutes !== undefined && w.minutes < 1440) {
    const tries = w.ambiguous ? [w.minutes, w.minutes - 720] : [w.minutes];
    const hit = tries.map(minutesToHHMM).find((hhmm) => isBookable(out.date as string, hhmm, now));
    if (hit) out.time = hit;
  }
  return out;
}
