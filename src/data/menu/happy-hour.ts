/** Happy hour menu — transcribed from spec Appendix A.3. Windows come from SCHEDULE.happyHour (C-5). */
import { SCHEDULE } from "@/data/hours";
import { COPY } from "@/data/venue";
import { formatRange } from "@/lib/la-time";
import type { Menu, Price } from "./types";

const one = (dollars: number): Price[] => [{ cents: Math.round(dollars * 100) }];
const [early, late] = SCHEDULE.happyHour[0];
/** "3–6 PM" */
export const HH_EARLY = formatRange(early.open, early.close);
/** "3–6 PM & 9 PM–close" */
export const HH_BOTH = `${HH_EARLY} & ${formatRange(late.open, late.close, { endWord: late.endWord })}`;
/** Text flag on draft and bottled beer while happy hour is on (G12: no computed prices). */
export const HH_BEER_FLAG = "−$2 · happy hour"; // OWNER-CONFIRM(C-5): $2 off all beers in both windows

export const HAPPY_HOUR: Menu = {
  id: "happy-hour",
  title: "Happy hour",
  href: "/menu/happy-hour",
  ground: "ink",
  notes: [COPY.allergyNote, COPY.hhFootnote],
  sections: [
    {
      id: "hh-bites", title: "$8 appetizers", layout: "list",
      note: `${HH_EARLY}.`, // OWNER-CONFIRM(C-5): $8 appetizers 3–6 PM only — late-night availability?
      items: [
        { id: "hh-eggrolls", name: "Eggrolls", prices: one(8), priceSource: "G", description: "5 vegetable eggrolls served with sweet & sour sauce." },
        { id: "hh-cream-cheese-wontons", name: "Cream Cheese Wontons", prices: one(8), priceSource: "G", description: "6 cream cheese wontons served with sweet & sour sauce." },
        { id: "hh-dragon-wings", name: "Dragon Wings", prices: one(8), priceSource: "G", description: "6 bone-in wings tossed in spicy Szechuan sauce." },
        { id: "hh-spicy-cheese-balls", name: "Spicy Cheese Balls", prices: one(8), priceSource: "G", description: "7 spicy cheese balls served with sweet & sour and spicy mayo." },
        { id: "hh-fries", name: "French Fries or Sweet Potato Fries", prices: one(8), priceSource: "G", description: "Served with your choice of dipping sauce. +$2.00 makes it garlic fries." },
        { id: "hh-edamame", name: "Edamame", prices: one(8), priceSource: "G", description: "Regular or spicy garlic." },
      ],
    },
    {
      id: "hh-drinks", title: "Drink specials", layout: "list",
      note: `${HH_BOTH}.`, // OWNER-CONFIRM(C-5): drink specials run in both windows
      items: [
        { id: "hh-beer", name: "All beers", prices: [], priceNote: "$2 off", priceSource: "G", description: "16 oz & 24 oz — ask about our rotating taps." },
        { id: "hh-house-wines", name: "House Wines", prices: one(5), priceSource: "G" },
        { id: "hh-seltzers", name: "Happy Dad Seltzers & Nutrl", prices: one(5), priceSource: "G" },
        { id: "hh-well-drinks", name: "Well Drinks", prices: one(5), priceSource: "G" },
        { id: "hh-herradura", name: "Herradura Tequila", prices: one(7), priceSource: "G" },
        { id: "hh-absolut", name: "Absolut Vodka", prices: one(7), priceSource: "G" },
        { id: "hh-fireball", name: "Fireball", prices: one(8), priceSource: "G" },
      ],
    },
  ],
};
