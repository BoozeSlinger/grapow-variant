/**
 * /about, Slate 03 (spec §12.7): "Three menus under one roof". Three type-only columns — no images — each
 * with its live status, a line from the copy deck or the schedule, and a link. Nothing here is hard-coded:
 * hours text comes from src/lib/hours.ts and the copy deck.
 */
import Link from "next/link";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { Slate } from "@/components/ui/Slate";
import { TRACKS, type TrackId } from "@/data/hours";
import { COPY } from "@/data/venue";
import { serviceLines } from "@/lib/hours";

type Column = { track: Extract<TrackId, "kitchen" | "sushi" | "bar">; title: string; lines: string[]; link: string };

export function ThreeMenus() {
  const service = serviceLines();
  const columns: Column[] = [
    { track: "kitchen", title: "The kitchen", lines: [COPY.foodLede, service.lunch], link: "Food menu" },
    { track: "sushi", title: "The sushi bar", lines: [COPY.sushiDisplay], link: "Sushi bar menu" },
    { track: "bar", title: "The bar", lines: [COPY.barLede, COPY.barDisplay, COPY.sportsLine], link: "Drinks menu" },
  ];
  return (
    <section aria-labelledby="about-menus" className="section-s">
      <div className="frame">
        <Slate index="03" title="Three menus under one roof" titleId="about-menus" />
        <div
         
          className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3 md:[&>*+*]:border-l md:[&>*+*]:border-hair md:[&>*+*]:pl-8"
        >
          {columns.map((c) => (
            <article key={c.track} className="flex min-w-0 flex-col items-start">
              <h3 className="t-d3 text-balance">{c.title}</h3>
              <LiveTrack track={c.track} withDot className="mt-3 t-small font-semibold" />
              <div className="mt-4 flex flex-col gap-2 t-body text-pretty">
                {c.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <Link
                href={TRACKS[c.track].href}
                className="mt-5 inline-flex min-h-11 items-center t-ui underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag"
              >
                {c.link}<span aria-hidden="true">&nbsp;→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
