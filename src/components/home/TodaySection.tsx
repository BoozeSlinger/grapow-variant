/** H2 · Today (spec §12.1): the tagline, then the day as a timeline — "Lunch to last call". */
import Button from "@/components/ui/Button";
import { DayStrip } from "@/components/ui/DayStrip";
import { LiveHeadline } from "@/components/ui/LiveStatus";
import { Slate } from "@/components/ui/Slate";
import { VENUE } from "@/data/venue";

export function TodaySection() {
  return (
    <section id="today" data-ground="rice-2" aria-labelledby="today-title" className="section-m">
      <div className="frame">
        <Slate title="Today" titleId="today-title" datum={<LiveHeadline withDot />} />
        <div className="mt-10 grid-page gap-y-10 lg:mt-14">
          <div className="col-span-full lg:col-span-4">
            {/* OWNER-CONFIRM(C-11): the tagline */}
            <p className="t-d1 text-balance">{VENUE.tagline}</p>
            <p className="mt-4 t-lede text-fg-muted">What&rsquo;s on today, and when.</p>
          </div>
          <div className="col-span-full min-w-0 lg:col-span-8">
            <DayStrip />
            <Button href="/visit" variant="quiet" size="sm" arrow className="mt-4">All hours &amp; directions</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
