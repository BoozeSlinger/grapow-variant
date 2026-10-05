/** Price and count formatting (spec §9.10). The `$` is always shown; a non-zero `.50` is always shown. */
import type { Menu, MenuItem, Price } from "@/data/menu/types";

/** 2200→"$22", 2650→"$26.50", 1250→"$12.50", null→"—" */
export function formatPrice(cents: number | null): string {
  if (cents === null) return "—";
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

/** Screen-reader text for a price cell: null → "not offered". */
export function priceSr(cents: number | null): string {
  return cents === null ? "not offered" : formatPrice(cents);
}

/** "Chicken, beef or pork $22 · Shrimp $24 · Combination $26.50" */
export function formatTiers(prices: Price[]): string {
  return prices.map((p) => (p.label ? `${p.label} ${formatPrice(p.cents)}` : formatPrice(p.cents))).join(" · ");
}

/** Lowest offered price in cents across the items (nulls ignored); 0 when none. */
export function minPrice(items: MenuItem[]): number {
  const all = items.flatMap((i) => i.prices.map((p) => p.cents)).filter((c): c is number => c !== null);
  return all.length ? Math.min(...all) : 0;
}

export function countItems(menu: Menu | Menu[]): number {
  return (Array.isArray(menu) ? menu : [menu]).reduce((n, m) => n + m.sections.reduce((k, s) => k + s.items.length, 0), 0);
}
