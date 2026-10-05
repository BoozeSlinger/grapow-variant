"use client";
/** One global Live/Paused control for every auto-updating status (WCAG 2.2.2, spec §10.9). */
import { Pause } from "lucide-react";
import { useLivePaused, useNow } from "@/lib/clock";
import { formatClock, laParts } from "@/lib/la-time";
import { StatusDot } from "./StatusDot";

export function LiveToggle({ className }: { className?: string }) {
  const [paused, setPaused] = useLivePaused();
  const now = useNow();
  return (
    <button
      type="button"
      aria-pressed={!paused}
      onClick={() => setPaused(!paused)}
      title={paused ? "Resume live updates" : "Pause live updates"}
      className={[
        "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm px-3 t-label whitespace-nowrap",
        "shadow-[inset_0_0_0_1.5px_var(--line)] transition-colors duration-(--dur-1) fine:hover:bg-bg-raised",
        className ?? "",
      ].join(" ")}
    >
      {paused ? (
        <>
          <Pause size={14} strokeWidth={2} aria-hidden="true" />
          <span>Paused</span>
          <span className="tnum text-fg-muted normal-case tracking-normal">· as of {formatClock(laParts(now).minutes)}</span>
        </>
      ) : (
        <>
          <StatusDot state="now" />
          <span>Live</span>
        </>
      )}
    </button>
  );
}
