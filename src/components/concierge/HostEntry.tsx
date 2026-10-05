"use client";
/**
 * One turn of the host stand's log (spec §13.1). A host reply is one atomic node that starts with an
 * sr-only "Host:"; its data cards reuse the site's primitives (Ticket, LiveTrack, HoursTable, MenuItemRow,
 * action buttons). No avatar, emoji, bubbles, typing dots or delay. Entries rise in (client-only, after an
 * interaction) and simply appear under reduced motion.
 */
import Link from "next/link";
import { m } from "framer-motion";
import Button from "@/components/ui/Button";
import { CallLink, DirectionsLink } from "@/components/ui/ActionButtons";
import { HoursTable } from "@/components/ui/HoursTable";
import { LiveTrack, trackDot } from "@/components/ui/LiveStatus";
import { ItemFlags, MenuItemRow, PriceText, TierLine } from "@/components/ui/MenuItemRow";
import { StatusDot } from "@/components/ui/StatusDot";
import { Ticket } from "@/components/ui/Ticket";
import { getItem } from "@/data/menu";
import type { TrackId } from "@/data/hours";
import { bookingSummary } from "@/lib/booking/copy";
import { useVenueStatus } from "@/lib/clock";
import { getVenueStatus } from "@/lib/hours";
import { formatClock } from "@/lib/la-time";
import { entryRise } from "@/lib/motion";
import type { OpenBookingDetail } from "@/lib/overlay";
import { CARD } from "@/lib/concierge/replies";
import type { HostBlock, HostReply } from "@/lib/concierge/types";

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

type Props = {
  animate: boolean;
  /** The newest host reply: only it may carry the chili "Request a table" (one primary per view). */
  latest: boolean;
  onBook: (prefill?: OpenBookingDetail) => void;
};

export function GuestEntry({ text, animate }: { text: string; animate: boolean }) {
  return (
    <m.div variants={entryRise} initial={animate ? "hidden" : false} animate="shown" className="flex flex-col items-end gap-1 pl-10 text-right">
      <span aria-hidden="true" className="t-label text-fg-muted">You</span>
      <p className="text-base leading-7 font-semibold text-pretty break-words underline decoration-chili-deep decoration-2 underline-offset-[5px]">
        <span className="sr-only">You: </span>
        {text}
      </p>
    </m.div>
  );
}

export function HostEntry({ reply, animate, latest, onBook }: Props & { reply: HostReply }) {
  return (
    <m.div variants={entryRise} initial={animate ? "hidden" : false} animate="shown" className="flex flex-col gap-3" data-intent={reply.intent}>
      <span className="sr-only">Host:</span>
      <span aria-hidden="true" className="t-label text-fg-muted">Host</span>
      {reply.blocks.map((b, i) => (
        <Block key={i} block={b} intent={reply.intent} latest={latest} onBook={onBook} />
      ))}
    </m.div>
  );
}

function Block({ block: b, intent, latest, onBook }: { block: HostBlock; intent: HostReply["intent"]; latest: boolean; onBook: Props["onBook"] }) {
  switch (b.kind) {
    case "voice":
      return <p className="t-note leading-7 text-pretty">{b.text}</p>;
    case "text":
      return <p className="t-body leading-7 text-pretty">{b.text}</p>;
    case "notice":
      return b.tone === "info" ? (
        <p className="t-note leading-6 text-fg-muted text-pretty">{b.text}</p>
      ) : (
        <p className="rounded-sm bg-bg px-3 py-2 t-small text-fg-muted text-pretty shadow-[inset_0_0_0_1.5px_var(--line)]">{b.text}</p>
      );
    case "status":
      return b.at === undefined ? <LiveStatusCard /> : <StatusAtCard at={b.at} />;
    case "hours":
      return (
        <Ticket paper="card" head={<span className="t-label">{CARD.hours}</span>}>
          <HoursTable layout={b.layout} className="py-1" />
        </Ticket>
      );
    case "items":
      return <ItemsCard ids={b.itemIds} moreHref={b.moreHref} moreLabel={b.moreLabel} descOnly={intent === "dietary"} />;
    case "links":
      return (
        <ul className="flex flex-wrap gap-x-6">
          {b.links.map((l) => (
            <li key={l.href}>
              <Button href={l.href} variant="quiet" size="sm" arrow>{l.label}</Button>
            </li>
          ))}
        </ul>
      );
    case "actions":
      return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {b.actions.map((a) =>
            a === "call" ? <CallLink key={a} label="full" variant="secondary" size="sm" />
            : a === "directions" ? <DirectionsLink key={a} variant="quiet" size="sm" />
            : (
              <Button key={a} variant={latest ? "primary" : "secondary"} size="sm" onClick={() => onBook()}>
                Request a table
              </Button>
            ))}
        </div>
      );
    case "booking":
      return (
        <Ticket paper="card" head={<span className="t-label">Table request</span>}>
          <p className="py-1 t-small tnum">{bookingSummary(b.prefill ?? {})}</p>
          <Button variant="quiet" size="sm" arrow onClick={() => onBook(b.prefill)}>{CARD.bookingResume}</Button>
        </Ticket>
      );
  }
}

const ROW_TRACKS = (order: TrackId[], lunchOpen: boolean): TrackId[] =>
  lunchOpen ? order.flatMap((t) => (t === "kitchen" ? ["kitchen", "lunch"] as TrackId[] : [t])) : order;

/** The live board in miniature: one LiveTrack row per service, in the ticket's clock order. */
function LiveStatusCard() {
  const s = useVenueStatus();
  return (
    <Ticket paper="card" head={<><span className="t-label">{CARD.statusNow}</span><span className="t-small tnum text-fg-muted">{formatClock(s.minutes)}</span></>}>
      <ul className="flex flex-col py-1">
        {ROW_TRACKS(s.order, s.tracks.lunch.open).map((t) => (
          <li key={t} className="flex min-h-9 items-center border-b border-hair t-small last:border-b-0">
            <LiveTrack track={t} withDot />
          </li>
        ))}
      </ul>
    </Ticket>
  );
}

/** Status at the instant the guest asked about (not live). */
function StatusAtCard({ at }: { at: number }) {
  const s = getVenueStatus(at);
  return (
    <Ticket paper="card" head={<><span className="t-label">{CARD.statusAt(at)}</span></>}>
      <ul className="flex flex-col py-1">
        {ROW_TRACKS(s.order, s.tracks.lunch.open).map((t) => (
          <li key={t} className="flex min-h-9 items-center gap-2 border-b border-hair t-small last:border-b-0">
            <StatusDot state={trackDot(s.tracks[t])} />
            <span>{s.tracks[t].text}</span>
          </li>
        ))}
      </ul>
    </Ticket>
  );
}

const linkCls = "fine:hover:decoration-2 fine:hover:decoration-flag underline decoration-1 underline-offset-[.22em]";

function ItemsCard({ ids, moreHref, moreLabel, descOnly }: { ids: string[]; moreHref?: string; moreLabel?: string; descOnly?: boolean }) {
  const items = ids.map((id) => getItem(id)).filter((i): i is NonNullable<typeof i> => !!i);
  if (!items.length) return null;
  const more = moreHref ? (
    <Link href={moreHref} className={cx("inline-flex min-h-11 items-center t-ui", linkCls)}>
      {moreLabel}<span aria-hidden="true">&nbsp;→</span>
    </Link>
  ) : undefined;

  // Dietary: the official description only — no price, no claim.
  if (descOnly) {
    return (
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <Ticket key={it.id} paper="card"
            head={<span className="t-label">{CARD.descOnly}</span>}
            stub={<Link href={it.href} className={cx("inline-flex min-h-11 items-center t-ui", linkCls)}>See it on the menu<span aria-hidden="true">&nbsp;→</span></Link>}>
            <h3 className="t-title">{it.name}</h3>
            {it.description ? <p className="mt-1 t-desc text-pretty">{it.description}</p> : null}
          </Ticket>
        ))}
      </div>
    );
  }

  // One dish: the full menu card (labelled tiers, flags, description, "See it on the menu →").
  if (items.length === 1) return <MenuItemRow item={items[0]} variant="card" />;

  const meta = CARD.itemsMeta(ids);
  return (
    <Ticket paper="card"
      head={<><span className="t-label">{CARD.itemsHead(ids)}</span>{meta ? <span className="t-small tnum text-fg-muted">{meta}</span> : null}</>}
      stub={more}>
      <ul className="-mx-2 flex flex-col">
        {items.map((it) => {
          const single = it.prices.length === 1 && !it.prices[0].label ? it.prices[0] : null;
          return (
            <li key={it.id} className="border-b border-hair last:border-b-0">
              <Link href={it.href} className="group grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 rounded-sm px-2 py-2.5 fine:hover:bg-bg-raised">
                <div className="min-w-0">
                  <span className="font-semibold text-pretty underline decoration-transparent decoration-1 underline-offset-[.22em] fine:group-hover:decoration-current">{it.name}</span>
                  {it.spicy || it.minSpice ? <span className="ml-2 inline-flex align-baseline"><ItemFlags item={it} /></span> : null}
                  {!single && it.prices.length > 0 ? <TierLine prices={it.prices} className="mt-0.5" /> : null}
                </div>
                <div className="text-right">
                  {it.priceNote ? <span className="t-price">{it.priceNote}</span> : single ? <PriceText cents={single.cents} /> : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Ticket>
  );
}
