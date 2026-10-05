/**
 * /about, Slate 01 (spec §12.7): the chef-owner. The Dec 2019 Inland Empire Magazine cover scan (3:4, 240px,
 * linked ↗) beside the paraphrase. Facts only: COPY.iemParaphrase and the PRESS entry; no quote, no year.
 */
import Button from "@/components/ui/Button";
import { Plate } from "@/components/ui/Plate";
import { Slate } from "@/components/ui/Slate";
import { PRESS } from "@/data/press";
import { COPY, VENUE } from "@/data/venue";

/** The press entry featured here. Its scan is used once on the page, so the "On the record" list skips it. */
export const FEATURED_PRESS_ID = "iem-dec-2019";

export function ChefSection() {
  const feature = PRESS.find((p) => p.id === FEATURED_PRESS_ID);
  if (!feature) return null;
  return (
    <section aria-labelledby="about-chef" className="section-s">
      <div className="frame">
        <Slate index="01" title={VENUE.chefOwner} titleId="about-chef" />
        <div className="grid-page mt-10 items-start gap-y-8">
          <div className="col-span-full sm:col-span-3 lg:col-span-3">
            <div className="w-60 max-w-full">
              <Plate
                photo={feature.thumb}
                slot="thumb"
                treatment="plain"
                href={feature.url}
                sizes="240px"
                caption={<>{feature.publication}, {feature.date} <span aria-hidden="true">↗</span></>}
              />
            </div>
          </div>
          <div className="col-span-full sm:col-span-5 lg:col-span-6 lg:col-start-5">
            <p className="t-body measure text-pretty">{COPY.iemParaphrase}</p>
            <div className="mt-4">
              <Button href={feature.url} external variant="quiet">Read the feature</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
