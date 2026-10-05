"use client";
/**
 * "The bar" happy-hour strip (spec §12.5). Renders only while happy hour is on. Every word and price
 * is composed from HAPPY_HOUR (deals) and the shared clock (the "till" end) — no literals, no
 * computed discounts (C-5). Not a live region: it appears or disappears on the minute tick.
 */
import Link from "next/link";
import { TRACKS } from "@/data/hours";
import { HAPPY_HOUR } from "@/data/menu/happy-hour";
import { useVenueStatus } from "@/lib/clock";
import { formatPrice } from "@/lib/format";

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const drinks = HAPPY_HOUR.sections.find((s) => s.id === "hh-drinks")?.items ?? [];
/** The deal note ("off" deals) + its name — every item whose deal is a note rather than a price. */
const NOTE_DEALS = drinks.filter((i) => i.priceNote).map((i) => ({ price: i.priceNote!, names: lowerFirst(i.name) }));
/** The lowest-priced group of drink specials: every item at the minimum price, joined by name. */
const priced = drinks.filter((i) => typeof i.prices[0]?.cents === "number");
const low = priced.length ? Math.min(...priced.map((i) => i.prices[0].cents as number)) : null;
const LOW_DEAL = low === null ? null : {
  names: priced.filter((i) => i.prices[0].cents === low).map((i) => i.name).join(", "),
  price: formatPrice(low),
};

export function HhBanner() {
  const hh = useVenueStatus().tracks.happyHour;
  if (!hh.open) return null;
  const sep = <span aria-hidden="true" className="text-fg-muted"> · </span>;
  return (
    <aside aria-label={TRACKS.happyHour.label} data-ground="ink-2" className="border-y border-hair">
      <div className="frame flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-5">
        <span className="inline-flex min-h-7 w-fit flex-none items-center rounded-sm bg-yolk px-2 t-label text-char">On now</span>
        <p className="min-w-0 flex-1 t-small text-pretty">
          <strong className="font-bold">{TRACKS.happyHour.label} now</strong>
          {NOTE_DEALS.map((d) => (
            <span key={d.names}>{sep}<span className="tnum font-bold text-accent">{d.price}</span> {d.names}</span>
          ))}
          {LOW_DEAL ? <span>{sep}{LOW_DEAL.names} <span className="tnum font-bold text-accent">{LOW_DEAL.price}</span></span> : null}
          {sep}<span className="whitespace-nowrap">{lowerFirst(hh.short)}</span>
        </p>
        <Link
          href={TRACKS.happyHour.href}
          className="group inline-flex min-h-11 w-fit flex-none items-center gap-2 t-ui underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag"
        >
          Happy hour menu
          <span aria-hidden="true" className="inline-block transition-transform duration-(--dur-2) ease-out fine:group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </aside>
  );
}
