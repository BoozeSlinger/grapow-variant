/**
 * /visit — "Hours & directions" (spec §11.7). Rice throughout: the day strip and the week, where to find us
 * (address, Directions, Call, pickup — no parking, landmark or delivery claims), and the table request.
 * No photo, no map iframe. Every fact comes from @/data and @/lib/hours.
 */
import type { Metadata } from "next";
import { BookButton, CallLink, DirectionsLink } from "@/components/ui/ActionButtons";
import { DayStrip } from "@/components/ui/DayStrip";
import { HoursTable } from "@/components/ui/HoursTable";
import { LiveHeadline } from "@/components/ui/LiveStatus";
import { LiveToggle } from "@/components/ui/LiveToggle";
import { PageHeader } from "@/components/ui/PageHeader";
import { Slate } from "@/components/ui/Slate";
import { NoBreakPhone } from "@/components/chrome/NoBreakPhone";
import { COPY, PAGE_META, VENUE } from "@/data/venue";

export const metadata: Metadata = { ...PAGE_META["/visit"], alternates: { canonical: "/visit" } };

export default function Page() {
  const { address } = VENUE;
  return (
    <>
      <PageHeader
        ground="rice"
        label="Visit"
        title={PAGE_META["/visit"].title}
        live={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <LiveHeadline withDot className="t-title" />
            <LiveToggle />
          </div>
        }
      />

      {/* 01 · Today and the week */}
      <section data-ground="rice" aria-labelledby="visit-week" className="pb-(--space-s)">
        <div className="frame">
          <Slate index="01" title="Today and the week" titleId="visit-week" />
          <div className="grid-page mt-8 gap-y-12 lg:mt-10">
            <div className="col-span-full min-w-0 xl:col-span-7">
              <DayStrip />
            </div>
            <div className="col-span-full min-w-0 sm:col-span-6 lg:col-span-7 xl:col-span-5">
              <HoursTable layout="week" className="hidden sm:block" />
              <HoursTable layout="grouped" className="sm:hidden min-[360px]:[&_th]:whitespace-nowrap" />
            </div>
          </div>
        </div>
      </section>

      {/* 02 · Find us */}
      <section data-ground="rice" aria-labelledby="visit-find" className="pb-(--space-s)">
        <div className="frame">
          <Slate index="02" title="Find us" titleId="visit-find" />
          <div className="grid-page mt-8 gap-y-10 lg:mt-10">
            <div className="col-span-full lg:col-span-8">
              <address className="t-d2 not-italic text-balance">
                <span className="block">{address.street}</span>
                <span className="block">
                  {address.suite} · {address.city}, {address.region} <span className="tnum">{address.postalCode}</span>
                </span>
              </address>
              <p className="mt-4 t-lede">{address.center}</p>
            </div>
            <div className="col-span-full sm:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end">
              <div className="flex flex-wrap gap-3">
                <DirectionsLink provider="google" variant="secondary" size="md" />
                <DirectionsLink provider="apple" label="Apple Maps" variant="secondary" size="md" />
              </div>
              <div className="mt-5 border-t border-hair pt-3">
                <CallLink label="full" size="md" />
                <p className="t-small text-fg-muted"><NoBreakPhone text={VENUE.pickupLine} /></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 · Request a table */}
      <section data-ground="rice" aria-labelledby="visit-book" className="pb-(--space-m)">
        <div className="frame">
          <Slate index="03" title="Request a table" titleId="visit-book" />
          <div className="grid-page mt-8 gap-y-8 lg:mt-10">
            <p className="col-span-full t-lede measure-lede text-pretty lg:col-span-6">{COPY.bookingStandfirst}</p>
            <div className="col-span-full lg:col-span-4 lg:col-start-9">
              <BookButton size="lg" detail={{ source: "visit" }} />
              <p className="mt-4 t-small text-fg-muted"><NoBreakPhone text={COPY.groupsLine} /></p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
