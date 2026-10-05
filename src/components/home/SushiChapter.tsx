/**
 * H4 · 02 The sushi bar (spec §12.1). The tipped-in counter plate bleeds off the left edge; the three house
 * special rolls; the raw-food advisory. The datum leads with the positive state ("Opens 5 PM", "Back Tue 5 PM").
 */
import Button from "@/components/ui/Button";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { MenuItemRow } from "@/components/ui/MenuItemRow";
import { Plate } from "@/components/ui/Plate";
import { Slate } from "@/components/ui/Slate";
import { MENUS } from "@/data/menu";
import { COPY } from "@/data/venue";

export function SushiChapter() {
  const specials = MENUS.sushi.sections.find((s) => s.id === "house-specials");
  return (
    <section id="sushi" data-ground="rice" aria-labelledby="sushi-title" className="section-l border-t border-hair">
      <div className="frame">
        <Slate index="02" title="The sushi bar" titleId="sushi-title" datum={<LiveTrack track="sushi" format="short" />} />
        <div className="mt-12 grid-page gap-y-14 lg:mt-16 lg:items-center">
          {/* Bleeds off the left edge only; the caption keeps the page margin */}
          <div className="col-span-full -ml-(--margin) sm:col-span-6 lg:col-span-5 [&_figcaption]:pl-(--margin)">
            <Plate
              photo="sushiCounter"
              slot="plate"
              treatment="keyline"
              fig={1}
              caption="The sushi counter and open kitchen"
              sizes="(min-width:1024px) 40vw, (min-width:640px) 75vw, 100vw"
              reveal
            />
          </div>
          <div className="col-span-full lg:col-span-6 lg:col-start-7">
            <p className="t-d2 text-balance">{COPY.sushiDisplay}</p>
            {specials ? (
              <>
                <p className="mt-10 t-label text-fg-muted">{specials.title}</p>
                <ul aria-label={specials.title} className="mt-3 border-b border-hair">
                  {specials.items.map((item) => (
                    <li key={item.id}>
                      <MenuItemRow item={item} />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <p className="mt-6 t-micro text-fg-muted measure text-pretty">{COPY.rawAdvisory}</p>
            <Button href={MENUS.sushi.href} variant="secondary" className="mt-8">See the sushi menu</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
