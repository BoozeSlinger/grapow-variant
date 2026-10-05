"use client";
/**
 * Hours sheet (spec §11.4), opened by the StatusChip: right sheet at 1024 and up, bottom sheet below.
 * Live headline + Live/Paused, the day strip with its picker, the hours table (week ≥640, grouped below),
 * address with Directions and Call, a link to /visit, and the booking CTA in the sticky footer.
 *
 * Content mounts on first open (nothing live ticks inside a closed sheet before then). The day strip sits
 * in its own <form> so its radio group never joins another day strip's group on the same page; the form sets
 * --margin to the sheet's 16px padding so the strip's phone picker bleeds exactly to the sheet edge.
 */
import Link from "next/link";
import { useState } from "react";
import { BookButton, CallLink, DirectionsLink } from "@/components/ui/ActionButtons";
import { DayStrip } from "@/components/ui/DayStrip";
import { HoursTable } from "@/components/ui/HoursTable";
import { LiveHeadline } from "@/components/ui/LiveStatus";
import { LiveToggle } from "@/components/ui/LiveToggle";
import { Sheet } from "@/components/ui/Sheet";
import { FOOTER_NAV } from "@/data/nav";
import { VENUE } from "@/data/venue";
import { closeOverlay, useOverlay } from "@/lib/overlay";
import { useWide } from "./useWide";

const VISIT = FOOTER_NAV.find((l) => l.href === "/visit") ?? { label: "Hours & directions", href: "/visit" };

export function HoursSheet() {
  const open = useOverlay((s) => s.overlay?.kind === "hours");
  const trigger = useOverlay((s) => s.trigger);
  const wide = useWide();
  const [mounted, setMounted] = useState(false);
  if (open && !mounted) setMounted(true);

  return (
    <Sheet
      open={open}
      onClose={closeOverlay}
      variant={wide ? "right" : "bottom"}
      tone="rice"
      title={VISIT.label}
      titleId="hours-title"
      returnFocus={trigger}
      footer={<BookButton full detail={{ source: "hours" }} />}
    >
      {mounted ? (
        <div
          className="flex flex-col gap-8"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a[href^="/"]')) closeOverlay();
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <LiveHeadline withDot className="t-title" />
            <LiveToggle />
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="max-sm:[--margin:16px]">
            <DayStrip />
          </form>

          <div>
            <HoursTable layout="week" className="hidden sm:block" />
            <HoursTable layout="grouped" className="sm:hidden min-[360px]:[&_th]:whitespace-nowrap" />
          </div>

          <div className="border-t border-hair pt-5">
            <h3 className="t-label text-fg-muted">Find us</h3>
            <address className="mt-2 t-body not-italic">
              {VENUE.address.street}, {VENUE.address.suite}
              <br />
              {VENUE.address.city}, {VENUE.address.region} {VENUE.address.postalCode}
            </address>
            <p className="t-small text-fg-muted">{VENUE.address.center}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
              <DirectionsLink />
              <CallLink label="full" />
            </div>
          </div>

          <Link
            href={VISIT.href}
            className="group inline-flex min-h-11 items-center gap-2.5 self-start t-ui underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag"
          >
            All {VISIT.label.toLowerCase()}
            <span aria-hidden="true" className="inline-block transition-transform duration-(--dur-2) ease-out fine:group-hover:translate-x-1">→</span>
          </Link>
        </div>
      ) : null}
    </Sheet>
  );
}
