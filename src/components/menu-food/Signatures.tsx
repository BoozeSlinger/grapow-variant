/**
 * Signatures band on /menu/food (spec §12.3): the namesake plus the three dishes the Press-Enterprise
 * named in 2019, as elevated order tickets on ink. 4-up ≥1280 · 2×2 640–1279 · scroll-snap rail <640.
 * Every fact (name, flags, description, price) comes from the menu data via getItem().
 */
import { DishTicket } from "@/components/ui/DishTicket";
import { Slate } from "@/components/ui/Slate";
import { getItem } from "@/data/menu";

const PICKS = ["pad-gra-pow", "kung-pik-pow", "crying-tiger-steak", "gra-pow-seafood"] as const;
/** Word joiner after the hyphen + no-break space before the year: the label wraps before "Press-Enterprise", never inside it. */
const PE_CONTEXT = "Named by the Press-\u2060Enterprise,\u00a02019";

export function Signatures() {
  const items = PICKS.map((id) => getItem(id)).filter((i) => i !== undefined);
  return (
    <section data-ground="ink" aria-labelledby="signatures-title" className="sm:pb-(--space-s)">
      <div className="frame">
        <Slate title="Signatures" titleId="signatures-title" />
        <ul className="mt-8 -mx-(--margin) flex snap-x snap-mandatory gap-(--gutter) overflow-x-auto scroll-px-(--margin) px-(--margin) pt-2 pb-12 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:p-0 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden [&_.ticket-head]:min-h-15 [&_.ticket-head]:items-end">
          {items.map((item) => (
            <li key={item.id} className="w-[min(82%,340px)] flex-none snap-start sm:w-auto">
              <DishTicket
                item={item}
                context={item.pe2019 ? PE_CONTEXT : "Shares our name"}
                elevated
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
