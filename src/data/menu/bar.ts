/** Bar menu ("The bar", /menu/drinks) — transcribed from spec Appendix A.4. Prices in cents. */
import { COPY } from "@/data/venue";
import type { Menu, MenuItem, Price } from "./types";

const c = (dollars: number) => Math.round(dollars * 100);
const one = (dollars: number): Price[] => [{ cents: c(dollars) }];
const OZ16 = "16 oz", OZ24 = "24 oz";
const draft = (id: string, name: string, small: number, large: number, extra: Partial<MenuItem> = {}): MenuItem =>
  ({ id, name, prices: [{ label: OZ16, cents: c(small) }, { label: OZ24, cents: c(large) }], priceSource: "G", ...extra });
const GLASS = "Glass", BOTTLE = "Bottle";
const wine = (id: string, name: string, glass: number, bottle: number | null, description: string): MenuItem =>
  ({ id, name, prices: [{ label: GLASS, cents: c(glass) }, { label: BOTTLE, cents: bottle === null ? null : c(bottle) }], priceSource: "W", description });
const bottle = (id: string, name: string, dollars: number): MenuItem => ({ id, name, prices: one(dollars), priceSource: "W" });

/** "spirit-" + slug(name): strip diacritics and apostrophes, & → and, non-alphanumerics → "-". */
export function spiritId(name: string): string {
  return "spirit-" + name.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/['’]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const SPIRITS: Array<[group: string, names: string[]]> = [
  ["Vodka", ["Absolut", "Absolut Citron", "Absolut Elyx", "Absolut Mandrin", "Absolut Raspberri", "Absolut Vanilia", "Grey Goose", "Ketel One", "Ketel One Botanical (Cucumber & Mint, Grapefruit & Rose, Peach & Orange Blossom)", "Tito's Handmade", "White Rhino"]],
  ["Gin", ["Bombay Sapphire", "Hendrick's", "Malfy Pink Grapefruit", "Tanqueray"]],
  ["Tequila", ["Casamigos Blanco", "Cazadores Reposado", "Don Julio Blanco", "Don Julio Reposado", "Don Julio Añejo", "Don Julio 70", "Herradura Silver", "Hornitos Plata", "Maestro Dobel Diamante", "Olmeca Altos Plata", "Patrón Silver", "Lalo", "Clase Azul"]],
  ["Rum", ["Bacardi Superior", "Captain Morgan", "Malibu Coconut", "Myers's"]],
  ["Whiskey & bourbon", ["Buffalo Trace", "Crown Royal", "Fireball", "Gentleman Jack", "Jack Daniel's", "Jack Daniel's Fire", "Jack Daniel's Honey", "Jameson", "Jameson Orange", "Jefferson's Bourbon", "Jim Beam", "Beam's 8 Star", "Maker's Mark", "Seagram's 7", "Skrewball Peanut Butter"]],
  ["Scotch", ["Johnnie Walker Black Label", "Macallan 12"]],
  ["Cognac", ["Grand Marnier", "Hennessy VS"]],
  ["Liqueurs", ["Baileys", "Chambord", "Frangelico", "Jägermeister", "Kahlúa", "Midori", "Soho Lychee", "X-Rated Fusion", "RumChata", "Rumple Minze"]],
];
const REPO_ONLY_SPIRITS = new Set(["RumChata", "Rumple Minze"]); // OWNER-CONFIRM(C-9): RumChata and Rumple Minze are repo-only — still poured?

export const BAR: Menu = {
  id: "bar",
  title: "The bar",
  href: "/menu/drinks",
  ground: "ink",
  notes: [COPY.drinkNote, COPY.priceNote],
  sections: [
    {
      id: "cocktails", title: "Cocktails", layout: "list",
      items: [
        { id: "lycheetini", name: "Lycheetini", prices: one(14), priceSource: "G", description: "Absolut Elyx vodka, Soho lychee & sour mix.", aliases: ["lychee martini"] },
        { id: "southern-lemonade", name: "Southern Lemonade", prices: one(13), priceSource: "G", description: "Jefferson's bourbon, fresh berries & house lemon sour mix." },
        { id: "gra-pow-mule", name: "Gra Pow Mule", prices: one(13), priceSource: "G", description: "Absolut vodka, ginger beer, yuzu liqueur & lime.", aliases: ["mule", "moscow mule"] },
        { id: "house-old-fashioned", name: "GraPow's House Old Fashioned", prices: one(15), priceSource: "G", description: "Our barrel-aged old fashioned featuring Jefferson's Very Small Batch bourbon." },
        { id: "pink-grapefruit-negroni-spritzer", name: "Pink Grapefruit Negroni Spritzer", prices: one(13), priceSource: "G", description: "Malfy Pink Grapefruit gin, Aperol & soda water." },
        { id: "grapowrita", name: "Grapowrita", prices: one(11), priceSource: "G", description: "Olmeca Altos tequila, triple sec, house margarita mix, pomegranate and pineapple juice.", aliases: ["margarita"] },
        { id: "love-you-long-time", name: "Love You Long Time", prices: one(12), priceSource: "G", description: "Absolut Mandrin vodka, watermelon schnapps, peach schnapps, X-Rated Fusion liqueur, and pineapple juice." },
        { id: "purple-rain", name: "Purple Rain", prices: one(12), priceSource: "G", description: "X-Rated Fusion liqueur, blue curaçao, and lemon-lime soda." },
        { id: "are-you-tajin-to-me", name: "Are You Tajin To Me", prices: one(13), priceSource: "G", description: "Ketel One Botanical Cucumber & Mint vodka, triple sec, fresh cucumber & lime with a Tajín rim." },
        { id: "titos-cocktails", name: "Tito's Cocktails", prices: one(7), priceSource: "W" },
      ],
    },
    {
      id: "shots", title: "Shots", layout: "list", note: "$10 each.",
      items: [
        { id: "shot-green-tea", name: "Green Tea", prices: one(10), priceSource: "G", description: "Jameson Irish whiskey, peach schnapps, sour mix." },
        { id: "shot-mexican-candy", name: "Mexican Candy", prices: one(10), priceSource: "G", description: "Vodka, watermelon schnapps, peach schnapps, sour mix, Tajín rim." },
        { id: "shot-pink-candy", name: "Pink Candy", prices: one(10), priceSource: "G", description: "Vanilla vodka, watermelon schnapps, sour mix, lemon-lime soda." },
        { id: "shot-liquid-marijuana", name: "Liquid Marijuana", prices: one(10), priceSource: "G", description: "Spiced rum, Midori, blue curaçao, coconut rum, pineapple juice." },
        { id: "shot-cactus-cooler", name: "Cactus Cooler", prices: one(10), priceSource: "G", description: "Mandarin vodka, peach schnapps, energy drink." },
      ],
    },
    {
      id: "draft", title: "Draft beer", layout: "table", tierLabels: [OZ16, OZ24], hhFlag: true,
      note: "Ask about our seasonal rotating taps.",
      items: [
        draft("draft-corona-light", "Corona Light", 6, 8, { ownerConfirm: "C-9: Corona Light (repo) vs Coors Light (grapow.net)" }), // OWNER-CONFIRM(C-9): Corona Light (repo) vs Coors Light (grapow.net)
        draft("draft-805", "805", 7, 9),
        draft("draft-modelo", "Modelo", 6, 8),
        draft("draft-mango-cart", "Mango Cart", 7, 9),
        draft("draft-michelob-ultra", "Michelob Ultra", 6, 8),
        draft("draft-kirin", "Kirin", 6, 8, { ownerConfirm: "C-9: Kirin listed without a description (grapow.net text says Sapporo)" }), // OWNER-CONFIRM(C-9): Kirin vs Sapporo
        draft("draft-bud-light", "Bud Light", 6, 8),
        draft("draft-vista-haze-ipa", "Vista Haze IPA", 5, 7),
        draft("draft-dos-equis", "Dos Equis", 6, 8),
        draft("draft-guinness", "Guinness", 7, 9),
        draft("draft-twisted-tea", "Twisted Tea", 6, 8),
        draft("draft-kona-big-wave", "Kona Big Wave", 7, 9),
        draft("draft-hangar-24-orange-wheat", "Hangar 24 Orange Wheat", 7, 9, { priceSource: "W" }),
        draft("draft-red-trolley", "Red Trolley", 7, 9, { priceSource: "W" }),
        draft("draft-stella-artois", "Stella Artois", 7, 9, { priceSource: "W" }),
      ],
    },
    {
      id: "bottled", title: "Bottled beer", layout: "priceGroups", hhFlag: true,
      items: [
        bottle("bottle-corona", "Corona", 6),
        bottle("bottle-corona-light", "Corona Light", 6),
        bottle("bottle-modelo", "Modelo", 6),
        bottle("bottle-michelob-ultra", "Michelob Ultra", 6),
        bottle("bottle-miller-lite", "Miller Lite", 6),
        bottle("bottle-bud-light", "Bud Light", 6),
        bottle("bottle-coors-light", "Coors Light", 6),
        bottle("bottle-estrella-jalisco", "Estrella Jalisco", 6),
        bottle("bottle-heineken", "Heineken", 7),
        bottle("bottle-blue-moon", "Blue Moon", 7),
        bottle("bottle-lucky-buddha", "Lucky Buddha", 7),
        bottle("bottle-angry-orchard", "Angry Orchard", 8),
        bottle("bottle-high-noon", "High Noon", 8),
        bottle("bottle-white-claw", "White Claw", 8),
        bottle("bottle-happy-dad", "Happy Dad", 8),
        bottle("bottle-odouls", "O'Doul's (non-alcoholic)", 5),
      ],
    },
    {
      id: "wine", title: "Wine", layout: "table", tierLabels: [GLASS, BOTTLE],
      items: [
        wine("wine-kung-fu-girl", "Charles Smith Kung Fu Girl Riesling, Washington", 10, 30, "White peach, mandarin orange and apricot — pairs with dessert."),
        wine("wine-oyster-bay", "Oyster Bay Sauvignon Blanc, New Zealand", 10, 30, "Pink grapefruit, lemongrass, lychee, peach and pear — pairs with spicy seafood."),
        wine("wine-kenwood-chardonnay", "Kenwood Yulupa Chardonnay, Sonoma", 10, 30, "Ripe apple and pear, light buttery finish — pairs with chicken dishes."),
        wine("wine-lincourt-chardonnay", "Lincourt Chardonnay", 10, 30, "Candied lemon rind, creamy panna cotta and vanilla bean."),
        wine("wine-castle-rock-pinot-noir", "Castle Rock Pinot Noir, California", 10, 30, "Silky textures and vibrant flavors — pairs with meat dishes."),
        wine("wine-meiomi", "Meiomi Red Blend, California", 12, 32, "Dark jammy fruit and sweet vanilla with a hint of dark mocha."),
        wine("wine-trouble-maker", "Trouble Maker Red Blend, Paso Robles", 12, 32, "Strawberry preserves, cherry cola and milk chocolate — pairs with meat dishes."),
        wine("wine-woodbridge", "Woodbridge by Robert Mondavi", 6, null, "Chardonnay, Pinot Grigio, Sauvignon Blanc, Moscato, Cabernet, Pinot Noir, Merlot."),
      ],
    },
    {
      id: "spirits", title: "Spirits", layout: "names",
      items: SPIRITS.flatMap(([group, names]) =>
        names.map((name): MenuItem => (REPO_ONLY_SPIRITS.has(name)
          ? { id: spiritId(name), name, prices: [], group, priceSource: "G", ownerConfirm: "C-9: repo-only" }
          : { id: spiritId(name), name, prices: [], group, priceSource: "G" }))),
    },
  ],
};
