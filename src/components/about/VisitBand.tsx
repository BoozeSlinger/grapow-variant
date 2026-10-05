/**
 * /about closing band (spec §12.7): ink-2. The address in t-d3, Directions, Call and the one primary action
 * (Request a table, source "about"). Address and phone come from VENUE only.
 */
import { BookButton, CallLink, DirectionsLink } from "@/components/ui/ActionButtons";
import { LiveHeadline } from "@/components/ui/LiveStatus";
import { Slate } from "@/components/ui/Slate";
import { VENUE } from "@/data/venue";

export function VisitBand() {
  const a = VENUE.address;
  return (
    <section aria-labelledby="about-visit" data-ground="ink-2" className="section-s">
      <div className="frame">
        <Slate title="Visit" titleId="about-visit" datum={<LiveHeadline withDot />} />
        <div className="grid-page mt-10 items-end gap-y-8">
          <div className="col-span-full lg:col-span-7">
            <address className="not-italic t-d3 text-balance">
              <span className="block">{a.street}, {a.suite}</span>
              <span className="block">{a.city}, {a.region} {a.postalCode}</span>
            </address>
            <p className="mt-3 t-body text-fg-muted">{a.center}</p>
          </div>
          <div className="col-span-full flex flex-wrap items-center gap-x-5 gap-y-3 lg:col-span-5">
            <BookButton size="md" detail={{ source: "about" }} />
            <DirectionsLink variant="secondary" size="md" />
            <CallLink label="full" variant="quiet" size="md" />
          </div>
        </div>
      </div>
    </section>
  );
}
