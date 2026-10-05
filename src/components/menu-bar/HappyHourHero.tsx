/**
 * /menu/happy-hour header (spec §12.6). PageHeader's padding, label and h1, but with the spec's own split:
 * text cols 1–7 (so the t-num-xl board fits on one line per window), the hhPlate in cols 8–12 bleeding
 * right; below 1024 the plate sits under the h1, ahead of the board. The board is built from SCHEDULE.
 */
import { HappyHourStatus } from "@/components/ui/HappyHourStatus";
import { Plate } from "@/components/ui/Plate";
import { SCHEDULE } from "@/data/hours";
import { formatRange, type Weekday } from "@/lib/la-time";

const DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
const byDay = DAYS.map((d) => SCHEDULE.happyHour[d].map((w) => formatRange(w.open, w.close, { endWord: w.endWord })));
const WINDOWS = byDay[0];
const DAILY = byDay.every((w) => w.join("|") === WINDOWS.join("|"));

export function HappyHourHero({ label, title }: { label: string; title: string }) {
  return (
    <header data-ground="ink" className="pt-[calc(var(--header-full)+clamp(32px,6vw,72px))] pb-[clamp(40px,6vw,80px)]">
      <div className="frame grid-page gap-y-8 lg:gap-y-12">
        <div className="col-span-full lg:col-span-7 lg:row-start-1">
          <p className="mb-4 t-label text-accent">{label}</p>
          <h1 className="t-d1 text-balance">{title}</h1>
        </div>

        <div className="col-span-3 col-start-2 -mr-(--margin) sm:col-span-4 sm:col-start-5 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
          <Plate
            photo="roomBar"
            slot="hhPlate"
            treatment="lower-third"
            caption="The Happy Hour sign"
            sizes="(min-width:1024px) 34vw, (min-width:640px) 50vw, 75vw"
            priority
          />
        </div>

        <div className="col-span-full lg:col-span-7 lg:row-start-2">
          {DAILY ? <p className="t-label text-fg-muted">Daily</p> : null}
          <p className="mt-3 t-num-xl text-accent">
            {WINDOWS.map((w, i) => (
              <span key={w} className="block whitespace-nowrap">
                {i > 0 ? <span className="sr-only">and </span> : null}
                {w}
              </span>
            ))}
          </p>
          <HappyHourStatus variant="board" className="mt-10 border-t border-hair pt-6" />
        </div>
      </div>
    </header>
  );
}
