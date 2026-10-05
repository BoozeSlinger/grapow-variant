/** Happy hour (spec §12.6): ink. Board header → appetizer chits + drink specials → CTAs → notes. */
import type { Metadata } from "next";
import { HappyHourHero } from "@/components/menu-bar/HappyHourHero";
import { HashTarget } from "@/components/menu-bar/HashTarget";
import { BookButton } from "@/components/ui/ActionButtons";
import Button from "@/components/ui/Button";
import { MenuItemRow, PriceText } from "@/components/ui/MenuItemRow";
import { MenuNotes } from "@/components/ui/MenuNotes";
import { Slate } from "@/components/ui/Slate";
import { Ticket } from "@/components/ui/Ticket";
import { TRACKS } from "@/data/hours";
import { BAR } from "@/data/menu/bar";
import { HAPPY_HOUR, HH_BOTH, HH_EARLY } from "@/data/menu/happy-hour";
import type { MenuSection } from "@/data/menu/types";
import { COPY, PAGE_META } from "@/data/venue";
export const metadata: Metadata = { ...PAGE_META["/menu/happy-hour"], alternates: { canonical: "/menu/happy-hour" } };

const section = (id: string) => HAPPY_HOUR.sections.find((s) => s.id === id) as MenuSection;
const BITES = section("hh-bites");
const DRINKS = section("hh-drinks");
const pad2 = (n: number) => String(n).padStart(2, "0");

function Head({ index, s, when }: { index: string; s: MenuSection; when: string }) {
  return (
    <>
      <Slate index={index} title={`${s.title} · ${when}`} titleId={`${s.id}-title`} />
      <p aria-hidden="true" className="mt-4 t-d3 text-balance">{s.title}</p>
    </>
  );
}

export default function Page() {
  return (
    <>
      <HappyHourHero label={TRACKS.happyHour.label} title={HAPPY_HOUR.title} />
      <div data-ground="ink" className="pb-(--space-m)">
        <div className="frame grid-page gap-y-16 pt-(--space-s)">
          <section id={BITES.id} aria-labelledby={`${BITES.id}-title`} className="col-span-full lg:col-span-7">
            <Head index="01" s={BITES} when={HH_EARLY} />
            <ul className="mt-8 grid gap-x-(--gutter) gap-y-6 sm:grid-cols-2">
              {BITES.items.map((item, n) => (
                <li key={item.id} id={`item-${item.id}`} data-item={item.id} tabIndex={-1} className="min-w-0">
                  <Ticket
                    elevated
                    paper="rice"
                    className="h-full [&>.ticket-paper]:h-full"
                    head={
                      <>
                        <span className="t-label tnum text-fg-muted">{pad2(n + 1)}</span>
                        <PriceText cents={item.prices[0]?.cents ?? null} />
                      </>
                    }
                  >
                    <h3 className="item-name t-title text-pretty">{item.name}</h3>
                    {item.description ? <p className="mt-1.5 t-desc text-pretty">{item.description}</p> : null}
                  </Ticket>
                </li>
              ))}
            </ul>
          </section>

          <section id={DRINKS.id} aria-labelledby={`${DRINKS.id}-title`} className="col-span-full lg:col-span-4 lg:col-start-9">
            <Head index="02" s={DRINKS} when={HH_BOTH} />
            <ul className="mt-8 border-b border-hair">
              {DRINKS.items.map((item) => <MenuItemRow key={item.id} item={item} as="li" />)}
            </ul>
          </section>

          <div className="col-span-full flex flex-col gap-6 border-t border-hair pt-8 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-wrap gap-3">
              <BookButton size="lg" detail={{ source: "menu" }} />
              <Button href={BAR.href} variant="secondary" size="lg">See the full bar menu</Button>
            </div>
            <p className="t-small text-fg-muted text-pretty">{COPY.groupsLine}</p>
          </div>

          <MenuNotes variant="bottom" notes={HAPPY_HOUR.notes} className="col-span-full lg:col-span-7" />
        </div>
      </div>
      <HashTarget />
    </>
  );
}
