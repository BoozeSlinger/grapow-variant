"use client";
/**
 * Search across every menu (spec §12.2). searchMenu over all menus; the top 24 hits are grouped by menu
 * as compact rows linking to the item on its own page. Reads ?q= from window.location after mount
 * (never useSearchParams) and writes it back with replaceState. SSR renders the empty finder.
 */
import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AskHostButton, CallLink } from "@/components/ui/ActionButtons";
import { MenuItemRow } from "@/components/ui/MenuItemRow";
import { MENUS, getItem } from "@/data/menu";
import type { MenuId } from "@/data/menu/types";
import { VENUE } from "@/data/venue";
import { countItems } from "@/lib/format";
import { searchMenu, type SearchHit } from "@/lib/menu-search";

const LIMIT = 24;
const ORDER: MenuId[] = ["food", "sushi", "bar", "happy-hour"];
const TOTAL = countItems(ORDER.map((id) => MENUS[id]));
/** Menus whose page runs MenuBrowser, which reads ?q= itself. */
const FINDER: MenuId[] = ["food", "sushi", "bar"];

const noopSubscribe = () => () => {};
const readSearch = () => window.location.search;
const serverSearch = () => "";

export function HubSearch() {
  const uid = useId();
  const search = useSyncExternalStore(noopSubscribe, readSearch, serverSearch);
  const [typed, setTyped] = useState<string | null>(null);
  const query = typed ?? new URLSearchParams(search).get("q") ?? "";

  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), query === "" ? 0 : 120);
    return () => clearTimeout(t);
  }, [query]);
  const q = debounced.trim();

  useEffect(() => {
    if (typed === null) return;
    const params = new URLSearchParams(window.location.search);
    if (q) params.set("q", q); else params.delete("q");
    const qs = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }, [typed, q]);

  const all = useMemo(() => (q.length >= 2 ? searchMenu(q, { limit: Infinity }) : null), [q]);
  const groups = useMemo(() => {
    if (!all) return [];
    const top = all.slice(0, LIMIT);
    return ORDER.map((id) => ({
      id,
      total: all.filter((h) => h.doc.menuId === id).length,
      hits: top.filter((h) => h.doc.menuId === id),
    })).filter((g) => g.hits.length > 0);
  }, [all]);

  const n = all?.length ?? 0;
  const status = !all ? "" : n === 0
    ? `No matches for '${q}'`
    : `${n} ${n === 1 ? "match" : "matches"} for '${q}'${n > LIMIT ? ` — showing the top ${LIMIT}` : ""}`;
  const inputId = `${uid}-q`;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-2 block t-label">Search <span className="tnum">{TOTAL}</span> dishes and drinks</label>
      <div className="relative max-w-xl">
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
          placeholder="Try “noodle”, “mule” or “sashimi”"
          className="block h-12 w-full rounded-sm bg-bg-raised pr-3.5 pl-11 text-[1.0625rem] text-fg shadow-[inset_0_0_0_1.5px_var(--line)] placeholder:text-fg-muted"
        />
      </div>
      <p role="status" className="mt-3 min-h-[1.45em] t-small text-fg-muted">{status}</p>

      {all && n === 0 ? (
        <div className="mt-4 max-w-xl rounded-sm p-5 shadow-[inset_0_0_0_1.5px_var(--line)]">
          <p className="t-title">No matches — ask the host or call {VENUE.phone.display}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <AskHostButton prompt={q} />
            <CallLink label="full" variant="secondary" />
          </div>
        </div>
      ) : null}

      {groups.length > 0 ? (
        <div className="mt-6 flex flex-col gap-10">
          {groups.map((g) => <ResultGroup key={g.id} id={g.id} total={g.total} hits={g.hits} q={q} />)}
        </div>
      ) : null}
    </div>
  );
}

function ResultGroup({ id, total, hits, q }: { id: MenuId; total: number; hits: SearchHit[]; q: string }) {
  const menu = MENUS[id];
  const href = FINDER.includes(id) ? `${menu.href}?q=${encodeURIComponent(q)}` : menu.href;
  return (
    <section aria-labelledby={`hub-${id}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 border-b border-line pb-2">
        <h2 id={`hub-${id}`} className="t-label">
          {menu.title} <span className="tnum text-fg-muted">· {total}</span>
        </h2>
        <Link href={href} className="inline-flex min-h-11 items-center t-small underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag">
          Open menu<span className="sr-only">: {menu.title}</span>&nbsp;<span aria-hidden="true">→</span>
        </Link>
      </div>
      <ul className="grid gap-x-(--gutter) lg:grid-cols-2">
        {hits.map((h) => {
          const item = getItem(h.doc.id);
          if (!item) return null;
          return (
            <li key={h.doc.id} className="min-w-0">
              <Link href={h.doc.href} className="group grid grid-cols-[minmax(0,1fr)_auto] transition-colors duration-(--dur-1) fine:hover:bg-bg-raised">
                <MenuItemRow item={item} variant="compact" matched={h.matched} className="min-w-0 pl-1" />
                <span aria-hidden="true" className="flex items-center border-t border-hair px-2 text-fg-muted">
                  <span className="transition-transform duration-(--dur-2) ease-out fine:group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
