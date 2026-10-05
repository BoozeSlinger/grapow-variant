"use client";
/**
 * The Tonight ticket (spec §12.1): the hero's status below 1024. Head "Tonight · Fri, Oct 2" + the live
 * time; four rows in status.order; a stub with two 44px links (no CTAs — the dock carries them).
 */
import Button from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/StatusDot";
import { Ticket } from "@/components/ui/Ticket";
import { useVenueStatus } from "@/lib/clock";
import { ticketHead, ticketRows } from "./tonight";

export function TonightTicket({ className }: { className?: string }) {
  const s = useVenueStatus();
  const head = ticketHead(s);
  const rows = ticketRows(s);
  return (
    <Ticket
      as="section"
      elevated
      labelledBy="tonight-ticket-title"
      className={className}
      head={
        <>
          <h2 id="tonight-ticket-title" className="t-label">{head.label}</h2>
          <span className="t-label tnum text-fg-muted">{head.time}</span>
        </>
      }
      stub={
        <>
          <Button href="/menu" variant="quiet" size="sm" arrow>See the menus</Button>
          <Button href="/visit" variant="quiet" size="sm" arrow>Hours &amp; directions</Button>
        </>
      }
    >
      <ul>
        {rows.map((r, i) => (
          <li key={r.id} className={i > 0 ? "border-t border-hair" : undefined}>
            <span className="sr-only">{r.sr}</span>
            <div aria-hidden="true" className="flex min-h-11 items-center gap-3 py-2">
              <StatusDot state={r.dot} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex flex-wrap items-center gap-2">
                  {/* t-title at 16px (spec): set directly so no two font-size utilities compete */}
                  <span className="text-base leading-[1.25] font-bold">{r.label}</span>
                  {r.now ? <span className="rounded-sm bg-yolk px-1.5 py-px t-label text-char">On now</span> : null}
                </span>
                {r.sub ? <span className="t-small text-fg-muted">{r.sub}</span> : null}
              </span>
              <span className="shrink-0 text-right t-small font-semibold tnum">{r.value}</span>
            </div>
          </li>
        ))}
      </ul>
    </Ticket>
  );
}
