import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Food Menu | Gra Pow" };

const LUNCH = [
  { name: "Cashew Chicken",              price: "$18" },
  { name: "Orange Chicken",              price: "$18" },
  { name: "B.B.Q. Chicken, Beef or Pork",price: "$18" },
  { name: "Gra/Pow Chicken or Beef",     price: "$18" },
  { name: "Yellow Curry Chicken",        price: "$18" },
  { name: "Red Curry Beef",              price: "$18" },
  { name: "Eggplant & Tofu",             price: "$18" },
  { name: "Mixed Vegetable & Tofu",      price: "$18" },
  { name: "Garlic & Pepper Beef",        price: "$18" },
  { name: "Green Bean Chicken",          price: "$18" },
  { name: "Teriyaki Chicken",            price: "$18" },
  { name: "Broccoli & Beef",             price: "$18" },
  { name: "Kung Pao Chicken",            price: "$20" },
  { name: "Mongolian Beef",              price: "$20" },
  { name: "NY Steak with Garlic Sauce",  price: "$22" },
  { name: "Salmon with Teriyaki Sauce",  price: "$22" },
];
const NOODLE_LUNCH = [
  { name: "Gra-Pow Noodle Chicken",              price: "$20" },
  { name: "Chow Mein Noodle (Beef or Chicken)",  price: "$20" },
  { name: "Pho Noodle Soup",                     price: "$18" },
  { name: "BBQ Pork with Noodle Soup with Wonton",price:"$18" },
  { name: "Pad See Aew Chicken",                 price: "$18" },
  { name: "Pad Thai Chicken",                    price: "$18" },
  { name: "Seafood Noodle",                      price: "$21" },
  { name: "Spicy & Sour Noodle Soup",            price: "$20", note: "Min. Spicy 5" },
];
const APPETIZERS = [
  { name: "Egg Rolls (5)",                price: "$12" },
  { name: "Fresh Spring Roll",            price: "$15" },
  { name: "Dumplings (10)",               price: "$14" },
  { name: "Fantastic Four",              price: "$23" },
  { name: "Deep Fried Calamari",          price: "$17" },
  { name: "Chicken Slammer (8)",          price: "$15" },
  { name: "Chips & Thai Salsa",           price: "$13" },
  { name: "Thai Tacos (3)",               price: "$14" },
  { name: "Cream Cheese Wontons Pineapples (6)", price: "$11" },
  { name: "Edamame — Regular",            price: "$10" },
  { name: "Edamame — Spicy Garlic",       price: "$11" },
];
const SOUP = [
  { name: "Tom Yum — Chicken",   price: "S.$12.50 / L.$16.50" },
  { name: "Tom Yum — Shrimp",    price: "S.$13.50 / L.$17.50" },
  { name: "Tom Yum — Seafood",   price: "S.$15.00 / L.$22.50" },
  { name: "Tom Kha — Chicken",   price: "S.$12.75 / L.$17.00" },
  { name: "Tom Kha — Shrimp",    price: "S.$13.75 / L.$18.00" },
  { name: "Buddha Shrimp Wonton Soup", price: "S.$14 / L.$20" },
  { name: "Thai Rice Soup",      price: "S.$13 / L.$17" },
  { name: "Tofu & Clear Noodle Soup", price: "S.$13 / L.$17" },
  { name: "Miso Soup",           price: "S.$9.50 / L.$14.50" },
];
const SALAD = [
  { name: "House Green Salad", price: "Sm.$9 / Lg.$13" },
  { name: "Larb",              price: "$19" },
  { name: "Green Papaya Salad",price: "$18" },
  { name: "Seared Tuna Salad", price: "$23" },
];
const ENTREES = [
  { name: "Pad Gra Pow",          price: "$22 / w/ Fried Egg $23" },
  { name: "Cashew Chicken",       price: "$22" },
  { name: "Broccoli & Cauliflower — Chicken/Beef/Pork", price: "$22" },
  { name: "Broccoli & Cauliflower — Shrimp",            price: "$24" },
  { name: "Broccoli & Cauliflower — Combo",             price: "$26.50" },
  { name: "Orange Chicken",       price: "$23" },
  { name: "Garlic Black Pepper — Chicken/Beef/Pork",    price: "$22" },
  { name: "Green Beans",          price: "$22" },
  { name: "B.B.Q. Chicken",       price: "$23" },
  { name: "B.B.Q. Pork",          price: "$23" },
  { name: "B.B.Q. Beef",          price: "$23" },
  { name: "Teriyaki Chicken",     price: "$23" },
  { name: "NY Steak",             price: "$30" },
  { name: "Crying Tiger Steak",   price: "$30" },
  { name: "Eggplant — Tofu",      price: "$21" },
  { name: "Eggplant — Chicken/Beef/Pork", price: "$22" },
  { name: "Eggplant — Shrimp",    price: "$24" },
  { name: "Mixed Vegetable — Tofu",price:"$21" },
  { name: "Mixed Vegetable — Chicken/Beef/Pork", price: "$22" },
  { name: "Mongolian Beef",       price: "$23" },
  { name: "Pad Pik King — Chicken/Beef/Pork", price: "$22" },
  { name: "Kung Pao — Tofu",      price: "$21" },
  { name: "Kung Pao — Chicken/Beef/Pork", price: "$22" },
  { name: "Gra/Pow Seafood",      price: "$30" },
  { name: "Salmon",               price: "$29" },
  { name: "Kung Pik Pow",         price: "$26" },
];
const NOODLES = [
  { name: "Asian Noodle",         price: "$23" },
  { name: "Garlic Noodle — Chicken/Beef/Pork", price: "$22" },
  { name: "Chowmein Noodle — Chicken/Beef/Pork", price: "$22" },
  { name: "Pho Noodle — Chicken/Beef/Pork",    price: "$22" },
  { name: "B.B.Q. Pork Noodle Soup",           price: "$22" },
  { name: "Wok Fried Rice — Chicken/Beef/Pork",price: "$21.50" },
  { name: "Wok Fried Rice — Shrimp",           price: "$23.50" },
  { name: "Seafood Fried Rice",   price: "$28" },
  { name: "Golden Pineapple Fried Rice", price: "$24" },
  { name: "Dragon Fried Rice — Chicken/Beef/Pork", price: "$21.50" },
  { name: "Crab Meat Fried Rice", price: "$27" },
];
const CURRY = [
  { name: "Red Curry — Tofu",     price: "$21" },
  { name: "Red Curry — Chicken/Beef/Pork", price: "$22" },
  { name: "Red Curry — Shrimp",   price: "$24" },
  { name: "Chicken Yellow Curry", price: "$22.50" },
  { name: "Young Coconut Green Curry — Tofu", price: "$21" },
  { name: "Young Coconut Green Curry — Chicken/Beef/Pork", price: "$22" },
  { name: "Young Coconut Green Curry — Shrimp", price: "$24" },
  { name: "Panange Curry — Tofu", price: "$21" },
  { name: "Panange Curry — Chicken/Beef/Pork", price: "$22" },
  { name: "Panange Curry — Shrimp", price: "$24" },
];
const SPECIAL = [
  { name: "Cajun Seafood Boil — Shrimp",      price: "$25" },
  { name: "Cajun Seafood Boil — Crab",        price: "$55" },
  { name: "Cajun Seafood Boil — Shrimp+Crab", price: "$45" },
  { name: "Pork Ramen",                        price: "$21" },
];
const SIDES = [
  { name: "Steamed White or Brown Rice", price: "$5" },
  { name: "Fried Rice / Sticky Rice",    price: "$6" },
  { name: "Steamed Vegetable / Stir Fried Spinach", price: "$7" },
  { name: "Plain Chow Mein & Vegi",      price: "$7" },
];
const DESSERT = [
  { name: "Sweet Sticky Rice w/ Mango",   price: "$13" },
  { name: "Fried Banana",                 price: "$11" },
  { name: "Coconut Ice Cream",            price: "$9.50" },
  { name: "Green Tea Ice Cream",          price: "$9.50" },
  { name: "Vanilla Ice Cream",            price: "$9" },
  { name: "Coconut Ice Cream w/ Fried Bananas", price: "$13" },
  { name: "Chocolate Cake & Ice Cream",   price: "$13" },
];

function MenuSection({ title, note, items }: {
  title: string; note?: string;
  items: { name: string; price: string; note?: string }[];
}) {
  return (
    <div className="menu-category mb-10">
      <h3 className="font-[family-name:var(--font-dancing)]">{title}</h3>
      {note && <p className="text-gray-500 text-xs italic mb-4">{note}</p>}
      {items.map((item) => (
        <div key={item.name} className="menu-item">
          <div>
            <p className="menu-item-name font-[family-name:var(--font-baskerville)]">{item.name}</p>
            {item.note && <p className="menu-item-desc">{item.note}</p>}
          </div>
          <span className="menu-item-price font-[family-name:var(--font-baskerville)]">{item.price}</span>
        </div>
      ))}
    </div>
  );
}

export default function FoodMenu() {
  return (
    <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-14 text-center">
        <Link href="/" className="font-[family-name:var(--font-baskerville)] text-[#E8A000] text-xs tracking-widest uppercase hover:text-[#F5BC30] transition-colors">
          ← Back to Home
        </Link>
        <h1 className="font-[family-name:var(--font-dancing)] text-6xl md:text-7xl text-white mt-6">Food Menu</h1>
        <p className="font-[family-name:var(--font-baskerville)] text-gray-400 text-sm tracking-widest mt-3 uppercase">
          Gra Pow Thai &amp; Sports Bar · Riverside, CA
        </p>
      </div>

      {/* Tabs for quick navigation */}
      <div className="flex flex-wrap gap-2 justify-center mb-14">
        {["Lunch", "Appetizers", "Soup", "Salad", "Entrées", "Noodles & Rice", "Curry", "Special", "Sides", "Dessert"].map((s) => (
          <a key={s} href={`#${s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
             className="font-[family-name:var(--font-baskerville)] border border-[rgba(232,160,0,0.3)] text-[#E8A000] text-xs px-4 py-2 tracking-widest hover:border-[#E8A000] transition-colors">
            {s}
          </a>
        ))}
      </div>

      <div id="lunch">
        <MenuSection
          title="Lunch Special"
          note="Served daily until 3:00 p.m. All lunch served with salad, chicken dumpling, fried wonton, and your choice of steamed white, brown rice or fried rice. Chowmein or veggies for an additional cost."
          items={LUNCH}
        />
        <MenuSection title="Noodle Lunch" note="Rice not included w/ noodles" items={NOODLE_LUNCH} />
      </div>
      <div id="appetizers"><MenuSection title="Appetizers" items={APPETIZERS} /></div>
      <div id="soup"><MenuSection title="Soup" items={SOUP} /></div>
      <div id="salad"><MenuSection title="Salad" items={SALAD} /></div>
      <div id="entr-es"><MenuSection title="Entrées" items={ENTREES} /></div>
      <div id="noodles--rice"><MenuSection title="Noodles & Rice Dishes" items={NOODLES} /></div>
      <div id="curry"><MenuSection title="Curry" items={CURRY} /></div>
      <div id="special"><MenuSection title="Special Menu" note="Cajun Seafood Boil sides: Corn $3 / Sausage $5 / Potato $3" items={SPECIAL} /></div>
      <div id="sides"><MenuSection title="Side Orders" items={SIDES} /></div>
      <div id="dessert"><MenuSection title="Dessert" items={DESSERT} /></div>
    </main>
  );
}
