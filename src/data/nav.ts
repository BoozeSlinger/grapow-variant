/** Navigation data (spec §9.11). */
import type { TrackId } from "@/data/hours";
import type { MenuId } from "@/data/menu/types";

export type NavLink = { label: string; href: string };

export const PRIMARY_NAV: Array<{ label: string; href?: string; kind?: "menu" }> = [
  { label: "Menu", kind: "menu" },
  { label: "Happy hour", href: "/menu/happy-hour" },
  { label: "Story", href: "/about" },
  { label: "Visit", href: "/visit" },
];

export type MenuNavEntry = { id: MenuId; label: string; href: string; track: TrackId; links: NavLink[] };

export const MENU_NAV: MenuNavEntry[] = [
  {
    id: "food", label: "Food", href: "/menu/food", track: "kitchen",
    links: [
      { label: "Lunch specials", href: "/menu/food#lunch" },
      { label: "Appetizers", href: "/menu/food#appetizers" },
      { label: "Entrées", href: "/menu/food#entrees" },
    ],
  },
  {
    id: "sushi", label: "Sushi bar", href: "/menu/sushi", track: "sushi",
    links: [
      { label: "Nigiri & sashimi", href: "/menu/sushi#nigiri-sashimi" },
      { label: "Specialty rolls", href: "/menu/sushi#specialty-rolls" },
      { label: "House special rolls", href: "/menu/sushi#house-specials" },
    ],
  },
  {
    id: "bar", label: "The bar", href: "/menu/drinks", track: "bar",
    links: [
      { label: "Cocktails", href: "/menu/drinks#cocktails" },
      { label: "Draft beer", href: "/menu/drinks#draft" },
      { label: "Wine", href: "/menu/drinks#wine" },
    ],
  },
  {
    id: "happy-hour", label: "Happy hour", href: "/menu/happy-hour", track: "happyHour",
    links: [
      { label: "$8 appetizers", href: "/menu/happy-hour#hh-bites" }, // OWNER-CONFIRM(C-5): $8 appetizers 3–6 PM only
      { label: "Drink specials", href: "/menu/happy-hour#hh-drinks" },
    ],
  },
];

export const FOOTER_NAV: NavLink[] = [
  { label: "Food", href: "/menu/food" },
  { label: "Sushi bar", href: "/menu/sushi" },
  { label: "The bar", href: "/menu/drinks" },
  { label: "Happy hour", href: "/menu/happy-hour" },
  { label: "All menus", href: "/menu" },
  { label: "Story", href: "/about" },
  { label: "Hours & directions", href: "/visit" },
  { label: "Request a table", href: "/reservations" },
];

export const SITE_ROUTES: string[] = ["/", "/menu", "/menu/food", "/menu/sushi", "/menu/drinks", "/menu/happy-hour", "/about", "/reservations", "/visit"];
