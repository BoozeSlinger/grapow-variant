/**
 * /about — "Our story" (spec §12.7). Verified facts only: COPY.aboutLede, the two paraphrases, AWARDS and PRESS.
 * No quote, no founding year, no email. The dining-room plate (C-15) is used here and nowhere else.
 */
import type { Metadata } from "next";
import { ChefSection } from "@/components/about/ChefSection";
import { RecordSection } from "@/components/about/RecordSection";
import { SignaturesSection } from "@/components/about/SignaturesSection";
import { ThreeMenus } from "@/components/about/ThreeMenus";
import { VisitBand } from "@/components/about/VisitBand";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plate } from "@/components/ui/Plate";
import { COPY, PAGE_META } from "@/data/venue";

export const metadata: Metadata = { ...PAGE_META["/about"], alternates: { canonical: "/about" } };

export default function Page() {
  return (
    <>
      <PageHeader ground="rice" label="Our story" title="Chef-owned in Mission Grove" lede={COPY.aboutLede} />
      <div data-ground="rice">
        <div className="frame grid-page pb-4">
          <div className="col-span-full lg:col-span-10">
            <Plate
              photo="diningRoom"
              slot="room"
              treatment="keyline"
              fig={1}
              caption="The dining room bar and the to-go pickup counter"
              sizes="(min-width:1024px) 83vw, 100vw"
              priority
            />
          </div>
        </div>
        <ChefSection />
        <SignaturesSection />
        <ThreeMenus />
      </div>
      <RecordSection />
      <VisitBand />
    </>
  );
}
