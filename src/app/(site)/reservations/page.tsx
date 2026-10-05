/**
 * /reservations — "Request a table" (spec §12.8). The form (cols 1–7) and a sticky "Good to know" ticket
 * (cols 9–12). Below 1024 the form comes first and carries its own fixed bar (the dock is null here).
 * Header / nav "Request a table" on this page scrolls to #request-form instead of opening the sheet.
 */
import type { Metadata } from "next";
import BookingForm from "@/components/booking/BookingForm";
import { NoBreakPhones } from "@/components/booking/NoBreakPhones";
import { CallLink } from "@/components/ui/ActionButtons";
import { HoursTable } from "@/components/ui/HoursTable";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { PageHeader } from "@/components/ui/PageHeader";
import { Ticket } from "@/components/ui/Ticket";
import { COPY, PAGE_META, VENUE } from "@/data/venue";
import { BOOKING_COPY } from "@/lib/booking/copy";
import { serviceLines } from "@/lib/hours";
import { BOOKING_FORM_ID } from "@/lib/overlay";

export const metadata: Metadata = { ...PAGE_META["/reservations"], alternates: { canonical: "/reservations" } };

export default function Page() {
  const lines = serviceLines();
  return (
    <>
      <PageHeader ground="rice" label="Host stand" title="Request a table" lede={COPY.bookingStandfirst} />
      <div data-ground="rice" className="pb-(--space-m)">
        <div className="frame grid-page gap-y-16">
          <section id={BOOKING_FORM_ID} className="col-span-full lg:col-span-7">
            <BookingForm variant="page" />
          </section>

          <aside aria-labelledby="good-to-know" className="col-span-full sm:col-span-6 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
              <Ticket
                head={<h2 id="good-to-know" className="t-label">Good to know</h2>}
                stub={<p className="t-small">{VENUE.pickupLine}</p>}
              >
                <div className="flex flex-col gap-5 pt-2">
                  <div>
                    <p className="t-body text-pretty"><NoBreakPhones text={BOOKING_COPY.groups} /></p>
                    <CallLink label="full" className="mt-1" />
                  </div>
                  <ul className="flex flex-col gap-1.5 border-t border-hair pt-4 t-small">
                    <li className="mb-1 font-semibold"><LiveTrack track="kitchen" withDot /></li>
                    <li>{lines.lunch}</li>
                    <li>{lines.happyHour}</li>
                    <li>{lines.sushi}</li>
                  </ul>
                  <HoursTable layout="grouped" showServiceLines={false} caption="Kitchen, bar and sushi bar hours" />
                </div>
              </Ticket>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
