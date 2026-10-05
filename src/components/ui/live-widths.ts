/**
 * Reserved widths (in characters) for live status text, so a minute update never shifts layout.
 * Derived once from a fixed reference week — a pure function of SCHEDULE, identical on server and client.
 */
import type { TrackId } from "@/data/hours";
import { getVenueStatus } from "@/lib/hours";

type Widths = { headline: number; compact: number; text: Record<TrackId, number>; short: Record<TrackId, number> };
let cache: Widths | null = null;
const REF_WEEK = Date.parse("2026-10-04T00:00:00-07:00"); // a Sunday in LA
const TRACKS: TrackId[] = ["kitchen", "bar", "lunch", "sushi", "happyHour"];

export function liveWidths(): Widths {
  if (cache) return cache;
  const w: Widths = {
    headline: 0, compact: 0,
    text: { kitchen: 0, bar: 0, lunch: 0, sushi: 0, happyHour: 0 },
    short: { kitchen: 0, bar: 0, lunch: 0, sushi: 0, happyHour: 0 },
  };
  for (let i = 0; i < 7 * 48; i++) {
    const s = getVenueStatus(REF_WEEK + i * 30 * 60_000);
    w.headline = Math.max(w.headline, s.headline.length);
    w.compact = Math.max(w.compact, s.compact.length);
    for (const t of TRACKS) {
      w.text[t] = Math.max(w.text[t], s.tracks[t].text.length);
      w.short[t] = Math.max(w.short[t], s.tracks[t].short.length);
    }
  }
  cache = w;
  return w;
}

/** `min-width` that reserves `n` characters but never exceeds the container. */
export const reserve = (n: number): React.CSSProperties => ({ minWidth: `min(${n}ch, 100%)` });
