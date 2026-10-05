/** /menu/food, "The kitchen" (spec §12.3). Text-led: no photo, the h1 is the LCP. Metadata per §15. */
import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { Signatures } from "@/components/menu-food/Signatures";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { MenuBrowser } from "@/components/ui/MenuBrowser";
import { MenuNotes } from "@/components/ui/MenuNotes";
import { PageHeader } from "@/components/ui/PageHeader";
import { FOOD } from "@/data/menu/food";
import { COPY, PAGE_META, VENUE } from "@/data/venue";

export const metadata: Metadata = { ...PAGE_META["/menu/food"], alternates: { canonical: "/menu/food" } };

export default function Page() {
  return (
    <>
      <PageHeader
        ground="ink"
        label="Food menu"
        title="The kitchen"
        lede={COPY.foodLede}
        live={
          <ul className="flex flex-col gap-y-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
            <li><LiveTrack track="kitchen" withDot /></li>
            <li><LiveTrack track="lunch" withDot /></li>
            <li>
              <a
                href={VENUE.phone.href}
                className="inline-flex min-h-11 items-center gap-2 underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag"
              >
                <Phone size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
                {VENUE.pickupLine}
              </a>
            </li>
          </ul>
        }
        actions={<MenuNotes variant="top" notes={FOOD.notes} className="measure" />}
      />
      <Signatures />
      <div data-ground="rice" className="[--rail-h:52px] lg:[--rail-h:0px]">
        <MenuBrowser menu={FOOD} filters={["spicy", "lunch"]} />
        <div className="frame grid-page pb-(--space-s)">
          <MenuNotes variant="bottom" notes={FOOD.notes} className="col-span-full lg:col-span-9 lg:col-start-4" />
        </div>
      </div>
    </>
  );
}
