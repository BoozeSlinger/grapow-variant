"use client";
/**
 * The header's status chip (spec §10.7 StatusChip, §11.1, §11.3): the same pill, dot, handoff state and
 * hours-sheet action as the shared StatusChip, with text that steps down to the room the header has.
 *
 * - Venue pages: headline from 1280, compact below (as StatusChip).
 * - Route pages (/menu/sushi, /menu/happy-hour, /menu/drinks): the track's full text from 1440, its `short`
 *   form below ("Back Tue 5 PM", "Till close"). The full sentence ("Sushi bar closed today · back Tue 5 PM") is
 *   up to 38 characters: below 1440 it would push the right cluster off a 1024 screen, off-centre the wordmark,
 *   or truncate in the phone header. Every string still comes from getVenueStatus; the accessible name is
 *   always the full text.
 */
import { trackDot } from "@/components/ui/LiveStatus";
import { liveWidths } from "@/components/ui/live-widths";
import { StatusDot } from "@/components/ui/StatusDot";
import { useVenueStatus } from "@/lib/clock";
import { openOverlay } from "@/lib/overlay";

/** Reserve `n` characters (no CLS on a status change) but never more than the pill has left after the dot + gap. */
const reserve = (n: number, dotAndGap: number): React.CSSProperties => ({ minWidth: `min(${n}ch, 100% - ${dotAndGap}px)` });

export function HeaderChip({ size = "md", hidden, className }: { size?: "sm" | "md"; hidden?: boolean; className?: string }) {
  const s = useVenueStatus();
  const w = liveWidths();
  const t = s.primary !== "venue" ? s.tracks[s.primary] : null;
  const full = t ? t.text : s.headline;
  const forms = t
    ? [
        { text: t.short, cls: "min-[1440px]:hidden", min: w.short[t.id] },
        { text: t.text, cls: "hidden min-[1440px]:inline", min: w.compact },
      ]
    : [
        { text: s.compact, cls: "xl:hidden", min: w.compact },
        { text: s.headline, cls: "hidden xl:inline", min: w.compact },
      ];

  return (
    <button
      type="button"
      onClick={(e) => openOverlay({ kind: "hours" }, e.currentTarget)}
      aria-haspopup="dialog"
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={[
        "group inline-flex h-11 max-w-full items-center transition-[opacity,transform] duration-(--dur-2) ease-out",
        hidden ? "-translate-y-1.5 opacity-0" : "translate-y-0 opacity-100",
        className ?? "",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-9 max-w-full items-center overflow-hidden rounded-pill border border-line t-small font-semibold whitespace-nowrap",
          // Semi-condensed Archivo (narrower below 390 and 375px) so every form fits from 360px and the wordmark stays centred.
          "[font-stretch:87.5%] max-[389.98px]:[font-stretch:80%] max-[374.98px]:[font-stretch:75%]",
          "transition-colors duration-(--dur-1) fine:group-hover:bg-bg-raised",
          size === "sm" ? "gap-1.5 px-2" : "gap-2 px-4",
        ].join(" ")}
      >
        <StatusDot state={t ? trackDot(t) : s.dot} live />
        {forms.map((f) => (
          <span key={f.cls} aria-hidden="true" className={`truncate ${f.cls}`} style={reserve(f.min, size === "sm" ? 14 : 16)}>{f.text}</span>
        ))}
        <span className="sr-only">{`${full}. Show today's hours`}</span>
      </span>
    </button>
  );
}
