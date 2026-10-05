"use client";
/**
 * H1 · Game Day (spec §12.1, C-12). Owner-fed from src/data/gameday.ts, which is EMPTY by default:
 * renders nothing until a fixture is added. One elevated ticket per fixture; 3-up ≥1024, a snap rail on phones.
 */
import { BookButton } from "@/components/ui/ActionButtons";
import { Slate } from "@/components/ui/Slate";
import { Ticket } from "@/components/ui/Ticket";
import { upcomingFixtures } from "@/data/gameday";
import { useNow } from "@/lib/clock";
import { lastSlotAtOrBefore } from "@/lib/hours";
import { formatClock, formatDateShort, laParts } from "@/lib/la-time";

/** Prefill a table half an hour before kick-off. */
const LEAD_MINUTES = 30;

export function GameDay() {
  const now = useNow();
  const fixtures = upcomingFixtures(now);
  if (!fixtures.length) return null;
  return (
    <section id="game-day" data-ground="ink-2" aria-labelledby="game-day-title" className="section-s">
      <div className="frame">
        <Slate title="On the screens" titleId="game-day-title" />
        <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 max-lg:-mx-(--margin) max-lg:scroll-px-(--margin) max-lg:px-(--margin) lg:grid lg:grid-cols-3 lg:gap-(--gutter) lg:overflow-visible">
          {fixtures.map((f) => {
            const p = laParts(Date.parse(f.startsAt));
            const slot = lastSlotAtOrBefore(p.dateISO, p.minutes - LEAD_MINUTES, now);
            return (
              <Ticket
                key={f.id}
                as="li"
                elevated
                className="w-[85vw] max-w-[26rem] shrink-0 snap-start lg:w-auto lg:max-w-none"
                labelledBy={`fixture-${f.id}`}
                head={<span className="t-label">{f.league}</span>}
                stub={
                  <BookButton variant="secondary" size="sm" detail={{ date: p.dateISO, time: slot?.time, source: "gameday" }}>
                    {/* may wrap on a 320px card; the button keeps its 44px height */}
                    <span className="whitespace-normal">Request a table for this game</span>
                  </BookButton>
                }
              >
                <h3 id={`fixture-${f.id}`} className="t-d3 text-balance">{f.matchup}</h3>
                <p className="mt-2 t-small tnum">{formatDateShort(p.dateISO)} · {formatClock(p.minutes)}</p>
                {f.note ? <p className="mt-2 t-desc">{f.note}</p> : null}
              </Ticket>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
