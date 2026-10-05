"use client";
/**
 * The Tonight Board (spec §12.1, G1): the hero's full-bleed lower third at 1024 and up. Four linked cells —
 * label → verb → value → sub-line — composed from useVenueStatus(), plus the global Live/Paused toggle.
 * Values crossfade (swapFade) at most once a minute; instantly under reduced motion.
 */
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useVenueStatus } from "@/lib/clock";
import { swapFade } from "@/lib/motion";
import { LiveToggle } from "@/components/ui/LiveToggle";
import { StatusDot } from "@/components/ui/StatusDot";
import { boardCells, glue, type BoardCell, type BoardTag, type BoardValue } from "./tonight";

function Tag({ tag }: { tag: BoardTag }) {
  if (tag.tone === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 text-open">
        <StatusDot state="open" />
        {tag.text}
      </span>
    );
  }
  return (
    <span
      className={[
        "inline-flex items-center rounded-sm px-1.5 py-px",
        tag.tone === "now" ? "bg-yolk text-char" : "shadow-[inset_0_0_0_1.5px_currentColor] text-fg-muted",
      ].join(" ")}
    >
      {tag.text}
    </span>
  );
}

function ValueText({ value }: { value: BoardValue }) {
  return (
    <>
      {value.main}
      {value.suffix ? <span className="ml-[.12em] text-[.42em] tracking-[.04em]">{value.suffix}</span> : null}
    </>
  );
}

const VALUE_CLS = "t-score tnum text-accent whitespace-nowrap";
/**
 * t-score's size, capped by the cell's inline size (cqi) so "midnight" fits. The cap comes from --v-size, which Cell
 * sets per container width (a tighter cap in narrow cells, where the label stacks). Inline so it beats the utility.
 */
const VALUE_STYLE = { fontSize: "var(--v-size)" } as const;

/** Reduced motion: the same markup (no hydration difference), but the swap is instant. */
const INSTANT: typeof swapFade = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

function Value({ value, reduce }: { value: BoardValue; reduce: boolean }) {
  const key = `${value.main}${value.suffix ?? ""}`;
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.span
        key={key}
        variants={reduce ? INSTANT : swapFade}
        initial="hidden"
        animate="shown"
        exit="exit"
        className={`inline-block ${VALUE_CLS}`}
        style={VALUE_STYLE}
      >
        <ValueText value={value} />
      </m.span>
    </AnimatePresence>
  );
}

/**
 * Height budget (board 120–136px): label row → value → sub-line, all driven by the cell's own width (@container) so a
 * cell never needs more height than the board has.
 *  - ≥12rem wide: the tag sits inline with the track name (one label row).
 *  - <12rem: the tag stacks under the name with tight leading and the value cap drops to 15.5cqi; the sub-line
 *    reserves two rows (min-h 2lh) up to 17rem so cells line up whether it wraps or not.
 */
function Cell({ c, reduce }: { c: BoardCell; reduce: boolean }) {
  return (
    <Link
      href={c.href}
      className="@container flex h-full min-w-0 flex-col justify-center gap-[clamp(2px,.5vh,6px)] px-[clamp(12px,1.4vw,24px)] transition-colors duration-(--dur-1) focus-visible:-outline-offset-3 fine:hover:bg-bg-raised"
    >
      <span className="sr-only">{c.sr}</span>
      <span aria-hidden="true" className="flex min-w-0 flex-row items-center gap-x-2 t-label whitespace-nowrap @max-[12rem]:flex-col @max-[12rem]:items-start @max-[12rem]:gap-y-0.5">
        <span className="@max-[12rem]:leading-[1.1]">{c.label}</span>
        <Tag tag={c.tag} />
      </span>
      <span
        aria-hidden="true"
        className="flex min-w-0 items-baseline gap-2 [--v-size:min(clamp(2rem,1.4rem_+_3vw,4.25rem),19cqi)] @max-[12rem]:[--v-size:min(clamp(1.5rem,1.4rem_+_3vw,4.25rem),15.5cqi)]"
      >
        {c.verb ? <span className="t-label text-fg-muted">{c.verb}</span> : null}
        <Value value={c.value} reduce={reduce} />
      </span>
      <span
        aria-hidden="true"
        className="line-clamp-2 font-serif text-[.9375rem] leading-[1.2] font-normal text-balance text-fg-muted italic @max-[17rem]:min-h-[2lh] @min-[15rem]:text-[1.0625rem] @min-[15rem]:leading-[1.35]"
      >
        {glue(c.sub)}
      </span>
    </Link>
  );
}

/**
 * The host tab (WP6) is fixed 240×56 at the viewport's bottom-right, 24px in, so at the first fold it sits on the
 * board's lower right. The cells stop 16px short of it (the zone is 280px from the viewport edge, less the page
 * margin and any frame inset) and the Live toggle rides on the board's top edge as a broadcast-style "bug", clear of
 * the tab at every board height. When the viewport is taller than the hero cap (980px) plus the tab, they cannot
 * meet and the zone collapses to nothing.
 */
const ZONE =
  "[--zone-w:max(0px,calc(17.5rem-var(--margin)-max(0px,(100vw-1600px)/2)))] [@media(min-height:1061px)]:[--zone-w:0px]";

export function TonightBoard({ className }: { className?: string }) {
  const s = useVenueStatus();
  const reduce = useReducedMotion() ?? false;
  const cells = boardCells(s);
  return (
    <div data-ground="ink-2" className={["h-(--board-h) border-t border-hair", ZONE, className].filter(Boolean).join(" ")}>
      <div className="frame relative flex h-full items-stretch">
        <ul aria-label="Tonight at a glance" className="grid min-w-0 flex-1 grid-cols-4">
          {cells.map((c, i) => (
            <li key={c.id} className={i > 0 ? "min-w-0 border-l border-hair" : "min-w-0 -ml-[clamp(12px,1.4vw,24px)]"}>
              <Cell c={c} reduce={reduce} />
            </li>
          ))}
        </ul>
        <div data-ground="ink-2" className="absolute right-(--margin) bottom-[calc(100%+8px)] rounded-sm bg-bg">
          <LiveToggle />
        </div>
        <div aria-hidden="true" className="w-(--zone-w) shrink-0 border-l border-hair" />
      </div>
    </div>
  );
}
