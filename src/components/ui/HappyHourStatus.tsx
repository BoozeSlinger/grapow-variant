"use client";
/**
 * Happy hour status (spec §10.8). board: state plate + countdown/next value + LiveToggle;
 * inline: one line. Screen readers get one static sentence — the countdown is aria-hidden, no aria-live.
 */
import { AnimatePresence, m } from "framer-motion";
import { SCHEDULE } from "@/data/hours";
import { useVenueStatus } from "@/lib/clock";
import { formatClock, formatRange } from "@/lib/la-time";
import { serviceLines } from "@/lib/hours";
import { swapFade } from "@/lib/motion";
import { LiveToggle } from "./LiveToggle";
import { liveWidths, reserve } from "./live-widths";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/** "1:12" (H:MM), or "48 min" under an hour. */
export function formatLeft(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

export function HappyHourStatus({ variant, className }: { variant: "board" | "inline"; className?: string }) {
  const s = useVenueStatus();
  const hh = s.tracks.happyHour;
  const windows = SCHEDULE.happyHour[s.serviceWeekday];
  const active = hh.open && hh.window !== undefined ? windows[hh.window] : undefined;
  const ends = active ? (active.endWord === "close" ? "close" : formatClock(active.close)) : "";
  const startsToday = !hh.open && hh.next?.relative === "today";
  const daily = windows.map((w) => formatRange(w.open, w.close, { endWord: w.endWord })).join(" & ");

  const sr = active
    ? `Happy hour runs until ${ends} today.`
    : startsToday && hh.next
      ? `Happy hour starts at ${formatClock(hh.next.minutes)} today.`
      : `${serviceLines().happyHour}.`;

  if (variant === "inline") {
    return (
      <span className={cx("inline-block", className)} style={reserve(liveWidths().text.happyHour)}>
        {hh.text}
      </span>
    );
  }

  const plate = active ? (hh.lastCall ? "Last call" : "On now") : "Next up";
  const value = active && hh.minutesLeft !== undefined ? formatLeft(hh.minutesLeft) : startsToday && hh.next ? `Starts ${formatClock(hh.next.minutes)}` : `Daily ${daily}`;
  const sub = active ? (ends === "close" ? "left · ends at close" : `left · ends ${ends}`) : "";

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <p className="sr-only">{sr}</p>
      <div aria-hidden="true" className="flex flex-wrap items-center gap-3">
        <span
          className={cx(
            "inline-flex min-h-7 items-center rounded-sm px-2 t-label",
            active ? "bg-yolk text-char" : "shadow-[inset_0_0_0_1.5px_currentColor]",
          )}
        >
          {plate}
        </span>
      </div>
      <div aria-hidden="true" className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span key={value} variants={swapFade} initial="hidden" animate="shown" exit="exit" className="t-score tnum text-accent">
            {value}
          </m.span>
        </AnimatePresence>
        {sub && <span className="t-label text-fg-muted">{sub}</span>}
      </div>
      <div>
        <LiveToggle />
      </div>
    </div>
  );
}
