/**
 * Reply templates (spec §13.4): the ONLY place the host's words are built. Every fact comes from
 * src/data/* or src/lib/hours.ts through the shared formatters — no price, time or phone number is
 * typed here. Prices are never written into text; they appear only on item cards.
 */
import { AWARD_LINE } from "@/data/awards";
import { upcomingFixtures } from "@/data/gameday";
import { SCHEDULE, type ServiceWindow, type TrackId } from "@/data/hours";
import { ALL_ITEMS, MENUS, getItem } from "@/data/menu";
import type { MenuSection } from "@/data/menu/types";
import { FOOTER_NAV } from "@/data/nav";
import { COPY, VENUE } from "@/data/venue";
import { BOOKING_COPY, bookingSummary } from "@/lib/booking/copy";
import { formatPrice, minPrice } from "@/lib/format";
import { getVenueStatus, lastSlotAtOrBefore, serviceLines, type NextOpen, type VenueStatus } from "@/lib/hours";
import { normalize, type SearchHit } from "@/lib/menu-search";
import { WEEKDAY_LONG, formatClock, formatDateShort, formatRange, formatSlot, laParts, weekdayOfISO } from "@/lib/la-time";
import type { OpenBookingDetail } from "@/lib/overlay";
import type { IntentContext } from "./intents";
import { FILLER, hasAny, without } from "./normalize";
import { parseBooking, whenInstant } from "./parse";
import type { Chip, HostBlock, HostReply, IntentId } from "./types";

const PHONE = VENUE.phone.display;
const MAX_CHIPS = 6;
const LIST_MAX = 6;
const FOOD = MENUS.food;
const VISIT_LINK = FOOTER_NAV.find((l) => l.href === "/visit") ?? { label: "Hours & directions", href: "/visit" };

/* ── Chips ── */
const ask = (label: string, text = label): Chip => ({ label, action: { type: "ask", text } });
export const FIND_PLACEHOLDER = "Type a dish or an ingredient — like 'pad thai' or 'basil'";
export const COMPOSER_PLACEHOLDER = "Ask about hours, a dish, happy hour…";

const CHIP = {
  openNow: ask("Open now?", "Are you open now?"),
  happyHour: ask("Happy hour"),
  happyHourNow: ask("Happy hour now", "Happy hour"),
  lateHappyHour: ask("Late happy hour", "Happy hour"),
  findDish: { label: "Find a dish", action: { type: "focus", placeholder: FIND_PLACEHOLDER } } as Chip,
  book: (prefill?: OpenBookingDetail): Chip => ({ label: "Request a table", action: { type: "book", ...(prefill ? { prefill } : {}) } }),
  directions: { label: "Directions", action: { type: "directions" } } as Chip,
  lunch: ask("Lunch specials"),
  sushiTonight: ask("Sushi tonight?"),
  barHours: ask("Bar hours"),
  sushiHours: ask("Sushi bar hours"),
  cocktails: ask("Cocktails"),
  spicy: ask("Spicy dishes", "Something spicy"),
  hhWhat: ask("What's on happy hour?"),
  todaysHours: ask("Today's hours", "Hours"),
  menus: { label: "Menus", action: { type: "link", href: "/menu" } } as Chip,
  visit: { label: VISIT_LINK.label, action: { type: "link", href: VISIT_LINK.href } } as Chip,
  call: { label: "Call", action: { type: "call" } } as Chip,
  parking: ask("Parking"),
  hours: ask("Hours"),
  pickup: ask("Pickup", "Order pickup"),
  ourStory: ask("Our story"),
  awards: ask("Awards"),
  dessert: ask("Dessert"),
  sushiMenu: { label: MENUS.sushi.title + " menu", action: { type: "link", href: MENUS.sushi.href } } as Chip,
  noodleLunch: ask(FOOD.sections.find((s) => s.id === "noodle-lunch")?.title ?? "Noodle lunch"),
};

const ROUTE_CHIP: Record<string, Chip> = {
  "/menu/sushi": CHIP.sushiHours,
  "/menu/drinks": CHIP.cocktails,
  "/menu/food": CHIP.spicy,
  "/menu/happy-hour": CHIP.hhWhat,
};

/** Time- and route-aware opening chips (spec §13.4), at most 6. */
export function openingChips(now: number, path: string): Chip[] {
  const st = getVenueStatus(now, { route: path });
  const m = st.minutes, wd = st.serviceWeekday;
  const [hhEarly, hhLate] = SCHEDULE.happyHour[wd];
  const lunch = SCHEDULE.lunch[wd][0];
  const sushi = SCHEDULE.sushi[wd][0];
  const late = !!hhLate && m >= hhLate.open;
  const route = ROUTE_CHIP[path];
  // [chip, priority (lower = kept first)] in display order; the least useful come last, so a narrow
  // row can drop from the end (the opening reply already shows the live status card).
  const list: Array<[Chip, number]> = [];
  if (route) list.push([route, 0]);
  if (late) list.push([CHIP.lateHappyHour, 1]);
  else if (hhEarly && m >= hhEarly.open && m < hhEarly.close) list.push([CHIP.happyHourNow, 1]);
  else list.push([CHIP.happyHour, 2]);
  if (lunch && m < lunch.close) list.push([CHIP.lunch, 1]);
  if (sushi && path !== "/menu/sushi" && m >= sushi.open - 60 && m < sushi.close) list.push([CHIP.sushiTonight, 1]);
  if (late) list.push([CHIP.barHours, 1]);
  list.push([CHIP.book(), 2], [CHIP.findDish, 2], [CHIP.openNow, 3], [CHIP.directions, 4]);
  const keep = new Set([...list].map((x, i) => ({ x, i })).sort((a, b) => a.x[1] - b.x[1] || a.i - b.i).slice(0, MAX_CHIPS).map((o) => o.i));
  return list.filter((_, i) => keep.has(i)).map(([c]) => c);
}

/* ── Small builders ── */
const text = (t: string): HostBlock => ({ kind: "text", text: t });
const reply = (intent: IntentId, blocks: HostBlock[], chips: Chip[], sources: string[], confidence = 1): HostReply =>
  ({ intent, confidence, blocks, chips: chips.slice(0, MAX_CHIPS), sources: [...new Set(sources)] });
const itemSource = (id: string) => {
  const it = getItem(id);
  return it ? `menu:${it.menuId}:${id}` : `menu:?:${id}`;
};
const untilWord = (w: ServiceWindow) => (w.endWord === "close" ? "close" : formatClock(w.close));
const STATUS_SOURCES = ["hours:kitchen", "hours:bar", "hours:sushi", "hours:happyHour", "hours:lunch"];

function section(menuId: keyof typeof MENUS, id: string): MenuSection {
  const s = MENUS[menuId].sections.find((x) => x.id === id);
  if (!s) throw new Error(`[concierge] missing section ${menuId}#${id}`);
  return s;
}

/** "at 11 AM" · "tomorrow at 11 AM" · "Saturday at 11 AM" */
function whenPhrase(n: NextOpen): string {
  const clock = formatClock(n.minutes);
  if (n.relative === "today") return `at ${clock}`;
  if (n.relative === "tomorrow") return `tomorrow at ${clock}`;
  return `${WEEKDAY_LONG[n.weekday]} at ${clock}`;
}

/** First clause of an official description ("Gra/Pow Noodle — “Drunken noodles”"). */
function firstClause(desc?: string): string {
  if (!desc) return "";
  let c = desc.split(/(?<=[.!?])\s|;\s|:\s/)[0].replace(/[.!?;:]+$/, "").trim();
  if (c.length > 80) c = c.split(/,\s/)[0];
  return c;
}

/* ── Status sentences ── */
function happyHourSentence(st: VenueStatus): string | null {
  const hh = st.tracks.happyHour;
  if (hh.open && hh.window !== undefined) {
    const w = SCHEDULE.happyHour[st.serviceWeekday][hh.window];
    return `Happy hour's on now — till ${untilWord(w)}.`;
  }
  if (hh.next?.relative === "today") return `Happy hour starts at ${formatClock(hh.next.minutes)}.`;
  return null;
}

/** "Yes — the kitchen's open…" answers a yes/no question; "how late…" and "what time do you close" get the facts alone. */
function nowSentence(st: VenueStatus, yesNo: boolean): string {
  const k = st.tracks.kitchen, b = st.tracks.bar, s = st.tracks.sushi;
  const lead = yesNo ? "Yes — the" : "The";
  let first: string;
  if (k.open && k.closesAt !== undefined) {
    first = `${lead} kitchen's open till ${formatClock(k.closesAt)}`
      + (b.open && b.closesAt !== undefined && b.closesAt !== k.closesAt ? `, and the bar till ${formatClock(b.closesAt)}.` : ".");
  } else if (b.open && b.closesAt !== undefined) {
    first = `${lead} bar's open till ${formatClock(b.closesAt)}.` + (k.next ? ` The kitchen's closed; it opens ${whenPhrase(k.next)}.` : "");
  } else {
    const next = [k.next, b.next].filter((x): x is NextOpen => !!x).sort((x, y) => (x.dateISO + x.minutes).localeCompare(y.dateISO + y.minutes))[0];
    first = next ? `We're closed right now. We open ${whenPhrase(next)}.` : "We're closed right now.";
  }
  const hh = happyHourSentence(st);
  const sushi = !s.open && s.next?.relative === "today" ? `The sushi bar opens at ${formatClock(s.next.minutes)}.` : null;
  const fact = st.tracks.happyHour.open ? hh : k.open ? hh ?? sushi : b.open ? hh : null;
  return [first, fact].filter(Boolean).join(" ");
}

/** Normalized questions that open with an auxiliary verb ("are you open", "is the kitchen still open", "open now") expect a yes or no. */
const YES_NO = /^(are|is|do|does|can|could|will|am|still|open)\b/;

type Clause = { track: TrackId; text: string };

/** "the kitchen's closed — it closes at 9 PM" for one track at an instant. */
function clauseAt(track: TrackId, st: VenueStatus): Clause {
  const wd = st.serviceWeekday;
  const windows = SCHEDULE[track][wd];
  const t = st.tracks[track];
  const name = { kitchen: "the kitchen", bar: "the bar", sushi: "the sushi bar", happyHour: "happy hour", lunch: "lunch specials" }[track];
  const verb = track === "lunch" ? "are" : "'s";
  const is = (adj: string) => (verb === "are" ? `${name} are ${adj}` : `${name}${verb} ${adj}`);
  if (track === "happyHour") {
    if (t.open && st.tracks.happyHour.window !== undefined) return { track, text: `happy hour's on till ${untilWord(windows[st.tracks.happyHour.window])}` };
    const later = windows.find((w) => w.open > st.minutes);
    if (later) return { track, text: `happy hour starts at ${formatClock(later.open)}` };
    return { track, text: `happy hour's over — it runs ${windows.map((w) => formatRange(w.open, w.close, { endWord: w.endWord })).join(" & ")}` };
  }
  if (windows.length === 0) return { track, text: `${is("closed")} on ${WEEKDAY_LONG[wd]}s` };
  const open = windows.find((w) => w.open <= st.minutes && st.minutes < w.close);
  if (open) return { track, text: track === "lunch" ? `lunch specials run till ${untilWord(open)}` : `${is("open")} till ${untilWord(open)}` };
  const later = windows.find((w) => w.open > st.minutes);
  if (later) return { track, text: track === "lunch" ? `lunch specials start at ${formatClock(later.open)}` : `${name} opens at ${formatClock(later.open)}` };
  const last = windows[windows.length - 1];
  return { track, text: track === "lunch" ? `lunch specials end at ${untilWord(last)}` : `${is("closed")} — it closes at ${untilWord(last)}` };
}

/** "the kitchen's open 11 AM–9 PM" for a whole day. */
function clauseDay(track: TrackId, wd: ReturnType<typeof weekdayOfISO>): string {
  const windows = SCHEDULE[track][wd];
  const ranges = windows.map((w) => formatRange(w.open, w.close, { endWord: w.endWord })).join(" & ");
  switch (track) {
    case "kitchen": return `the kitchen's open ${ranges}`;
    case "bar": return `the bar's open ${ranges}`;
    case "sushi": return windows.length ? `the sushi bar's open ${ranges}` : `the sushi bar's closed on ${WEEKDAY_LONG[wd]}s`;
    case "happyHour": return `happy hour runs ${ranges}`;
    case "lunch": return `lunch specials run ${ranges}`;
  }
}

const joinClauses = (c: string[]) => (c.length <= 1 ? c.join("") : `${c.slice(0, -1).join(", ")}, and ${c[c.length - 1]}`);

function relevantTracks(ctx: IntentContext): TrackId[] {
  const m = ctx.mentions;
  const t: TrackId[] = [];
  if (m.kitchen) t.push("kitchen");
  if (m.bar) t.push("bar");
  if (m.sushi) t.push("sushi");
  if (m.happyHour) t.push("happyHour");
  if (m.lunch) t.push("lunch");
  return t.length ? t : ["kitchen", "bar"];
}

/* ── Item helpers ── */
const LUNCH = section("food", "lunch");
const isWindowed = (sectionId: string) => FOOD.sections.find((s) => s.id === sectionId)?.window === "lunch";
const SPICY_IDS = ALL_ITEMS.filter((i) => i.menuId === "food" && !isWindowed(i.sectionId) && (i.spicy || (i.minSpice ?? 0) > 0)).map((i) => i.id);
const PE_IDS = ALL_ITEMS.filter((i) => i.pe2019)
  .map((i) => ({ id: i.id, at: COPY.peNote.toLowerCase().indexOf(i.name.toLowerCase()) }))
  .sort((a, b) => (a.at < 0 ? 999 : a.at) - (b.at < 0 ? 999 : b.at))
  .map((x) => x.id);
const NAMESAKE = ALL_ITEMS.find((i) => i.id === "pad-gra-pow");

function itemsBlock(ids: string[], moreHref?: string, moreLabel?: string): HostBlock {
  return { kind: "items", itemIds: ids, ...(moreHref ? { moreHref } : {}), ...(moreHref ? { moreLabel: moreLabel ?? "See them on the menu" } : {}) };
}

/* ── Card labels (rendered by HostEntry; kept here so every host-visible word is built in one file) ── */
export const CARD = {
  statusNow: "Right now",
  statusAt: (at: number): string => {
    const p = laParts(at);
    return `${formatDateShort(p.dateISO)} · ${formatClock(p.minutes)}`;
  },
  hours: "Hours",
  itemsHead: (ids: string[]): string => {
    const items = ids.map((id) => getItem(id)).filter((i): i is NonNullable<typeof i> => !!i);
    const first = items[0];
    if (!first) return "From the menu";
    const sameSection = items.every((i) => i.menuId === first.menuId && i.sectionId === first.sectionId);
    if (!sameSection) return MENUS[first.menuId].title;
    const groups = new Set(items.map((i) => i.group));
    const s = section(first.menuId, first.sectionId);
    return groups.size === 1 && first.group ? first.group : s.title;
  },
  itemsMeta: (ids: string[]): string | null => {
    const first = getItem(ids[0] ?? "");
    if (!first) return null;
    const s = section(first.menuId, first.sectionId);
    return s.note && s.note.length <= 24 ? s.note.replace(/\.$/, "") : null;
  },
  bookingResume: "Continue the table request",
  descOnly: "Official menu description",
};

/* ── Booking strings (HostBooking) ── */
export const BOOKING_HOST = {
  handoff: "Let's send a table request to the team. They'll call or text to confirm.",
  askParty: "How many guests?",
  askDay: "Which day?",
  askTime: "What time?",
  askDetails: "Who's the table for? The team will call or text this number to confirm.",
  review: "Here's your request. Send it to the host stand?",
  groups: BOOKING_COPY.groups,
  noSlots: `No times left on this date — pick another day, or call ${PHONE}.`,
  partyEcho: (n: number) => (n === 1 ? "1 guest" : `${n} guests`),
  dayEcho: (date: string) => formatDateShort(date),
  timeEcho: (time: string) => formatSlot(time),
  confirm: (p: { partySize?: number; date?: string; time?: string }): string => {
    const parts = [p.partySize ? `Table for ${p.partySize}` : null, p.date ? formatDateShort(p.date) : null, p.time ? formatSlot(p.time) : null].filter(Boolean);
    return `${parts.join(", ")} — right?`;
  },
  unavailable: (time: string) => `${formatSlot(time)} isn't available — here are the closest times:`,
  /** Transcript line after a submit: never a name, phone or email. */
  outcome: (status: "ok" | "not_configured" | "failed", p: { partySize?: number; date?: string; time?: string }): HostReply => {
    const summary = bookingSummary(p);
    if (status === "ok") return reply("booking", [text(`${summary} — request sent. We'll call or text to confirm; it isn't booked until we do.`)], [], ["venue:copy", "hours:kitchen"]);
    const why = status === "not_configured" ? BOOKING_COPY.notConfigured : BOOKING_COPY.failed;
    return reply("booking", [text(`${summary} — not sent. ${why}`), { kind: "actions", actions: ["call"] }], [CHIP.menus, CHIP.visit], ["venue:phone", "hours:kitchen"]);
  },
};

/* ── Opening reply ── */
export function openingReply(now: number, path: string): HostReply {
  return reply("greeting", [{ kind: "voice", text: COPY.hostHello }, { kind: "status" }], openingChips(now, path), STATUS_SOURCES);
}

/* ── Intent replies ── */
const DIET_DROP = new Set([...FILLER, "vegan", "vegetarian", "veggie", "veg", "gluten", "free", "celiac", "coeliac", "halal", "kosher", "plant",
  "based", "meatless", "meat", "no", "without", "dietary", "diet", "lactose", "dairy", "nut", "nuts", "peanut", "peanuts", "tree", "shellfish",
  "sesame", "soy", "msg", "milk", "wheat", "contain", "contains", "allergy", "allergies", "allergic", "allergen", "allergens", "safe", "intolerant",
  "intolerance", "sauce", "fish", "oyster", "use", "cooked", "it"]);
/**
 * The one dish the guest named, or none. A bare ingredient ("chicken") matches many dishes equally and names
 * none of them; a dish and its variants ("Pad Thai", "Pad Thai Chicken") count as one.
 */
function namedDish(hits: SearchHit[]): SearchHit | undefined {
  const top = hits[0];
  if (!top || top.score < 0.9) return undefined;
  const base = normalize(top.doc.name);
  const rival = hits.slice(1).find((h) => top.score - h.score <= 0.05 && !normalize(h.doc.name).startsWith(base));
  return rival ? undefined : top;
}

export function buildReply(intent: IntentId, ctx: IntentContext): HostReply {
  const { now, path } = ctx;
  const st = getVenueStatus(now, { route: path });
  switch (intent) {
    case "groups":
      return reply(intent, [text(BOOKING_COPY.groups), { kind: "actions", actions: ["call"] }], [CHIP.hours, CHIP.menus], ["venue:phone"]);

    case "booking": {
      const prefill = parseBooking(ctx.text, now);
      return reply(intent, [text(BOOKING_HOST.handoff), { kind: "booking", prefill }], [], ["venue:copy", "hours:kitchen"]);
    }

    case "dietary": {
      const dishQ = without(ctx.topic, DIET_DROP);
      const top = dishQ ? namedDish(ctx.hits(dishQ)) : undefined;
      const blocks: HostBlock[] = [text(COPY.hostDiet), { kind: "notice", tone: "allergy", text: COPY.allergyNote }];
      const sources = ["venue:phone", "venue:copy"];
      if (top) {
        blocks.push(itemsBlock([top.doc.id]));
        sources.push(itemSource(top.doc.id));
      }
      return reply(intent, blocks, [CHIP.call, CHIP.menus], sources);
    }

    case "status.at": {
      const w = ctx.when;
      const date = w.dateISO ?? st.serviceDateISO;
      const tracks = relevantTracks(ctx);
      const minutes = w.minutes ?? (w.label === "Tonight" ? 1140 : undefined); // tonight without a time → 7 PM (spec §13.4)
      const label = w.label ?? formatDateShort(date);
      const prefill = parseBooking(ctx.text, now);
      const chips = [CHIP.todaysHours, CHIP.book(prefill)];
      const sources = tracks.map((t) => `hours:${t}`);
      if (minutes === undefined) {
        const wd = weekdayOfISO(date);
        const body = joinClauses(tracks.map((t) => clauseDay(t, wd)));
        return reply(intent, [text(`${label}: ${body}.`), { kind: "hours", layout: "grouped" }], chips, sources);
      }
      const at = whenInstant(date, minutes);
      const sAt = getVenueStatus(at);
      const body = joinClauses(tracks.map((t) => clauseAt(t, sAt).text));
      return reply(intent, [text(`${label} at ${formatClock(minutes)}: ${body}.`), { kind: "status", at }], chips, sources);
    }

    case "status.now":
      return reply(intent, [text(nowSentence(st, YES_NO.test(ctx.n))), { kind: "status" }, { kind: "links", links: [VISIT_LINK] }],
        [CHIP.happyHour, CHIP.findDish, CHIP.book()], STATUS_SOURCES);

    case "happyhour": {
      const hhLine = happyHourSentence(st) ?? `${serviceLines().happyHour}.`;
      const [early] = SCHEDULE.happyHour[st.serviceWeekday];
      const bites = section("happy-hour", "hh-bites"), drinks = section("happy-hour", "hh-drinks");
      const blocks: HostBlock[] = [text(hhLine)];
      const ids: string[] = [];
      if (early && st.minutes < early.close) {
        blocks.push(itemsBlock(bites.items.slice(0, LIST_MAX).map((i) => i.id), `${MENUS["happy-hour"].href}#${bites.id}`));
        ids.push(...bites.items.slice(0, LIST_MAX).map((i) => i.id));
      }
      blocks.push(itemsBlock(drinks.items.slice(0, LIST_MAX).map((i) => i.id), `${MENUS["happy-hour"].href}#${drinks.id}`));
      ids.push(...drinks.items.slice(0, LIST_MAX).map((i) => i.id));
      blocks.push({ kind: "links", links: [{ label: `${MENUS["happy-hour"].title} menu`, href: MENUS["happy-hour"].href }] });
      return reply(intent, blocks, [CHIP.barHours, CHIP.book()], ["hours:happyHour", ...ids.map(itemSource)]);
    }

    case "sushi": {
      const specials = section("sushi", "house-specials");
      const ids = specials.items.map((i) => i.id);
      return reply(intent, [
        text(st.tracks.sushi.text),
        itemsBlock(ids, `${MENUS.sushi.href}#${specials.id}`),
        { kind: "notice", tone: "raw", text: COPY.rawAdvisory },
        { kind: "links", links: [{ label: CHIP.sushiMenu.label, href: MENUS.sushi.href }] },
      ], [CHIP.sushiMenu, CHIP.book()], ["hours:sushi", ...ids.map(itemSource)]);
    }

    case "lunch": {
      const close = SCHEDULE.lunch[st.serviceWeekday][0]?.close ?? SCHEDULE.lunch[0][0].close;
      const ids = LUNCH.items.slice(0, LIST_MAX).map((i) => i.id);
      const blocks: HostBlock[] = [text(`Lunch specials are served daily until ${formatClock(close)} — from ${formatPrice(minPrice(LUNCH.items))}.`)];
      if (LUNCH.note) blocks.push({ kind: "notice", tone: "info", text: LUNCH.note });
      blocks.push(itemsBlock(ids, `${FOOD.href}#${LUNCH.id}`));
      return reply(intent, blocks, [CHIP.noodleLunch, CHIP.book()], ["hours:lunch", ...ids.map(itemSource)]);
    }

    case "kids": {
      const kids = section("food", "kids");
      const ids = kids.items.map((i) => i.id);
      const blocks: HostBlock[] = [];
      if (kids.note) blocks.push(text(kids.note));
      blocks.push(itemsBlock(ids, `${FOOD.href}#${kids.id}`));
      return reply(intent, blocks, [CHIP.dessert, CHIP.menus], ids.map(itemSource));
    }

    case "menu.spicy": {
      const ids = SPICY_IDS.slice(0, LIST_MAX);
      return reply(intent, [
        text("Here's what our menu marks as spicy."),
        { kind: "notice", tone: "info", text: "Spice flags as printed on our menu." },
        itemsBlock(ids, `${FOOD.href}?spicy=1`, "All spicy dishes on the menu"),
      ], [CHIP.findDish], ids.map(itemSource));
    }

    case "menu.recommend": {
      const featured = ALL_ITEMS.filter((i) => i.featured).map((i) => i.id);
      const ids = [...new Set([...(NAMESAKE ? [NAMESAKE.id] : []), ...PE_IDS, ...featured])].slice(0, LIST_MAX);
      const lead = NAMESAKE ? `${NAMESAKE.name} shares our name, and the Press-Enterprise called out these three in 2019.` : COPY.peNote;
      return reply(intent, [text(lead), itemsBlock(ids)], [CHIP.spicy, CHIP.book()], ["press", ...ids.map(itemSource)]);
    }

    case "menu.category": {
      const sm = ctx.section!;
      const menu = MENUS[sm.menuId];
      const s = section(sm.menuId, sm.sectionId);
      const items = sm.group ? s.items.filter((i) => i.group === sm.group) : s.items;
      const title = sm.group ?? s.title;
      const ids = items.slice(0, LIST_MAX).map((i) => i.id);
      const blocks: HostBlock[] = [text(`${title}: ${items.length} on the menu.`)];
      if (s.note && !sm.group) blocks.push({ kind: "notice", tone: "info", text: s.note });
      if (sm.menuId === "sushi") blocks.push({ kind: "notice", tone: "raw", text: COPY.rawAdvisory });
      blocks.push(itemsBlock(ids, `${menu.href}#${s.id}`, `See all ${items.length} on the menu`));
      return reply(intent, blocks, siblingChips(sm), ids.map(itemSource));
    }

    case "menu.item": {
      const { q: dishQ, hits } = ctx.dish();
      const top = hits[0];
      const item = getItem(top.doc.id)!;
      const openChip: Chip = { label: "Open in the menu", action: { type: "link", href: item.href } };
      if (top.score < 0.6) {
        // Ingredient match (official descriptions): list them and hand over to the menu's own search.
        const ids = hits.slice(0, LIST_MAX).map((h) => h.doc.id);
        const menu = MENUS[top.doc.menuId];
        return reply(intent, [text("Here's what I found on the menu:"), itemsBlock(ids, `${menu.href}?q=${encodeURIComponent(dishQ)}`, "Search the menu")],
          [CHIP.book()], ids.map(itemSource), top.score);
      }
      // A competitor is another dish, not a variant of the top one ("Pad Thai Chicken" at lunch for "Pad Thai").
      const base = normalize(top.doc.name);
      const rivals = hits.slice(1).filter((h) => !normalize(h.doc.name).startsWith(base));
      const second = rivals[0];
      const close = second && top.score - second.score <= 0.05 && top.score < 0.9 && second.score < 0.9;
      const tied = second && second.score === top.score && top.score < 1;
      if (close || tied) {
        const ids = [top, ...rivals].slice(0, 3).map((h) => h.doc.id);
        return reply(intent, [text("Did you mean one of these?"), itemsBlock(ids)], [CHIP.book()], ids.map(itemSource), top.score);
      }
      const clause = firstClause(item.description);
      return reply(intent, [text(`${item.name}${clause ? ` — ${clause}` : ""}.`), itemsBlock([item.id])], [openChip, CHIP.book()], [itemSource(item.id)], top.score);
    }

    case "location":
      return reply(intent, [text(`${VENUE.address.oneLine}, in the ${VENUE.address.center}.`), { kind: "actions", actions: ["directions", "call"] }],
        [CHIP.hours, CHIP.parking], ["venue:address", "venue:phone"]);

    case "parking":
      return reply(intent, [
        text(`I don't have parking details written down. We're in the ${VENUE.address.center} — the team can help at ${PHONE}.`),
        { kind: "actions", actions: ["directions", "call"] },
      ], [], ["venue:address", "venue:phone"]);

    case "pickup":
      return reply(intent, [text(`${VENUE.pickupLine}.`), { kind: "actions", actions: ["call"] }], [CHIP.menus], ["venue:phone"]);

    case "delivery":
      return reply(intent, [text(`I can't confirm delivery options online — please call ${PHONE}.`), { kind: "actions", actions: ["call"] }],
        [CHIP.pickup], ["venue:phone"]);

    case "contact": {
      const blocks: HostBlock[] = [text(`You can reach us at ${PHONE}.`)];
      if (hasAny(ctx.n, ["email", "e mail", "mail"])) blocks.push(text("We don't list an email — please call."));
      blocks.push({ kind: "actions", actions: ["call"] });
      return reply(intent, blocks, [], ["venue:phone"]);
    }

    case "sports": {
      const fixtures = upcomingFixtures(now);
      if (fixtures.length) {
        const lines = fixtures.slice(0, 4).map((f) => {
          const p = laParts(Date.parse(f.startsAt));
          return text(`${f.league} · ${f.matchup} · ${formatDateShort(p.dateISO)}, ${formatSlot(`${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`)}`);
        });
        const chips = fixtures.slice(0, 3).map((f): Chip => {
          const p = laParts(Date.parse(f.startsAt));
          const slot = lastSlotAtOrBefore(p.dateISO, p.minutes, now);
          return { label: `Table for ${f.matchup}`, action: { type: "book", prefill: { date: p.dateISO, ...(slot ? { time: slot.time } : {}), source: "host" } } };
        });
        return reply(intent, [text("On the TVs over the bar this week:"), ...lines], [...chips, CHIP.barHours], ["gameday", "venue:copy"]);
      }
      return reply(intent, [
        text(`We don't post a TV schedule online — call the bar to ask what's on tonight: ${PHONE}.`),
        text(VENUE.sportsLine),
        { kind: "status" },
      ], [CHIP.barHours, CHIP.book()], ["gameday", "venue:phone", "hours:bar"]);
    }

    case "awards":
      return reply(intent, [text(AWARD_LINE), { kind: "links", links: [{ label: "Recognition", href: "/about#recognition" }] }], [CHIP.ourStory], ["awards"]);

    case "story":
      return reply(intent, [text(COPY.storyShort), { kind: "links", links: [{ label: "Our story", href: "/about" }] }], [CHIP.awards], ["press", "venue:copy"]);

    case "hours.week": {
      const lead = ctx.mentions.bar ? st.tracks.bar.text : ctx.mentions.kitchen ? st.tracks.kitchen.text : st.headline;
      return reply(intent, [text(`${lead}.`), { kind: "hours", layout: "grouped" }, { kind: "links", links: [VISIT_LINK] }],
        [CHIP.happyHour, CHIP.sushiHours], STATUS_SOURCES);
    }

    case "greeting":
      return reply(intent, [text("Hi — what can I find for you?")], openingChips(now, path), ["venue:copy"]);

    case "thanks":
      return reply(intent, [text("You're welcome.")], openingChips(now, path), ["venue:copy"]);

    case "fallback":
    default:
      return reply("fallback", [text(COPY.hostFallback), { kind: "actions", actions: ["call"] }], [CHIP.menus, CHIP.visit, CHIP.book()], ["venue:phone"], 0);
  }
}


/** Two neighbouring sections (or spirit groups) as ask chips. */
function siblingChips(sm: { menuId: keyof typeof MENUS; sectionId: string; group?: string }): Chip[] {
  const menu = MENUS[sm.menuId];
  if (sm.group) {
    const s = section(sm.menuId, sm.sectionId);
    const groups = [...new Set(s.items.map((i) => i.group).filter((g): g is string => !!g))];
    const i = groups.indexOf(sm.group);
    return [groups[i - 1], groups[i + 1]].filter((g): g is string => !!g).map((g) => ask(g));
  }
  const list = menu.sections.filter((s) => !s.window);
  const i = list.findIndex((s) => s.id === sm.sectionId);
  const near = i < 0 ? [] : [list[i - 1], list[i + 1]].filter((s): s is MenuSection => !!s);
  if (near.length < 2 && i >= 0) {
    const extra = i === 0 ? list[i + 2] : list[i - 2];
    if (extra) near.push(extra);
  }
  return near.slice(0, 2).map((s) => ask(s.title));
}
