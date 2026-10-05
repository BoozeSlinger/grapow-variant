/** All menus, a flat item index, and the cook's index (spec §9.8). */
import { BAR } from "./bar";
import { FOOD } from "./food";
import { HAPPY_HOUR } from "./happy-hour";
import { SUSHI } from "./sushi";
import type { Menu, MenuId, MenuItem } from "./types";

export type { Menu, MenuId, MenuItem, MenuSection, Price, SectionLayout } from "./types";

export const MENUS: Record<MenuId, Menu> = { food: FOOD, sushi: SUSHI, bar: BAR, "happy-hour": HAPPY_HOUR };

/** Menu order used for search tie-breaks. */
const ORDER: MenuId[] = ["food", "sushi", "bar", "happy-hour"];

export const ALL_ITEMS: Array<MenuItem & { menuId: MenuId; sectionId: string; href: string }> = ORDER.flatMap((menuId) =>
  MENUS[menuId].sections.flatMap((section) =>
    section.items.map((item) => ({ ...item, menuId, sectionId: section.id, href: `${MENUS[menuId].href}#item-${item.id}` })),
  ),
);

const BY_ID = new Map(ALL_ITEMS.map((i) => [i.id, i]));
export function getItem(id: string): (typeof ALL_ITEMS)[number] | undefined {
  return BY_ID.get(id);
}

/** Ingredient words taken from official descriptions, each linking to a pre-filtered food menu (G7). */
export const COOKS_INDEX: Array<{ term: string; href: string }> = [
  "Thai basil", "lemon grass", "roasted curry paste", "young coconut", "chili garlic", "peanut sauce", "roasted rice powder",
].map((term) => ({ term, href: `/menu/food?q=${encodeURIComponent(term)}` }));
