/**
 * Box-score price table (spec §10.12/§10.13). ≥640: a real <table> (tier columns, "—" = not offered).
 * <640: the same items as MenuItemRows with inline labelled tiers. Both render; CSS hides one, so
 * assistive tech gets exactly one. Deep-link ids live on the table rows; the phone list carries data-item.
 */
import type { MenuSection } from "@/data/menu/types";
import { Highlight, ItemFlags, MenuItemRow, PriceText } from "./MenuItemRow";

export function PriceTable({ section, matched, hidden, className }: {
  section: MenuSection; matched?: Map<string, string[]>; hidden?: Set<string>; className?: string;
}) {
  const tiers = section.tierLabels ?? section.items[0]?.prices.map((p) => p.label ?? "") ?? [];
  return (
    <div className={["min-w-0", className].filter(Boolean).join(" ")}>
      <table className="hidden w-full border-collapse sm:table">
        <caption className="sr-only">{section.title}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="py-2 pr-4 text-left t-label text-fg-muted">Item</th>
            {tiers.map((t) => (
              <th key={t} scope="col" className="py-2 pl-4 text-right t-label whitespace-nowrap text-fg-muted">{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.items.map((item) => (
            <tr key={item.id} id={`item-${item.id}`} data-item={item.id} tabIndex={-1} hidden={hidden?.has(item.id)} className="border-b border-hair align-baseline">
              <th scope="row" className="py-4 pr-4 text-left font-normal">
                <span className="item-name t-title">
                  <Highlight text={item.name} matched={matched?.get(item.id)} />
                </span>
                {(item.spicy || item.minSpice) && <span className="ml-2 inline-flex"><ItemFlags item={item} /></span>}
                {item.description ? (
                  <span className="mt-1.5 block t-desc measure-desc text-pretty">
                    <Highlight text={item.description} matched={matched?.get(item.id)} />
                  </span>
                ) : null}
              </th>
              {tiers.map((t, i) => (
                <td key={t} className="py-4 pl-4 text-right tnum">
                  <PriceText cents={item.prices[i]?.cents ?? null} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="sm:hidden" aria-label={section.title}>
        {section.items.map((item) => (
          <li key={item.id} data-item={item.id} tabIndex={-1} hidden={hidden?.has(item.id)}>
            <MenuItemRow item={item} matched={matched?.get(item.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
