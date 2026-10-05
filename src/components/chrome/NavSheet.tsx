"use client";
/**
 * Nav sheet below 1024 (spec §11.3): a full-screen rice sheet. Live headline; the site in t-d1 rows with
 * live sub-lines; Ask the host; the day strip (no picker); address, Directions and Call; socials; and a
 * sticky "Request a table". Every row is ≥56px and the body scrolls, so everything is reachable at 375×667
 * and 844×390. Internal links close it on click (navigation also closes it, via the header).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { AskHostButton, BookButton, CallLink, DirectionsLink } from "@/components/ui/ActionButtons";
import { DayStrip } from "@/components/ui/DayStrip";
import { LiveHeadline, LiveTrack } from "@/components/ui/LiveStatus";
import { Sheet } from "@/components/ui/Sheet";
import { Wordmark } from "@/components/ui/Wordmark";
import type { TrackId } from "@/data/hours";
import { FOOTER_NAV, MENU_NAV } from "@/data/nav";
import { VENUE } from "@/data/venue";
import { closeOverlay, useOverlay } from "@/lib/overlay";
import { NavPending } from "./NavPending";

type Row = { label: string; href: string; track?: TrackId };
const ROWS: Row[] = [
  ...MENU_NAV.map((m) => ({ label: m.label, href: m.href, track: m.track })),
  ...FOOTER_NAV.filter((l) => l.href === "/about" || l.href === "/visit"),
];

export function NavSheet() {
  const open = useOverlay((s) => s.overlay?.kind === "nav");
  const trigger = useOverlay((s) => s.trigger);
  const [mounted, setMounted] = useState(false);
  if (open && !mounted) setMounted(true);

  return (
    <Sheet
      open={open}
      onClose={closeOverlay}
      variant="full"
      tone="rice"
      title={<Wordmark size="sm" />}
      titleId="nav-title"
      closeLabel="Close menu"
      returnFocus={trigger}
      footer={<BookButton full detail={{ source: "nav" }} />}
    >
      <div
        id="nav-sheet"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a[href^="/"]')) closeOverlay();
        }}
      >
        {mounted ? <NavSheetBody /> : null}
      </div>
    </Sheet>
  );
}

function NavSheetBody() {
  const pathname = usePathname();
  return (
    <div className="flex max-w-[44rem] flex-col gap-9">
      <LiveHeadline withDot className="t-small font-semibold" />

      <nav aria-label="Primary">
        <ul className="border-t border-hair">
          {ROWS.map((r, i) => {
            const current = pathname === r.href;
            return (
              <li key={r.href} className="border-b border-hair">
                <Link
                  href={r.href}
                  aria-current={current ? "page" : undefined}
                  className="group grid min-h-14 grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-x-2 py-3"
                >
                  <span className="t-label tnum text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex min-w-0 flex-col gap-2">
                    <span
                      className={[
                        "t-d1 text-balance decoration-[3px] underline-offset-[.12em]",
                        current ? "underline decoration-flag" : "",
                      ].join(" ")}
                    >
                      {r.label}
                    </span>
                    {r.track ? <LiveTrack track={r.track} withDot className="t-small text-fg-muted" /> : null}
                  </span>
                  <span aria-hidden="true" className="t-title text-fg-muted">→</span>
                  <NavPending />
                </Link>
              </li>
            );
          })}
          <li className="flex min-h-14 items-center border-b border-hair pl-10">
            <AskHostButton variant="quiet" size="md" />
          </li>
        </ul>
      </nav>

      <div>
        <h3 className="mb-1 t-label text-fg-muted">Today</h3>
        <DayStrip picker={false} compact />
      </div>

      <div className="grid gap-8 border-t border-hair pt-6 sm:grid-cols-2">
        <div>
          <h3 className="t-label text-fg-muted">Find us</h3>
          <address className="mt-2 t-body not-italic">
            {VENUE.address.street}, {VENUE.address.suite}
            <br />
            {VENUE.address.city}, {VENUE.address.region} {VENUE.address.postalCode}
          </address>
          <div className="mt-2 flex flex-wrap items-center gap-x-6">
            <DirectionsLink />
            <CallLink label="full" />
          </div>
        </div>
        <div>
          <h3 className="t-label text-fg-muted">Follow</h3>
          <ul className="mt-1 flex flex-col">
            <li>
              <Button href={VENUE.socials.instagram.url} variant="quiet" size="sm">
                Instagram {VENUE.socials.instagram.handle}
              </Button>
            </li>
            <li>
              <Button href={VENUE.socials.facebook.url} variant="quiet" size="sm">Facebook</Button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
