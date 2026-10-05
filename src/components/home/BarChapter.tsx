/**
 * H8 · 05 The bar (spec §12.1). On tap (computed count + names), four cocktails, and the screens.
 * C-12: one sports line only — no counts, schedules or packages.
 */
import Button from "@/components/ui/Button";
import { CallLink } from "@/components/ui/ActionButtons";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { MenuItemRow } from "@/components/ui/MenuItemRow";
import { Slate } from "@/components/ui/Slate";
import { MENUS, getItem } from "@/data/menu";
import { COPY, VENUE } from "@/data/venue";

const COCKTAILS = ["lycheetini", "gra-pow-mule", "grapowrita", "house-old-fashioned"];

export function BarChapter() {
  const draft = MENUS.bar.sections.find((s) => s.id === "draft");
  const cocktails = COCKTAILS.map((id) => getItem(id)).filter((c): c is NonNullable<typeof c> => !!c);
  return (
    <section id="bar" data-ground="ink-2" aria-labelledby="bar-title" className="section-l">
      <span id="events" aria-hidden="true" />
      <div className="frame">
        <Slate index="05" title="The bar" titleId="bar-title" datum={<LiveTrack track="bar" format="short" />} />
        {/* OWNER-CONFIRM(C-4): bar hours */}
        <p className="mt-12 t-d2 text-balance lg:mt-16 lg:max-w-[18ch]">{COPY.barDisplay}</p>

        <div className="mt-14 grid-page gap-y-16 lg:mt-20">
          {draft ? (
            <div className="col-span-full sm:col-span-4 lg:col-span-3">
              <h3 className="t-d3">On tap</h3>
              <p className="mt-5 flex items-baseline gap-3 border-t border-hair pt-5">
                <span className="t-score tnum text-accent">{draft.items.length}</span>
                <span className="t-label">Beers on draft</span>
              </p>
              <ul aria-label={draft.title} className="mt-4 columns-2 gap-x-4 t-small">
                {draft.items.map((item) => (
                  <li key={item.id} className="break-inside-avoid py-1">{item.name}</li>
                ))}
              </ul>
              {draft.note ? <p className="mt-5 t-note text-fg-muted">{draft.note}</p> : null}
            </div>
          ) : null}

          <div className="col-span-full sm:col-span-4 lg:col-span-5 lg:col-start-5">
            <h3 className="t-d3">Cocktails</h3>
            <ul aria-label="Cocktails" className="mt-5 border-b border-hair">
              {cocktails.map((item) => (
                <li key={item.id}>
                  <MenuItemRow item={item} />
                </li>
              ))}
            </ul>
            <Button href={MENUS.bar.href} variant="quiet" size="sm" arrow className="mt-5">Cocktails, shots, wine &amp; spirits</Button>
          </div>

          <div className="col-span-full lg:col-span-3 lg:col-start-10">
            <h3 className="t-d3">On the screens</h3>
            <div className="mt-5 border-t border-hair pt-5">
              {/* OWNER-CONFIRM(C-12): the sports line */}
              <p className="t-body text-pretty">{VENUE.sportsLine}</p>
              <p className="mt-3 t-body text-pretty">{VENUE.groupsLine}</p>
              <CallLink label="full" variant="secondary" size="md" className="mt-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
