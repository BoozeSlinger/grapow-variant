/**
 * H5 · 03 Chef & the record (spec §12.1). Awards appear only here and on the footer award line (C-6:
 * the 2020 badge is never shown). Everything is built from AWARDS and PRESS.
 */
import Button from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Slate } from "@/components/ui/Slate";
import { AWARDS } from "@/data/awards";
import { PRESS } from "@/data/press";
import { COPY, VENUE } from "@/data/venue";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;
const NewTab = () => (
  <>
    <span aria-hidden="true"> ↗</span>
    <span className="sr-only"> (opens in a new tab)</span>
  </>
);

const years = (rank: 1 | 3) => AWARDS.filter((a) => a.rank === rank).map((a) => a.year).join(" & ");

export function RecordChapter() {
  const first = AWARDS.find((a) => a.rank === 1);
  const top3 = AWARDS.find((a) => a.rank === 3);
  const badged = AWARDS.filter((a): a is typeof a & { badge: NonNullable<(typeof a)["badge"]> } => !!a.badge);
  const lead = PRESS[0];

  return (
    <section id="record" data-ground="rice-2" aria-labelledby="record-title" className="section-l">
      <span id="media" aria-hidden="true" />
      <div className="frame">
        <Slate index="03" title="Chef & the record" titleId="record-title" />
        <div className="mt-12 grid-page gap-y-16 lg:mt-16">
          {/* Chef */}
          <div className="col-span-full lg:col-span-5">
            <h3 className="t-d2 text-balance">{VENUE.chefOwner}, chef-owner</h3>
            <p className="mt-6 t-body measure text-pretty">{COPY.storyShort}</p>
            {lead ? (
              <a href={lead.url} {...external} className="group mt-8 block w-40">
                <figure className="m-0">
                  <div className="overflow-hidden">
                    <Photo
                      photo={lead.thumb}
                      slot="thumb"
                      sizes="160px"
                      imgClassName="transition-transform duration-(--dur-4) ease-out fine:group-hover:scale-[1.03]"
                    />
                  </div>
                  <figcaption className="mt-3 t-small text-fg-muted">
                    {lead.publication}, {lead.date}
                    <NewTab />
                  </figcaption>
                </figure>
              </a>
            ) : null}
            <Button href="/about" variant="quiet" size="sm" arrow className="mt-6">Our story</Button>
          </div>

          {/* The record */}
          <div className="col-span-full lg:col-span-6 lg:col-start-7">
            {first ? (
              <>
                <p className="t-num-xl text-accent">#{first.rank}</p>
                <h3 className="mt-3 t-d3">{first.title}</h3>
                <p className="mt-4 t-small">
                  <a href={first.url} {...external} className="underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag">
                    {first.source}, <span className="tnum">{years(1)}</span>
                    <NewTab />
                  </a>
                </p>
              </>
            ) : null}
            {top3 ? (
              <p className="mt-1 t-small text-fg-muted">
                {top3.label} — <span className="tnum">{years(3)}</span>
              </p>
            ) : null}

            <ul aria-label="Badges" className="mt-8 flex flex-wrap items-end gap-8">
              {badged.map((a) => (
                <li key={a.year} className="w-[120px]">
                  <figure className="m-0">
                    <Photo photo={a.badge} slot="badge" sizes="120px" fit="contain" />
                    <figcaption className="mt-2 t-label tnum text-fg-muted">
                      {a.rank === 1 ? a.year : `${a.year} · ${a.label}`}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>

            <h3 className="mt-12 t-label">Press</h3>
            <ul className="mt-3 border-b border-hair">
              {PRESS.map((p) => (
                <li key={p.id} className="border-t border-hair">
                  <a
                    href={p.url}
                    {...external}
                    className="group grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-3 sm:grid-cols-[11rem_minmax(0,1fr)_auto]"
                  >
                    <span className="t-label tnum text-fg-muted max-sm:col-span-2">{p.date}</span>
                    <span className="t-small">
                      <span className="font-semibold">{p.publication}</span> · {p.title}
                    </span>
                    <span aria-hidden="true" className="t-small transition-transform duration-(--dur-2) ease-out fine:group-hover:-translate-y-0.5 fine:group-hover:translate-x-0.5">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
