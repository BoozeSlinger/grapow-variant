/** /menu/sushi, "Sushi bar" (spec §12.4). The counter band is the LCP. Metadata per §15. */
import type { Metadata } from "next";
import { CounterBand } from "@/components/menu-sushi/CounterBand";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { MenuBrowser } from "@/components/ui/MenuBrowser";
import { MenuNotes } from "@/components/ui/MenuNotes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plate } from "@/components/ui/Plate";
import { SUSHI } from "@/data/menu/sushi";
import { COPY, PAGE_META } from "@/data/venue";

export const metadata: Metadata = { ...PAGE_META["/menu/sushi"], alternates: { canonical: "/menu/sushi" } };

/** Allergy + price notes on one line; the raw-food advisory gets its own line below them. */
const topNotes = SUSHI.notes.filter((n) => n !== COPY.rawAdvisory);

export default function Page() {
  return (
    <>
      <PageHeader
        ground="ink"
        label="Sushi bar"
        title="Sushi bar"
        lede={COPY.sushiLede}
        live={<LiveTrack track="sushi" withDot />}
        actions={
          <div className="flex basis-full flex-col gap-2 measure">
            <MenuNotes variant="top" notes={topNotes} />
            <p className="t-small text-pretty text-fg-muted">{COPY.rawAdvisory}</p>
          </div>
        }
      />
      <CounterBand />
      <div data-ground="rice" className="[--rail-h:52px] lg:[--rail-h:0px]">
        <MenuBrowser
          menu={SUSHI}
          sectionExtras={{
            "house-specials": (
              <Plate
                photo="sushiPlate"
                slot="inset"
                treatment="keyline"
                fig={2}
                caption="From the sushi bar"
                sizes="(min-width:1024px) 40vw, 100vw"
                className="lg:w-3/5"
              />
            ),
          }}
        />
        <div className="frame grid-page pb-(--space-s)">
          <MenuNotes variant="bottom" notes={SUSHI.notes} className="col-span-full lg:col-span-9 lg:col-start-4" />
        </div>
      </div>
    </>
  );
}
