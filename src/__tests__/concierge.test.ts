/**
 * The host stand (spec §13.5): golden utterances → intent + item ids, the grounding property test, the
 * parser, a source grep for hard-coded facts, transcript privacy and the booking state machine with
 * requestTable mocked. Every instant carries an explicit LA offset, so results hold in any process TZ.
 */
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/request-table", () => ({ requestTable: vi.fn() }));

import { requestTable } from "@/app/actions/request-table";
import { redact, serializeTurns } from "@/components/concierge/useTranscript";
import { MENUS, getItem } from "@/data/menu";
import { COPY, VENUE } from "@/data/venue";
import { BOOKING_COPY } from "@/lib/booking/copy";
import { submitHostBooking, type HostBookingDraft } from "@/lib/concierge/booking";
import { answer, createRuleEngine, openingReply } from "@/lib/concierge/engine";
import { ungroundedTokens } from "@/lib/concierge/guard";
import { INTENT_ORDER } from "@/lib/concierge/intents";
import { parseBooking, parseParty, parseWhen } from "@/lib/concierge/parse";
import { BOOKING_HOST, openingChips } from "@/lib/concierge/replies";
import type { HostReply, IntentId } from "@/lib/concierge/types";
import { formatPrice, minPrice } from "@/lib/format";

const at = (iso: string) => Date.parse(iso);
const FRI_2230 = at("2026-10-02T22:30:00-07:00");
const SUN_2015 = at("2026-10-04T20:15:00-07:00");
const MON_1300 = at("2026-10-05T13:00:00-07:00");
const TUE_1730 = at("2026-10-06T17:30:00-07:00");
const SAT_0130 = at("2026-10-03T01:30:00-07:00");
const WED_1105 = at("2026-10-07T11:05:00-07:00");
const WED_NOON = at("2026-09-30T12:00:00-07:00"); // the Saturday after is 2026-10-03

const texts = (r: HostReply) => r.blocks.flatMap((b) => (b.kind === "text" || b.kind === "voice" || b.kind === "notice" ? [b.text] : [])).join(" ");
const itemIds = (r: HostReply) => r.blocks.flatMap((b) => (b.kind === "items" ? b.itemIds : []));
const prefillOf = (r: HostReply) => r.blocks.find((b) => b.kind === "booking");

type Golden = {
  q: string; intent: IntentId; now?: number; path?: string;
  top?: string; items?: string[]; noItems?: boolean; text?: Array<string | RegExp>; notText?: RegExp[];
};

const LUNCH = MENUS.food.sections.find((s) => s.id === "lunch")!;

const GOLDEN: Golden[] = [
  // ── Required rows (spec §13.5) ──
  { q: "are you open", intent: "status.now" },
  { q: "open sunday at 11pm?", now: WED_NOON, intent: "status.at", text: ["Sunday at 11 PM", "the kitchen's closed", "the bar's open till midnight"] },
  { q: "pad tai", intent: "menu.item", top: "pad-thai" },
  { q: "how much is the drunken noodles", intent: "menu.item", top: "gra-pow-noodle" },
  { q: "kra pao", intent: "menu.item", top: "pad-gra-pow" },
  { q: "lychee martini", intent: "menu.item", top: "lycheetini" },
  { q: "something spicy", intent: "menu.spicy" },
  { q: "vegan?", intent: "dietary", noItems: true, text: [COPY.hostDiet] },
  { q: "is the pad thai gluten free", intent: "dietary", items: ["pad-thai"], text: [COPY.hostDiet] },
  { q: "parking", intent: "parking", text: ["don't have parking details"], notText: [/free parking|parking lot|plenty/i] },
  { q: "do you deliver", intent: "delivery" },
  { q: "what game is on", intent: "sports", text: ["We don't post a TV schedule online", VENUE.sportsLine] },
  { q: "table for 4 saturday at 7", now: WED_NOON, intent: "booking" },
  { q: "party of 12", intent: "groups", text: [BOOKING_COPY.groups] },
  { q: "best thai food?", intent: "awards" },
  { q: "who owns this place", intent: "story", text: [COPY.storyShort] },
  { q: "happy hour", now: TUE_1730, intent: "happyhour", text: ["till 6 PM"] },
  { q: "sushi tonight", now: MON_1300, intent: "sushi", text: ["Sushi bar closed today · back Tue 5 PM"] },
  { q: "xyzzy", intent: "fallback", text: [COPY.hostFallback] },
  // ── Status ──
  { q: "are you open right now?", now: SAT_0130, intent: "status.now", text: ["the bar's open till 2 AM"] },
  { q: "is the kitchen still open", now: FRI_2230, intent: "status.now", text: ["kitchen's closed", "tomorrow at 11 AM"] },
  { q: "what time do you close tonight", now: MON_1300, intent: "status.now", text: ["The kitchen's open till 9 PM"], notText: [/^Yes/] },
  { q: "open tomorrow?", now: WED_NOON, intent: "status.at", text: ["Tomorrow:", "the kitchen's open 11 AM–9 PM"] },
  { q: "are you open at 10pm", now: MON_1300, intent: "status.at", text: ["Tonight at 10 PM", "the kitchen's closed — it closes at 9 PM", "the bar's open till midnight"] },
  { q: "kitchen open saturday at 9:30 pm?", now: WED_NOON, intent: "status.at", text: ["Saturday at 9:30 PM: the kitchen's open till 10 PM."] },
  { q: "is it open on monday", now: WED_NOON, intent: "status.at", text: ["Monday:"] },
  { q: "is the sushi bar open on sunday", now: WED_NOON, intent: "status.at", text: ["the sushi bar's closed on Sundays"] },
  { q: "happy hour friday at 10pm", now: WED_NOON, intent: "status.at", text: ["Friday at 10 PM: happy hour's on till close."] },
  { q: "open at 1am saturday?", now: WED_NOON, intent: "status.at", text: ["Saturday at 1 AM", "the bar's open till 2 AM"] },
  { q: "hours", intent: "hours.week" },
  { q: "what are your hours", intent: "hours.week" },
  // ── Happy hour, sushi, lunch, kids ──
  { q: "is happy hour on", now: FRI_2230, intent: "happyhour", text: ["till close"], items: ["hh-beer"] },
  { q: "when is happy hour", now: MON_1300, intent: "happyhour", text: ["starts at 3 PM"], items: ["hh-eggrolls", "hh-beer"] },
  { q: "drink specials", intent: "happyhour" },
  { q: "any deals?", intent: "happyhour" },
  { q: "sushi bar hours", now: TUE_1730, intent: "sushi", text: ["Sushi bar open · till 9 PM", COPY.rawAdvisory], items: ["spicy-yuzu-kanpachi-roll"] },
  { q: "is the sushi bar open tonight", now: FRI_2230, intent: "sushi", text: ["Sushi bar closed · back tomorrow 5 PM"] },
  { q: "lunch specials", now: WED_1105, intent: "lunch", text: ["until 3 PM", `from ${formatPrice(minPrice(LUNCH.items))}`], items: ["lunch-cashew-chicken"] },
  { q: "until when is lunch", intent: "lunch" },
  { q: "kids menu", intent: "kids", items: ["kids-teriyaki-chicken-bowl"] },
  { q: "do you have food for children", intent: "kids" },
  // ── Menu ──
  { q: "what's hot", intent: "menu.spicy", items: ["pad-gra-pow"] },
  { q: "spicy tuna roll", intent: "menu.item", top: "spicy-tuna-roll" },
  { q: "what do you recommend", intent: "menu.recommend", items: ["pad-gra-pow", "crying-tiger-steak", "kung-pik-pow", "gra-pow-seafood"] },
  { q: "what's good here", intent: "menu.recommend" },
  { q: "what should I order", intent: "menu.recommend" },
  { q: "curry", intent: "menu.category", items: ["red-curry"], text: [/^Curry: \d+ on the menu\./] },
  { q: "do you have desserts", intent: "menu.category", items: ["sweet-sticky-rice-mango"] },
  { q: "cocktails", intent: "menu.category", items: ["lycheetini"] },
  { q: "what's on tap", intent: "menu.category", items: ["draft-corona-light"] },
  { q: "wine list", intent: "menu.category", items: ["wine-kung-fu-girl"] },
  { q: "tequila", intent: "menu.category", items: ["spirit-casamigos-blanco"], text: [/^Tequila: \d+ on the menu\./] },
  { q: "nigiri", intent: "menu.category", items: ["nigiri-tuna"], text: [COPY.rawAdvisory] },
  { q: "noodle lunch", intent: "menu.category", items: ["lunch-gra-pow-noodle"] },
  { q: "tom yum", intent: "menu.item", items: ["tom-yum-chicken", "tom-yum-shrimp"], text: ["Did you mean one of these?"] },
  { q: "pad see ew", intent: "menu.item", top: "pad-see-aew" },
  { q: "panang", intent: "menu.item", top: "panang-curry" },
  { q: "shumai", intent: "menu.item", top: "steamed-sue-mai" },
  { q: "thai tea", intent: "menu.item", top: "thai-iced-tea" },
  { q: "egg rolls", intent: "menu.item", top: "egg-rolls" },
  { q: "mango sticky rice", intent: "menu.item", top: "sweet-sticky-rice-mango" },
  { q: "margarita", intent: "menu.item", top: "grapowrita" },
  { q: "wings", intent: "menu.item", top: "dragon-wings" },
  { q: "anything with basil", intent: "menu.item", items: ["pad-gra-pow"] },
  { q: "what's the price of the crying tiger steak", intent: "menu.item", top: "crying-tiger-steak", notText: [/\$\d/] },
  { q: "seafood hot plate", intent: "menu.item", top: "gra-pow-seafood" },
  { q: "how much is a coke", intent: "menu.item", top: "coke-products" },
  { q: "how spicy is the panang", intent: "menu.item", top: "panang-curry" },
  { q: "sake", intent: "fallback" }, // a one-letter slip from "cake" is not an answer
  { q: "bar hours", now: MON_1300, intent: "hours.week", text: ["Bar open · till midnight."] },
  { q: "late night food?", now: FRI_2230, intent: "status.now", text: ["The bar's open till 2 AM", "The kitchen's closed"], notText: [/^Yes/] },
  { q: "how late is the bar open", now: MON_1300, intent: "status.now", notText: [/^Yes/] },
  { q: "are you open", now: MON_1300, intent: "status.now", text: ["Yes — the kitchen's open till"] },
  // ── Honesty: no holiday hours, no digit fuzz, a bare ingredient names no dish ──
  { q: "are you open on christmas", intent: "fallback", text: [COPY.hostFallback], notText: [/\bYes\b/] },
  { q: "open on thanksgiving?", intent: "fallback" },
  { q: "what are the hours on new years eve", intent: "fallback" },
  { q: "what's 2+2", intent: "fallback" },
  { q: "805", intent: "menu.item", top: "draft-805" },
  { q: "is the chicken halal", intent: "dietary", noItems: true },
  { q: "who is patrick", intent: "story", text: [COPY.storyShort] },
  { q: "is sushi raw", intent: "sushi", text: [COPY.rawAdvisory] },
  { q: "gra pow", intent: "menu.recommend", items: ["pad-gra-pow"] },
  { q: "what is gra pow", intent: "menu.recommend", items: ["pad-gra-pow"] },
  // ── Dietary (never asserts or denies an ingredient) ──
  { q: "I'm allergic to peanuts", intent: "dietary", noItems: true },
  { q: "does the satay have peanuts", intent: "dietary", items: ["satay-chicken"] },
  { q: "halal?", intent: "dietary", noItems: true },
  { q: "gluten free options", intent: "dietary", noItems: true },
  { q: "do you have vegetarian dishes", intent: "dietary", noItems: true },
  // ── Visit, contact, sports, the record ──
  { q: "where are you located", intent: "location", text: [VENUE.address.oneLine] },
  { q: "what's your address", intent: "location" },
  { q: "directions", intent: "location" },
  { q: "where do I park", intent: "parking" },
  { q: "can I order to go", intent: "pickup", text: [VENUE.pickupLine] },
  { q: "takeout", intent: "pickup" },
  { q: "doordash?", intent: "delivery" },
  { q: "uber eats", intent: "delivery" },
  { q: "phone number", intent: "contact", text: [VENUE.phone.display] },
  { q: "do you have an email", intent: "contact", text: ["We don't list an email — please call."] },
  { q: "are the dodgers on tv", intent: "sports" },
  { q: "ufc fight tonight?", intent: "sports" },
  { q: "awards", intent: "awards" },
  { q: "voted #1?", intent: "awards" },
  { q: "who is the chef", intent: "story" },
  { q: "tell me about gra pow", intent: "story" },
  // ── Booking and groups ──
  { q: "we're a group of 15 for a birthday party", intent: "groups" },
  { q: "private event", intent: "groups" },
  { q: "catering", intent: "groups" },
  { q: "book a table", intent: "booking" },
  { q: "reservation for 2 tomorrow at 6:30pm", now: WED_NOON, intent: "booking" },
  { q: "can I get a table for two tonight at 8", now: MON_1300, intent: "booking" },
  // ── Small talk ──
  { q: "hi", intent: "greeting" },
  { q: "hello there", intent: "greeting" },
  { q: "thanks!", intent: "thanks" },
  { q: "thank you so much", intent: "thanks" },
  { q: "asdf qwerty", intent: "fallback" },
];

const DEFAULT_NOW = WED_NOON;

describe("golden utterances", () => {
  it("has at least 60 cases, covering every intent", () => {
    expect(GOLDEN.length).toBeGreaterThanOrEqual(60);
    const covered = new Set(GOLDEN.map((g) => g.intent));
    for (const id of INTENT_ORDER) expect(covered, id).toContain(id);
  });

  it.each(GOLDEN)("$q → $intent", (g) => {
    const r = answer(g.q, g.now ?? DEFAULT_NOW, g.path ?? "/");
    expect(r.intent).toBe(g.intent);
    expect(r.sources.length).toBeGreaterThan(0);
    expect(r.chips.length).toBeLessThanOrEqual(6);
    const ids = itemIds(r);
    if (g.top) expect(ids[0]).toBe(g.top);
    if (g.items) for (const id of g.items) expect(ids).toContain(id);
    if (g.noItems) expect(ids).toEqual([]);
    const t = texts(r);
    for (const want of g.text ?? []) {
      if (typeof want === "string") expect(t).toContain(want);
      else expect(t).toMatch(want);
    }
    for (const bad of g.notText ?? []) expect(t).not.toMatch(bad);
    if (r.intent !== "awards") expect(t).not.toMatch(/\bbest\b/i); // never "best" for dishes
    for (const id of ids) expect(getItem(id), id).toBeDefined();
  });

  it("never writes a price into host text — prices only on item cards", () => {
    for (const g of GOLDEN.filter((x) => x.intent === "menu.item" || x.intent === "menu.category" || x.intent === "menu.spicy" || x.intent === "menu.recommend")) {
      const t = texts(answer(g.q, g.now ?? DEFAULT_NOW, "/"));
      expect(t, g.q).not.toMatch(/\$\d/);
    }
  });

  it("uses the dietary copy without suggesting an item when no dish is named", () => {
    const r = answer("vegan?", DEFAULT_NOW, "/");
    expect(r.blocks.some((b) => b.kind === "notice" && b.tone === "allergy" && b.text === COPY.allergyNote)).toBe(true);
    expect(texts(r)).not.toMatch(/\b(contains|is vegan|is gluten|no meat|safe)\b/i);
  });

  it("pre-fills the booking hand-off from free text", () => {
    expect(prefillOf(answer("table for 4 saturday at 7", WED_NOON, "/"))).toEqual({
      kind: "booking", prefill: { partySize: 4, date: "2026-10-03", time: "19:00", source: "host" },
    });
    expect(prefillOf(answer("reservation for 2 tomorrow at 6:30pm", WED_NOON, "/"))).toMatchObject({
      prefill: { partySize: 2, date: "2026-10-01", time: "18:30" },
    });
    expect(prefillOf(answer("can I get a table for two tonight at 8", MON_1300, "/"))).toMatchObject({
      prefill: { partySize: 2, date: "2026-10-05", time: "20:00" },
    });
  });

  it("answers through the async engine interface with no artificial delay", async () => {
    const engine = createRuleEngine();
    const t0 = Date.now();
    const r = await engine.reply({ text: "are you open", now: FRI_2230, path: "/", history: [] });
    expect(r.intent).toBe("status.now");
    expect(Date.now() - t0).toBeLessThan(250);
  });
});

describe("grounding property (ungroundedTokens)", () => {
  it.each(GOLDEN)("$q is grounded", (g) => {
    const r = answer(g.q, g.now ?? DEFAULT_NOW, g.path ?? "/");
    expect(ungroundedTokens(r)).toEqual([]);
  });

  const INSTANTS = { FRI_2230, SUN_2015, MON_1300, TUE_1730, SAT_0130, WED_1105 };
  it.each(Object.entries(INSTANTS))("opening reply at %s is grounded", (_, now) => {
    for (const p of ["/", "/menu/food", "/menu/sushi", "/menu/drinks", "/menu/happy-hour"]) {
      const r = openingReply(now, p);
      expect(r.blocks[0]).toEqual({ kind: "voice", text: COPY.hostHello });
      expect(r.blocks[1]).toEqual({ kind: "status" });
      expect(r.chips.length).toBeGreaterThan(0);
      expect(r.chips.length).toBeLessThanOrEqual(6);
      expect(ungroundedTokens(r)).toEqual([]);
    }
  });

  it("flags invented prices, times, phone numbers and item ids", () => {
    const fake: HostReply = {
      intent: "fallback", confidence: 0, sources: ["venue:phone"], chips: [],
      blocks: [{ kind: "text", text: "Pad Thai is $99, we open at 8:15 PM, call (555) 123-4567." }, { kind: "items", itemIds: ["not-a-dish"] }],
    };
    expect(ungroundedTokens(fake)).toEqual(["$99", "8:15 PM", "(555) 123-4567", "item:not-a-dish"]);
    const ok: HostReply = { ...fake, blocks: [{ kind: "text", text: `Kids: Thai iced tea $2 extra. Late happy hour from 9 PM. ${VENUE.phone.display}` }] };
    expect(ungroundedTokens(ok)).toEqual([]);
  });
});

describe("chips are time- and route-aware", () => {
  const labels = (now: number, p = "/") => openingChips(now, p).map((c) => c.label);
  it("adds lunch before 3 PM", () => expect(labels(MON_1300)).toContain("Lunch specials"));
  it("swaps in 'Happy hour now' during 3–6 and adds sushi Tue–Sat", () => {
    expect(labels(TUE_1730)).toEqual(expect.arrayContaining(["Happy hour now", "Sushi tonight?"]));
    expect(labels(TUE_1730)).not.toContain("Happy hour");
  });
  it("goes late after 9 PM", () => expect(labels(FRI_2230)).toEqual(expect.arrayContaining(["Late happy hour", "Bar hours"])));
  it("leads with the route chip", () => {
    expect(labels(MON_1300, "/menu/food")[0]).toBe("Spicy dishes");
    expect(labels(MON_1300, "/menu/sushi")[0]).toBe("Sushi bar hours");
    expect(labels(MON_1300, "/menu/drinks")[0]).toBe("Cocktails");
    expect(labels(MON_1300, "/menu/happy-hour")[0]).toBe("What's on happy hour?");
  });
  it("caps at 6", () => {
    for (const now of [FRI_2230, SUN_2015, MON_1300, TUE_1730, SAT_0130, WED_1105]) {
      for (const p of ["/", "/menu/food", "/menu/sushi"]) expect(openingChips(now, p).length).toBeLessThanOrEqual(6);
    }
  });
});

describe("parser", () => {
  it("parses days and times in LA service time", () => {
    expect(parseWhen("open sunday at 11pm?", WED_NOON)).toEqual({ dateISO: "2026-10-04", minutes: 1380, label: "Sunday" });
    expect(parseWhen("tomorrow", WED_NOON)).toEqual({ dateISO: "2026-10-01", label: "Tomorrow" });
    expect(parseWhen("tonight", WED_NOON)).toEqual({ dateISO: "2026-09-30", label: "Tonight" });
    expect(parseWhen("today at noon", WED_NOON)).toMatchObject({ dateISO: "2026-09-30", minutes: 720 });
    expect(parseWhen("tonight at 10", WED_NOON)).toMatchObject({ dateISO: "2026-09-30", minutes: 1320 });
    expect(parseWhen("sat 11:30", WED_NOON)).toMatchObject({ dateISO: "2026-10-03", minutes: 1410 });
    expect(parseWhen("at 7:30 pm", WED_NOON)).toMatchObject({ dateISO: "2026-09-30", minutes: 1170, label: "Tonight" });
    expect(parseWhen("19:00", WED_NOON)).toMatchObject({ minutes: 1140 });
    expect(parseWhen("at midnight", WED_NOON)).toMatchObject({ minutes: 1440 });
    expect(parseWhen("saturday at 1am", WED_NOON)).toMatchObject({ dateISO: "2026-10-03", minutes: 1500 });
    expect(parseWhen("10pm", WED_NOON)).toMatchObject({ dateISO: "2026-09-30", minutes: 1320 });
    expect(parseWhen("next wednesday", WED_NOON)).toMatchObject({ dateISO: "2026-10-07", label: "Wednesday" });
    expect(parseWhen("wednesday", WED_NOON)).toMatchObject({ dateISO: "2026-09-30" });
    expect(parseWhen("wednesday at 11am", WED_NOON)).toMatchObject({ dateISO: "2026-10-07", minutes: 660 });
    expect(parseWhen("oct 3", WED_NOON)).toMatchObject({ dateISO: "2026-10-03", label: "Sat, Oct 3" });
    expect(parseWhen("at 11am", FRI_2230)).toMatchObject({ dateISO: "2026-10-03", label: "Tomorrow" });
    expect(parseWhen("pad thai", WED_NOON)).toEqual({});
  });

  it("never reads a head count as a time", () => {
    expect(parseWhen("table for 4", WED_NOON)).toEqual({});
    expect(parseWhen("saturday 6 people", WED_NOON)).toEqual({ dateISO: "2026-10-03", label: "Saturday" });
  });

  it("parses party sizes", () => {
    expect(parseParty("table for 4 saturday at 7")).toBe(4);
    expect(parseParty("4 people")).toBe(4);
    expect(parseParty("party of 6")).toBe(6);
    expect(parseParty("table for two")).toBe(2);
    expect(parseParty("party of twelve")).toBe(12);
    expect(parseParty("just me")).toBe(1);
    expect(parseParty("dinner for 7pm")).toBeUndefined();
    expect(parseParty("are you open")).toBeUndefined();
  });

  it("builds a booking pre-fill, keeping only a bookable time", () => {
    expect(parseBooking("table for 4 saturday at 7", WED_NOON)).toEqual({ partySize: 4, date: "2026-10-03", time: "19:00", source: "host" });
    // 11 PM on a Sunday is past the last slot: date kept, time dropped.
    expect(parseBooking("table for 2 sunday at 11pm", WED_NOON)).toEqual({ partySize: 2, date: "2026-10-04", source: "host" });
    // An ambiguous "11:30" resolves to the morning when only that is bookable.
    expect(parseBooking("table for 2 saturday at 11:30", WED_NOON)).toMatchObject({ date: "2026-10-03", time: "11:30" });
    // 31 days ahead is outside the window.
    expect(parseBooking("table for 2 on nov 15", WED_NOON)).toEqual({ partySize: 2, source: "host" });
  });
});

describe("no hard-coded facts in the engine sources", () => {
  const dir = path.resolve(__dirname, "../lib/concierge");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));
  it.each(files)("%s", (f) => {
    const src = fs.readFileSync(path.join(dir, f), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .map((line) => line.replace(/(^|[^:"'`\\])\/\/.*$/, "$1"))
      .join("\n");
    expect(src.match(/\$\d|\d{3}\) \d{3}|\b\d{1,2} ?(AM|PM)\b/g)).toBeNull();
  });
});

describe("transcript privacy", () => {
  it("redacts phone numbers and emails from guest text", () => {
    expect(redact("call me at 951-555-0134 or (909) 555 0199, or mail ana@example.com")).toBe("call me at [phone] or [phone], or mail [email]");
    expect(redact("table for 4 at 7")).toBe("table for 4 at 7");
  });

  it("stores the last 30 turns and no guest contact details", () => {
    const turns = Array.from({ length: 40 }, (_, i) => ({ role: "guest" as const, text: `msg ${i} 951.555.0134 a@b.co`, at: i }));
    const out = JSON.parse(serializeTurns(turns));
    expect(out).toHaveLength(30);
    expect(out[0].text).toBe("msg 10 [phone] [email]");
    expect(JSON.stringify(out)).not.toMatch(/555|@/);
  });

  it("keeps booking outcomes free of names, phones and emails", () => {
    for (const s of ["ok", "not_configured", "failed"] as const) {
      const r = BOOKING_HOST.outcome(s, { partySize: 4, date: "2026-10-03", time: "19:00" });
      const t = texts(r);
      expect(t).toContain("Table for 4 · Sat, Oct 3 · 7:00 PM");
      expect(t.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}/g) ?? []).toEqual(s === "ok" ? [] : [VENUE.phone.display]);
      expect(ungroundedTokens(r)).toEqual([]);
    }
  });
});

describe("booking state machine (requestTable mocked)", () => {
  const send = vi.mocked(requestTable);
  const NOW = WED_NOON;
  const draft: HostBookingDraft = {
    partySize: 4, date: "2026-10-03", time: "19:00", name: "Ana Reyes", phone: "951 555 0134", email: "ana@example.com", notes: "", company: "",
  };
  beforeEach(() => send.mockReset());

  it("ok → success copy, only on { ok: true }", async () => {
    send.mockResolvedValue({ ok: true, id: "x", ref: "ABC123" });
    const out = await submitHostBooking(draft, NOW);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ partySize: 4, date: "2026-10-03", time: "19:00", source: "host", phone: "(951) 555-0134" }));
    expect(out.status).toBe("ok");
    expect(out.ref).toBe("ABC123");
    expect(out.message).toBe(BOOKING_COPY.success({ phone: "(951) 555-0134", partySize: 4, date: "2026-10-03", time: "19:00" }));
  });

  it("not_configured → its copy, never success", async () => {
    send.mockResolvedValue({ ok: false, reason: "not_configured" });
    const out = await submitHostBooking(draft, NOW);
    expect(out.status).toBe("not_configured");
    expect(out.message).toBe(BOOKING_COPY.notConfigured);
  });

  it("failed → failure copy, and every field is kept for Try again", async () => {
    send.mockResolvedValue({ ok: false, reason: "failed" });
    const out = await submitHostBooking(draft, NOW);
    expect(out.status).toBe("failed");
    expect(out.message).toBe(BOOKING_COPY.failed);
    expect(out.draft).toEqual(draft);
  });

  it("a thrown network error is a failure, not a success", async () => {
    // Injected directly: a rejecting vi.fn is reported by vitest itself even when the caller handles it.
    const offline = async (): Promise<never> => {
      throw new TypeError("network offline");
    };
    expect((await submitHostBooking(draft, NOW, offline)).status).toBe("failed");
  });

  it("invalid fields stop before the server and come back inline", async () => {
    const out = await submitHostBooking({ ...draft, phone: "12", email: "nope" }, NOW);
    expect(send).not.toHaveBeenCalled();
    expect(out.status).toBe("invalid");
    expect(Object.keys(out.fields).sort()).toEqual(["email", "phone"]);
  });

  it("passes the server's invalid fields through", async () => {
    send.mockResolvedValue({ ok: false, reason: "invalid", fields: { time: "That time isn't available — pick another." } });
    const out = await submitHostBooking(draft, NOW);
    expect(out.status).toBe("invalid");
    expect(out.fields.time).toBeDefined();
  });

  it("the pending copy is the shared one", () => expect(BOOKING_COPY.pending).toBe(COPY.bookingPending));
});
