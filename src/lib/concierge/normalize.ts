/**
 * Intent-level text normalisation on top of menu-search's `normalize` (spec §13.2): chat shorthand and
 * common misspellings become the words the intent table listens for. Dish-name synonyms stay in
 * menu-search (expandSynonyms) — this file never forks item search.
 */
import { normalize } from "@/lib/menu-search";

/** Whole-word rewrites, applied after normalize() (which already strips apostrophes: "what's" → "whats"). */
const WORD_MAP: Record<string, string> = {
  whats: "what is", wheres: "where is", whos: "who is", hows: "how is", whens: "when is", youre: "you are",
  u: "you", ya: "you", ur: "your", r: "are", pls: "please", plz: "please", thx: "thanks", thnx: "thanks", ty: "thank you",
  tmrw: "tomorrow", tmr: "tomorrow", tmw: "tomorrow", tmrow: "tomorrow", tomorow: "tomorrow", tommorow: "tomorrow",
  tommorrow: "tomorrow", tonite: "tonight", "2nite": "tonight", tonght: "tonight",
  hrs: "hours", hr: "hour", ppl: "people", pax: "people",
  rez: "reservation", resy: "reservation", reso: "reservation", res: "reservation", rsvp: "reservation",
  gf: "gluten free", hh: "happy hour", happyhour: "happy hour", addy: "address", addr: "address",
  togo: "to go", takeout: "take out", carryout: "take out", bday: "birthday", num: "number",
  whisky: "whiskey", tvs: "tv", television: "tv",
};

/** normalize() + chat shorthand. Lowercase words separated by single spaces. */
export function normText(s: string): string {
  return normalize(s)
    .split(" ")
    .filter(Boolean)
    .map((w) => WORD_MAP[w] ?? w)
    .join(" ");
}

/** Whole-phrase match on normalized text ("happy hour" in "is happy hour on"). */
export function hasPhrase(n: string, phrase: string): boolean {
  return ` ${n} `.includes(` ${phrase} `);
}

export function hasAny(n: string, phrases: readonly string[]): boolean {
  return phrases.some((p) => hasPhrase(n, p));
}

/** A word that starts with `stem` ("allerg" → allergy, allergies, allergen). */
export function hasStem(n: string, stem: string): boolean {
  return n.split(" ").some((w) => w.startsWith(stem));
}

/** Remove whole words in `drop` and collapse spaces. */
export function without(n: string, drop: ReadonlySet<string>): string {
  return n.split(" ").filter((w) => w && !drop.has(w)).join(" ");
}

/** Words that carry no topic: question scaffolding, pronouns, politeness. Stripped to find the dish or section. */
export const FILLER = new Set([
  "a", "an", "the", "is", "are", "was", "be", "do", "does", "did", "you", "your", "yall", "we", "us", "our", "my", "me", "i", "id", "im",
  "it", "that", "this", "there", "these", "those", "what", "which", "how", "much", "many", "can", "could", "would", "will", "should",
  "get", "got", "have", "has", "had", "want", "need", "like", "love", "try", "tell", "show", "see", "about", "please", "hi", "hey",
  "hello", "of", "for", "on", "in", "at", "to", "with", "and", "or", "any", "some", "price", "prices", "cost", "costs", "menu", "order",
  "looking", "info", "information", "serve", "served", "sell", "offer", "available", "kind", "kinds", "type", "types", "option",
  "options", "list", "all", "else", "also", "just", "still", "thanks", "thank", "know", "whats", "doing", "make", "made", "eat",
  "anything", "something", "dish", "dishes", "stuff", "item", "items", "good", "um", "so", "really", "here",
]);
