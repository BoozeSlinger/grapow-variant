"use client";
/**
 * The global booking sheet (spec §10.17, §12.8; CONTRACT: default export, no props). While
 * useOverlay().overlay.kind === "booking" it shows <Sheet variant="right"> at ≥1024 or "bottom" below,
 * titled "Request a table" under the "Host stand" label, containing <BookingForm variant="sheet">.
 * The current step's primary action is portalled into the Sheet's sticky footer. Closing calls
 * closeOverlay() and the Sheet returns focus to the trigger. Each opening starts a fresh request.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { closeOverlay, useOverlay, type OpenBookingDetail } from "@/lib/overlay";
import BookingForm from "./BookingForm";
import { SheetFooterSlot } from "./sheet-footer";

const WIDE = "(min-width: 1024px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function BookingSheet() {
  const overlay = useOverlay((s) => s.overlay);
  const trigger = useOverlay((s) => s.trigger);
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches, () => false);
  const [footer, setFooter] = useState<HTMLDivElement | null>(null);

  // A new session (fresh form + this opening's prefill) each time the sheet opens. The last session stays
  // mounted while the sheet closes so the exit transition has content.
  const open = overlay?.kind === "booking";

  const [wasOpen, setWasOpen] = useState(false);
  const [session, setSession] = useState<{ n: number; detail: OpenBookingDetail } | null>(null);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (overlay?.kind === "booking") setSession((s) => ({ n: (s?.n ?? 0) + 1, detail: overlay.detail }));
  }

  // Once the exit transition has played, drop the finished session so no hidden copy of the form (and its
  // shared form id) stays in the document, e.g. after client-side navigation to /reservations. Only a session
  // that has actually been closed is dropped, and never one that has been reopened in the meantime.
  const hasSession = session !== null;
  useEffect(() => {
    if (open || !hasSession) return;
    const id = window.setTimeout(() => {
      if (useOverlay.getState().overlay?.kind !== "booking") setSession(null);
    }, 400);
    return () => window.clearTimeout(id);
  }, [open, hasSession]);

  return (
    <Sheet
      open={open}
      onClose={closeOverlay}
      variant={wide ? "right" : "bottom"}
      title="Request a table"
      titleId="booking-sheet-title"
      label="Host stand"
      returnFocus={trigger}
      footer={<div ref={setFooter} />}
    >
      {session ? (
        <SheetFooterSlot.Provider value={footer}>
          <BookingForm
            key={session.n}
            variant="sheet"
            prefill={session.detail}
            titleId="booking-sheet-title"
            onDone={() => closeOverlay()}
          />
        </SheetFooterSlot.Provider>
      ) : null}
    </Sheet>
  );
}
