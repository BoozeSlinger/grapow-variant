"use client";
/**
 * The table-request ticket (spec §12.8): head "Table request" + status, body = bookingSummary in t-d3.
 * Each part ("Table for 4" · "Sat, Oct 3" · "7:00 PM") writes in with slotWrite when it changes; the first
 * render never animates (SSR-safe) and reduced motion swaps instantly. The REQUESTED stamp lands on ok.
 */
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Ticket } from "@/components/ui/Ticket";
import { bookingSummary } from "@/lib/booking/copy";
import { slotWrite } from "@/lib/motion";
import { Stamp } from "./Stamp";

export type TicketStatus = "draft" | "sending" | "requested" | "not-sent";

const STATUS: Record<TicketStatus, { text: string; className: string }> = {
  draft: { text: "Draft", className: "t-small text-fg-muted" },
  sending: { text: "Sending…", className: "t-small text-fg-muted" },
  requested: { text: "Requested", className: "t-label text-accent" },
  "not-sent": { text: "Not sent", className: "t-label text-flag" },
};

export function TicketPreview({ partySize, date, time, status, className }: {
  partySize?: number; date?: string; time?: string; status: TicketStatus; className?: string;
}) {
  const reduce = useReducedMotion();
  const parts = bookingSummary({ partySize, date, time }).split(" · ");
  const s = STATUS[status];
  return (
    <Ticket
      paper="card"
      className={className}
      head={
        <>
          <span className="t-label">Table request</span>
          <span className={`${s.className} whitespace-nowrap`}>{s.text}</span>
        </>
      }
    >
      <p className="t-d3 tnum text-balance short:t-title">
        {parts.map((part, i) => (
          <span key={i}>
            {i > 0 ? " " : null}
            <span className="inline-block whitespace-nowrap">
              <AnimatePresence mode="popLayout" initial={false}>
                <m.span
                  key={part}
                  className="inline-block"
                  variants={slotWrite}
                  initial={reduce ? false : "hidden"}
                  animate="shown"
                >
                  {part}
                </m.span>
              </AnimatePresence>
              {i < parts.length - 1 ? <span className="text-fg-muted">&nbsp;·</span> : null}
            </span>
          </span>
        ))}
      </p>
      {status === "requested" ? (
        <div className="mt-3 flex justify-end pr-1">
          <Stamp />
        </div>
      ) : null}
    </Ticket>
  );
}
