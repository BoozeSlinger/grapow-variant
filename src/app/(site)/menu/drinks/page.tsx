/** "The bar" (spec §12.5): ink throughout. Header → happy-hour strip (only while on) → tap-wall band → menu. */
import type { Metadata } from "next";
import { HhBanner } from "@/components/menu-bar/HhBanner";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { MenuBrowser } from "@/components/ui/MenuBrowser";
import { MenuNotes } from "@/components/ui/MenuNotes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plate } from "@/components/ui/Plate";
import { BAR } from "@/data/menu/bar";
import { COPY, PAGE_META } from "@/data/venue";
export const metadata: Metadata = { ...PAGE_META["/menu/drinks"], alternates: { canonical: "/menu/drinks" } };

export default function Page() {
  return (
    <>
      <PageHeader ground="ink" label="The bar" title="The bar" lede={COPY.barLede} live={<LiveTrack track="bar" withDot />} />
      <HhBanner />
      <section aria-label="The tap wall" data-ground="ink">
        <Plate photo="tapWall" slot="band" treatment="lower-third" caption="The tap wall" sizes="100vw" priority />
      </section>
      <div data-ground="ink" className="pb-(--space-m)">
        <MenuBrowser menu={BAR} hhActiveFlags />
        <div className="frame grid-page">
          <MenuNotes variant="bottom" notes={BAR.notes} className="col-span-full lg:col-span-6 lg:col-start-4" />
        </div>
      </div>
    </>
  );
}
