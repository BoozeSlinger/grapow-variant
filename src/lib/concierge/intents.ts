/**
 * The ordered intent table (spec §13.4). Deterministic: the first rule that matches wins, groups first and
 * fallback last. Rules only classify; every word the host says is built in replies.ts.
 */
import { MENUS } from "@/data/menu";
import { VENUE } from "@/data/venue";
import type { MenuId } from "@/data/menu/types";
import { getServiceDay } from "@/lib/hours";
import { searchMenu, tokenize, type SearchHit } from "@/lib/menu-search";
import type { IntentId } from "./types";
import { FILLER, hasAny, hasPhrase, hasStem, normText, without } from "./normalize";
import { parseParty, parseWhen } from "./parse";

export type SectionMatch = { menuId: MenuId; sectionId: string; group?: string };
export type TrackMention = { kitchen: boolean; bar: boolean; sushi: boolean; happyHour: boolean; lunch: boolean };

export type IntentContext = {
  text: string; n: string; now: number; path: string;
  when: { dateISO?: string; minutes?: number; label?: string };
  party?: number;
  serviceDateISO: string;
  /** Normalized text without filler words: the dish or section the guest named, if any. */
  topic: string;
  mentions: TrackMention;
  section?: SectionMatch;
  /** searchMenu over a query (cached). */
  hits(q: string): SearchHit[];
  /** The dish query that searches best: the topic, or the topic without modifiers ("how spicy is the panang"). */
  dish(): { q: string; hits: SearchHit[] };
};

/* ── Trigger vocabularies (normalized words) ── */
const GROUP_WORDS = ["event", "events", "buyout", "buy out", "private party", "private event", "private room", "private", "birthday party",
  "catering", "cater", "large group", "big group", "banquet", "rehearsal dinner", "office party", "company party", "party room"];
const BOOK_WORDS = ["book", "booking", "reserve", "reserving", "reservation", "reservations", "table for", "get a table", "request a table",
  "save a table", "hold a table", "make a reservation", "need a table", "want a table", "a table tonight", "table tonight", "tables available"];
const PARTY_WORDS = ["party of", "people", "guests", "persons", "of us", "adults"];
const DIET_STRONG = ["vegan", "vegetarian", "veggie", "veg", "gluten", "celiac", "coeliac", "halal", "kosher", "plant based", "meatless",
  "no meat", "without meat", "dietary", "diet", "lactose", "dairy free", "nut free", "msg"];
const DIET_ALLERGENS = ["nut", "nuts", "peanut", "peanuts", "tree nut", "shellfish", "dairy", "sesame", "soy", "fish sauce", "oyster sauce", "milk", "wheat"];
const DIET_ASK = ["contain", "contains", "have", "has", "any", "free", "without", "no", "allergic", "safe", "in it", "made with", "cooked in", "use"];
const STATUS_WORDS = ["open", "opened", "opening", "opens", "close", "closed", "closing", "closes", "hours", "hour", "kitchen", "bar", "sushi",
  "happy hour", "lunch", "serving", "what time", "last call", "late", "until", "till", "til"];
const OPEN_WORDS = ["open", "opened", "opening", "opens", "close", "closes", "closed", "closing", "still open", "open now", "are you open",
  "last call", "how late", "until when", "till when", "serving", "late night"];
const HH_WORDS = ["happy hour", "drink specials", "drink special", "deals", "deal", "late happy hour"];
const SPECIALS_ONLY = new Set(["specials", "special", "daily", "today", "tonight", "todays", "current", "deals", "deal", "drink", "drinks", "any", "now"]);
const KIDS_WORDS = ["kid", "kids", "children", "child", "childrens", "child menu", "kids menu", "toddler", "little ones"];
const SPICY_WORDS = ["spicy", "hot", "heat", "spice", "spiciest", "fiery"];
const SPICY_DROP = new Set([...SPICY_WORDS, "something", "anything", "dish", "dishes", "food", "really", "very", "most", "extra"]);
const MODIFIERS = new Set([...SPICY_DROP, "big", "large", "small", "portion", "size", "sizes", "spiciness", "level", "taste", "like", "come"]);
const RECOMMEND_WORDS = ["recommend", "recommendation", "recommendations", "what is good", "good here", "popular", "signature", "signatures",
  "best dish", "best dishes", "what should i order", "what should i get", "must try", "favorite", "favourite", "famous", "known for", "suggest", "suggestion"];
const LOCATION_WORDS = ["where", "address", "directions", "direction", "located", "location", "how do i get", "how to get", "find you", "map", "cross street", "near"];
const PARKING_WORDS = ["parking", "park", "valet", "parking lot"];
const PICKUP_WORDS = ["to go", "take out", "pickup", "pick up", "order online", "online order", "online ordering", "call in", "phone order", "order ahead"];
const DELIVERY_WORDS = ["doordash", "door dash", "uber eats", "ubereats", "grubhub", "postmates", "delivery"];
const CONTACT_WORDS = ["phone", "number", "call", "email", "e mail", "contact", "reach", "text"];
const SPORTS_WORDS = ["game", "games", "tv", "watch", "watching", "screens", "screen", "ufc", "nfl", "nba", "mlb", "nhl", "mls", "soccer",
  "fight", "fights", "boxing", "dodgers", "lakers", "clippers", "rams", "chargers", "angels", "kings", "ducks", "galaxy", "football",
  "basketball", "baseball", "hockey", "sports", "sport", "playoffs", "playoff", "super bowl", "world series", "world cup", "march madness", "ppv"];
const AWARD_WORDS = ["award", "awards", "best thai", "voted", "press", "magazine", "press enterprise", "recognition", "accolade", "accolades", "best of"];
const STORY_WORDS = ["owner", "owners", "who owns", "chef", "who runs", "about", "history", "story", "founded", "founder", "background", "patrick", "sura", "patrick sura"];
/** Dates the posted hours don't cover: the host never answers these from the weekly schedule. */
const HOLIDAY_WORDS = ["christmas", "xmas", "christmas eve", "thanksgiving", "easter", "halloween", "new year", "new years", "new years eve", "new years day",
  "nye", "holiday", "holidays", "memorial day", "labor day", "independence day", "fourth of july", "4th of july", "july 4th", "valentines", "valentine",
  "mothers day", "fathers day", "cinco de mayo", "st patricks day", "juneteenth", "veterans day", "thanksgiving day", "black friday"];
const HOURS_WORDS = ["hours", "hour", "schedule", "what time", "opening times", "times", "when"];
const THANKS_WORDS = ["thanks", "thank you", "thank", "cheers", "appreciate", "appreciate it", "great", "awesome", "perfect", "cool", "ok", "okay", "got it"];
const GREETING_WORDS = ["hi", "hello", "hey", "hiya", "yo", "howdy", "good morning", "good afternoon", "good evening", "sup", "greetings"];

/* ── Section keys for menu.category: titles, ids and the spec's aliases ── */
const SECTION_ALIASES: Record<string, SectionMatch> = {
  curry: { menuId: "food", sectionId: "curry" }, curries: { menuId: "food", sectionId: "curry" },
  noodle: { menuId: "food", sectionId: "noodles" },
  soup: { menuId: "food", sectionId: "soup" },
  salad: { menuId: "food", sectionId: "salad" },
  dessert: { menuId: "food", sectionId: "dessert" }, sweet: { menuId: "food", sectionId: "dessert" },
  appetizer: { menuId: "food", sectionId: "appetizers" }, app: { menuId: "food", sectionId: "appetizers" }, starter: { menuId: "food", sectionId: "appetizers" },
  entree: { menuId: "food", sectionId: "entrees" }, main: { menuId: "food", sectionId: "entrees" },
  side: { menuId: "food", sectionId: "sides" },
  "soft drink": { menuId: "food", sectionId: "soft-drinks" }, soda: { menuId: "food", sectionId: "soft-drinks" }, "non alcoholic": { menuId: "food", sectionId: "soft-drinks" },
  roll: { menuId: "sushi", sectionId: "specialty-rolls" }, "sushi roll": { menuId: "sushi", sectionId: "specialty-rolls" },
  nigiri: { menuId: "sushi", sectionId: "nigiri-sashimi" }, sashimi: { menuId: "sushi", sectionId: "nigiri-sashimi" },
  "house roll": { menuId: "sushi", sectionId: "house-specials" },
  cocktail: { menuId: "bar", sectionId: "cocktails" }, drink: { menuId: "bar", sectionId: "cocktails" },
  shot: { menuId: "bar", sectionId: "shots" },
  draft: { menuId: "bar", sectionId: "draft" }, draught: { menuId: "bar", sectionId: "draft" }, tap: { menuId: "bar", sectionId: "draft" },
  "on tap": { menuId: "bar", sectionId: "draft" }, beer: { menuId: "bar", sectionId: "draft" }, "draft beer": { menuId: "bar", sectionId: "draft" },
  bottle: { menuId: "bar", sectionId: "bottled" }, "bottled beer": { menuId: "bar", sectionId: "bottled" }, "bottle beer": { menuId: "bar", sectionId: "bottled" },
  wine: { menuId: "bar", sectionId: "wine" },
  spirit: { menuId: "bar", sectionId: "spirits" }, liquor: { menuId: "bar", sectionId: "spirits" },
  bourbon: { menuId: "bar", sectionId: "spirits", group: "Whiskey & bourbon" }, whiskey: { menuId: "bar", sectionId: "spirits", group: "Whiskey & bourbon" },
  liqueur: { menuId: "bar", sectionId: "spirits", group: "Liqueurs" },
};

let SECTION_KEYS: Map<string, SectionMatch> | null = null;
function sectionKeys(): Map<string, SectionMatch> {
  if (SECTION_KEYS) return SECTION_KEYS;
  const map = new Map<string, SectionMatch>();
  const key = (s: string) => tokenize(s).join(" ");
  for (const menu of Object.values(MENUS)) {
    for (const s of menu.sections) {
      map.set(key(s.title), { menuId: menu.id, sectionId: s.id });
      map.set(key(s.id.replace(/-/g, " ")), { menuId: menu.id, sectionId: s.id });
      for (const g of new Set(s.items.map((i) => i.group).filter((g): g is string => !!g))) {
        map.set(key(g), { menuId: menu.id, sectionId: s.id, group: g });
        for (const word of tokenize(g)) if (!map.has(word) && word !== "and") map.set(word, { menuId: menu.id, sectionId: s.id, group: g });
      }
    }
  }
  for (const [alias, match] of Object.entries(SECTION_ALIASES)) map.set(key(alias), match);
  SECTION_KEYS = map;
  return map;
}

function matchSection(topic: string): SectionMatch | undefined {
  if (!topic) return undefined;
  return sectionKeys().get(tokenize(topic).join(" "));
}

/** The guest named a dish strongly enough that a broader rule should step aside. */
function strongDish(c: IntentContext, q: string): boolean {
  const top = q ? c.hits(q)[0] : undefined;
  return !!top && top.score >= 0.9;
}

const isSportsy = (c: IntentContext) => hasAny(c.n, SPORTS_WORDS);
/** Words owned by the later intents (visit, contact, sports, record, hours, small talk): never a dish search. */
const LATER_WORDS = new Set([
  ...[LOCATION_WORDS, PARKING_WORDS, PICKUP_WORDS, DELIVERY_WORDS, CONTACT_WORDS, SPORTS_WORDS, AWARD_WORDS, STORY_WORDS, HOURS_WORDS,
    THANKS_WORDS, GREETING_WORDS].flat().flatMap((p) => p.split(" ")),
  "go", "out", "online", "deliver", "delivers", "delivering", "open", "close", "closed", "tonight", "today", "tomorrow", "now",
].map((w) => tokenize(w)[0] ?? w));
const genericTopic = (c: IntentContext) => c.topic.split(" ").every((w) => LATER_WORDS.has(tokenize(w)[0] ?? w));
/** "tell me about gra pow" is about the place, not the dishes that share its name. */
const VENUE_TOPIC = normText(VENUE.name);

const RULES: Array<{ id: IntentId; test: (c: IntentContext) => boolean }> = [
  { id: "groups", test: (c) => (c.party ?? 0) >= 9 || (hasAny(c.n, GROUP_WORDS) && !isSportsy(c)) },
  {
    id: "booking",
    test: (c) => hasAny(c.n, BOOK_WORDS) || (c.party !== undefined && (hasAny(c.n, PARTY_WORDS) || c.when.dateISO !== undefined)),
  },
  {
    id: "dietary",
    test: (c) => hasAny(c.n, DIET_STRONG) || hasStem(c.n, "allerg") || hasStem(c.n, "intoleran")
      || (hasAny(c.n, DIET_ALLERGENS) && (hasAny(c.n, DIET_ASK) || without(c.n, FILLER).split(" ").every((w) => DIET_ALLERGENS.includes(w)))),
  },
  {
    id: "status.at",
    test: (c) => hasAny(c.n, STATUS_WORDS) && !isSportsy(c)
      && (c.when.minutes !== undefined || (c.when.dateISO !== undefined && c.when.dateISO !== c.serviceDateISO)),
  },
  {
    id: "status.now",
    test: (c) => !c.mentions.sushi && !c.mentions.happyHour && !c.mentions.lunch && !isSportsy(c)
      && (hasAny(c.n, OPEN_WORDS) || c.topic === "tonight" || c.topic === "now" || c.topic === "right now"),
  },
  {
    id: "happyhour",
    test: (c) => hasAny(c.n, HH_WORDS)
      || (hasAny(c.n, ["specials", "special"]) && !c.mentions.lunch && c.n.split(" ").every((w) => FILLER.has(w) || SPECIALS_ONLY.has(w))),
  },
  {
    id: "sushi",
    test: (c) => c.mentions.sushi && (hasAny(c.n, STATUS_WORDS.filter((w) => w !== "sushi" && w !== "bar")) || hasAny(c.n, ["tonight", "today", "now", "days", "raw"])
      || ["sushi", "sushi bar", "sushi menu", "sushi bar menu"].includes(c.topic)) || hasAny(c.n, ["sashimi hours", "nigiri hours"]),
  },
  { id: "lunch", test: (c) => c.mentions.lunch && !hasPhrase(c.n, "noodle") && !hasPhrase(c.n, "noodles") },
  { id: "kids", test: (c) => hasAny(c.n, KIDS_WORDS) },
  { id: "menu.spicy", test: (c) => hasAny(c.n, SPICY_WORDS) && !strongDish(c, without(c.topic, SPICY_DROP)) },
  // A bare "gra pow" is the namesake dish ("tell me about gra pow" is about the place and reaches story below).
  { id: "menu.recommend", test: (c) => hasAny(c.n, RECOMMEND_WORDS) || (c.topic === VENUE_TOPIC && !hasAny(c.n, STORY_WORDS)) },
  { id: "menu.category", test: (c) => !!c.section },
  {
    id: "menu.item",
    test: (c) => {
      if (!c.topic || c.topic === VENUE_TOPIC || genericTopic(c)) return false;
      const { q, hits } = c.dish();
      const score = hits[0]?.score ?? 0;
      // "2+2" must not fuzz onto "Hangar 24": a query with no real word has to match a name exactly ("805").
      if (!/[a-z]{3,}/.test(q) && score < 1) return false;
      // 0.5–0.6: ingredient matches (listed). A one-letter slip in a short word ("sake" → "cake") is too loose to answer.
      return score >= 0.5 && !(score < 0.65 && q.length <= 4);
    },
  },
  { id: "location", test: (c) => hasAny(c.n, LOCATION_WORDS) && !hasStem(c.n, "park") },
  { id: "parking", test: (c) => hasAny(c.n, PARKING_WORDS) },
  { id: "pickup", test: (c) => hasAny(c.n, PICKUP_WORDS) },
  { id: "delivery", test: (c) => hasStem(c.n, "deliver") || hasAny(c.n, DELIVERY_WORDS) },
  { id: "contact", test: (c) => hasAny(c.n, CONTACT_WORDS) },
  { id: "sports", test: (c) => isSportsy(c) },
  { id: "awards", test: (c) => hasAny(c.n, AWARD_WORDS) },
  { id: "story", test: (c) => hasAny(c.n, STORY_WORDS) },
  { id: "hours.week", test: (c) => hasAny(c.n, HOURS_WORDS) },
  { id: "thanks", test: (c) => hasAny(c.n, THANKS_WORDS) },
  { id: "greeting", test: (c) => hasAny(c.n, GREETING_WORDS) },
];

/** Intent ids in precedence order (groups first, fallback last). */
export const INTENT_ORDER: IntentId[] = [...RULES.map((r) => r.id), "fallback"];

const isVariant = (h: SearchHit) =>
  h.doc.menuId === "happy-hour" || MENUS[h.doc.menuId].sections.some((s) => s.id === h.doc.sectionId && s.window === "lunch");

export function buildContext(text: string, now: number, path: string): IntentContext {
  const n = normText(text);
  const cache = new Map<string, SearchHit[]>();
  const topic = without(n, FILLER);
  const has = (p: string) => hasPhrase(n, p);
  return {
    text, n, now, path,
    when: parseWhen(text, now),
    party: parseParty(text),
    serviceDateISO: getServiceDay(now).dateISO,
    topic,
    mentions: {
      kitchen: has("kitchen") || has("food"),
      bar: (has("bar") && !has("sushi bar")) || has("drinks"),
      sushi: has("sushi") || has("sushi bar"),
      happyHour: has("happy hour"),
      lunch: has("lunch"),
    },
    section: matchSection(topic),
    dish() {
      const qs = [...new Set([topic, without(topic, MODIFIERS)])].filter(Boolean);
      const best = qs.map((q) => ({ q, hits: this.hits(q) })).sort((a, b) => (b.hits[0]?.score ?? 0) - (a.hits[0]?.score ?? 0))[0];
      return best ?? { q: topic, hits: [] };
    },
    hits: (q: string) => {
      let h = cache.get(q);
      if (!h) {
        // Equal scores: the regular menus before their happy-hour and lunch variants (stable otherwise).
        h = searchMenu(q, { limit: 8 })
          .map((x, i) => ({ x, i, v: isVariant(x) ? 1 : 0 }))
          .sort((a, b) => b.x.score - a.x.score || a.v - b.v || a.i - b.i)
          .map((o) => o.x);
        cache.set(q, h);
      }
      return h;
    },
  };
}

export function classify(text: string, now: number, path: string): { intent: IntentId; ctx: IntentContext } {
  const ctx = buildContext(text, now, path);
  if (!ctx.n) return { intent: "fallback", ctx };
  const rule = RULES.find((r) => r.test(ctx));
  const timely: IntentId[] = ["status.now", "status.at", "hours.week", "happyhour", "sushi", "lunch"];
  // A holiday question is never answered from the weekly schedule ("Yes, we're open" would be a guess).
  if (rule && timely.includes(rule.id) && hasAny(ctx.n, HOLIDAY_WORDS)) return { intent: "fallback", ctx };
  return { intent: rule?.id ?? "fallback", ctx };
}
