/** The menus hub (spec §12.2): search everything → contents → hours and notes. */
import type { Metadata } from "next";
import { HubSearch } from "@/components/menu-hub/HubSearch";
import { MenuContents } from "@/components/menu-hub/MenuContents";
import Button from "@/components/ui/Button";
import { HoursTable } from "@/components/ui/HoursTable";
import { LiveHeadline } from "@/components/ui/LiveStatus";
import { MenuNotes } from "@/components/ui/MenuNotes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Slate } from "@/components/ui/Slate";
import { COPY, PAGE_META, VENUE } from "@/data/venue";
export const metadata: Metadata = { ...PAGE_META["/menu"], alternates: { canonical: "/menu" } };

export default function Page() {
  return (
    <>
      <PageHeader
        ground="ink"
        label="Menus"
        title="Menus"
        lede={VENUE.descriptor}
        live={<LiveHeadline withDot />}
        actions={<HubSearch />}
      />
      <MenuContents />
      <section data-ground="rice" aria-label="Hours and notes" className="pb-(--space-m)">
        <div className="frame grid-page gap-y-12">
          <div className="col-span-full lg:col-span-7">
            <Slate title="Hours" titleId="menu-hours" />
            <HoursTable layout="grouped" className="mt-6" />
            <Button href="/visit" variant="quiet" arrow className="mt-4">All hours &amp; directions</Button>
          </div>
          <div className="col-span-full lg:col-span-4 lg:col-start-9">
            <Slate title="Menu notes" titleId="menu-notes" />
            <MenuNotes variant="bottom" notes={[COPY.allergyNote, COPY.priceNote]} className="mt-6" />
          </div>
        </div>
      </section>
    </>
  );
}
