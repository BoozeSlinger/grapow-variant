"use client";
/**
 * Concierge mount (spec §10.17, §13.1). Small on purpose: the host tab (1024 and up) plus a lazy loader.
 * The panel and the engine load with next/dynamic on first open, or are prefetched when the tab is
 * hovered or focused, or after 4 s and an idle moment — never in the initial page JS.
 * Below 1024 there is no floating element: the dock's "Ask" opens the same panel as a bottom sheet.
 * The tab hides (inert) while any overlay is open, the host pad included.
 */
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { reserve, liveWidths } from "@/components/ui/live-widths";
import { StatusDot } from "@/components/ui/StatusDot";
import { COPY } from "@/data/venue";
import { useVenueStatus } from "@/lib/clock";
import { openConcierge, useOverlay } from "@/lib/overlay";

// next/dynamic with ssr:false (spec §13.2). Turbopack lists a tiny async-loader stub (~0.6 KB) in the initial
// chunks; the panel and the engine are separate chunks fetched only when loadPanel() runs (tab hover or
// focus, after 4 s idle, or first open).
const loadPanel = () => import("./HostPanel");
const HostPanel = dynamic(loadPanel, { ssr: false });
const prefetch = () => void loadPanel();

/** Half-notch on the stub's left edge (a ticket torn from the pad). */
const NOTCH: React.CSSProperties = {
  WebkitMaskImage: "radial-gradient(circle at 0 50%, transparent 9px, #000 9.5px)",
  maskImage: "radial-gradient(circle at 0 50%, transparent 9px, #000 9.5px)",
};

export default function Concierge() {
  const overlay = useOverlay((s) => s.overlay);
  const open = overlay?.kind === "concierge";
  const [mounted, setMounted] = useState(false);
  if (open && !mounted) setMounted(true);
  const path = usePathname() ?? "/";
  const s = useVenueStatus();
  const hidden = overlay !== null;

  useEffect(() => {
    let idle = 0;
    const timer = window.setTimeout(() => {
      const ric = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback.bind(window) : null;
      idle = ric ? ric(prefetch, { timeout: 2000 }) : window.setTimeout(prefetch, 0);
    }, 4000);
    return () => {
      window.clearTimeout(timer);
      if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        id="host-tab"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="host-pad"
        aria-hidden={hidden || undefined}
        inert={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        onClick={(e) => openConcierge(undefined, e.currentTarget)}
        className={[
          "group fixed right-6 bottom-6 z-(--z-tab) hidden h-14 w-60 rounded-sm text-left lg:block",
          "transition-[transform,opacity] duration-(--dur-2) ease-out [--focus:var(--color-char)]",
          "focus-visible:outline-offset-0 focus-visible:shadow-[0_0_0_6px_var(--color-yolk)]",
          hidden ? "pointer-events-none translate-y-3 opacity-0" : "opacity-100 fine:hover:-translate-y-1.5",
        ].join(" ")}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-sm shadow-[0_30px_60px_-20px_rgb(0_0_0/.7)]" />
        <span data-ground="rice" style={NOTCH} className="relative flex h-full items-center gap-3 rounded-sm pr-4 pl-7 shadow-[inset_0_0_0_1px_var(--line)]">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[17px] border-l-[1.5px] border-dashed border-line" />
          <span className="flex min-w-0 flex-1 flex-col gap-1 pl-1.5">
            <span className="t-ui">{path.startsWith("/menu") ? "Ask about a dish" : COPY.hostTitle}</span>
            <span aria-hidden="true" className="inline-flex items-center gap-1.5 t-micro text-fg-muted">
              <StatusDot state={s.dot} />
              <span className="truncate" style={reserve(liveWidths().compact)}>{s.compact}</span>
            </span>
          </span>
          <MessageSquare aria-hidden="true" size={18} strokeWidth={1.75} className="shrink-0 transition-transform duration-(--dur-2) ease-out fine:group-hover:-translate-y-0.5" />
        </span>
      </button>
      {mounted ? <HostPanel /> : null}
    </>
  );
}
