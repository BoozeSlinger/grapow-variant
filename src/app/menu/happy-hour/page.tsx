import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Happy Hour | Gra Pow" };

const APPS = [
  { name: "Eggrolls",           desc: "5 vegetable egg rolls, sweet & sour sauce",    price: "$8" },
  { name: "Cream Cheese Wontons",desc:"6 pineapple cream cheese wontons, sweet & sour sauce", price: "$8" },
  { name: "Dragon Wings",       desc: "6 bone-in wings tossed in dragon sauce",       price: "$8" },
  { name: "Spicy Cheese Balls", desc: "7 spicy cheese balls, sweet & sour sauce & spicy mayo", price: "$8" },
  { name: "French Fries",       desc: "Regular or Sweet Potato — served with dipping sauce (+$2 Garlic Fries)", price: "$8" },
  { name: "Edamame",            desc: "Regular or Spicy Garlic",                      price: "$8" },
];

const DRINKS = [
  { name: "$2 Off All Beers",       desc: "16oz & 24oz — Ask about rotating taps",   price: "−$2" },
  { name: "House Wines",            desc: "",                                          price: "$5" },
  { name: "Happy Dad Seltzers & Nutrl", desc: "",                                     price: "$5" },
  { name: "Wells Drinks",           desc: "",                                          price: "$5" },
  { name: "Herradura Tequila",      desc: "",                                          price: "$7" },
  { name: "Absolut Vodka",          desc: "",                                          price: "$7" },
  { name: "Fireball",               desc: "",                                          price: "$8" },
];

export default function HappyHourMenu() {
  return (
    <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
      <div className="mb-14 text-center">
        <Link href="/" className="font-[family-name:var(--font-baskerville)] text-[#E8A000] text-xs tracking-widest uppercase hover:text-[#F5BC30] transition-colors">
          ← Back to Home
        </Link>
        <h1 className="font-[family-name:var(--font-dancing)] text-6xl md:text-7xl text-white mt-6">Happy Hour</h1>
        <p className="font-[family-name:var(--font-baskerville)] text-gray-400 text-sm tracking-widest mt-3 uppercase">
          Everyday 3PM – 6PM &amp; Drink Specials 9PM – 12AM
        </p>
      </div>

      {/* Hours badge */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
        {[
          { label: "Happy Hour", time: "Daily 3PM – 6PM" },
          { label: "Late Night Drinks", time: "9PM – 12AM" },
        ].map((b) => (
          <div key={b.label} className="border border-[rgba(232,160,0,0.4)] px-8 py-5 text-center flex-1 max-w-xs mx-auto">
            <p className="font-[family-name:var(--font-dancing)] text-[#E8A000] text-3xl">{b.label}</p>
            <p className="font-[family-name:var(--font-baskerville)] text-gray-300 text-sm mt-1 tracking-wider">{b.time}</p>
          </div>
        ))}
      </div>

      {/* $8 Appetizers */}
      <div className="menu-category mb-12">
        <h3 className="font-[family-name:var(--font-dancing)]">$8 Appetizers</h3>
        {APPS.map((item) => (
          <div key={item.name} className="menu-item">
            <div>
              <p className="menu-item-name font-[family-name:var(--font-baskerville)]">{item.name}</p>
              {item.desc && <p className="menu-item-desc">{item.desc}</p>}
            </div>
            <span className="menu-item-price font-[family-name:var(--font-baskerville)]">{item.price}</span>
          </div>
        ))}
      </div>

      {/* Drink Specials */}
      <div className="menu-category">
        <h3 className="font-[family-name:var(--font-dancing)]">Drink Specials</h3>
        <p className="text-gray-500 text-xs italic mb-4">Available 3PM–6PM &amp; 9PM–12AM</p>
        {DRINKS.map((item) => (
          <div key={item.name} className="menu-item">
            <div>
              <p className="menu-item-name font-[family-name:var(--font-baskerville)]">{item.name}</p>
              {item.desc && <p className="menu-item-desc">{item.desc}</p>}
            </div>
            <span className="menu-item-price font-[family-name:var(--font-baskerville)]">{item.price}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
