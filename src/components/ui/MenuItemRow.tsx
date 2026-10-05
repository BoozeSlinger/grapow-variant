/**
 * One menu item (spec §10.13): grid name | price. Flags are text labels (never icons). Tiers on one
 * labelled line. `matched` drives <mark> highlights. Menu rows never animate.
 */
import { Fragment } from "react";
import Link from "next/link";
import { HH_BEER_FLAG } from "@/data/menu/happy-hour";
import type { MenuItem, Price } from "@/data/menu/types";
import { formatPrice, priceSr } from "@/lib/format";
import { highlightParts } from "@/lib/menu-search";
import { Ticket } from "./Ticket";

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

export function Highlight({ text, matched }: { text: string; matched?: string[] }) {
  if (!matched?.length) return <>{text}</>;
  return (
    <>
      {highlightParts(text, matched).map((p, i) => (p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
    </>
  );
}

/** Text flag with a 1.5px currentColor outline. `accent` = money/time (the happy-hour beer flag). */
export function Flag({ children, tone = "flag", className }: { children: React.ReactNode; tone?: "flag" | "accent"; className?: string }) {
  return (
    <span className={cx("inline-flex items-center rounded-sm px-1.5 py-0.5 align-middle t-label shadow-[inset_0_0_0_1.5px_currentColor]", tone === "accent" ? "text-accent" : "text-flag", className)}>
      {children}
    </span>
  );
}

export function ItemFlags({ item, hhFlag }: { item: MenuItem; hhFlag?: boolean }) {
  const flags: string[] = [];
  if (item.spicy) flags.push("Spicy");
  if (item.minSpice) flags.push(`Min. spice ${item.minSpice}`);
  if (!flags.length && !hhFlag) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {flags.map((f) => <Flag key={f}>{f}</Flag>)}
      {hhFlag ? <Flag tone="accent">{HH_BEER_FLAG}</Flag> : null}
    </span>
  );
}

export function PriceText({ cents, className }: { cents: number | null; className?: string }) {
  if (cents === null) {
    return (
      <span className={cx("t-price", className)}>
        <span aria-hidden="true">—</span>
        <span className="sr-only">{priceSr(null)}</span>
      </span>
    );
  }
  return <span className={cx("t-price", className)}>{formatPrice(cents)}</span>;
}

/** "Chicken, beef or pork <price> · Shrimp <price>" with muted labels and accent prices. Wraps between tiers only. */
export function TierLine({ prices, className }: { prices: Price[]; className?: string }) {
  return (
    <p className={cx("t-small", className)}>
      {prices.map((p, i) => (
        <Fragment key={i}>
          {i > 0 ? <span className="text-fg-muted"><span aria-hidden="true"> · </span><span className="sr-only">, </span></span> : null}
          <span className="whitespace-nowrap">
            {p.label ? <span className="text-fg-muted">{p.label} </span> : null}
            <PriceText cents={p.cents} />
          </span>
        </Fragment>
      ))}
    </p>
  );
}

export function MenuItemRow({ item, variant = "full", matched, as = "div", hhFlag, className }: {
  item: MenuItem; variant?: "full" | "compact" | "card"; matched?: string[]; as?: "li" | "div";
  hhFlag?: boolean; className?: string;
}) {
  const Tag = as;
  const single = item.prices.length === 1 && !item.prices[0].label ? item.prices[0] : null;
  const tiers = !single && item.prices.length > 0 ? item.prices : null;
  const NameTag = variant === "compact" ? "p" : "h3";
  const anchor = as === "li" ? { id: `item-${item.id}`, "data-item": item.id, tabIndex: -1 } : {};
  const href = (item as MenuItem & { href?: string }).href;

  const priceSlot = item.priceNote ? (
    <span className="t-price">{item.priceNote}</span>
  ) : single ? (
    <PriceText cents={single.cents} />
  ) : variant === "compact" && tiers ? (
    <TierLine prices={tiers} className="text-right" />
  ) : null;

  const row = (
    <div className={cx("grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4", variant === "compact" ? "gap-y-0" : "gap-y-1.5")}>
      <div className="min-w-0">
        <NameTag className={cx("item-name inline t-title text-pretty", variant === "compact" && "font-semibold")}>
          <Highlight text={item.name} matched={matched} />
        </NameTag>
        {(item.spicy || item.minSpice || hhFlag) && (
          <span className="ml-2 inline-flex align-baseline">
            <ItemFlags item={item} hhFlag={hhFlag} />
          </span>
        )}
      </div>
      <div className="text-right">{priceSlot}</div>
      {variant !== "compact" && tiers ? <TierLine prices={tiers} className="col-span-2" /> : null}
      {variant !== "compact" && item.description ? (
        <p className="col-span-2 t-desc measure-desc text-pretty">
          <Highlight text={item.description} matched={matched} />
        </p>
      ) : null}
    </div>
  );

  if (variant === "card") {
    return (
      <Tag className={className} {...anchor}>
        <Ticket
          paper="card"
          stub={href ? (
            <Link href={href} className="inline-flex min-h-11 items-center t-ui underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag">
              See it on the menu <span aria-hidden="true">&nbsp;→</span>
            </Link>
          ) : undefined}
        >
          {row}
        </Ticket>
      </Tag>
    );
  }

  return (
    <Tag className={cx("block border-t border-hair", variant === "compact" ? "flex min-h-14 flex-col justify-center py-3" : "min-h-14 py-4", className)} {...anchor}>
      {row}
    </Tag>
  );
}
