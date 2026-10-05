/**
 * Sushi menu — transcribed from spec Appendix A.2. Prices in cents.
 * Official sushi items have no descriptions except house special rolls and small bites. Never invent sub-descriptions.
 */
import { COPY } from "@/data/venue";
import type { Menu, Price } from "./types";

const c = (dollars: number) => Math.round(dollars * 100);
const one = (dollars: number): Price[] => [{ cents: c(dollars) }];
const NIGIRI_TIER = "Sushi (2 pc)", SASHIMI_TIER = "Sashimi (5 pc)";
const pair = (sushi: number, sashimi: number | null): Price[] => [
  { label: NIGIRI_TIER, cents: c(sushi) },
  { label: SASHIMI_TIER, cents: sashimi === null ? null : c(sashimi) },
];

export const SUSHI: Menu = {
  id: "sushi",
  title: "Sushi bar",
  href: "/menu/sushi",
  ground: "rice",
  notes: [COPY.allergyNote, COPY.priceNote, COPY.rawAdvisory],
  sections: [
    {
      id: "nigiri-sashimi", title: "Nigiri & sashimi", layout: "table", tierLabels: [NIGIRI_TIER, SASHIMI_TIER],
      items: [
        { id: "nigiri-tuna", name: "Tuna", prices: pair(12.5, 20.5), priceSource: "G", aliases: ["maguro"] },
        { id: "nigiri-salmon", name: "Salmon", prices: pair(12, 17), priceSource: "G" },
        { id: "nigiri-albacore", name: "Albacore", prices: pair(12, 17.5), priceSource: "G" },
        { id: "nigiri-snapper", name: "Snapper", prices: pair(11, 16), priceSource: "G" },
        { id: "nigiri-octopus", name: "Octopus", prices: pair(12.5, 17), priceSource: "G", aliases: ["tako"], ownerConfirm: "C-8: sashimi $17 (repo) vs $15 (grapow.net)" }, // OWNER-CONFIRM(C-8): Octopus sashimi $17 (repo) vs $15 (grapow.net)
        { id: "nigiri-boiled-shrimp", name: "Boiled Shrimp", prices: pair(10, 15), priceSource: "G", aliases: ["ebi"] },
        { id: "nigiri-yellowtail", name: "Yellowtail", prices: pair(12.5, 19), priceSource: "G", aliases: ["hamachi"] },
        { id: "nigiri-freshwater-eel", name: "Freshwater Eel", prices: pair(13, null), priceSource: "G", aliases: ["unagi"] },
        { id: "nigiri-smoked-salmon", name: "Smoked Salmon", prices: pair(13, 19), priceSource: "G", ownerConfirm: "C-8: $13/$19 (repo) vs $11/$17 (grapow.net)" }, // OWNER-CONFIRM(C-8): Smoked Salmon $13/$19 (repo) vs $11/$17 (grapow.net)
      ],
    },
    {
      id: "traditional-rolls", title: "Traditional cut rolls", layout: "compact",
      items: [
        { id: "tuna-roll", name: "Tuna Roll", prices: one(13), priceSource: "G" },
        { id: "cucumber-roll", name: "Cucumber Roll", prices: one(12), priceSource: "G" },
        { id: "california-roll", name: "California Roll", prices: one(14), priceSource: "G" },
        { id: "spicy-tuna-roll", name: "Spicy Tuna Roll", prices: one(15.5), priceSource: "G" },
        { id: "tempura-roll", name: "Tempura Roll", prices: one(16), priceSource: "G" },
        { id: "salmon-roll", name: "Salmon Roll", prices: one(15), priceSource: "G" },
      ],
    },
    {
      id: "specialty-rolls", title: "Specialty cut rolls", layout: "compact",
      items: [
        { id: "dragon-roll", name: "Dragon Roll", prices: one(19), priceSource: "G" },
        { id: "rainbow-roll", name: "Rainbow Roll", prices: one(18), priceSource: "G" },
        { id: "caterpillar-roll", name: "Caterpillar Roll", prices: one(19), priceSource: "G" },
        { id: "crunchy-roll", name: "Crunchy Roll", prices: one(18), priceSource: "G" },
        { id: "unagi-roll", name: "Unagi Roll", prices: one(17), priceSource: "G" },
        { id: "philadelphia-roll", name: "Philadelphia Roll", prices: one(17), priceSource: "G" },
      ],
    },
    {
      id: "house-specials", title: "House special rolls", layout: "list",
      items: [
        { id: "spicy-yuzu-kanpachi-roll", name: "Spicy Yuzu Kanpachi Roll", prices: one(21), priceSource: "G", description: "Inside: spicy tuna & cucumber. Outside: yellowtail, jalapeño, fried garlic, citrus." },
        { id: "smoke-salmon-roll", name: "Smoke Salmon Roll", prices: one(21), priceSource: "G", description: "Inside: crab, cucumber, cream cheese. Outside: smoked salmon with ponzu sauce." },
        { id: "the-hangover-roll", name: "The Hangover Roll", prices: one(22), priceSource: "G", description: "Spicy tuna, cucumber, cream cheese and jalapeño roll, tempura deep-fried with spicy tuna on top." },
      ],
    },
    {
      id: "small-bites", title: "Small bites", layout: "list",
      items: [
        { id: "yellowtail-carpaccio", name: "Yellowtail Carpaccio", prices: one(20), priceSource: "G", description: "Yellowtail, jalapeño, olive oil, citrus, cilantro, sea salt." },
        { id: "tuna-crispy-carpaccio", name: "Tuna Crispy Carpaccio", prices: one(20.5), priceSource: "G", description: "Seared tuna, soy mustard vinaigrette, avocado, crab mix, tempura, spinach, jalapeño, and crispy onion." },
        // No truffle oil.
        { id: "yellowtail-crudo", name: "Yellowtail Crudo", prices: one(20.5), priceSource: "G", description: "Yellowtail, olive oil, lemon citrus, onion, fresh ginger, Japanese garlic paste, jalapeños." },
        { id: "poke-bowl", name: "Poke Bowl", prices: one(27), priceSource: "G", description: "Salmon, tuna, yellowtail, crab meat, cucumber, spicy tuna, and veggies over your choice of rice or salad." },
      ],
    },
  ],
};
