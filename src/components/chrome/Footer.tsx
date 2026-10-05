/**
 * Footer, "Last call" (spec §11.6). Server component with client islands (live text, hours, actions).
 * Slate + live headline · four columns (Visit #visit · Hours · Menus & more · Follow) · the credits
 * wordmark (the only centred element) · crest seal · legal line. No chili here: the booking CTA is secondary.
 * Bottom padding clears the 1024+ host tab.
 */
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { BookButton, CallLink, DirectionsLink } from "@/components/ui/ActionButtons";
import { HoursTable } from "@/components/ui/HoursTable";
import { LiveHeadline } from "@/components/ui/LiveStatus";
import { LiveToggle } from "@/components/ui/LiveToggle";
import { Slate } from "@/components/ui/Slate";
import { Wordmark } from "@/components/ui/Wordmark";
import { AWARD_LINE } from "@/data/awards";
import { FOOTER_NAV } from "@/data/nav";
import { VENUE } from "@/data/venue";
import { laParts, requestTime } from "@/lib/la-time";
import { NoBreakPhone } from "./NoBreakPhone";

// 2×2 from 640, one row from 1280. The hours table needs the widest column (3/4/2/3) to read without wrapping.
const COL = "col-span-full min-w-0 sm:col-span-4 lg:col-span-6";
const SPAN = { visit: "xl:col-span-3", hours: "xl:col-span-4", menus: "xl:col-span-2", follow: "xl:col-span-3" };
const HEAD = "t-label text-fg-muted";

export default function Footer() {
  const year = laParts(requestTime()).year;
  const { address, socials } = VENUE;
  return (
    <footer
      id="site-footer"
      data-ground="ink"
      aria-labelledby="footer-title"
      className="section-m border-t border-hair lg:pb-[max(96px,var(--space-m))]"
    >
      <div className="frame">
        <Slate title="Last call" titleId="footer-title" datum={<LiveHeadline withDot />} />

        <div className="grid-page mt-10 gap-y-12 lg:mt-14">
          {/* Visit */}
          <div id="visit" className={`${COL} ${SPAN.visit}`}>
            <h3 className={HEAD}>Visit</h3>
            <address className="mt-4 t-body not-italic">
              {address.street}, {address.suite}
              <br />
              {address.city}, {address.region} {address.postalCode}
            </address>
            <p className="mt-1 t-small text-fg-muted">{address.center}</p>
            <ul className="mt-3 flex flex-wrap gap-x-6">
              <li><DirectionsLink provider="google" /></li>
              <li><DirectionsLink provider="apple" label="Apple Maps" /></li>
            </ul>
            <CallLink label="full" />
            <p className="mt-1 t-small text-fg-muted"><NoBreakPhone text={VENUE.pickupLine} /></p>
            <BookButton variant="secondary" size="sm" detail={{ source: "footer" }} className="mt-6" />
          </div>

          {/* Hours */}
          <div className={`${COL} ${SPAN.hours}`}>
            <div className="flex items-center justify-between gap-4">
              <h3 className={HEAD}>Hours</h3>
              <LiveToggle />
            </div>
            {/* Day labels stay on one line wherever the table (315px min) fits its column: 360–639 (full width) and 728+ (half column). */}
            <HoursTable layout="grouped" className="mt-2 min-[360px]:max-sm:[&_th]:whitespace-nowrap min-[728px]:[&_th]:whitespace-nowrap" />
          </div>

          {/* Menus and more */}
          <nav aria-labelledby="footer-menus" className={`${COL} ${SPAN.menus}`}>
            <h3 id="footer-menus" className={HEAD}>Menus &amp; more</h3>
            <ul className="mt-3 border-t border-hair">
              {FOOTER_NAV.map((l) => (
                <li key={l.href} className="border-b border-hair">
                  <Link
                    href={l.href}
                    className="group flex min-h-11 items-center justify-between gap-2 t-small font-semibold"
                  >
                    <span className="decoration-1 underline-offset-[.22em] fine:group-hover:underline">{l.label}</span>
                    <span aria-hidden="true" className="text-fg-muted transition-transform duration-(--dur-2) ease-out fine:group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Follow */}
          <div className={`${COL} ${SPAN.follow}`}>
            <h3 className={HEAD}>Follow</h3>
            <ul className="mt-3 flex flex-col">
              <li>
                <Button href={socials.instagram.url} variant="quiet" size="sm">
                  Instagram <span className="text-fg-muted">{socials.instagram.handle}</span>
                </Button>
              </li>
              <li>
                <Button href={socials.facebook.url} variant="quiet" size="sm">Facebook</Button>
              </li>
            </ul>
            <Link
              href="/about#recognition"
              className="mt-6 block border-t border-hair pt-4 t-small text-fg-muted text-pretty decoration-1 underline-offset-[.22em] fine:hover:text-fg fine:hover:underline"
            >
              {AWARD_LINE}
            </Link>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div aria-hidden="true" className="mt-[clamp(64px,9vw,128px)] overflow-hidden px-(--margin) text-center">
        <Wordmark size="xl" />
      </div>

      <div className="frame mt-8 lg:mt-10">
        <div className="flex flex-col gap-6 border-t border-hair pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <Image src="/grapow-new-logo.png" alt="" width={96} height={92} className="h-auto w-24 shrink-0" />
            <div>
              <p className="t-label">
                {VENUE.descriptor} · {address.city}
              </p>
              <p className="mt-1 t-lede">{VENUE.tagline}</p>
            </div>
          </div>
          <p className="t-micro text-fg-muted">
            © <span className="tnum">{year}</span> {VENUE.name} · {address.city}, {address.region} · Prices subject to change.
          </p>
        </div>
      </div>
    </footer>
  );
}
