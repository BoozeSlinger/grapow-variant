import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sushi Bar | Gra Pow" };

const SASHIMI = [
  { name: "Tuna",         price: "Sushi(2) $12.50 / Sashimi(5) $20.50" },
  { name: "Salmon",       price: "Sushi(2) $12.00 / Sashimi(5) $17.00" },
  { name: "Albacore",     price: "Sushi(2) $12.00 / Sashimi(5) $17.50" },
  { name: "Snapper",      price: "Sushi(2) $11.00 / Sashimi(5) $16.00" },
  { name: "Octopus",      price: "Sushi(2) $12.50 / Sashimi(5) $17.00" },
  { name: "Boil Shrimp",  price: "Sushi(2) $10.00 / Sashimi(5) $15.00" },
  { name: "Yellowtail",   price: "Sushi(2) $12.50 / Sashimi(5) $19.00" },
  { name: "Freshwater Eel", price: "Sushi(2) $13.00 / Sashimi(5) N/A" },
  { name: "Smoke Salmon", price: "Sushi(2) $13.00 / Sashimi(5) $19.00" },
];
const TRADITIONAL = [
  { name: "Tuna Roll",      price: "$13" },
  { name: "Cucumber Roll",  price: "$12" },
  { name: "California Roll",price: "$14" },
  { name: "Spicy Tuna Roll",price: "$15.50" },
  { name: "Tempura Roll",   price: "$16" },
  { name: "Salmon Roll",    price: "$15" },
];
const SPECIALTY = [
  { name: "Dragon Roll",      price: "$19" },
  { name: "Rainbow Roll",     price: "$18" },
  { name: "Caterpillar Roll", price: "$19" },
  { name: "Crunchy Roll",     price: "$18" },
  { name: "Unagi Roll",       price: "$17" },
  { name: "Philadelphia Roll",price: "$17" },
];
const HOUSE = [
  { name: "Spicy Yuzu Kanpachi Roll", price: "$21" },
  { name: "Smoke Salmon Roll",        price: "$21" },
  { name: "The Hangover Roll",        price: "$22" },
];
const SMALL_BITES = [
  { name: "Yellowtail Carpaccio",      price: "$20" },
  { name: "Tuna Crispy Carpaccio",     price: "$20.50" },
  { name: "Yellowtail Crudo",          price: "$20.50" },
  { name: "Poke Bowl",                 price: "$27" },
];

function Section({ title, items }: { title: string; items: { name: string; price: string }[] }) {
  return (
    <div className="menu-category mb-10">
      <h3 className="font-[family-name:var(--font-dancing)]">{title}</h3>
      {items.map((i) => (
        <div key={i.name} className="menu-item">
          <p className="menu-item-name font-[family-name:var(--font-baskerville)]">{i.name}</p>
          <span className="menu-item-price font-[family-name:var(--font-baskerville)]">{i.price}</span>
        </div>
      ))}
    </div>
  );
}

export default function SushiMenu() {
  return (
    <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
      <div className="mb-14 text-center">
        <Link href="/" className="font-[family-name:var(--font-baskerville)] text-[#E8A000] text-xs tracking-widest uppercase hover:text-[#F5BC30] transition-colors">
          ← Back to Home
        </Link>
        <h1 className="font-[family-name:var(--font-dancing)] text-6xl md:text-7xl text-white mt-6">Sushi Bar</h1>
        <p className="font-[family-name:var(--font-baskerville)] text-gray-400 text-sm tracking-widest mt-3 uppercase">
          Opens at 5PM · Closed Sunday &amp; Monday
        </p>
      </div>

      {/* Hours notice */}
      <div className="border border-[rgba(232,160,0,0.35)] p-6 text-center mb-14 max-w-md mx-auto">
        <p className="font-[family-name:var(--font-dancing)] text-[#E8A000] text-3xl">Sushi Bar Hours</p>
        <p className="font-[family-name:var(--font-baskerville)] text-gray-300 text-sm mt-2 tracking-wider">
          Tuesday – Saturday from 5:00 PM
        </p>
        <p className="text-gray-500 text-xs mt-2">Closed Sunday &amp; Monday</p>
      </div>

      <Section title="Sushi & Sashimi" items={SASHIMI} />
      <Section title="Traditional Rolls" items={TRADITIONAL} />
      <Section title="Specialty Rolls" items={SPECIALTY} />
      <Section title="House Special Rolls" items={HOUSE} />
      <Section title="Small Bites" items={SMALL_BITES} />
    </main>
  );
}
