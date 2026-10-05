/**
 * Menu search (spec §9.9), shared by MenuBrowser, the /menu hub and the concierge.
 * Deterministic scoring over item names, aliases, official descriptions and section names.
 */
import { ALL_ITEMS, MENUS } from "@/data/menu";
import type { MenuId } from "@/data/menu/types";

export type SearchDoc = {
  id: string; menuId: MenuId; sectionId: string; sectionTitle: string; name: string;
  description?: string; aliases: string[]; href: string; spicy: boolean;
};
/** matched = normalized query tokens that hit (for <mark>). */
export type SearchHit = { doc: SearchDoc; score: number; matched: string[] };

/** lowercase; NFKD + strip diacritics; "&"→"and"; "/" "-" → space; strip punctuation; collapse spaces. */
export function normalize(s: string): string {
  return s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’.]/g, "") // apostrophes and periods join ("b.b.q." → "bbq", "o'doul's" → "odouls")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function singularize(t: string): string {
  if (t.length < 4) return t;
  if (t.endsWith("ies")) return `${t.slice(0, -3)}y`;
  if (/(s|x|ch|sh)es$/.test(t)) return t.slice(0, -2);
  if (t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

/** normalize, split, singularize (≥4 chars: -ies→-y, -es after s/x/ch/sh, -s; not -ss). */
export function tokenize(s: string): string[] {
  return normalize(s).split(" ").filter(Boolean).map(singularize);
}

/* ── Synonyms (CONTRACT minimum) ── */
const SYNONYMS: Array<[string[], string]> = [
  [["pad kra pao", "kra pao", "kaprao", "krapow", "gra pao", "pad krapow", "basil chicken"], "pad gra pow"],
  [["drunken noodles", "drunken noodle"], "gra pow noodle"],
  [["pad see ew", "see ew", "see eiw"], "pad see aew"],
  [["panange", "penang"], "panang"],
  [["tom kar"], "tom kha"],
  [["tom yam"], "tom yum"],
  [["shumai", "shu mai", "siu mai", "sui mai"], "sue mai"],
  [["eggroll"], "egg roll"],
  [["mango sticky rice"], "sticky rice mango"],
  [["thai tea"], "thai iced tea"],
  [["lychee martini"], "lycheetini"],
  [["moscow mule", "mule"], "gra pow mule"],
  [["margarita"], "grapowrita"],
  [["chicken wings", "wings"], "dragon wings"],
  [["laab", "larp"], "larb"],
  [["som tum", "papaya salad"], "green papaya salad"],
  [["draught", "on tap"], "draft"],
];
const SYN_MAP = new Map<string, string>(SYNONYMS.flatMap(([from, to]) => from.map((f) => [normalize(f), normalize(to)] as [string, string])));
const SYN_RE = new RegExp(
  `\\b(${[...SYN_MAP.keys()].sort((a, b) => b.length - a.length).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "g",
);

/** Guest phrase → menu phrase (single pass, longest phrase first). Skipped when the query already holds the target. */
export function expandSynonyms(q: string): string {
  const n = normalize(q);
  return n.replace(SYN_RE, (m) => {
    const target = SYN_MAP.get(m) ?? m;
    return n.includes(target) ? m : target;
  });
}

/** Optimal-string-alignment Damerau–Levenshtein distance. */
export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length, bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  const d: number[][] = Array.from({ length: al + 1 }, (_, i) => Array.from({ length: bl + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[al][bl];
}

/* ── Index ── */
export const SEARCH_DOCS: SearchDoc[] = ALL_ITEMS.map((i) => {
  const section = MENUS[i.menuId].sections.find((s) => s.id === i.sectionId);
  return {
    id: i.id, menuId: i.menuId, sectionId: i.sectionId, sectionTitle: section?.title ?? "",
    name: i.name, description: i.description, aliases: i.aliases ?? [], href: i.href,
    spicy: !!i.spicy || (i.minSpice ?? 0) > 0,
  };
});

const STOP = new Set(["and", "or", "with", "the", "a", "an", "of", "in", "on", "w", "to"]);

/** Section aliases (spec §9.9). Spirits are matched by their `group` label instead. */
const SECTION_ALIASES: Array<{ terms: string[]; sections: string[] }> = [
  { terms: ["curry", "curries"], sections: ["curry"] },
  { terms: ["draft", "draught", "on tap", "tap"], sections: ["draft"] },
  { terms: ["sashimi", "nigiri"], sections: ["nigiri-sashimi"] },
  { terms: ["roll"], sections: ["traditional-rolls", "specialty-rolls", "house-specials"] },
  { terms: ["noodle"], sections: ["noodles", "noodle-lunch"] },
  { terms: ["soup"], sections: ["soup"] },
  { terms: ["salad"], sections: ["salad"] },
  { terms: ["dessert"], sections: ["dessert"] },
  { terms: ["appetizer", "starter"], sections: ["appetizers", "hh-bites"] },
  { terms: ["cocktail"], sections: ["cocktails"] },
  { terms: ["shot"], sections: ["shots"] },
  { terms: ["wine"], sections: ["wine"] },
].map((a) => ({ terms: a.terms.map((t) => tokenize(t).join(" ")), sections: a.sections }));
const SPIRIT_WORDS = new Set(["whiskey", "bourbon", "tequila", "vodka", "gin", "rum", "scotch"]);

type Prepared = {
  doc: SearchDoc; index: number;
  names: string[]; nameTokLists: string[][]; nameToks: string[];
  descWords: string[]; sectionToks: string[][]; aliasSections: Set<string>; groupToks: string[];
};

const PREPARED: Prepared[] = SEARCH_DOCS.map((doc, index) => {
  const names = [doc.name, ...doc.aliases].map(normalize);
  const nameTokLists = [doc.name, ...doc.aliases].map(tokenize);
  const descNorm = doc.description ? normalize(doc.description).split(" ").filter(Boolean) : [];
  const group = ALL_ITEMS[index].group;
  return {
    doc, index, names, nameTokLists, nameToks: [...new Set(nameTokLists.flat())],
    descWords: [...new Set([...descNorm, ...descNorm.map(singularize)])],
    sectionToks: [tokenize(doc.sectionId.replace(/-/g, " ")), tokenize(doc.sectionTitle)],
    aliasSections: new Set(SECTION_ALIASES.filter((a) => a.sections.includes(doc.sectionId)).flatMap((a) => a.terms)),
    groupToks: group ? tokenize(group) : [],
  };
});

function startsAtWord(hay: string, needle: string): boolean {
  return ` ${hay}`.includes(` ${needle}`);
}
/** Spaces ignored ("egg roll" finds "eggrolls"), anchored at a word start of the haystack. */
function compactAtWord(hay: string, needle: string): boolean {
  const n = needle.replace(/ /g, "");
  const words = hay.split(" ");
  return words.some((_, i) => words.slice(i).join("").startsWith(n));
}

function tokenScore(t: string, nameToks: string[]): { s: number; hit?: string } {
  let best = { s: 0 } as { s: number; hit?: string };
  for (const nt of nameToks) {
    let s = 0;
    if (nt === t) s = 1;
    else if (nt.startsWith(t)) s = 0.85;
    else {
      const longest = Math.max(t.length, nt.length);
      if (longest >= 4 && Math.abs(t.length - nt.length) <= 2) {
        const dl = damerauLevenshtein(t, nt);
        if (dl <= 1) s = 0.75;
        else if (dl <= 2 && longest >= 8) s = 0.65;
      }
    }
    if (s > best.s) best = { s, hit: nt };
    if (s === 1) break;
  }
  return best;
}

function scoreOne(p: Prepared, qn: string, qt: string[]): { score: number; matched: string[] } {
  const matched = new Set<string>();
  let best = 0;
  const qjoin = qt.join(" ");

  if (p.nameTokLists.some((toks) => toks.join(" ") === qjoin)) best = 1;
  if (best < 0.95 && qn.length >= 3 && p.names.some((n) => startsAtWord(n, qn) || (qt.length > 1 && compactAtWord(n, qn)))) best = 0.95;
  if (best < 0.9 && qt.every((t) => p.nameToks.some((nt) => nt.startsWith(t)))) best = 0.9;

  const per = qt.map((t) => tokenScore(t, p.nameToks));
  const positive = per.filter((x) => x.s > 0).length;
  const mean = per.reduce((a, x) => a + x.s, 0) / per.length;
  if (positive === per.length) best = Math.max(best, 0.8 * mean);
  else if (positive * 2 >= per.length) best = Math.max(best, 0.6 * mean);
  per.forEach((x, i) => {
    if (x.s > 0) matched.add(x.s >= 0.85 ? qt[i] : (x.hit ?? qt[i]));
  });

  const q3 = qt.filter((t) => t.length >= 3);
  if (q3.length && p.descWords.length) {
    const hits = q3.filter((t) => p.descWords.some((w) => w.startsWith(t)));
    best = Math.max(best, hits.length === q3.length ? 0.55 : 0.3 * (hits.length / q3.length));
    hits.forEach((t) => matched.add(t));
  }

  const sectionHit =
    p.aliasSections.has(qjoin) ||
    p.sectionToks.some((st) => st.join(" ") === qjoin || (qt.every((t) => t.length >= 3) && qt.every((t) => st.some((s) => s.startsWith(t))))) ||
    (p.groupToks.length > 0 && qt.every((t) => t.length >= 3) && qt.every((t) => p.groupToks.some((g) => g.startsWith(t))) &&
      (qt.some((t) => SPIRIT_WORDS.has(t)) || qt.every((t) => p.groupToks.includes(t) || p.groupToks.some((g) => g.startsWith(t)))));
  if (sectionHit) best = Math.max(best, 0.6);

  return { score: best, matched: [...matched].filter((t) => !STOP.has(t)) };
}

function scoreDoc(p: Prepared, query: string): { score: number; matched: string[] } {
  const variants = [...new Set([normalize(query), expandSynonyms(query)])].filter(Boolean);
  let best = { score: 0, matched: [] as string[] };
  for (const qn of variants) {
    const qt = [...new Set(tokenize(qn))];
    if (!qt.length) continue;
    const r = scoreOne(p, qn, qt);
    if (r.score > best.score) best = r;
  }
  return best;
}

/** Defaults: all menus, limit 50, threshold 0.5. Sorted by score desc, then shorter name, then menu order. */
export function searchMenu(query: string, opts?: { menus?: MenuId[]; limit?: number; threshold?: number }): SearchHit[] {
  if (normalize(query).length < 2) return [];
  const menus = opts?.menus, threshold = opts?.threshold ?? 0.5, limit = opts?.limit ?? 50;
  const hits: Array<SearchHit & { index: number }> = [];
  for (const p of PREPARED) {
    if (menus && !menus.includes(p.doc.menuId)) continue;
    const { score, matched } = scoreDoc(p, query);
    if (score >= threshold) hits.push({ doc: p.doc, score, matched, index: p.index });
  }
  hits.sort((a, b) => b.score - a.score || a.doc.name.length - b.doc.name.length || a.index - b.index);
  return hits.slice(0, limit).map(({ doc, score, matched }) => ({ doc, score, matched }));
}

/** id → matched tokens, for every item in `menuId` scoring ≥ 0.5. */
export function matchItemIds(query: string, menuId: MenuId): Map<string, string[]> {
  return new Map(searchMenu(query, { menus: [menuId], limit: Infinity }).map((h) => [h.doc.id, h.matched]));
}

/** Split `text` into marked / unmarked runs: word-prefix matches of `matched`, case-insensitive. */
export function highlightParts(text: string, matched: string[]): Array<{ text: string; mark: boolean }> {
  const toks = [...new Set(matched.filter((t) => t && !STOP.has(t)))].sort((a, b) => b.length - a.length);
  if (!toks.length) return [{ text, mark: false }];
  const out: Array<{ text: string; mark: boolean }> = [];
  const push = (t: string, mark: boolean) => {
    if (!t) return;
    const prev = out[out.length - 1];
    if (prev && prev.mark === mark) prev.text += t;
    else out.push({ text: t, mark });
  };
  let last = 0;
  for (const m of text.matchAll(/[\p{L}\p{N}]+/gu)) {
    const w = m[0], start = m.index ?? 0;
    const wn = w.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
    const t = toks.find((tok) => wn.startsWith(tok) || singularize(wn).startsWith(tok));
    if (!t) continue;
    const len = wn.length === w.length && wn.startsWith(t) ? t.length : w.length;
    push(text.slice(last, start), false);
    push(w.slice(0, len), true);
    last = start + len;
  }
  push(text.slice(last), false);
  return out;
}
