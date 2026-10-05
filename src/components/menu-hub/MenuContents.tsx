/**
 * The /menu contents (spec §12.2): four full-row links, each with its live track, a fact line and three
 * sample names — all from data. On fine pointers at ≥1024, hovering or focusing a row crossfades its
 * 4:5 plate into the sticky slot (CSS :has, opacity only, lazy, alt=""). Food stays type-only: its plate
 * is set in type from the cook's index, and is also the resting state.
 */
import Link from "next/link";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { Photo } from "@/components/ui/Photo";
import { Slate } from "@/components/ui/Slate";
import { COOKS_INDEX, MENUS } from "@/data/menu";
import type { MenuId } from "@/data/menu/types";
import { MENU_NAV } from "@/data/nav";
import type { PhotoKey } from "@/data/photos";
import { COPY } from "@/data/venue";
import { countItems } from "@/lib/format";
import { serviceLines } from "@/lib/hours";

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const lines = serviceLines();

const FACTS: Record<MenuId, string> = {
  food: `${countItems(MENUS.food)} dishes · ${lowerFirst(lines.lunch)}`,
  sushi: lines.sushi,
  bar: COPY.barLede.replace(/\.$/, ""),
  "happy-hour": lines.happyHour,
};

/** The first item of the first three sections (round-robin deeper when a menu has fewer sections). */
function samples(id: MenuId): string[] {
  const sections = MENUS[id].sections.slice(0, 3);
  const out: string[] = [];
  for (let depth = 0; out.length < 3 && depth < 3; depth++) {
    for (const s of sections) if (s.items[depth] && out.length < 3) out.push(s.items[depth].name);
  }
  return out;
}

const PLATES: Array<{ id: MenuId; photo: PhotoKey; slot: string; show: string }> = [
  {
    id: "sushi", photo: "sushiCounter", slot: "plate",
    show: "group-has-[[data-plate=sushi]:hover]/contents:opacity-100 group-has-[[data-plate=sushi]:focus-within]/contents:opacity-100",
  },
  {
    id: "bar", photo: "tapWall", slot: "plate",
    show: "group-has-[[data-plate=bar]:hover]/contents:opacity-100 group-has-[[data-plate=bar]:focus-within]/contents:opacity-100",
  },
  {
    id: "happy-hour", photo: "roomBar", slot: "hhPlate",
    show: "group-has-[[data-plate=happy-hour]:hover]/contents:opacity-100 group-has-[[data-plate=happy-hour]:focus-within]/contents:opacity-100",
  },
];
const fade = "transition-opacity duration-(--dur-3) ease-out";

export function MenuContents() {
  const total = countItems(MENU_NAV.map((m) => MENUS[m.id]));
  return (
    <section data-ground="rice" aria-labelledby="menu-contents" className="group/contents pt-(--space-m) pb-(--space-s)">
      <div className="frame">
        <Slate title="Contents" titleId="menu-contents" datum={<><span className="tnum">{total}</span> dishes and drinks</>} />
      </div>
      <div className="frame grid-page mt-8">
        <ol className="col-span-full lg:fine:col-span-8">
          {MENU_NAV.map((entry, i) => (
            <li
              key={entry.id}
              data-plate={entry.id}
              className={[
                "group/row relative border-t border-line last:border-b",
                "before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:origin-left before:scale-x-0 before:bg-fg",
                "before:transition-transform before:duration-(--dur-4) before:ease-out fine:hover:before:scale-x-100",
                "has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-focus has-[a:focus-visible]:before:scale-x-100",
              ].join(" ")}
            >
              <div className="grid min-h-[120px] grid-cols-[auto_minmax(0,1fr)_auto] gap-x-4 gap-y-4 py-6 sm:gap-x-8 lg:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1fr)_auto] lg:py-8">
                <span aria-hidden="true" className="t-score tnum text-accent">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <h3 className="t-d2 text-balance">
                    <Link href={entry.href} className="after:absolute after:inset-0 focus-visible:outline-none">
                      {entry.label}
                    </Link>
                  </h3>
                  <p className="mt-3 t-small">
                    <LiveTrack track={entry.track} withDot />
                  </p>
                </div>
                <div className="col-span-2 col-start-2 min-w-0 lg:col-span-1 lg:col-start-3 lg:pt-1">
                  <p className="t-body text-pretty">{FACTS[entry.id]}</p>
                  <p className="mt-2 t-small text-fg-muted text-pretty">{samples(entry.id).join(" · ")}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="col-start-3 row-start-1 pt-1 t-d3 transition-transform duration-(--dur-2) ease-out fine:group-hover/row:translate-x-1 lg:col-start-4"
                >
                  →
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div aria-hidden="true" className="hidden lg:fine:col-span-4 lg:fine:col-start-9 lg:fine:block">
          <div className="sticky top-[calc(var(--header-h)+24px)]">
            <div className="plate-keyline relative aspect-[4/5]">
              <div
                data-ground="rice-2"
                className={[
                  "@container absolute inset-0 flex flex-col justify-between p-6",
                  fade,
                  "group-has-[[data-plate]:not([data-plate=food]):hover]/contents:opacity-0",
                  "group-has-[[data-plate]:not([data-plate=food]):focus-within]/contents:opacity-0",
                ].join(" ")}
              >
                <p className="t-label text-fg-muted">Cook&apos;s index</p>
                <ul className="font-serif text-[9.5cqw] leading-[1.12] italic">
                  {COOKS_INDEX.map((c) => <li key={c.term}>{c.term}</li>)}
                </ul>
                <p className="t-micro text-fg-muted">Words from our menu descriptions.</p>
              </div>
              {PLATES.map((p) => (
                <div key={p.id} className={["absolute inset-0 opacity-0", fade, p.show].join(" ")}>
                  <Photo photo={p.photo} slot={p.slot} sizes="(min-width:1024px) 30vw, 1px" alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
