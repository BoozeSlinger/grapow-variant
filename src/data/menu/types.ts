/** Menu data types (spec §9.8). No dietary fields exist anywhere (C-10). */
export type MenuId = "food" | "sushi" | "bar" | "happy-hour";
/** null = not offered → "—" (sr "not offered"); source "W" tags a grapow.net tier price. */
export type Price = { label?: string; cents: number | null; source?: "W" };
export type MenuItem = {
  /** Globally unique slug; the anchor id is `item-${id}`. */
  id: string;
  /** Official name, typo-fixed. */
  name: string;
  /** OFFICIAL text only (Appendix A); omitted when none. */
  description?: string;
  /** ≥1, except in sections with layout "names" (or when `priceNote` fills the price slot). */
  prices: Price[];
  /** Non-price deal text shown in the price slot, e.g. "$2 off". */
  priceNote?: string;
  /** Official "(Spicy)". */
  spicy?: boolean;
  /** Official "Minimum spice N". */
  minSpice?: number;
  /** Sub-group label for "names"/"priceGroups" layouts (e.g. "Vodka"). */
  group?: string;
  /** Search only, never displayed. */
  aliases?: string[];
  /** Named by the Press-Enterprise in 2019. */
  pe2019?: boolean;
  /** OWNER-CONFIRM picks (none in v1). */
  featured?: boolean;
  /** G = repo transcription (newest), W = grapow.net price. */
  priceSource: "G" | "W";
  /** e.g. "C-8: Mongolian Beef $23 (repo) vs $21 (grapow.net)". Never displayed. */
  ownerConfirm?: string;
  /** C-15; renders only when approved. */
  photo?: { publicId: string; alt: string; approved: boolean };
};
export type SectionLayout = "list" | "compact" | "table" | "priceGroups" | "names";
export type MenuSection = {
  id: string; title: string; note?: string; layout: SectionLayout; tierLabels?: string[];
  window?: "lunch"; hhFlag?: boolean; items: MenuItem[];
};
export type Menu = { id: MenuId; title: string; href: string; ground: "rice" | "ink"; notes: string[]; sections: MenuSection[] };
