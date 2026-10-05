// @vitest-environment node
import { describe, expect, it } from "vitest";
import { AWARDS, AWARD_LINE } from "@/data/awards";
import { FIXTURES, upcomingFixtures } from "@/data/gameday";
import { ALL_ITEMS, COOKS_INDEX, MENUS, getItem } from "@/data/menu";
import { FOOD } from "@/data/menu/food";
import { MENU_NAV, SITE_ROUTES } from "@/data/nav";
import { PHOTOS } from "@/data/photos";
import { COPY, VENUE } from "@/data/venue";
import { countItems, formatPrice, formatTiers, minPrice, priceSr } from "@/lib/format";
import { searchMenu } from "@/lib/menu-search";

const MENU_ITEM_KEYS = new Set([
  "id", "name", "description", "prices", "priceNote", "spicy", "minSpice", "group", "aliases",
  "pe2019", "featured", "priceSource", "ownerConfirm", "photo",
]);

describe("menu data integrity (Appendix A)", () => {
  it("item ids are unique across all menus", () => {
    const ids = ALL_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("every item has a price unless its section layout is names (priceNote fills the slot)", () => {
    for (const menu of Object.values(MENUS)) {
      for (const s of menu.sections) {
        for (const i of s.items) {
          if (s.layout === "names") expect(i.prices, i.id).toEqual([]);
          else expect(i.prices.length > 0 || !!i.priceNote, i.id).toBe(true);
        }
      }
    }
  });
  it("prices are integer cents or null", () => {
    for (const i of ALL_ITEMS) for (const p of i.prices) expect(p.cents === null || Number.isInteger(p.cents), i.id).toBe(true);
  });
  it("Fresh Spring Roll contains shrimp", () => {
    expect(getItem("fresh-spring-roll")?.description).toContain("shrimp");
  });
  it("no item carries keys outside MenuItem (no dietary fields)", () => {
    for (const menu of Object.values(MENUS)) {
      for (const s of menu.sections) {
        for (const i of s.items) {
          for (const k of Object.keys(i)) expect(MENU_ITEM_KEYS.has(k), `${i.id}.${k}`).toBe(true);
          expect(Object.keys(i).some((k) => /veg|vegan|gluten|halal|diet/i.test(k))).toBe(false);
        }
      }
    }
  });
  it("only the three PE 2019 dishes are flagged pe2019", () => {
    expect(ALL_ITEMS.filter((i) => i.pe2019).map((i) => i.id).sort()).toEqual(["crying-tiger-steak", "gra-pow-seafood", "kung-pik-pow"]);
  });
  it("the draft section has exactly 15 items", () => {
    expect(MENUS.bar.sections.find((s) => s.id === "draft")?.items).toHaveLength(15);
  });
  it("lunch specials start at $18", () => {
    const lunch = FOOD.sections.find((s) => s.id === "lunch")!;
    expect(minPrice(lunch.items)).toBe(1800);
    expect(lunch.items).toHaveLength(16);
    expect(FOOD.sections.find((s) => s.id === "noodle-lunch")!.items).toHaveLength(8);
  });
  it("every cook's-index term returns at least one food hit", () => {
    expect(COOKS_INDEX.map((c) => c.term)).toEqual([
      "Thai basil", "lemon grass", "roasted curry paste", "young coconut", "chili garlic", "peanut sauce", "roasted rice powder",
    ]);
    for (const c of COOKS_INDEX) {
      expect(c.href).toBe(`/menu/food?q=${encodeURIComponent(c.term)}`);
      expect(searchMenu(c.term, { menus: ["food"] }).length, c.term).toBeGreaterThan(0);
    }
  });
  it("MENU_NAV anchors exist as section ids", () => {
    for (const entry of MENU_NAV) {
      const menu = MENUS[entry.id];
      expect(entry.href).toBe(menu.href);
      for (const l of entry.links) {
        const [path, hash] = l.href.split("#");
        expect(path).toBe(menu.href);
        expect(menu.sections.some((s) => s.id === hash), l.href).toBe(true);
      }
    }
  });
  it("section ids and layouts match §9.8", () => {
    const shape = (id: keyof typeof MENUS) => MENUS[id].sections.map((s) => `${s.id}:${s.layout}`);
    expect(shape("food")).toEqual([
      "lunch:compact", "noodle-lunch:compact", "appetizers:list", "soup:table", "salad:list", "entrees:list", "curry:list",
      "noodles:list", "rice:list", "specials:list", "sides:compact", "dessert:compact", "kids:compact", "soft-drinks:compact",
    ]);
    expect(shape("sushi")).toEqual([
      "nigiri-sashimi:table", "traditional-rolls:compact", "specialty-rolls:compact", "house-specials:list", "small-bites:list",
    ]);
    expect(shape("bar")).toEqual(["cocktails:list", "shots:list", "draft:table", "bottled:priceGroups", "wine:table", "spirits:names"]);
    expect(shape("happy-hour")).toEqual(["hh-bites:list", "hh-drinks:list"]);
    expect(MENUS.food.notes).toEqual([COPY.allergyNote, COPY.priceNote]);
    expect(MENUS.sushi.notes).toContain(COPY.rawAdvisory);
  });
  it("table sections share tier labels across their items", () => {
    for (const menu of Object.values(MENUS)) {
      for (const s of menu.sections.filter((x) => x.layout === "table")) {
        for (const i of s.items) expect(i.prices.map((p) => p.label), i.id).toEqual(s.tierLabels);
      }
    }
  });
  it("spot-checks transcribed prices", () => {
    expect(formatTiers(getItem("pad-thai")!.prices)).toBe("Chicken, beef or pork $22 · Shrimp $24 · Combination $26.50");
    expect(formatTiers(getItem("pad-gra-pow")!.prices)).toBe("$22 · With fried egg $23");
    expect(getItem("nigiri-freshwater-eel")!.prices[1].cents).toBeNull();
    expect(getItem("wine-woodbridge")!.prices[1].cents).toBeNull();
    expect(getItem("garlic-black-pepper")!.prices.map((p) => p.source)).toEqual([undefined, "W", "W"]);
    expect(getItem("pad-thai")!.priceSource).toBe("W");
    expect(getItem("hh-beer")!.priceNote).toBe("$2 off");
    expect(getItem("mongolian-beef")!.ownerConfirm).toMatch(/^C-8/);
  });
});

describe("format", () => {
  it("formats prices", () => {
    expect(formatPrice(2200)).toBe("$22");
    expect(formatPrice(2650)).toBe("$26.50");
    expect(formatPrice(1250)).toBe("$12.50");
    expect(formatPrice(null)).toBe("—");
    expect(priceSr(null)).toBe("not offered");
    expect(countItems(MENUS.bar)).toBe(MENUS.bar.sections.reduce((n, s) => n + s.items.length, 0));
    expect(countItems([MENUS.food, MENUS.sushi])).toBe(countItems(MENUS.food) + countItems(MENUS.sushi));
  });
});

describe("venue, photos, awards, nav, game day", () => {
  it("venue facts", () => {
    expect(VENUE.phone.href).toBe("tel:+19517801132");
    expect(VENUE.address.oneLine).toBe("497 E Alessandro Blvd, Suite D, Riverside, CA 92508");
    expect(JSON.stringify(VENUE)).not.toMatch(/@[a-z0-9-]+\.[a-z]/i); // no public email
  });
  it("photo registry never ships banned assets", () => {
    const all = JSON.stringify(PHOTOS);
    for (const banned of ["e3lutg", "wtue0a", "bwklhs", "unsplash", "noise.png", "about-atmosphere"]) expect(all).not.toContain(banned);
    expect(PHOTOS.diningRoom.ownerConfirm).toBe("C-15");
    expect(PHOTOS.tapWall.slots.plate).toBeDefined();
  });
  it("awards", () => {
    expect(AWARDS.map((a) => `${a.year}:${a.label}`)).toEqual(["2018:Voted #1", "2019:Voted #1", "2020:Top 3", "2023:Top 3"]);
    expect(AWARDS.find((a) => a.year === 2020)?.badge).toBeUndefined();
    expect(AWARD_LINE).toContain("Top 3 in 2020 & 2023");
  });
  it("site routes and fixtures", () => {
    expect(SITE_ROUTES).toEqual(["/", "/menu", "/menu/food", "/menu/sushi", "/menu/drinks", "/menu/happy-hour", "/about", "/reservations", "/visit"]);
    expect(FIXTURES).toEqual([]);
    expect(upcomingFixtures(Date.now())).toEqual([]);
  });
});
