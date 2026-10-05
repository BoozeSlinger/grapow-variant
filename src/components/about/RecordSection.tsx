/**
 * /about, Slate 04 (spec §12.7): "On the record" (id="recognition", linked from the footer).
 * A real <table> of the Best of the Inland Empire honours (Year · Honour · Source ↗) from AWARDS, the 2019 and
 * 2023 badge art captioned with their own result (the 2020 badge is never shown), and the press list from PRESS
 * with 3:4 thumbnails. The Dec 2019 magazine scan sits in Slate 01, so its row is not repeated here: no photo
 * appears twice on a page (spec §0.7).
 */
import { Photo } from "@/components/ui/Photo";
import { Slate } from "@/components/ui/Slate";
import { AWARD_LINE, AWARDS } from "@/data/awards";
import { PHOTOS } from "@/data/photos";
import { PRESS } from "@/data/press";
import { FEATURED_PRESS_ID } from "./ChefSection";

const topRank = Math.min(...AWARDS.map((a) => a.rank));
const link = "underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag";

export function RecordSection() {
  const badges = AWARDS.filter((a) => a.badge);
  const press = PRESS.filter((p) => p.id !== FEATURED_PRESS_ID);
  return (
    <section id="recognition" aria-labelledby="about-record" data-ground="rice-2" className="section-s">
      <div className="frame">
        <Slate index="04" title="On the record" titleId="about-record" />
        <div className="grid-page mt-10 gap-y-14">
          <div className="col-span-full lg:col-span-4">
            <p aria-hidden="true" className="t-num-xl text-accent">#{topRank}</p>
            <p className="mt-4 t-body measure text-pretty">{AWARD_LINE}</p>
            <ul className="mt-8 flex list-none gap-6 p-0">
              {badges.map((a) => (
                <li key={a.year} className="w-[min(40%,9rem)]">
                  <figure className="m-0">
                    <Photo photo={a.badge!} slot="badge" sizes="144px" fit="contain" />
                    <figcaption className="mt-3 t-small tnum">{a.label} · {a.year}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-full lg:col-span-7 lg:col-start-6">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Best Thai Food, Press-Enterprise Best of Inland Empire, by year</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="w-16 py-2 pr-3 align-bottom t-label text-fg-muted">Year</th>
                  <th scope="col" className="py-2 pr-3 align-bottom t-label text-fg-muted">Honour</th>
                  <th scope="col" className="py-2 align-bottom t-label text-fg-muted">Source</th>
                </tr>
              </thead>
              <tbody>
                {AWARDS.map((a) => (
                  <tr key={a.year} className="border-b border-hair align-top">
                    <th scope="row" className="py-4 pr-3 text-left t-title tnum">{a.year}</th>
                    <td className="py-4 pr-3">
                      <span className={a.rank === topRank ? "t-title text-accent" : "t-title"}>{a.label}</span>
                      <span className="block t-small text-fg-muted">{a.title}</span>
                      {a.note ? <span className="mt-1 block t-small text-fg-muted text-pretty">{a.note}</span> : null}
                    </td>
                    <td className="py-4 t-small">
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center ${link}`}>
                        <span>{a.source}&nbsp;<span aria-hidden="true">↗</span></span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="mt-14 t-label">In print</h3>
            <ul className="mt-4 list-none p-0">
              {press.map((p) => (
                <li key={p.id} className="grid grid-cols-[7.5rem_1fr] items-start gap-5 border-t border-hair py-5 last:border-b">
                  <div className="w-30">
                    <Photo photo={p.thumb} slot="thumb" sizes="120px" alt={PHOTOS[p.thumb].alt} />
                  </div>
                  <div className="min-w-0">
                    <p className="t-label text-fg-muted">{p.publication} · <span className="tnum">{p.date}</span></p>
                    <p className="mt-2 t-title">
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center ${link}`}>
                        <span>{p.title}&nbsp;<span aria-hidden="true">↗</span></span>
                        <span className="sr-only"> ({p.publication}, {p.date}; opens in a new tab)</span>
                      </a>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
