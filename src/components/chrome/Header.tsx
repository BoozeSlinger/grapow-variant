"use client";
/**
 * Site header (spec §11.1, §11.3). Fixed. Below 1024: a 56px row (wordmark · status chip · Menu → nav sheet),
 * plus compact Call / Request in short landscape. 1024 and up: 72px (12px top padding + a 60px row) that
 * condenses to a visible 60px by translateY(-12px) after 80px of scroll — transform only, never height.
 * The hairline is an inset shadow so the bar is exactly --header-full / --header-h tall.
 *
 * Right cluster ≥1024: HeaderChip · Call · Request a table. Call is quiet throughout and sized to the room, so
 * the 1fr/auto/1fr grid keeps the wordmark centred instead of the right cluster pushing it over: "Call" below
 * 1280 and on route pages (whose chip carries a longer track line); the number from 1280; "Call <number>" from 1440.
 *
 * Home handoff (G2): while the home hero ([data-tonight]) is in view the chip is hidden (inert) and the header
 * CTA steps down to secondary; when the hero has left (behind the header) the chip slides in and the CTA is
 * primary again. No hero on the page → chip shown, CTA primary.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Menu as MenuIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { BookButton, CallLink } from "@/components/ui/ActionButtons";
import { Wordmark } from "@/components/ui/Wordmark";
import { PRIMARY_NAV } from "@/data/nav";
import { VENUE } from "@/data/venue";
import { useVenueStatus } from "@/lib/clock";
import { closeOverlay, openOverlay, useOverlay } from "@/lib/overlay";
import { HeaderChip } from "./HeaderChip";
import { HoursSheet } from "./HoursSheet";
import { MenuDisclosure } from "./MenuPanel";
import { NavPending, PendingBar, PendingContext } from "./NavPending";
import { NavSheet } from "./NavSheet";

const CONDENSE_AT = 80;
const HOME_LABEL = `${VENUE.name} — home`;
const CHROME_OVERLAYS = new Set(["nav", "hours", "menu-panel"]);

function closeChromeOverlay() {
  const o = useOverlay.getState().overlay;
  if (o && CHROME_OVERLAYS.has(o.kind)) closeOverlay();
}

/** Visible header height (--header-h: 56px, 60px ≥1024) — the hero counts as gone once it is behind it. */
function headerHeight() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 56;
}

export default function Header() {
  const pathname = usePathname();
  const navOpen = useOverlay((s) => s.overlay?.kind === "nav");
  // Route pages lead with their own track; the long chip leaves no room for the full number (see HeaderChip).
  const routeChip = useVenueStatus().primary !== "venue";
  const [condensed, setCondensed] = useState(false);
  // Hero visibility, keyed by route so a client navigation never shows the previous page's answer.
  const [hero, setHero] = useState<{ path: string; inView: boolean } | null>(null);
  const heroInView = hero?.path === pathname ? hero.inView : pathname === "/";
  const [pending, setPending] = useState(0);
  const report = useCallback((d: 1 | -1) => setPending((n) => Math.max(0, n + d)), []);

  // Condense: one passive, rAF-throttled scroll listener.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setCondensed(window.scrollY > CONDENSE_AT);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Handoff: watch [data-tonight]; re-query on every route change. If it is missing at mount (streamed or added
  // later), look again on the first scroll and whenever <main> gains nodes, until it turns up.
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    let raf = 0;
    const watch = (el: Element) => {
      mo?.disconnect();
      window.removeEventListener("scroll", find);
      io = new IntersectionObserver(
        ([entry]) => setHero({ path: pathname, inView: entry.isIntersecting }),
        { rootMargin: `-${headerHeight()}px 0px 0px 0px` },
      );
      io.observe(el);
    };
    function find() {
      const el = io ? null : document.querySelector("[data-tonight]");
      if (el) watch(el);
    }
    const el = document.querySelector("[data-tonight]");
    if (el) watch(el);
    else {
      raf = requestAnimationFrame(() => setHero({ path: pathname, inView: false }));
      window.addEventListener("scroll", find, { passive: true, once: true });
      const main = document.getElementById("main");
      if (main) {
        mo = new MutationObserver(find);
        mo.observe(main, { childList: true, subtree: true });
      }
    }
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      mo?.disconnect();
      window.removeEventListener("scroll", find);
    };
  }, [pathname]);

  // Navigation closes the chrome overlays (nav sheet, hours sheet, menu panel).
  useEffect(() => {
    closeChromeOverlay();
  }, [pathname]);

  // Crossing 1024 closes whichever chrome overlay belongs to the other layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      const kind = useOverlay.getState().overlay?.kind;
      if ((mq.matches && kind === "nav") || (!mq.matches && kind === "menu-panel")) closeOverlay();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const ctaVariant = heroInView ? "secondary" : "primary";
  const current = (href?: string) => (href && pathname === href ? "page" : undefined);

  return (
    <PendingContext.Provider value={report}>
      <header
        id="site-header"
        data-ground="ink-2"
        data-condensed={condensed || undefined}
        data-hero={heroInView || undefined}
        className="fixed inset-x-0 top-0 z-(--z-header) bg-ink-2/95 shadow-[inset_0_-1px_0_var(--hair)] transition-transform duration-(--dur-2) ease-out lg:pt-3 lg:data-condensed:-translate-y-3"
      >
        {/* ── 1024 and up ── */}
        <div className="frame hidden h-15 grid-cols-[1fr_auto_1fr] items-center gap-6 lg:grid">
          <nav aria-label="Primary" className="justify-self-start">
            <ul className="flex items-center gap-6 t-ui xl:gap-7">
              {PRIMARY_NAV.map((l) =>
                l.kind === "menu" || !l.href ? (
                  <MenuDisclosure key={l.label} label={l.label} />
                ) : (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={current(l.href)}
                      className="inline-flex min-h-11 items-center whitespace-nowrap decoration-2 underline-offset-[10px] aria-[current=page]:underline aria-[current=page]:decoration-chili-lit fine:hover:underline fine:hover:decoration-line"
                    >
                      {l.label}
                      <NavPending />
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <Link href="/" aria-label={HOME_LABEL} className="inline-flex min-h-11 items-center justify-self-center">
            <Wordmark size="md" />
            <NavPending />
          </Link>

          <div className="flex items-center gap-3 justify-self-end">
            <HeaderChip hidden={heroInView} />
            <CallLink label="full" variant="quiet" className={routeChip ? "hidden" : "hidden min-[1440px]:inline-flex"} />
            <CallLink label={VENUE.phone.display} variant="quiet" className={routeChip ? "hidden" : "hidden xl:max-[1439.98px]:inline-flex"} />
            <CallLink label="short" variant="quiet" className={routeChip ? undefined : "xl:hidden"} />
            <BookButton size="sm" variant={ctaVariant} detail={{ source: "header" }} />
          </div>
        </div>

        {/* ── Below 1024 ── */}
        <div className="frame grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 max-[374.98px]:gap-1 lg:hidden">
          <Link href="/" aria-label={HOME_LABEL} className="inline-flex min-h-11 items-center">
            <Wordmark size="sm" />
            <NavPending />
          </Link>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <HeaderChip size="sm" hidden={heroInView} className="min-w-0 max-[359.98px]:hidden" />
            <CallLink label="short" variant="secondary" size="sm" className="hidden px-3.5 short:inline-flex" />
            <BookButton size="sm" variant={ctaVariant} detail={{ source: "header" }} className="hidden px-3.5 short:inline-flex">
              Request<span className="sr-only"> a table</span>
            </BookButton>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={MenuIcon}
            iconPosition="end"
            aria-expanded={navOpen}
            aria-controls="nav-sheet"
            aria-haspopup="dialog"
            className="px-2.5"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => openOverlay({ kind: "nav" }, e.currentTarget)}
          >
            Menu
          </Button>
        </div>

        <PendingBar active={pending > 0} />
      </header>
      <NavSheet />
      <HoursSheet />
    </PendingContext.Provider>
  );
}
