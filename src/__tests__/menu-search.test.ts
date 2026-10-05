// @vitest-environment node
import { describe, expect, it } from "vitest";
import { SUSHI } from "@/data/menu/sushi";
import {
  damerauLevenshtein, expandSynonyms, highlightParts, matchItemIds, normalize, searchMenu, tokenize,
} from "@/lib/menu-search";

const ids = (q: string) => searchMenu(q).map((h) => h.doc.id);
const top = (q: string) => searchMenu(q)[0]?.doc.id;

describe("normalize / tokenize / synonyms", () => {
  it("normalizes", () => {
    expect(normalize("Gra/Pow  Noodle")).toBe("gra pow noodle");
    expect(normalize("Jägermeister & Kahlúa")).toBe("jagermeister and kahlua");
    expect(normalize("Sue-Mai!")).toBe("sue mai");
  });
  it("singularizes tokens of 4+ chars", () => {
    expect(tokenize("Curries noodles dishes glass shots")).toEqual(["curry", "noodle", "dish", "glass", "shot"]);
    expect(tokenize("bus")).toEqual(["bus"]);
  });
  it("expands guest phrases", () => {
    expect(expandSynonyms("kra pao")).toBe("pad gra pow");
    expect(expandSynonyms("drunken noodles")).toBe("gra pow noodle");
    expect(expandSynonyms("tom yam soup")).toBe("tom yum soup");
    expect(expandSynonyms("on tap")).toBe("draft");
  });
  it("computes Damerau–Levenshtein", () => {
    expect(damerauLevenshtein("thai", "tahi")).toBe(1);
    expect(damerauLevenshtein("kitten", "sitting")).toBe(3);
    expect(damerauLevenshtein("", "abc")).toBe(3);
  });
});

describe("required search table (§9.9)", () => {
  it("pad tai → pad-thai", () => expect(top("pad tai")).toBe("pad-thai"));
  it("panang → panang-curry", () => expect(ids("panang")).toContain("panang-curry"));
  it("drunken noodles → gra-pow-noodle", () => expect(top("drunken noodles")).toBe("gra-pow-noodle"));
  it("kra pao → pad-gra-pow", () => expect(top("kra pao")).toBe("pad-gra-pow"));
  it("lychee martini → lycheetini", () => expect(ids("lychee martini")).toContain("lycheetini"));
  it("basil finds dishes by ingredient", () => {
    expect(ids("basil")).toEqual(expect.arrayContaining(["pad-gra-pow", "red-curry", "gra-pow-noodle", "eggplant"]));
  });
  it("sashimi ⊇ nigiri items", () => {
    const nigiri = SUSHI.sections.find((s) => s.id === "nigiri-sashimi")!.items.map((i) => i.id);
    expect(ids("sashimi")).toEqual(expect.arrayContaining(nigiri));
  });
  it("egg roll ⊇ egg-rolls, hh-eggrolls", () => expect(ids("egg roll")).toEqual(expect.arrayContaining(["egg-rolls", "hh-eggrolls"])));
  it("shumai → steamed-sue-mai", () => expect(ids("shumai")).toContain("steamed-sue-mai"));
  it("xyzzy → []", () => expect(searchMenu("xyzzy")).toEqual([]));
});

describe("more queries", () => {
  it("synonym and alias hits", () => {
    expect(top("pad see ew")).toBe("pad-see-aew");
    expect(ids("tom kar")).toEqual(expect.arrayContaining(["tom-kha-chicken", "tom-kha-shrimp"]));
    expect(ids("mango sticky rice")).toContain("sweet-sticky-rice-mango");
    expect(ids("thai tea")).toContain("thai-iced-tea");
    expect(ids("wings")).toEqual(expect.arrayContaining(["dragon-wings", "hh-dragon-wings"]));
    expect(ids("margarita")).toContain("grapowrita");
    expect(ids("papaya salad")).toContain("green-papaya-salad");
  });
  it("section and spirit-group queries", () => {
    expect(ids("curries")).toEqual(expect.arrayContaining(["red-curry", "panang-curry"]));
    expect(ids("tequila")).toEqual(expect.arrayContaining(["spirit-casamigos-blanco", "spirit-clase-azul"]));
    expect(ids("on tap")).toEqual(expect.arrayContaining(["draft-805", "draft-guinness"]));
  });
  it("options: menus, limit, threshold", () => {
    expect(searchMenu("basil", { menus: ["bar"] })).toEqual([]);
    expect(searchMenu("curry", { limit: 2 })).toHaveLength(2);
    const hits = searchMenu("chicken");
    expect(hits.every((h, i) => i === 0 || hits[i - 1].score >= h.score)).toBe(true);
  });
  it("matchItemIds returns matched tokens for one menu", () => {
    const m = matchItemIds("basil", "food");
    expect(m.get("pad-gra-pow")).toEqual(["basil"]);
    expect([...m.keys()].every((id) => !id.startsWith("hh-"))).toBe(true);
  });
});

describe("highlightParts", () => {
  it("marks word-prefix matches, case-insensitively", () => {
    expect(highlightParts("Thai basil and Basil leaves", ["basil"])).toEqual([
      { text: "Thai ", mark: false }, { text: "basil", mark: true }, { text: " and ", mark: false },
      { text: "Basil", mark: true }, { text: " leaves", mark: false },
    ]);
    expect(highlightParts("Pad Thai", ["tha"])).toEqual([{ text: "Pad ", mark: false }, { text: "Tha", mark: true }, { text: "i", mark: false }]);
    expect(highlightParts("Sabai", ["bai"])).toEqual([{ text: "Sabai", mark: false }]);
    expect(highlightParts("Plain", [])).toEqual([{ text: "Plain", mark: false }]);
  });
});
