/**
 * H7 · 04 Happy hour (spec §12.1). the "twice a day" lockup with the live board, the bite chits
 * (rice tickets on ink) and the drink specials. Windows and prices all come from SCHEDULE and HAPPY_HOUR.
 */
import Button from "@/components/ui/Button";
import { HappyHourStatus } from "@/components/ui/HappyHourStatus";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { MenuItemRow, PriceText } from "@/components/ui/MenuItemRow";
import { Slate } from "@/components/ui/Slate";
import { Ticket } from "@/components/ui/Ticket";
import { MENUS } from "@/data/menu";
import { HH_BOTH, HH_EARLY } from "@/data/menu/happy-hour";
import { COPY } from "@/data/venue";
import { formatPrice, minPrice } from "@/lib/format";
import { serviceLines } from "@/lib/hours";

export function HappyHourChapter() {
  const hh = MENUS["happy-hour"];
  const bites = hh.sections.find((s) => s.id === "hh-bites");
  const drinks = hh.sections.find((s) => s.id === "hh-drinks");
  return (
    <section id="happy-hour" data-ground="ink" aria-labelledby="hh-title" className="section-l">
      <div className="frame">
        <Slate index="04" title="Happy hour" titleId="hh-title" datum={<LiveTrack track="happyHour" format="short" />} />

        <div className="mt-12 grid-page gap-y-12 lg:mt-16 lg:items-end">
          <div className="col-span-full lg:col-span-7">
            <p className="t-d1 text-balance">
              {COPY.hhDisplay.text}
              <br />
              <em className="font-serif text-[.78em] font-normal tracking-normal normal-case italic text-accent">{COPY.hhDisplay.em}</em>
            </p>
            <p className="mt-6 t-lede">{serviceLines().happyHour}</p>
          </div>
          <div className="col-span-full lg:col-span-4 lg:col-start-9">
            <div className="border-t-[1.5px] border-fg pt-5">
              <HappyHourStatus variant="board" />
            </div>
          </div>
        </div>

        <div className="mt-16 grid-page gap-y-14 lg:mt-24">
          {bites ? (
            <div className="col-span-full lg:col-span-7">
              <p id="hh-bites-label" className="t-label">
                <span className="tnum text-accent">{formatPrice(minPrice(bites.items))}</span> bites · <span className="tnum">{HH_EARLY}</span>
              </p>
              <ul aria-labelledby="hh-bites-label" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-reveal="rise">
                {bites.items.map((item) => (
                  <Ticket
                    key={item.id}
                    as="li"
                    elevated
                    paper="rice"
                    className="[&>.ticket-paper]:flex [&>.ticket-paper]:h-full [&>.ticket-paper]:flex-col [&_.ticket-body]:flex-1"
                    stub={<PriceText cents={item.prices[0]?.cents ?? null} />}
                  >
                    <h3 className="pt-2 t-title text-balance">{item.name}</h3>
                    {item.description ? <p className="mt-1.5 t-desc text-pretty">{item.description}</p> : null}
                  </Ticket>
                ))}
              </ul>
            </div>
          ) : null}
          {drinks ? (
            <div className="col-span-full lg:col-span-4 lg:col-start-9">
              <p id="hh-drinks-label" className="t-label">
                {drinks.title} · <span className="tnum">{HH_BOTH}</span>
              </p>
              <ul aria-labelledby="hh-drinks-label" className="mt-5 border-b border-hair">
                {drinks.items.map((item) => (
                  <li key={item.id}>
                    <MenuItemRow item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button href={hh.href} variant="secondary">The happy hour menu</Button>
          <p className="t-micro text-fg-muted">{COPY.hhFootnote}</p>
        </div>
      </div>
    </section>
  );
}
