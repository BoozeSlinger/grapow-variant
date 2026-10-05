"use client";
/**
 * The host stand (spec §13.1, §13.6). Loaded lazily by Concierge on first open or prefetch — never part of
 * the initial page JS. At 1024 and up it is a non-modal pad (no backdrop: the page stays usable and
 * "See it on the menu" navigates while it stays open); below 1024 a modal bottom sheet at 92dvh, where
 * following a link closes it first.
 *
 * Ink header strip with a scalloped edge over ruled rice paper. role=log, aria-live=polite: each reply is
 * appended as one node. Enter sends and keeps focus in the input; Esc closes and returns focus to the tab
 * (or the dock's Ask).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { m, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import { LiveHeadline } from "@/components/ui/LiveStatus";
import { Sheet } from "@/components/ui/Sheet";
import { COPY, VENUE } from "@/data/venue";
import { useNow } from "@/lib/clock";
import { panelSwap } from "@/lib/motion";
import { closeOverlay, useOverlay, type OpenBookingDetail } from "@/lib/overlay";
import { createRuleEngine, openingReply } from "@/lib/concierge/engine";
import { COMPOSER_PLACEHOLDER } from "@/lib/concierge/replies";
import type { Chip, HostReply } from "@/lib/concierge/types";
import { HostBooking } from "./HostBooking";
import { GuestEntry, HostEntry } from "./HostEntry";
import { useTranscript } from "./useTranscript";

const WIDE = "(min-width: 1024px)";
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => true);

/** Ruled rice paper and the ink header's scalloped edge (spec §13.1). */
const RULED: React.CSSProperties = { backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 27px, rgb(28 24 21 / .07) 27px 28px)" };
const SCALLOP: React.CSSProperties = { background: "radial-gradient(circle at 6px 0, var(--color-ink) 5px, transparent 5.5px) 0 0 / 12px 12px repeat-x" };
const CHIP_CLS = "inline-flex h-11 items-center rounded-sm px-3 lg:px-2.5 t-ui whitespace-nowrap shadow-[inset_0_0_0_1.5px_var(--line)] transition-colors duration-(--dur-1) fine:hover:bg-bg-raised";
const CHIP_TEXT: React.CSSProperties = { fontSize: "0.875rem" };

type Booking = { prefill: OpenBookingDetail; text?: string; key: number; done: boolean };

export default function HostPanel() {
  const overlay = useOverlay((s) => s.overlay);
  const trigger = useOverlay((s) => s.trigger);
  const open = overlay?.kind === "concierge";
  const prompt = overlay?.kind === "concierge" ? overlay.prompt : undefined;
  const wide = useWide();
  const now = useNow();
  const path = usePathname() ?? "/";
  const reduce = !!useReducedMotion();
  const { turns, append, clear } = useTranscript();
  const engine = useMemo(() => createRuleEngine(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const handledPrompt = useRef<unknown>(null);
  const prevMode = useRef<"chat" | "booking">("chat");
  const chipsRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState(COMPOSER_PLACEHOLDER);
  const [mode, setMode] = useState<"chat" | "booking">("chat");
  const [booking, setBooking] = useState<Booking | null>(null);
  // Turns restored from sessionStorage appear in place; only new ones rise in.
  const [animateFrom, setAnimateFrom] = useState(turns.length);
  const [wasOpen, setWasOpen] = useState(false);

  // First open of a fresh transcript: the opening reply (render phase, so it's there when the sheet opens).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && turns.length === 0) append({ role: "host", reply: openingReply(now, path), at: now });
  }

  const startBooking = useCallback((prefill?: OpenBookingDetail, text?: string) => {
    setBooking({ prefill: prefill ?? { source: "host" }, text, key: Date.now(), done: false });
    setMode("booking");
  }, []);

  const onBook = useCallback((prefill?: OpenBookingDetail) => {
    const same = booking && !booking.done && (!prefill || JSON.stringify(prefill) === JSON.stringify(booking.prefill));
    if (same) setMode("booking");
    else startBooking(prefill);
  }, [booking, startBooking]);

  const ask = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const reply = await engine.reply({ text, now, path, history: turns });
    const at = Date.now();
    append({ role: "guest", text, at }, { role: "host", reply, at });
    const handoff = reply.blocks.find((b) => b.kind === "booking");
    if (handoff && handoff.kind === "booking") startBooking(handoff.prefill, text);
  }, [engine, now, path, turns, append, startBooking]);

  // A prompt passed with openConcierge(prompt) (e.g. a menu's "no matches" row) is asked once.
  useEffect(() => {
    if (!open || !prompt || handledPrompt.current === overlay) return;
    handledPrompt.current = overlay;
    queueMicrotask(() => void ask(prompt)); // the reply lands after the sheet opens
  }, [open, prompt, overlay, ask]);

  // Keep the newest exchange in view: the guest's line at the top, so a long reply reads from its start.
  useEffect(() => {
    const body = bodyRef.current;
    const scroller = body?.closest<HTMLElement>(".sheet-body");
    if (!open || !body || !scroller) return;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    // Entering the booking view starts at its top; later turns (the outcome line) must not undo the scroll to the result.
    const entering = prevMode.current !== mode;
    prevMode.current = mode;
    if (mode === "booking") {
      if (entering) scroller.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const guests = body.querySelectorAll<HTMLElement>("[data-role='guest']");
    const last = guests[guests.length - 1];
    // No question yet: show the opening line from the top.
    const top = last ? scroller.scrollTop + last.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 20 : 0;
    scroller.scrollTo({ top, behavior });
  }, [turns.length, mode, open, reduce]);

  // At 1024 and up the chips wrap to at most 2 rows (spec §13.1): any chip that would start a third row is
  // dropped (they are ordered most useful first). Below 1024 the row scrolls, so every chip stays.
  useLayoutEffect(() => {
    const g = chipsRef.current;
    if (!g || !open) return;
    const kids = [...g.children] as HTMLElement[];
    kids.forEach((k) => (k.hidden = false));
    if (!wide) return;
    const rows: number[] = [];
    for (const k of kids) {
      const top = Math.round(k.offsetTop);
      if (!rows.includes(top)) rows.push(top);
      if (rows.indexOf(top) >= 2) k.hidden = true;
    }
  });

  const backToChat = useCallback(() => {
    setMode("chat");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const onOutcome = useCallback((r: HostReply) => {
    append({ role: "host", reply: r, at: Date.now() });
    setBooking((b) => (b ? { ...b, done: true } : b));
  }, [append]);

  const startOver = () => {
    clear();
    setBooking(null);
    setMode("chat");
    setAnimateFrom(0);
    setValue("");
    setPlaceholder(COMPOSER_PLACEHOLDER);
    append({ role: "host", reply: openingReply(now, path), at: Date.now() });
    inputRef.current?.focus();
  };

  const runChip = (c: Chip) => {
    const a = c.action;
    if (a.type === "ask") {
      void ask(a.text);
      inputRef.current?.focus();
    } else if (a.type === "book") onBook(a.prefill);
    else if (a.type === "focus") {
      setPlaceholder(a.placeholder ?? COMPOSER_PLACEHOLDER);
      inputRef.current?.focus();
    }
  };

  /** Below 1024 a link closes the sheet first; on the desktop pad the page navigates underneath. */
  const closeOnLink = (e: React.MouseEvent) => {
    if (!wide && (e.target as Element).closest('a[href^="/"]')) closeOverlay();
  };

  let lastHost = -1;
  for (let i = turns.length - 1; i >= 0 && lastHost < 0; i--) if (turns[i].role === "host") lastHost = i;
  const chips = lastHost >= 0 ? turns[lastHost].reply?.chips ?? [] : [];
  const swap = (active: boolean) => (reduce ? {} : { variants: panelSwap, initial: false as const, animate: active ? "shown" : "hidden" });

  const footer = mode === "chat" ? (
    <div
      data-ground="rice"
      onClick={closeOnLink}
      className="-mx-4 -mt-3 -mb-[calc(12px+env(safe-area-inset-bottom))] px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6 short:flex short:items-center short:gap-3"
    >
      {chips.length ? (
        <div ref={chipsRef} role="group" aria-label="Suggestions"
          className="chip-rail -mx-4 mb-3 scroll-px-4 px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:gap-1.5 lg:overflow-visible lg:px-0 lg:[mask-image:none] short:m-0 short:min-w-0 short:flex-1 short:scroll-px-0 short:px-0">
          {chips.map((c) => <ChipEl key={c.label} chip={c} onRun={runChip} />)}
        </div>
      ) : null}
      <form
        className="flex items-end gap-3 short:min-w-0 short:flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const v = value;
          setValue("");
          setPlaceholder(COMPOSER_PLACEHOLDER);
          void ask(v);
          inputRef.current?.focus();
        }}
      >
        <label htmlFor="host-input" className="sr-only">{COPY.hostTitle}</label>
        <input
          ref={inputRef}
          id="host-input"
          name="q"
          type="text"
          enterKeyHint="send"
          autoComplete="off"
          maxLength={200}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className="h-12 min-w-0 flex-1 rounded-none border-b-[1.5px] border-line bg-transparent px-0.5 text-[1.0625rem] text-ellipsis text-fg placeholder:text-[0.9375rem] placeholder:text-fg-muted"
        />
        <Button type="submit" variant="secondary" size="md" className="px-5">Ask</Button>
      </form>
    </div>
  ) : undefined;

  return (
    <Sheet
      key={wide ? "pad" : "bottom"}
      open={open}
      onClose={closeOverlay}
      variant={wide ? "pad" : "bottom"}
      modal={!wide}
      tone="ink"
      title={COPY.hostTitle}
      titleId="host-title"
      label={COPY.hostLabel}
      closeLabel="Close the host"
      returnFocus={trigger}
      initialFocus={mode === "chat" ? inputRef : undefined}
      className={wide ? undefined : "h-[92dvh]"}
      headerExtra={
        <div className="flex flex-col gap-1 short:flex-row short:items-center short:justify-between short:gap-3">
          <p className="t-micro text-fg-muted">{COPY.hostSub}</p>
          <div className="flex flex-wrap items-center justify-between gap-x-3 short:flex-none">
            {/* Short landscape: the opening reply already carries the live status card, so the line gives its row back to the log. */}
            <LiveHeadline withDot className="t-micro short:hidden" />
            <Button variant="quiet" size="sm" onClick={startOver} className="-mr-0.5">Start over</Button>
          </div>
        </div>
      }
      footer={footer}
    >
      <div id="host-pad" ref={bodyRef} data-ground="rice" onClick={closeOnLink}
        className="-mx-4 -my-5 flex min-h-[calc(100%+40px)] flex-col sm:-mx-6" style={RULED}>
        <div aria-hidden="true" className="sticky -top-5 z-10 h-3 shrink-0" style={SCALLOP} />
        <m.div
          {...swap(mode === "chat")}
          hidden={mode !== "chat"}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Conversation with the host"
          className="flex flex-col gap-7 px-4 pt-3 pb-8 sm:px-6"
        >
          {turns.map((t, i) =>
            t.role === "guest" ? (
              <div key={`${i}-${t.at}`} data-role="guest"><GuestEntry text={t.text ?? ""} animate={!reduce && i >= animateFrom} /></div>
            ) : t.reply ? (
              <div key={`${i}-${t.at}`} data-role="host">
                <HostEntry reply={t.reply} animate={!reduce && i >= animateFrom} latest={i === lastHost} onBook={onBook} />
              </div>
            ) : null,
          )}
        </m.div>
        {booking ? (
          <m.div key={booking.key} {...(reduce ? {} : { variants: panelSwap, initial: "hidden", animate: mode === "booking" ? "shown" : "hidden" })}
            hidden={mode !== "booking"} className="px-4 pt-3 pb-8 sm:px-6">
            <HostBooking prefill={booking.prefill} requestText={booking.text} now={now} active={open && mode === "booking"}
              onBack={backToChat} onOutcome={onOutcome} />
          </m.div>
        ) : null}
      </div>
    </Sheet>
  );
}

function ChipEl({ chip, onRun }: { chip: Chip; onRun: (c: Chip) => void }) {
  const a = chip.action;
  if (a.type === "link") return <Link href={a.href} className={CHIP_CLS} style={CHIP_TEXT}>{chip.label}</Link>;
  if (a.type === "call") {
    return (
      <a href={VENUE.phone.href} className={CHIP_CLS} style={CHIP_TEXT}>
        {chip.label}<span className="sr-only"> {VENUE.phone.display}</span>
      </a>
    );
  }
  if (a.type === "directions") {
    return (
      <a href={VENUE.directions.google} target="_blank" rel="noopener noreferrer" className={CHIP_CLS} style={CHIP_TEXT}>
        {chip.label}<span aria-hidden="true">&nbsp;↗</span><span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return <button type="button" className={CHIP_CLS} style={CHIP_TEXT} onClick={() => onRun(chip)}>{chip.label}</button>;
}
