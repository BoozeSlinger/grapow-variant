/**
 * Tonight Board / Tonight ticket copy (spec §12.1), composed only from a VenueStatus plus SCHEDULE and
 * the menu data — no time, price or day literals. Pure TypeScript so the clock fixtures can be unit-tested.
 */
import { SCHEDULE, TRACKS } from "@/data/hours";
import { MENUS } from "@/data/menu";
import { COPY } from "@/data/venue";
import { formatPrice, minPrice } from "@/lib/format";
import type { TrackStatus, VenueStatus } from "@/lib/hours";
import { WEEKDAY_SHORT, formatClock, formatDateShort, formatSlot, laParts, minutesToHHMM, type Weekday } from "@/lib/la-time";

export type BoardTrack = "kitchen" | "happyHour" | "sushi" | "bar";
export const BOARD_ORDER: BoardTrack[] = ["kitchen", "happyHour", "sushi", "bar"];

export type BoardTag = { tone: "open" | "now" | "outline"; text: string };
export type BoardValue = { main: string; suffix?: string };
export type BoardCell = {
  id: BoardTrack; href: string; label: string;
  tag: BoardTag; verb: string; value: BoardValue; sub: string;
  /** Full sentence for screen readers (TrackStatus.text). */
  sr: string;
};

/** Splits a clock string into its figure and meridiem (a day prefix stays with the figure); "midnight" stays whole. */
export function splitClock(text: string): BoardValue {
  const m = /^(.*\S) (AM|PM)$/.exec(text);
  return m ? { main: m[1], suffix: m[2] } : { main: text };
}

/** HappyHourStatus countdown rule: "1:12" (H:MM) from an hour up, "48 min" under an hour. */
export function leftValue(minutes: number): BoardValue {
  if (minutes < 60) return { main: String(minutes), suffix: "min" };
  return { main: `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}` };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Line-break hygiene for the sub-lines, applied when rendering so the copy strings stay plain: a time keeps its
 * meridiem ("min" too), a day range keeps its dash (word joiners), and the "·" separator hangs on the word before it
 * so no line starts with a dot.
 */
export const glue = (s: string) =>
  s.replace(/(\d) (AM|PM|min)\b/g, "$1\u00a0$2").replace(/(\w)–(\w)/g, "$1\u2060–\u2060$2").replace(/ · /g, "\u00a0· ");

/** Appetizer specials run in the early window only (C-5: HH_EARLY is built from window 0). */
const BITES = MENUS["happy-hour"].sections.find((s) => s.id === "hh-bites");
const BITES_PRICE = BITES ? formatPrice(minPrice(BITES.items)) : "";
const DRINKS_TITLE = MENUS["happy-hour"].sections.find((s) => s.id === "hh-drinks")?.title ?? "";

/** The bar's closing time by day group, built from SCHEDULE.bar and grouped by closing time. */
export function barWeekLine(): string {
  const days: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
  const groups = new Map<number, Weekday[]>();
  for (const d of days) {
    const close = SCHEDULE.bar[d][0]?.close;
    if (close === undefined) continue;
    groups.set(close, [...(groups.get(close) ?? []), d]);
  }
  const label = (ds: Weekday[]) =>
    ds.length === 1 ? WEEKDAY_SHORT[ds[0]]
      : ds.length === 2 ? `${WEEKDAY_SHORT[ds[0]]} & ${WEEKDAY_SHORT[ds[1]]}`
        : `${WEEKDAY_SHORT[ds[0]]}–${WEEKDAY_SHORT[ds[ds.length - 1]]}`;
  return [...groups.entries()].map(([close, ds]) => `${cap(formatClock(close))} ${label(ds)}`).join(" · ");
}

/** Closed state: when it comes back, as a tag + verb + value that never lead with "Closed". */
function closedParts(t: TrackStatus, verb: string): Pick<BoardCell, "tag" | "verb" | "value"> {
  const n = t.next;
  if (!n) return { tag: { tone: "outline", text: "Closed" }, verb: "", value: { main: "—" } };
  const clock = formatClock(n.minutes);
  if (n.relative === "today") return { tag: { tone: "outline", text: "Next up" }, verb, value: splitClock(clock) };
  // A day with no window at all reads "Back Tue" (as TrackStatus does), even when Tue is tomorrow.
  if (n.relative === "tomorrow" && !t.closedToday) return { tag: { tone: "outline", text: "Tomorrow" }, verb, value: splitClock(clock) };
  const day = WEEKDAY_SHORT[n.weekday];
  return { tag: { tone: "outline", text: `Back ${day}` }, verb: "back", value: splitClock(`${day} ${clock}`) };
}

function openParts(t: TrackStatus): Pick<BoardCell, "tag" | "verb" | "value"> {
  return { tag: { tone: "open", text: "Open" }, verb: "till", value: splitClock(formatClock(t.closesAt ?? 0)) };
}

export function boardCells(s: VenueStatus): BoardCell[] {
  const wd = s.serviceWeekday;
  return BOARD_ORDER.map((id): BoardCell => {
    const t = s.tracks[id];
    const base = { id, href: TRACKS[id].href, label: TRACKS[id].label, sr: t.text };
    switch (id) {
      case "kitchen":
        return {
          ...base, ...(t.open ? openParts(t) : closedParts(t, "opens")),
          sub: s.tracks.lunch.text.replace(" · ", " "),
        };
      case "sushi":
        return { ...base, ...(t.open ? openParts(t) : closedParts(t, "opens")), sub: COPY.sushiDisplay };
      case "bar":
        return { ...base, ...(t.open ? openParts(t) : closedParts(t, "opens")), sub: barWeekLine() };
      case "happyHour": {
        const hh = s.tracks.happyHour;
        const windows = SCHEDULE.happyHour[wd];
        if (hh.open && hh.window !== undefined && hh.minutesLeft !== undefined) {
          const w = windows[hh.window];
          const until = w.endWord === "close" ? "close" : formatClock(w.close);
          const sub = hh.lastCall
            ? `Last call · till ${until}`
            : hh.window === 0 && BITES_PRICE ? `Till ${until} · ${BITES_PRICE} bites` : `${DRINKS_TITLE} till ${until}`;
          return { ...base, tag: { tone: "now", text: "On now" }, verb: "ends in", value: leftValue(hh.minutesLeft), sub };
        }
        const parts = closedParts(hh, "starts");
        const nextIdx = hh.next ? SCHEDULE.happyHour[hh.next.weekday].findIndex((w) => w.open === hh.next!.minutes) : -1;
        const nw = nextIdx >= 0 ? SCHEDULE.happyHour[hh.next!.weekday][nextIdx] : undefined;
        const until = nw ? (nw.endWord === "close" ? "close" : formatClock(nw.close)) : "";
        const sub = !nw ? "" : nextIdx === 0 && BITES_PRICE ? `${BITES_PRICE} bites & ${DRINKS_TITLE.toLowerCase()} till ${until}` : `${DRINKS_TITLE} till ${until}`;
        return { ...base, ...parts, sub };
      }
    }
  });
}

/** Ticket head: "Tonight · Fri, Oct 2" from 5 PM (service-day minutes), "Today · …" before; plus the live clock. */
const EVENING = 17 * 60;
export function ticketHead(s: VenueStatus): { label: string; time: string } {
  return {
    label: `${s.minutes >= EVENING ? "Tonight" : "Today"} · ${formatDateShort(s.serviceDateISO)}`,
    time: formatSlot(minutesToHHMM(laParts(s.at).minutes)),
  };
}

export type TicketRow = { id: BoardTrack; label: string; dot: "open" | "later" | "closed" | "now"; now: boolean; value: string; sub?: string; sr: string };

export function ticketRows(s: VenueStatus): TicketRow[] {
  return s.order
    .filter((id): id is BoardTrack => (BOARD_ORDER as string[]).includes(id))
    .map((id) => {
      const t = s.tracks[id];
      const dot = t.open ? (id === "happyHour" ? "now" : "open") : t.next?.relative === "today" ? "later" : "closed";
      const hh = s.tracks.happyHour;
      const value = id === "happyHour" && hh.open && hh.lastCall && hh.minutesLeft !== undefined
        ? `Last call · ${hh.minutesLeft} min`
        : t.short;
      const sub = id === "kitchen" && s.tracks.lunch.open ? s.tracks.lunch.text : undefined;
      return { id, label: TRACKS[id].label, dot, now: id === "happyHour" && t.open, value, sub, sr: sub ? `${t.text}. ${sub}` : t.text };
    });
}
