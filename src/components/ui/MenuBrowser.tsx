"use client";
/**
 * The menu reader (spec §10.13). SSR always renders the full menu; after mount it reads ?q= / ?spicy=1 /
 * ?lunch=1 from window.location (never useSearchParams) and writes changes back with replaceState.
 * Rows toggle `hidden` and never animate. Sticky index ≥1024, sticky chip rail below, scroll-spy,
 * and #item-* deep links (clear hiding filters → scroll → focus → .is-target sweep).
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { HH_BEER_FLAG } from "@/data/menu/happy-hour";
import type { Menu, MenuItem, MenuSection } from "@/data/menu/types";
import { VENUE } from "@/data/venue";
import { useVenueStatus } from "@/lib/clock";
import { countItems, formatPrice } from "@/lib/format";
import { matchItemIds } from "@/lib/menu-search";
import { AskHostButton, CallLink } from "./ActionButtons";
import { LiveTrack } from "./LiveStatus";
import { Flag, Highlight, MenuItemRow } from "./MenuItemRow";
import { PriceTable } from "./PriceTable";
import { Slate } from "./Slate";

type Filter = "spicy" | "lunch";
const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");
const isSpicy = (i: MenuItem) => !!i.spicy || !!i.minSpice;

const noopSubscribe = () => () => {};
const readSearch = () => window.location.search;
const serverSearch = () => "";

function reduceMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function MenuBrowser({ menu, filters = [], sectionExtras, hhActiveFlags, numbering = true, className }: {
  menu: Menu;
  filters?: Array<"spicy" | "lunch">;
  sectionExtras?: Partial<Record<string, React.ReactNode>>;
  hhActiveFlags?: boolean;
  numbering?: boolean;
  className?: string;
}) {
  const uid = useId();
  const status = useVenueStatus();
  const hhOn = !!hhActiveFlags && status.tracks.happyHour.open;

  // URL state: the SSR snapshot is "" (full menu); the client snapshot is read after hydration.
  const search = useSyncExternalStore(noopSubscribe, readSearch, serverSearch);
  const url = useMemo(() => new URLSearchParams(search), [search]);
  const [typed, setTyped] = useState<string | null>(null);
  const [spicyState, setSpicy] = useState<boolean | null>(null);
  const [lunchState, setLunch] = useState<boolean | null>(null);
  const query = typed ?? url.get("q") ?? "";
  const spicy = filters.includes("spicy") && (spicyState ?? url.get("spicy") === "1");
  const lunch = filters.includes("lunch") && (lunchState ?? url.get("lunch") === "1");

  // Debounced match query (120 ms while typing).
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), query === "" ? 0 : 120);
    return () => clearTimeout(t);
  }, [query]);
  const q = debounced.trim();
  const matches = useMemo(() => (q.length >= 2 ? matchItemIds(q, menu.id) : null), [q, menu.id]);

  // Write state back to the URL (keeps the hash).
  const interacted = typed !== null || spicyState !== null || lunchState !== null;
  useEffect(() => {
    if (!interacted) return;
    const params = new URLSearchParams(window.location.search);
    if (q) params.set("q", q); else params.delete("q");
    if (spicy) params.set("spicy", "1"); else params.delete("spicy");
    if (lunch) params.set("lunch", "1"); else params.delete("lunch");
    const qs = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }, [interacted, q, spicy, lunch]);

  const visibleItem = useCallback(
    (item: MenuItem, section: MenuSection) =>
      (!matches || matches.has(item.id)) && (!spicy || isSpicy(item)) && (!lunch || section.window === "lunch"),
    [matches, spicy, lunch],
  );
  const view = useMemo(() => menu.sections.map((section) => {
    const hidden = new Set(section.items.filter((i) => !visibleItem(i, section)).map((i) => i.id));
    return { section, hidden, visible: section.items.length - hidden.size };
  }), [menu.sections, visibleItem]);
  const shown = view.reduce((n, v) => n + v.visible, 0);
  const filtering = !!matches || spicy || lunch;
  const total = countItems(menu);
  const noun = menu.id === "bar" ? "drinks" : "dishes";
  const nounOne = menu.id === "bar" ? "drink" : "dish";

  const rootRef = useRef<HTMLDivElement>(null);

  // Deep links: #item-<id> → clear hiding filters → scroll → focus → sweep.
  const focusItem = useCallback((id: string) => {
    const scope = rootRef.current ?? document;
    const els = Array.from(scope.querySelectorAll<HTMLElement>(`[data-item="${CSS.escape(id)}"]`));
    const el = els.find((e) => e.offsetParent !== null) ?? els[0];
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
    el.classList.add("is-target");
    window.setTimeout(() => el.classList.remove("is-target"), 1200);
  }, []);
  const stateRef = useRef({ view, menu });
  useEffect(() => {
    stateRef.current = { view, menu };
  }, [view, menu]);
  useEffect(() => {
    const onHash = () => {
      const m = window.location.hash.match(/^#item-(.+)$/);
      if (!m) return;
      const id = decodeURIComponent(m[1]);
      const entry = stateRef.current.view.find((v) => v.section.items.some((i) => i.id === id));
      if (!entry) return;
      if (entry.hidden.has(id)) {
        setTyped("");
        setDebounced("");
        setSpicy(false);
        setLunch(false);
      }
      // Two frames: let React commit the cleared filters before measuring.
      requestAnimationFrame(() => requestAnimationFrame(() => focusItem(id)));
    };
    const raf = requestAnimationFrame(onHash);
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", onHash);
    };
  }, [focusItem]);

  // Scroll-spy: one IntersectionObserver on the sections.
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("section[data-menu-section]"));
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target.id, e.isIntersecting);
      const first = sections.find((s) => seen.get(s.id) && !s.hidden);
      if (first) setActive(first.id);
    }, { rootMargin: "-130px 0px -55% 0px" });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Keep the active rail chip in view (scrolls the rail only, never the page).
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !active) return;
    const chip = rail.querySelector<HTMLElement>(`[data-rail="${CSS.escape(active)}"]`);
    if (!chip) return;
    const left = chip.offsetLeft, right = left + chip.offsetWidth;
    if (left < rail.scrollLeft + 16 || right > rail.scrollLeft + rail.clientWidth - 32) {
      rail.scrollTo({ left: Math.max(0, left - 16), behavior: reduceMotion() ? "auto" : "smooth" });
    }
  }, [active]);
  const nudgeRail = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (rail) rail.scrollBy({ left: dir * rail.clientWidth * 0.6, behavior: reduceMotion() ? "auto" : "smooth" });
  };

  const inputId = `${uid}-search`;
  const statusText = matches
    ? `${shown} ${shown === 1 ? `${nounOne} matches` : `${noun} match`} '${q}'`
    : filtering ? `${shown} ${shown === 1 ? nounOne : noun} shown` : "";

  const filterChip = (f: Filter, label: string, on: boolean, set: (v: boolean) => void) => (
    <button
      key={f}
      type="button"
      aria-pressed={on}
      onClick={() => set(!on)}
      className="inline-flex h-11 items-center gap-1.5 rounded-sm px-3.5 t-ui shadow-[inset_0_0_0_1.5px_var(--line)] transition-colors duration-(--dur-1) aria-pressed:bg-fg aria-pressed:text-bg aria-pressed:shadow-none"
    >
      {on ? <Check size={16} strokeWidth={2.25} aria-hidden="true" /> : null}
      {label}
    </button>
  );

  const finder = (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor={inputId} className="mb-2 block t-label">Search <span className="tnum">{total}</span> {noun}</label>
        <div className="relative">
          <Search size={18} strokeWidth={1.75} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-muted" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                setTyped("");
              }
            }}
            autoComplete="off"
            enterKeyHint="search"
            className="block h-12 w-full rounded-sm bg-bg-raised pr-3.5 pl-11 text-[1.0625rem] text-fg shadow-[inset_0_0_0_1.5px_var(--line)] placeholder:text-fg-muted"
            placeholder={menu.id === "bar" ? "Try “mule” or “IPA”" : "Try “basil” or “pad thai”"}
          />
        </div>
      </div>
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filters">
          {filters.includes("spicy") && filterChip("spicy", "Spicy", spicy, (v) => setSpicy(v))}
          {filters.includes("lunch") && filterChip("lunch", "Lunch specials", lunch, (v) => setLunch(v))}
        </div>
      )}
      <p role="status" className="min-h-[1.45em] t-small text-fg-muted">{statusText}</p>
    </div>
  );

  return (
    <div ref={rootRef} className={cx("frame grid-page section-s [--rail-h:52px] lg:[--rail-h:0px]", className)}>
      {/* Finder + index: top of the page below 1024; sticky cols 1–3 from 1024 */}
      <div className="col-span-full lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:col-span-3 lg:max-h-[calc(100svh-var(--header-h)-48px)] lg:self-start lg:overflow-y-auto lg:pr-2">
        {finder}
        <nav aria-label={`${menu.title} sections`} className="mt-6 hidden lg:block">
          <ul className="flex flex-col">
            {view.map(({ section, visible }) => (
              <li key={section.id} hidden={visible === 0}>
                <a
                  href={`#${section.id}`}
                  aria-current={active === section.id ? "true" : undefined}
                  className="flex min-h-11 items-center justify-between gap-3 border-t border-hair py-2 t-small transition-colors aria-[current=true]:font-bold"
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className={cx("h-4 w-0.5 bg-accent", active !== section.id && "opacity-0")} />
                    {section.title}
                  </span>
                  <span className="tnum text-fg-muted">
                    {visible}
                    <span className="sr-only"> {visible === 1 ? "item" : "items"}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Sticky chip rail below 1024 */}
      <nav
        aria-label={`${menu.title} sections`}
        className="sticky top-(--header-h) z-(--z-rail) col-span-full -mx-(--margin) mt-2 flex h-[52px] items-center gap-1 border-b border-hair bg-bg px-(--margin) lg:hidden"
      >
        <button type="button" onClick={() => nudgeRail(-1)} aria-label="Scroll sections left" className="hidden size-11 flex-none items-center justify-center rounded-sm fine:inline-flex fine:hover:bg-bg-raised">
          <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <div ref={railRef} className="chip-rail -ml-4 min-w-0 flex-1 scroll-pl-4 py-1 pr-8 pl-4 fine:ml-0">
          {view.map(({ section, visible }) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              data-rail={section.id}
              hidden={visible === 0}
              aria-current={active === section.id ? "true" : undefined}
              className="inline-flex h-11 items-center rounded-sm px-3 t-small font-semibold whitespace-nowrap shadow-[inset_0_0_0_1.5px_var(--line)] aria-[current=true]:bg-fg aria-[current=true]:text-bg aria-[current=true]:shadow-none"
            >
              {section.title}
            </a>
          ))}
        </div>
        <button type="button" onClick={() => nudgeRail(1)} aria-label="Scroll sections right" className="hidden size-11 flex-none items-center justify-center rounded-sm fine:inline-flex fine:hover:bg-bg-raised">
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </nav>

      <div className="col-span-full min-w-0 lg:col-span-9 lg:col-start-4 lg:row-start-1">
        {filtering && shown === 0 && (
          <div className="mt-8 rounded-sm p-5 shadow-[inset_0_0_0_1.5px_var(--line)] lg:mt-0">
            <p className="t-title">No matches — ask the host or call {VENUE.phone.display}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <AskHostButton prompt={q || undefined} />
              <CallLink label="full" variant="secondary" />
            </div>
          </div>
        )}
        {view.map(({ section, hidden, visible }, idx) => {
          const titleId = `${uid}-${section.id}-title`;
          const showHh = hhOn && section.hhFlag;
          return (
            <section
              key={section.id}
              id={section.id}
              data-menu-section=""
              aria-labelledby={titleId}
              hidden={visible === 0}
              className="pt-10 pb-6 first:pt-8 lg:first:pt-0"
            >
              <Slate
                index={numbering ? String(idx + 1).padStart(2, "0") : undefined}
                title={section.title}
                titleId={titleId}
                datum={section.window === "lunch" ? <LiveTrack track="lunch" /> : undefined}
              />
              <p aria-hidden="true" className="mt-4 t-d3 text-balance">{section.title}</p>
              {showHh ? <p className="mt-3"><Flag tone="accent">{HH_BEER_FLAG}</Flag></p> : null}
              {section.note ? <p className="mt-3 t-note measure text-pretty text-fg-muted">{section.note}</p> : null}
              <div className="mt-5">
                <SectionItems section={section} hidden={hidden} matches={matches} />
              </div>
              {sectionExtras?.[section.id] ? <div className="mt-8">{sectionExtras[section.id]}</div> : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function SectionItems({ section, hidden, matches }: { section: MenuSection; hidden: Set<string>; matches: Map<string, string[]> | null }) {
  const m = (id: string) => matches?.get(id);
  const row = (item: MenuItem, variant: "full" | "compact") => (
    <li key={item.id} id={`item-${item.id}`} data-item={item.id} tabIndex={-1} hidden={hidden.has(item.id)} className="min-w-0">
      <MenuItemRow item={item} variant={variant} matched={m(item.id)} />
    </li>
  );

  switch (section.layout) {
    case "table":
      return <PriceTable section={section} matched={matches ?? undefined} hidden={hidden} />;
    case "list":
      return <ul className="grid gap-x-(--gutter) xl:grid-cols-2">{section.items.map((i) => row(i, "full"))}</ul>;
    case "compact":
      return <ul className="grid gap-x-(--gutter) md:grid-cols-2">{section.items.map((i) => row(i, "compact"))}</ul>;
    case "priceGroups": {
      const groups = new Map<string, MenuItem[]>();
      for (const i of section.items) {
        const key = String(i.prices[0]?.cents ?? "");
        groups.set(key, [...(groups.get(key) ?? []), i]);
      }
      return (
        <div className="flex flex-col">
          {[...groups.entries()].map(([cents, items]) => {
            const shown = items.filter((i) => !hidden.has(i.id));
            return (
              <div key={cents} hidden={shown.length === 0} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-t border-hair py-4">
                <p className="t-score tnum text-accent">{formatPrice(cents === "" ? null : Number(cents))}</p>
                <ul className="t-body">
                  {items.map((i) => {
                    const last = shown[shown.length - 1]?.id === i.id;
                    return (
                      <li key={i.id} id={`item-${i.id}`} data-item={i.id} tabIndex={-1} hidden={hidden.has(i.id)} className="inline">
                        <span className="item-name"><Highlight text={i.name} matched={m(i.id)} /></span>
                        {last ? "" : ", "}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      );
    }
    case "names": {
      const groups = new Map<string, MenuItem[]>();
      for (const i of section.items) groups.set(i.group ?? "", [...(groups.get(i.group ?? "") ?? []), i]);
      return (
        <div className="gap-x-(--gutter) sm:columns-2 lg:columns-3">
          {[...groups.entries()].map(([group, items]) => (
            <div key={group} hidden={items.every((i) => hidden.has(i.id))} className="mb-6 break-inside-avoid">
              {group ? <h3 className="mb-2 border-b border-line pb-1 t-label">{group}</h3> : null}
              <ul className="t-body">
                {items.map((i) => (
                  <li key={i.id} id={`item-${i.id}`} data-item={i.id} tabIndex={-1} hidden={hidden.has(i.id)} className="py-1">
                    <span className="item-name"><Highlight text={i.name} matched={m(i.id)} /></span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }
  }
}
