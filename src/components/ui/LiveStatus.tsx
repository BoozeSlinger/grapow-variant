"use client";
/**
 * Live status text (spec §10.7). Reads the shared clock store — never Date.now() during render — so the
 * SSR text equals the first client render. Every live text node reserves its width (no CLS).
 */
import type { TrackId } from "@/data/hours";
import { useVenueStatus } from "@/lib/clock";
import type { TrackStatus } from "@/lib/hours";
import { openOverlay } from "@/lib/overlay";
import { liveWidths, reserve } from "./live-widths";
import { StatusDot } from "./StatusDot";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

export function trackDot(t: TrackStatus): "open" | "later" | "closed" | "now" {
  if (t.open) return t.id === "happyHour" ? "now" : "open";
  return t.next?.relative === "today" ? "later" : "closed";
}

/** status.headline ("Kitchen open · till …") or status.compact ("Kitchen till …"). */
export function LiveHeadline({ format = "full", withDot, className }: { format?: "full" | "compact"; withDot?: boolean; className?: string }) {
  const s = useVenueStatus();
  const w = liveWidths();
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      {withDot && <StatusDot state={s.dot} />}
      <span className="inline-block" style={reserve(format === "full" ? w.headline : w.compact)}>
        {format === "full" ? s.headline : s.compact}
      </span>
    </span>
  );
}

/** One track: TrackStatus.text ("Sushi bar opens 5 PM") or .short ("Opens 5 PM"). */
export function LiveTrack({ track, format = "text", withDot, className }: { track: TrackId; format?: "text" | "short"; withDot?: boolean; className?: string }) {
  const t = useVenueStatus().tracks[track];
  const w = liveWidths();
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      {withDot && <StatusDot state={trackDot(t)} />}
      <span className="inline-block" style={reserve(format === "text" ? w.text[track] : w.short[track])}>
        {format === "text" ? t.text : t.short}
      </span>
    </span>
  );
}

/**
 * Header status pill: 36px visual / 44px hit area. Route primary track text on /menu/sushi,
 * /menu/happy-hour and /menu/drinks; otherwise headline (≥1280) / compact (<1280).
 * Default action opens the hours sheet. `hidden` = the home board-to-chip handoff state.
 */
export function StatusChip({ onClick, size = "md", className, hidden }: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; size?: "sm" | "md"; className?: string; hidden?: boolean;
}) {
  const s = useVenueStatus();
  const w = liveWidths();
  const primary = s.primary !== "venue" ? s.tracks[s.primary] : null;
  const full = primary ? primary.text : s.headline;
  const dot = primary ? trackDot(primary) : s.dot;
  return (
    <button
      type="button"
      onClick={onClick ?? ((e) => openOverlay({ kind: "hours" }, e.currentTarget))}
      aria-haspopup="dialog"
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={cx(
        "group inline-flex h-11 max-w-full items-center transition-[opacity,transform] duration-(--dur-2) ease-out",
        hidden ? "-translate-y-1.5 opacity-0" : "translate-y-0 opacity-100",
        className,
      )}
    >
      <span
        className={cx(
          "inline-flex h-9 max-w-full items-center gap-2 overflow-hidden rounded-pill border border-line t-small font-semibold whitespace-nowrap",
          "transition-colors duration-(--dur-1) fine:group-hover:bg-bg-raised",
          size === "sm" ? "px-3" : "px-4",
        )}
      >
        <StatusDot state={dot} live />
        {primary ? (
          <span aria-hidden="true" className="truncate" style={reserve(w.compact)}>{primary.text}</span>
        ) : (
          <>
            <span aria-hidden="true" className="truncate xl:hidden" style={reserve(w.compact)}>{s.compact}</span>
            <span aria-hidden="true" className="hidden truncate xl:inline" style={reserve(w.compact)}>{s.headline}</span>
          </>
        )}
        <span className="sr-only">{`${full}. Show today's hours`}</span>
      </span>
    </button>
  );
}
