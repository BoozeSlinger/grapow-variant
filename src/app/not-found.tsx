/**
 * Root 404 — "86'd" (spec §11.8). Root level, so no site chrome and no ClockProvider: nothing live here.
 * Ink ground, centred (one of the two centred compositions on the site), with the ways back in.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { CallLink } from "@/components/ui/ActionButtons";
import { Wordmark } from "@/components/ui/Wordmark";
import { COPY, VENUE } from "@/data/venue";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main
      id="main"
      data-ground="ink"
      className="grid min-h-svh place-items-center px-(--margin) py-[clamp(48px,8vw,96px)] text-center"
    >
      <div className="flex max-w-[52rem] flex-col items-center">
        <Link href="/" aria-label={`${VENUE.name} — home`} className="inline-flex min-h-11 items-center">
          <Wordmark size="md" />
        </Link>

        <div aria-hidden="true" className="mt-[clamp(40px,7vw,72px)] h-px w-24 bg-line" />

        <h1 className="mt-[clamp(40px,7vw,72px)] t-d1 text-balance">{COPY.notFoundH1}</h1>
        <p className="mt-6 t-lede measure-lede text-pretty text-fg-muted">{COPY.notFoundBody}</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button href="/reservations" variant="primary" size="md">Request a table</Button>
          <Button href="/menu" variant="secondary" size="md">Menus</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8">
          <Button href="/" variant="quiet" size="md">Home</Button>
          <CallLink label="full" size="md" />
        </div>
      </div>
    </main>
  );
}
