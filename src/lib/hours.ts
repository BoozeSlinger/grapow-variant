/**
 * The only place status text, timelines, hours rows and bookable slots are built.
 * Pure TypeScript: callers pass the instant (`at` / `now`); nothing here reads the clock.
 */
import { BOOKING_RULES, SCHEDULE, SERVICE_DAY_CUTOFF, TRACKS, type ServiceWindow, type TrackId } from "@/data/hours";
import {
  WEEKDAY_LONG, WEEKDAY_SHORT, addDaysISO, formatClock, formatRange, formatSlot, laParts,
  minutesToHHMM, weekdayOfISO, type Weekday,
} from "@/lib/la-time";

export type NextOpen = { dateISO: string; weekday: Weekday; minutes: number; relative: "today" | "tomorrow" | "later" };
export type TrackStatus = {
  id: TrackId; label: string;
  open: boolean;
  closesAt?: number;
  next?: NextOpen;
  closedToday: boolean;
  text: string;
  short: string;
};
export type HappyHourStatus = TrackStatus & { window?: 0 | 1; minutesLeft?: number; lastCall: boolean; startsInMinutes?: number };
export type VenueStatus = {
  at: number; serviceDateISO: string; serviceWeekday: Weekday; minutes: number;
  tracks: Record<Exclude<TrackId, "happyHour">, TrackStatus> & { happyHour: HappyHourStatus };
  headline: string;
  compact: string;
  dot: "open" | "later" | "closed";
  primary: TrackId | "venue";
  order: TrackId[];
};

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
const LAST_CALL_MINUTES = 30;

export function getServiceDay(at: Date | number): { dateISO: string; weekday: Weekday; minutes: number } {
  const p = laParts(at);
  if (p.minutes < SERVICE_DAY_CUTOFF) {
    return { dateISO: addDaysISO(p.dateISO, -1), weekday: ((p.weekday + 6) % 7) as Weekday, minutes: p.minutes + 1440 };
  }
  return { dateISO: p.dateISO, weekday: p.weekday, minutes: p.minutes };
}

type TrackCalc = {
  open: boolean; windowIndex?: number; window?: ServiceWindow;
  next?: NextOpen & { inMinutes: number }; closedToday: boolean;
};

function calcTrack(track: TrackId, serviceDateISO: string, weekday: Weekday, m: number, calendarISO: string): TrackCalc {
  const today = SCHEDULE[track][weekday];
  const idx = today.findIndex((w) => w.open <= m && m < w.close);
  const closedToday = today.length === 0;
  if (idx >= 0) return { open: true, windowIndex: idx, window: today[idx], closedToday };
  const relative = (dateISO: string): NextOpen["relative"] =>
    dateISO === calendarISO ? "today" : dateISO === addDaysISO(calendarISO, 1) ? "tomorrow" : "later";
  const later = today.find((w) => w.open > m);
  if (later) {
    return {
      open: false, closedToday,
      next: { dateISO: serviceDateISO, weekday, minutes: later.open, relative: relative(serviceDateISO), inMinutes: later.open - m },
    };
  }
  for (let d = 1; d <= 7; d++) {
    const wd = ((weekday + d) % 7) as Weekday;
    const first = SCHEDULE[track][wd][0];
    if (first) {
      const dateISO = addDaysISO(serviceDateISO, d);
      return { open: false, closedToday, next: { dateISO, weekday: wd, minutes: first.open, relative: relative(dateISO), inMinutes: d * 1440 + first.open - m } };
    }
  }
  return { open: false, closedToday };
}

function untilText(w: ServiceWindow): string {
  return w.endWord === "close" ? "close" : formatClock(w.close);
}

function buildText(track: TrackId, c: TrackCalc): { text: string; short: string } {
  const label = TRACKS[track].label;
  if (c.open && c.window) {
    const until = untilText(c.window);
    if (track === "happyHour") return { text: `Happy hour now · till ${until}`, short: `Till ${until}` };
    if (track === "lunch") return { text: `${label} · till ${until}`, short: `Till ${until}` };
    return { text: `${label} open · till ${until}`, short: `Till ${until}` };
  }
  const n = c.next;
  if (!n) return { text: `${label} closed`, short: "Closed" };
  const clock = formatClock(n.minutes);
  const day = WEEKDAY_SHORT[n.weekday];
  switch (track) {
    case "happyHour":
      if (n.relative === "today") return { text: `Happy hour from ${clock}`, short: `From ${clock}` };
      if (n.relative === "tomorrow") return { text: `Happy hour tomorrow from ${clock}`, short: `Tomorrow ${clock}` };
      return { text: `Happy hour ${day} from ${clock}`, short: `${day} ${clock}` };
    case "lunch":
      if (n.relative === "today") return { text: `${label} · from ${clock}`, short: `From ${clock}` };
      if (n.relative === "tomorrow") return { text: `${label} · back tomorrow ${clock}`, short: `Back tomorrow ${clock}` };
      return { text: `${label} · back ${day} ${clock}`, short: `Back ${day} ${clock}` };
    case "sushi":
      if (c.closedToday) return { text: `${label} closed today · back ${day} ${clock}`, short: `Back ${day} ${clock}` };
      if (n.relative === "today") return { text: `${label} opens ${clock}`, short: `Opens ${clock}` };
      if (n.relative === "tomorrow") return { text: `${label} closed · back tomorrow ${clock}`, short: `Back tomorrow ${clock}` };
      return { text: `${label} closed · back ${day} ${clock}`, short: `Back ${day} ${clock}` };
    default:
      if (n.relative === "today") return { text: `${label} opens ${clock}`, short: `Opens ${clock}` };
      if (n.relative === "tomorrow") return { text: `${label} closed · opens tomorrow ${clock}`, short: `Opens tomorrow ${clock}` };
      return { text: `${label} closed · opens ${day} ${clock}`, short: `Opens ${day} ${clock}` };
  }
}

function trackStatus(track: TrackId, c: TrackCalc): TrackStatus {
  const { text, short } = buildText(track, c);
  const next = c.next ? { dateISO: c.next.dateISO, weekday: c.next.weekday, minutes: c.next.minutes, relative: c.next.relative } : undefined;
  return {
    id: track, label: TRACKS[track].label, open: c.open,
    closesAt: c.open ? c.window?.close : undefined,
    next: c.open ? undefined : next,
    closedToday: c.closedToday, text, short,
  };
}

const ROUTE_PRIMARY: Record<string, TrackId> = { "/menu/sushi": "sushi", "/menu/happy-hour": "happyHour", "/menu/drinks": "bar" };

export function getVenueStatus(at: Date | number, opts?: { route?: string }): VenueStatus {
  const atMs = typeof at === "number" ? at : at.getTime();
  const calendarISO = laParts(atMs).dateISO;
  const sd = getServiceDay(atMs);
  const m = sd.minutes;
  const calc = (t: TrackId) => calcTrack(t, sd.dateISO, sd.weekday, m, calendarISO);
  const kc = calc("kitchen"), bc = calc("bar"), lc = calc("lunch"), sc = calc("sushi"), hc = calc("happyHour");

  const kitchen = trackStatus("kitchen", kc);
  const bar = trackStatus("bar", bc);
  const happy = trackStatus("happyHour", hc);
  const minutesLeft = hc.open && hc.window ? hc.window.close - m : undefined;
  const happyHour: HappyHourStatus = {
    ...happy,
    window: hc.open ? (hc.windowIndex as 0 | 1) : undefined,
    minutesLeft,
    lastCall: minutesLeft !== undefined && minutesLeft <= LAST_CALL_MINUTES,
    startsInMinutes: !hc.open && hc.next?.relative === "today" ? hc.next.inMinutes : undefined,
  };

  let headline: string, compact: string, dot: VenueStatus["dot"];
  if (kc.open && kc.window) {
    headline = kitchen.text;
    compact = `${TRACKS.kitchen.label} till ${untilText(kc.window)}`;
    dot = "open";
  } else if (bc.open && bc.window) {
    headline = bar.text;
    compact = `${TRACKS.bar.label} till ${untilText(bc.window)}`;
    dot = "open";
  } else {
    const nexts = [kc.next, bc.next].filter((n): n is NonNullable<TrackCalc["next"]> => !!n);
    const n = nexts.sort((a, b) => a.inMinutes - b.inMinutes)[0];
    const when = !n ? "" : n.relative === "today" ? formatClock(n.minutes)
      : n.relative === "tomorrow" ? `tomorrow ${formatClock(n.minutes)}` : `${WEEKDAY_SHORT[n.weekday]} ${formatClock(n.minutes)}`;
    headline = `Closed · opens ${when}`;
    compact = `Opens ${when}`;
    dot = n?.relative === "today" ? "later" : "closed";
  }

  const kitchenClose = SCHEDULE.kitchen[sd.weekday][0]?.close ?? 0;
  const hhFirst = SCHEDULE.happyHour[sd.weekday][0];
  let order: TrackId[];
  if (hhFirst && m < hhFirst.open) order = ["kitchen", "happyHour", "sushi", "bar"];
  else if (hhFirst && m < hhFirst.close) order = ["happyHour", "kitchen", "sushi", "bar"];
  else if (m < kitchenClose) order = ["kitchen", "sushi", "happyHour", "bar"];
  else order = ["bar", "happyHour", "kitchen", "sushi"];
  const primary: TrackId | "venue" = (opts?.route && ROUTE_PRIMARY[opts.route]) || "venue";
  if (primary !== "venue") order = [primary, ...order.filter((t) => t !== primary)];

  return {
    at: atMs, serviceDateISO: sd.dateISO, serviceWeekday: sd.weekday, minutes: m,
    tracks: { kitchen, bar, lunch: trackStatus("lunch", lc), sushi: trackStatus("sushi", sc), happyHour },
    headline, compact, dot, primary, order,
  };
}

export type TimelineBand = { track: TrackId; label: string; start: number; end: number; text: string; uncertainEnd: boolean };

/** lunch, kitchen, happyHour ×2, sushi (if any), bar — in that order. */
export function getDayTimeline(weekday: Weekday): TimelineBand[] {
  const tracks: TrackId[] = ["lunch", "kitchen", "happyHour", "sushi", "bar"];
  return tracks.flatMap((track) =>
    SCHEDULE[track][weekday].map((w) => ({
      track, label: TRACKS[track].label, start: w.open, end: w.close,
      text: formatRange(w.open, w.close, { endWord: w.endWord }),
      uncertainEnd: !!w.uncertainClose,
    })),
  );
}

/** "Tue–Sat" for consecutive days, "Sun & Mon" for two, "Tue" for one. */
function dayRunLabel(days: Weekday[], joiner: "–" | " & " = "–"): string {
  if (days.length === 0) return "";
  if (days.length === 1) return WEEKDAY_SHORT[days[0]];
  if (days.length === 2 && joiner === " & ") return `${WEEKDAY_SHORT[days[0]]} & ${WEEKDAY_SHORT[days[1]]}`;
  return `${WEEKDAY_SHORT[days[0]]}–${WEEKDAY_SHORT[days[days.length - 1]]}`;
}

function windowsText(track: TrackId, wd: Weekday): string {
  return SCHEDULE[track][wd].map((w) => formatRange(w.open, w.close, { endWord: w.endWord })).join(" & ");
}

/** The sushi bar's open days and closed days, derived from SCHEDULE: { open: "Tue–Sat from 5 PM", closed: "Sun & Mon" }. */
export function sushiDays(days: Weekday[] = ALL_DAYS): { open: string; closed: string } {
  const openDays = days.filter((d) => SCHEDULE.sushi[d].length > 0);
  const closedDays = days.filter((d) => SCHEDULE.sushi[d].length === 0);
  const from = openDays.length ? formatClock(SCHEDULE.sushi[openDays[0]][0].open) : "";
  return {
    open: openDays.length ? `${dayRunLabel(openDays)} from ${from}` : "",
    closed: dayRunLabel(closedDays, " & "),
  };
}

export type HoursRow = { days: string; weekdays: Weekday[]; kitchen: string; bar: string; sushi: string };

/** week: 7 rows Sun..Sat; grouped: consecutive days with identical kitchen + bar hours ("Sun–Thu", "Fri–Sat"). */
export function getHoursRows(layout: "week" | "grouped"): HoursRow[] {
  if (layout === "week") {
    return ALL_DAYS.map((d) => {
      const s = SCHEDULE.sushi[d][0];
      return {
        days: WEEKDAY_LONG[d], weekdays: [d],
        kitchen: windowsText("kitchen", d), bar: windowsText("bar", d),
        sushi: s ? `From ${formatClock(s.open)}` : "Closed",
      };
    });
  }
  const groups: Weekday[][] = [];
  for (const d of ALL_DAYS) {
    const last = groups[groups.length - 1];
    const key = (x: Weekday) => `${windowsText("kitchen", x)}|${windowsText("bar", x)}`;
    if (last && key(last[last.length - 1]) === key(d)) last.push(d);
    else groups.push([d]);
  }
  return groups.map((days) => ({
    days: dayRunLabel(days), weekdays: days,
    kitchen: windowsText("kitchen", days[0]), bar: windowsText("bar", days[0]),
    sushi: sushiDays(days).open || "Closed",
  }));
}

/** "Lunch specials daily until 3 PM" · "Happy hour daily 3–6 PM & 9 PM–close" · "Sushi bar Tue–Sat from 5 PM · closed Sun & Mon" */
export function serviceLines(): { lunch: string; happyHour: string; sushi: string } {
  const lunchClose = SCHEDULE.lunch[0][0]?.close ?? 0;
  const sushi = sushiDays();
  return {
    lunch: `${TRACKS.lunch.label} daily until ${formatClock(lunchClose)}`,
    happyHour: `${TRACKS.happyHour.label} daily ${windowsText("happyHour", 0)}`,
    sushi: `${TRACKS.sushi.label} ${sushi.open}${sushi.closed ? ` · closed ${sushi.closed}` : ""}`,
  };
}

export type BookableDate = { dateISO: string; weekday: Weekday; label: string; hasSlots: boolean; tags: string[] };

export function getBookableDates(now: Date | number): BookableDate[] {
  const today = laParts(now).dateISO;
  return Array.from({ length: BOOKING_RULES.windowDays }, (_, i) => {
    const dateISO = addDaysISO(today, i);
    const weekday = weekdayOfISO(dateISO);
    const day = Number(dateISO.slice(8, 10));
    const sushi = SCHEDULE.sushi[weekday][0];
    const sushiHour = sushi ? (Math.floor(sushi.open / 60) % 12 || 12) : 0;
    return {
      dateISO, weekday,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${WEEKDAY_SHORT[weekday]} ${day}`,
      hasSlots: getBookableSlots(dateISO, now).length > 0,
      tags: sushi ? [`Sushi from ${sushiHour}`] : [],
    };
  });
}

export type Slot = { time: string; minutes: number; label: string; group: "lunch" | "afternoon" | "dinner" };

export function getBookableSlots(dateISO: string, now: Date | number): Slot[] {
  const p = laParts(now);
  const last = addDaysISO(p.dateISO, BOOKING_RULES.windowDays - 1);
  if (dateISO < p.dateISO || dateISO > last) return [];
  const kitchen = SCHEDULE.kitchen[weekdayOfISO(dateISO)][0];
  if (!kitchen) return [];
  const lunchClose = SCHEDULE.lunch[weekdayOfISO(dateISO)][0]?.close ?? 0;
  const dinnerFrom = 1020; // the evening slot group starts at 5 PM (aligned with the sushi bar opening)
  const earliest = dateISO === p.dateISO ? p.minutes + BOOKING_RULES.leadMinutes : -Infinity;
  const slots: Slot[] = [];
  for (let m = kitchen.open; m <= kitchen.close - BOOKING_RULES.lastSlotBeforeClose; m += BOOKING_RULES.slotStep) {
    if (m < earliest) continue;
    const time = minutesToHHMM(m);
    slots.push({ time, minutes: m, label: formatSlot(time), group: m < lunchClose ? "lunch" : m < dinnerFrom ? "afternoon" : "dinner" });
  }
  return slots;
}

export function isBookable(dateISO: string, time: string, now: Date | number): boolean {
  return getBookableSlots(dateISO, now).some((s) => s.time === time);
}

/** For "7:00 PM isn't available — here are the closest times". Sorted by time. */
export function nearestSlots(dateISO: string, time: string, now: Date | number, count = 3): Slot[] {
  const [hh, mm] = time.split(":").map(Number);
  const target = hh * 60 + (mm || 0);
  return getBookableSlots(dateISO, now)
    .map((s) => ({ s, d: Math.abs(s.minutes - target) }))
    .sort((a, b) => a.d - b.d || a.s.minutes - b.s.minutes)
    .slice(0, count)
    .map((x) => x.s)
    .sort((a, b) => a.minutes - b.minutes);
}

/** Latest bookable slot at or before `minutes` (Game Day prefill). */
export function lastSlotAtOrBefore(dateISO: string, minutes: number, now: Date | number): Slot | null {
  const slots = getBookableSlots(dateISO, now).filter((s) => s.minutes <= minutes);
  return slots[slots.length - 1] ?? null;
}
