/**
 * Grounding guard (spec §13.5, G11). Lists every $ amount, clock time and phone number in a reply that
 * src/data does not back up. The rule engine must always return []; a future LLM engine's reply is
 * discarded for the rule engine's when it doesn't.
 *  - $ amounts: a formatPrice() of some data price, or text displayed from data (descriptions, section
 *    titles and notes, priceNote, COPY). ownerConfirm strings never count.
 *  - Clock times: formatClock() of a SCHEDULE boundary, a bookable slot label, a time in displayed data
 *    text, or the instant the guest asked about (a status block's `at`, a booking prefill's time).
 *  - Phone numbers: VENUE.phone.display only.
 */
import { AWARD_LINE, AWARD_SHORT } from "@/data/awards";
import { FIXTURES } from "@/data/gameday";
import { BOOKING_RULES, SCHEDULE } from "@/data/hours";
import { ALL_ITEMS, MENUS, getItem } from "@/data/menu";
import { COPY, VENUE } from "@/data/venue";
import { formatPrice } from "@/lib/format";
import { getServiceDay } from "@/lib/hours";
import { formatClock, formatSlot, laParts, minutesToHHMM } from "@/lib/la-time";
import type { HostReply } from "./types";

const MONEY_RE = /\$\s?\d+(?:\.\d{2})?/g;
const CLOCK_RE = /\b\d{1,2}(?::\d{2})?\s?(?:am|pm)\b|\b(?:noon|midnight)\b/gi;
const PHONE_RE = /\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}\b/g;

const money = (s: string) => s.replace(/\s+/g, "");
const clock = (s: string) => s.replace(/\s*(am|pm)$/i, (_, m: string) => ` ${m.toUpperCase()}`).replace(/^(noon|midnight)$/i, (w) => w.toLowerCase());

function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => strings(x, out));
  return out;
}

type Allowed = { money: Set<string>; clock: Set<string> };
let ALLOWED: Allowed | null = null;

function allowed(): Allowed {
  if (ALLOWED) return ALLOWED;
  const displayed: string[] = [
    ...strings(COPY), ...strings(VENUE), AWARD_LINE, AWARD_SHORT,
    ...Object.values(MENUS).flatMap((m) => [m.title, ...m.notes, ...m.sections.flatMap((s) => [s.title, s.note ?? "", ...(s.tierLabels ?? [])])]),
    ...ALL_ITEMS.flatMap((i) => [i.name, i.description ?? "", i.priceNote ?? "", i.group ?? "", ...i.prices.map((p) => p.label ?? "")]),
  ];
  const m = new Set<string>();
  ALL_ITEMS.forEach((i) => i.prices.forEach((p) => p.cents !== null && m.add(formatPrice(p.cents))));
  const c = new Set<string>();
  for (const track of Object.values(SCHEDULE)) {
    for (const day of Object.values(track)) for (const w of day) [w.open, w.close].forEach((x) => c.add(formatClock(x)));
  }
  for (const day of Object.values(SCHEDULE.kitchen)) {
    for (const w of day) {
      for (let t = w.open; t <= w.close - BOOKING_RULES.lastSlotBeforeClose; t += BOOKING_RULES.slotStep) c.add(formatSlot(minutesToHHMM(t)));
    }
  }
  for (const f of FIXTURES) {
    const p = laParts(Date.parse(f.startsAt));
    c.add(formatClock(p.minutes));
    c.add(formatSlot(minutesToHHMM(p.minutes)));
  }
  for (const s of displayed) {
    for (const x of s.match(MONEY_RE) ?? []) m.add(money(x));
    for (const x of s.match(CLOCK_RE) ?? []) c.add(clock(x));
  }
  ALLOWED = { money: m, clock: c };
  return ALLOWED;
}

/** Every visible string in a reply: block text, link and chip labels, chip prompts. */
function replyStrings(r: HostReply): string[] {
  const out: string[] = [];
  for (const b of r.blocks) {
    if (b.kind === "voice" || b.kind === "text" || b.kind === "notice") out.push(b.text);
    if (b.kind === "links") b.links.forEach((l) => out.push(l.label));
    if (b.kind === "items" && b.moreLabel) out.push(b.moreLabel);
  }
  for (const ch of r.chips) {
    out.push(ch.label);
    if (ch.action.type === "ask") out.push(ch.action.text);
    if (ch.action.type === "focus" && ch.action.placeholder) out.push(ch.action.placeholder);
  }
  return out;
}

/** $ amounts, clock times and phone numbers in `reply` that aren't found in src/data (plus unknown item ids). */
export function ungroundedTokens(reply: HostReply): string[] {
  const a = allowed();
  const echo = new Set<string>();
  for (const b of reply.blocks) {
    if (b.kind === "status" && b.at !== undefined) {
      const sd = getServiceDay(b.at);
      echo.add(formatClock(sd.minutes));
      echo.add(formatSlot(minutesToHHMM(sd.minutes)));
    }
    if (b.kind === "booking" && b.prefill?.time) echo.add(formatSlot(b.prefill.time));
  }
  const bad: string[] = [];
  for (const s of replyStrings(reply)) {
    for (const x of s.match(MONEY_RE) ?? []) if (!a.money.has(money(x))) bad.push(money(x));
    for (const x of s.match(CLOCK_RE) ?? []) {
      const k = clock(x);
      if (!a.clock.has(k) && !echo.has(k)) bad.push(k);
    }
    for (const x of s.match(PHONE_RE) ?? []) if (x !== VENUE.phone.display) bad.push(x);
  }
  for (const b of reply.blocks) {
    if (b.kind === "items") b.itemIds.forEach((id) => !getItem(id) && bad.push(`item:${id}`));
  }
  return bad;
}
