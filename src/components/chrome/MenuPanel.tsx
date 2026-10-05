"use client";
/**
 * "Menu ▾" disclosure + panel, 1024 and up (spec §11.2). A disclosure of links — not role="menu".
 * Opens on click; on mouse pointers also after a 150ms hover intent, closing 250ms after the pointer leaves.
 * Esc and outside clicks close it and return focus to the button; focus moves into the panel only when it
 * was opened from the keyboard. Opening it sets the overlay to "menu-panel" (one overlay at a time).
 *
 * The panel is positioned against the fixed header (no positioned ancestor in between), so it sits flush
 * under the header and follows the condense transform.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { MENU_NAV, PRIMARY_NAV } from "@/data/nav";
import { closeOverlay, openOverlay, useOverlay } from "@/lib/overlay";
import { NavPending } from "./NavPending";

type Via = "hover" | "click" | "key";

const ALL_MENUS = { label: "All menus", href: "/menu" };

function closePanel(refocus: HTMLElement | null) {
  if (useOverlay.getState().overlay?.kind === "menu-panel") closeOverlay();
  refocus?.focus({ preventScroll: true });
}

export function MenuDisclosure({ label }: { label: string }) {
  const pathname = usePathname();
  const open = useOverlay((s) => s.overlay?.kind === "menu-panel");
  const [via, setVia] = useState<Via>("click");
  const liRef = useRef<HTMLLIElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Underline "Menu" on the menu pages that have no link of their own in the primary nav.
  const current = pathname.startsWith("/menu") && !PRIMARY_NAV.some((l) => l.href === pathname);

  const show = (how: Via) => {
    clearTimeout(timer.current);
    setVia(how);
    openOverlay({ kind: "menu-panel" }, btnRef.current);
  };

  // Keyboard open: move focus to the first link once the panel has rendered.
  useEffect(() => {
    if (open && via === "key") panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
  }, [open, via]);

  // While open: Esc and outside pointer-downs close it.
  useEffect(() => {
    if (!open) return;
    const li = liRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      clearTimeout(timer.current);
      closePanel(btnRef.current);
    };
    const onDown = (e: PointerEvent) => {
      if (li?.contains(e.target as Node)) return;
      clearTimeout(timer.current);
      // Return focus only when it was inside the disclosure; never steal it from what was clicked.
      closePanel(li?.contains(document.activeElement) ? btnRef.current : null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    clearTimeout(timer.current);
    const how: Via = e.detail === 0 ? "key" : "click";
    if (!open) show(how);
    else if (via === "hover" && how === "click") setVia("click"); // a click on a hover-opened panel pins it
    else closePanel(how === "key" ? btnRef.current : null);
  };

  return (
    <li
      ref={liRef}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(timer.current);
        if (!open) timer.current = setTimeout(() => show("hover"), 150);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(timer.current);
        if (open && via === "hover") timer.current = setTimeout(() => closePanel(null), 250);
      }}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (open && next && !liRef.current?.contains(next)) closePanel(null);
      }}
    >
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls="menu-panel"
        onClick={onClick}
        className={[
          "inline-flex min-h-11 items-center gap-1.5 t-ui decoration-2 underline-offset-[10px]",
          current ? "underline decoration-chili-lit" : "fine:hover:underline fine:hover:decoration-line",
        ].join(" ")}
      >
        {label}
        <ChevronDown size={16} strokeWidth={2} aria-hidden="true" className={open ? "rotate-180" : undefined} />
      </button>

      <div
        id="menu-panel"
        ref={panelRef}
        data-ground="ink-2"
        hidden={!open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a[href]")) closePanel(null);
        }}
        className="absolute inset-x-0 top-full border-t border-hair bg-ink-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/.7)]"
      >
        {open ? (
          <div className="frame">
            <div className="grid-page pt-8 pb-9">
              {MENU_NAV.map((m, i) => (
                <div key={m.id} className="col-span-3 min-w-0 border-l border-hair pl-6 first:border-l-0 first:pl-0">
                  <span className="t-label tnum text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <Link
                    href={m.href}
                    aria-current={pathname === m.href ? "page" : undefined}
                    className="mt-2 flex min-h-11 items-center t-d3 decoration-2 underline-offset-[6px] aria-[current=page]:underline aria-[current=page]:decoration-chili-lit fine:hover:underline fine:hover:decoration-line"
                  >
                    {m.label}
                    <NavPending />
                  </Link>
                  <LiveTrack track={m.track} withDot className="mt-1 t-small text-fg-muted" />
                  <ul className="mt-5 border-t border-hair">
                    {m.links.map((l) => (
                      <li key={l.href} className="border-b border-hair">
                        <Link href={l.href} className="group flex min-h-11 items-center justify-between gap-3 t-small font-semibold">
                          <span className="decoration-1 underline-offset-[.22em] fine:group-hover:underline">{l.label}</span>
                          <span aria-hidden="true" className="text-fg-muted transition-transform duration-(--dur-2) ease-out fine:group-hover:translate-x-1">→</span>
                          <NavPending />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-hair py-3">
              <Link href={ALL_MENUS.href} className="group inline-flex min-h-11 items-center gap-2.5 t-ui underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag">
                {ALL_MENUS.label}
                <span aria-hidden="true" className="inline-block transition-transform duration-(--dur-2) ease-out fine:group-hover:translate-x-1">→</span>
                <NavPending />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}
