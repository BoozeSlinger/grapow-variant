/**
 * H0 · Hero "Tonight" (spec §12.1). Server component; the board and ticket are client islands.
 * ≥1024: photo top-right (58%) over two scrims, copy cols 1–8, full-bleed Tonight Board at the bottom.
 * <1024: a 50svh photo band, the h1 overlapping it, then the Tonight ticket (no hero CTAs: the dock has them).
 * short landscape: the photo full-bleed behind a left scrim, the h1 and compact CTAs only.
 * `data-tonight` is the header's handoff target (§11.1).
 */
import { getImageProps } from "next/image";
import Button from "@/components/ui/Button";
import { BookButton, CallLink } from "@/components/ui/ActionButtons";
import { AWARD_SHORT, PE2019 } from "@/data/awards";
import { PHOTOS } from "@/data/photos";
import { COPY } from "@/data/venue";
import { capSrcSet, photoLoader } from "@/lib/cloudinary";
import { TonightBoard } from "./TonightBoard";
import { TonightTicket } from "./TonightTicket";

const SHORT_MQ = "(max-width: 1023.98px) and (max-height: 480px) and (orientation: landscape)";

/**
 * roomBar · hero. Like <Photo>, but with one extra art-directed source: short landscape phones get the
 * desktop (1:1) recipe full-bleed, as §12.1 asks. LCP candidate: priority + fetchpriority=high, never faded.
 */
function HeroPicture() {
  const entry = PHOTOS.roomBar;
  const slot = entry.slots.hero;
  const desktop = slot.desktop;
  const mobile = slot.mobile ?? slot.desktop;
  const common = { alt: slot.alt ?? entry.alt, fill: true, src: entry.publicId } as const;
  const d = getImageProps({
    ...common, sizes: "(min-width:1024px) 58vw, 100vw",
    loader: photoLoader(entry, desktop), priority: true, fetchPriority: "high",
  }).props;
  const m = getImageProps({ ...common, sizes: "100vw", loader: photoLoader(entry, mobile) }).props;
  return (
    <picture>
      <source media={SHORT_MQ} srcSet={capSrcSet(d.srcSet, desktop.maxW)} sizes="100vw" />
      <source media="(max-width: 1023.98px)" srcSet={capSrcSet(m.srcSet, mobile.maxW)} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- getImageProps output; alt is set */}
      <img {...d} srcSet={capSrcSet(d.srcSet, desktop.maxW)} className="object-cover object-[70%_50%] lg:object-right" />
    </picture>
  );
}

const [AWARD_HEAD, AWARD_TAIL] = AWARD_SHORT.split(" — ");

export function Hero() {
  return (
    <section
      id="tonight"
      data-tonight=""
      data-ground="ink"
      aria-labelledby="home-h1"
      className={[
        "relative isolate overflow-hidden",
        "[--board-h:136px] [@media(max-height:820px)]:[--board-h:120px]",
        "pb-12 sm:pb-16 lg:grid lg:min-h-[min(100svh,980px)] lg:grid-rows-[1fr_auto] lg:pb-0",
        "short:flex short:min-h-svh short:flex-col short:justify-end short:pb-6",
      ].join(" ")}
    >
      {/* Media */}
      <div
        className={[
          "relative -z-10 h-[50svh] min-h-[280px]",
          "lg:absolute lg:top-0 lg:right-0 lg:bottom-(--board-h) lg:h-auto lg:min-h-0 lg:w-[58%]",
          "short:absolute short:inset-0 short:h-auto short:min-h-0",
        ].join(" ")}
      >
        <HeroPicture />
        {/* Phones: bottom scrim under the overlapping h1 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 lg:hidden short:hidden"
          style={{ background: "linear-gradient(0deg, var(--color-ink) 0%, var(--color-ink) 12%, rgb(15 13 12 / .86) 30%, rgb(15 13 12 / 0) 62%)" }}
        />
        {/* ≥1024: left scrim into the copy column + bottom scrim into the board */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden lg:block"
          style={{ background: "linear-gradient(90deg, var(--color-ink) 0%, rgb(15 13 12 / .72) 18%, rgb(15 13 12 / 0) 46%), linear-gradient(0deg, rgb(15 13 12 / .6), rgb(15 13 12 / 0) 30%)" }}
        />
        {/* Short landscape: the photo runs full-bleed, so the left scrim spans the copy width */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden short:block"
          style={{ background: "linear-gradient(90deg, var(--color-ink) 0%, rgb(15 13 12 / .86) 34%, rgb(15 13 12 / 0) 72%)" }}
        />
      </div>

      {/* Copy */}
      <div
        className={[
          "frame grid-page -mt-[17svh]",
          "lg:mt-0 lg:pt-[calc(var(--header-full)+clamp(24px,5vh,64px))] lg:pb-10",
          // Short desktop windows (≤740px tall): the spec's last shrink step. Never the CTAs or the board.
          "lg:[@media(max-height:740px)]:pt-[calc(var(--header-full)+14px)]",
          "short:mt-0 short:pt-[calc(var(--header-full)+12px)]",
        ].join(" ")}
      >
        <div className="col-span-full lg:col-span-8">
          <h1 id="home-h1" className="flex flex-col [@media(min-width:1024px)_and_(max-height:740px)]:[&_.t-mega]:text-[11svh]">
            <span className="order-last mt-4 block t-label text-accent lg:order-first lg:mt-0 lg:mb-4 short:order-first short:mt-0 short:mb-3">
              {COPY.heroEyebrow}
            </span>
            {COPY.heroH1.map((line, i) => (
              <span key={line} className="block t-mega">
                {i > 0 ? " " : null}
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-6 t-lede measure-lede text-pretty max-sm:hidden lg:[@media(max-height:820px)]:max-w-[44ch] short:hidden">
            {COPY.heroLede}
          </p>

          <div className="mt-6 hidden flex-wrap items-center gap-3 lg:flex short:mt-5 short:flex">
            <BookButton size="lg" detail={{ source: "hero" }} className="short:h-11 short:px-[18px]" />
            <Button href="/menu" variant="secondary" size="lg" className="short:h-11 short:px-[18px]">See the menus</Button>
            <CallLink label="full" variant="quiet" className="short:hidden" />
          </div>

          <TonightTicket className="mt-8 max-w-[34rem] lg:hidden short:hidden" />

          <p className="mt-6 t-small text-fg-muted lg:mt-5 short:hidden">
            <a
              href={PE2019}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-hair decoration-1 underline-offset-[.22em] fine:hover:decoration-flag"
            >
              <strong className="font-bold text-accent">{AWARD_HEAD}</strong>
              {AWARD_TAIL ? ` — ${AWARD_TAIL}` : null}
              <span aria-hidden="true"> ↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </div>

      <TonightBoard className="hidden lg:block" />
    </section>
  );
}
