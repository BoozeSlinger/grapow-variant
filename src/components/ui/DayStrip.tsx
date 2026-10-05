"use client";
/**
 * "Lunch to last call" (spec §10.11): the day as a timeline (axis minutes 660–1560), one row per track, with a
 * "now" needle. Rice grounds only. The graphic is aria-hidden; an sr-only list carries the facts.
 */
import { useLayoutEffect, useRef, useState } from "react";
import type { TrackId } from "@/data/hours";
import { useVenueStatus } from "@/lib/clock";
import { getDayTimeline, sushiDays, type TimelineBand } from "@/lib/hours";
import { WEEKDAY_LONG, WEEKDAY_SHORT, formatClock, type Weekday } from "@/lib/la-time";
import { ChoiceGroup } from "./ChoiceGroup";
import { Bang } from "./Wordmark";

const AXIS_START = 660;   // axis start (service-day minutes)
const AXIS_END = 1560;    // axis end, past midnight
const SPAN = AXIS_END - AXIS_START;
const TICKS = [660, 840, 1020, 1200, 1380, 1560];
const ROWS: TrackId[] = ["lunch", "kitchen", "happyHour", "sushi", "bar"];
const SHORT: Record<TrackId, string> = { lunch: "Lunch", kitchen: "Kitchen", happyHour: "HH", sushi: "Sushi", bar: "Bar" };
const NAME: Record<TrackId, string> = { lunch: "Lunch", kitchen: "Kitchen", happyHour: "Happy hour", sushi: "Sushi", bar: "Bar" };
const BAND: Record<TrackId, string> = {
  lunch: "bg-rice-2 text-char shadow-[inset_0_0_0_1.5px_var(--color-char)]",
  kitchen: "bg-char text-rice",
  happyHour: "bg-yolk text-char",
  sushi: "bg-transparent text-char shadow-[inset_0_0_0_1.5px_var(--color-char)]",
  bar: "bg-chili text-rice",
};

const pct = (m: number) => `${((Math.min(Math.max(m, AXIS_START), AXIS_END) - AXIS_START) / SPAN) * 100}%`;
const tick = (m: number) => {
  const h = Math.floor((m % 1440) / 60);
  return `${h % 12 || 12}${h < 12 ? "a" : "p"}`;
};
const spoken = (b: TimelineBand) => `${b.label}, ${b.text.replace("–", " to ")}`;

export function DayStrip({ picker = true, compact, caption, className }: { picker?: boolean; compact?: boolean; caption?: string; className?: string }) {
  const s = useVenueStatus();
  const [pick, setPick] = useState<"today" | `${Weekday}`>("today");
  const weekday: Weekday = pick === "today" ? s.serviceWeekday : (Number(pick) as Weekday);
  const isToday = weekday === s.serviceWeekday;
  const bands = getDayTimeline(weekday);
  const showNeedle = isToday && s.minutes >= AXIS_START && s.minutes <= AXIS_END;
  const needleFrac = (s.minutes - AXIS_START) / SPAN;
  const needleRef = useRef<HTMLDivElement>(null);
  const ran = useRef(false);

  // Needle run: axis start → now, once, on first view (--dur-5). SSR / reduced motion / no JS: placed at now.
  useLayoutEffect(() => {
    const el = needleRef.current;
    if (!el || ran.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      ran.current = true;
      return;
    }
    // Read the target when it is applied, not at mount: the clock corrects (and ticks) after mount.
    const final = () => `translateX(${el.dataset.x}%)`;
    el.style.transition = "none";
    el.style.transform = "translateX(0%)";
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      ran.current = true;
      requestAnimationFrame(() => {
        el.style.transition = "transform var(--dur-5) var(--ease-out)";
        el.style.transform = final();
        el.addEventListener("transitionend", () => { el.style.transition = ""; }, { once: true });
      });
    }, { threshold: 0.4 });
    io.observe(el.parentElement ?? el);
    return () => {
      io.disconnect();
      if (!ran.current) {
        el.style.transition = "";
        el.style.transform = final();
      }
    };
  }, [showNeedle]);

  const rowH = compact ? "h-8" : "h-9 lg:h-10";
  const dayName = WEEKDAY_LONG[weekday];
  const sushiOpen = sushiDays().open;
  const options = [
    { value: "today" as const, label: "Today" },
    ...([1, 2, 3, 4, 5, 6, 0] as Weekday[]).map((d) => ({ value: `${d}` as `${Weekday}`, label: WEEKDAY_SHORT[d] })),
  ];

  return (
    <figure className={["m-0 min-w-0", className].filter(Boolean).join(" ")}>
      <figcaption className={caption ? "mb-3 t-label" : "sr-only"}>{caption ?? `Hours for ${dayName}`}</figcaption>
      {picker && (
        <div className="mb-5 max-sm:-mx-(--margin) max-sm:overflow-x-auto max-sm:px-(--margin) [&_fieldset>div]:max-sm:flex-nowrap">
          <ChoiceGroup legend="Show hours for" legendHidden name="daystrip-day" size="sm" value={pick} onChange={setPick} options={options} />
        </div>
      )}

      <div aria-hidden="true" className="relative select-none">
        {/* Needle label lane */}
        <div className={compact ? "h-6" : "h-7"} />
        <div className="flex flex-col gap-1.5">
          {ROWS.map((track) => {
            const row = bands.filter((b) => b.track === track);
            if (!row.length) {
              if (track !== "sushi") return null;
              return (
                <div key={track} className={`${rowH} flex items-center t-small text-fg-muted`}>
                  Sushi bar: {sushiOpen}
                </div>
              );
            }
            return (
              <div key={track} className={`relative ${rowH}`}>
                {row.map((b, i) => (
                  <div
                    key={i}
                    className={`absolute inset-y-0 flex items-center overflow-hidden rounded-sm px-2 ${BAND[track]}`}
                    style={{
                      left: pct(b.start), width: `calc(${pct(b.end)} - ${pct(b.start)})`,
                      ...(b.uncertainEnd ? { borderRight: "2px dashed var(--color-char)" } : {}),
                    }}
                  >
                    <span className="truncate text-[.8125rem] font-semibold leading-none tnum">
                      <span className={compact ? "" : "sm:hidden"}>{i === 0 ? SHORT[track] : b.text}</span>
                      {!compact && <span className="hidden sm:inline">{i === 0 ? `${NAME[track]} · ${b.text}` : b.text}</span>}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {/* Axis */}
        <div className="relative mt-2 h-5 border-t border-line">
          {TICKS.map((m, i) => (
            <span
              key={m}
              className="absolute top-1 t-micro tnum text-fg-muted"
              style={{ left: pct(m), transform: i === 0 ? "none" : i === TICKS.length - 1 ? "translateX(-100%)" : "translateX(-50%)" }}
            >
              {tick(m)}
            </span>
          ))}
        </div>
        {showNeedle && (
          <div className="pointer-events-none absolute inset-0 bottom-7 overflow-hidden">
            <div ref={needleRef} data-x={needleFrac * 100} className="absolute inset-y-0 left-0 w-full" style={{ transform: `translateX(${needleFrac * 100}%)` }}>
              <div className="absolute top-0 bottom-0 left-0 w-0.5 -translate-x-1/2 bg-chili shadow-[0_0_0_1px_var(--color-rice)]" />
              <div className={`absolute top-0 flex items-center gap-1 t-label whitespace-nowrap text-char ${needleFrac > 0.7 ? "right-full mr-1.5 flex-row-reverse" : "left-1.5"}`}>
                <Bang className="text-[1.375rem]" />
                <span className="tnum">Now {formatClock(s.minutes)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <ol className="sr-only">
        {bands.map((b, i) => <li key={i}>{spoken(b)}</li>)}
        {!bands.some((b) => b.track === "sushi") && <li>{`Sushi bar closed ${isToday ? "today" : `on ${dayName}`}`}</li>}
      </ol>
    </figure>
  );
}
