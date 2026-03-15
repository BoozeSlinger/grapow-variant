import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Drinks Menu | Gra Pow" };

const COCKTAILS = [
  { name: "Lycheetini",                 price: "$14" },
  { name: "Southern Lemonade",          price: "$13" },
  { name: "Gra Pow Mule",               price: "$13" },
  { name: "Gra Pow's House Old Fashioned", price: "$15" },
  { name: "Pink Grapefruit Negroni Spritzer", price: "$13" },
  { name: "Grapowrita",                 price: "$11" },
  { name: "Love You Long Time",         price: "$12" },
  { name: "Purple Rain",                price: "$12" },
  { name: "Are You Tajin To Me",        price: "$13" },
];
const SHOTS = [
  { name: "Green Tea",       price: "$10" },
  { name: "Mexican Candy",   price: "$10" },
  { name: "Pink Candy",      price: "$10" },
  { name: "Liquid Marijuana",price: "$10" },
  { name: "Cactus Cooler",   price: "$10" },
];
const BOTTLED_BEER = [
  { name: "Corona",       price: "$6" }, { name: "Corona Light",  price: "$6" },
  { name: "Modelo",       price: "$6" }, { name: "Michelob Ultra",price: "$6" },
  { name: "Miller Lite",  price: "$6" }, { name: "Bud Light",     price: "$6" },
  { name: "Coors Light",  price: "$6" }, { name: "Heineken",      price: "$7" },
  { name: "Blue Moon",    price: "$7" }, { name: "Angry Orchard", price: "$8" },
  { name: "High Noon",    price: "$8" }, { name: "White Claws",   price: "$8" },
  { name: "Happy Dad",    price: "$8" }, { name: "Lucky Buddha",  price: "$7" },
  { name: "Estrella Jalisco", price: "$6" }, { name: "O'douls (NA)", price: "$5" },
];
const DRAFT_BEER = [
  { name: "Corona Light",  price: "16oz $6 / 24oz $8" },
  { name: "805",           price: "16oz $7 / 24oz $9" },
  { name: "Modelo",        price: "16oz $6 / 24oz $8" },
  { name: "Mango Cart",    price: "16oz $7 / 24oz $9" },
  { name: "Michelob Ultra",price: "16oz $6 / 24oz $8" },
  { name: "Kirin",         price: "16oz $6 / 24oz $8" },
  { name: "Bud Light",     price: "16oz $6 / 24oz $8" },
  { name: "Vista Haze IPA",price: "16oz $5 / 24oz $7" },
  { name: "Dos Equis",     price: "16oz $6 / 24oz $8" },
  { name: "Guinness",      price: "16oz $7 / 24oz $9" },
  { name: "Twisted Tea",   price: "16oz $6 / 24oz $8" },
  { name: "Kona Big Wave", price: "16oz $7 / 24oz $9" },
  { name: "Hangar 24 Orange Wheat", price: "16oz $7 / 24oz $9" },
  { name: "Red Trolley",   price: "16oz $7 / 24oz $9" },
  { name: "Stella Artois", price: "16oz $7 / 24oz $9" },
];
const WINE = [
  { name: "Charles Smith Kung Fu Girl Riesling, WA", price: "Glass $10 / Bottle $30" },
  { name: "Oyster Bay Sauvignon Blanc, NZ",          price: "Glass $10 / Bottle $30" },
  { name: "Kenwood Yulupa Chardonnay, Sonoma",       price: "Glass $10 / Bottle $30" },
  { name: "Lincourt Chardonnay",                     price: "Glass $10 / Bottle $30" },
  { name: "Castle Rock Pinot Noir, CA",              price: "Glass $10 / Bottle $30" },
  { name: "Meiomi Red Blend, CA",                    price: "Glass $12 / Bottle $32" },
  { name: "Trouble Maker Red Blend, Paso Robles",    price: "Glass $12 / Bottle $32" },
  { name: "Woodbridge by Robert Mondavi",            price: "$6 Glass — Chard, SB, PN, PG, Moscato, Cab, Merlot" },
];

function Section({ title, note, items }: { title: string; note?: string; items: { name: string; price: string }[] }) {
  return (
    <div className="menu-category mb-10">
      <h3 className="font-[family-name:var(--font-dancing)]">{title}</h3>
      {note && <p className="text-gray-500 text-xs italic mb-4">{note}</p>}
      {items.map((i) => (
        <div key={i.name} className="menu-item">
          <p className="menu-item-name font-[family-name:var(--font-baskerville)]">{i.name}</p>
          <span className="menu-item-price font-[family-name:var(--font-baskerville)]">{i.price}</span>
        </div>
      ))}
    </div>
  );
}

export default function DrinksMenu() {
  return (
    <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
      <div className="mb-14 text-center">
        <Link href="/" className="font-[family-name:var(--font-baskerville)] text-[#E8A000] text-xs tracking-widest uppercase hover:text-[#F5BC30] transition-colors">
          ← Back to Home
        </Link>
        <h1 className="font-[family-name:var(--font-dancing)] text-6xl md:text-7xl text-white mt-6">Drinks</h1>
        <p className="font-[family-name:var(--font-baskerville)] text-gray-400 text-sm tracking-widest mt-3 uppercase">
          Cocktails · Beer · Wine · Spirits
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-14">
        {["Cocktails", "Shots", "Draft Beer", "Bottled Beer", "Wine"].map((s) => (
          <a key={s} href={`#${s.toLowerCase().replace(/\s+/g,"-")}`}
             className="font-[family-name:var(--font-baskerville)] border border-[rgba(232,160,0,0.3)] text-[#E8A000] text-xs px-4 py-2 tracking-widest hover:border-[#E8A000] transition-colors">
            {s}
          </a>
        ))}
      </div>

      <div id="cocktails"><Section title="Cocktails" items={COCKTAILS} /></div>
      <div id="shots"><Section title="Shots" items={SHOTS} /></div>
      <div id="draft-beer"><Section title="Draft Beer" items={DRAFT_BEER} /></div>
      <div id="bottled-beer"><Section title="Bottled Beer" items={BOTTLED_BEER} /></div>
      <div id="wine"><Section title="Wine" items={WINE} /></div>

      {/* Spirits — text block since it's a long paragraph */}
      <div className="menu-category mt-4">
        <h3 className="font-[family-name:var(--font-dancing)]">Spirits</h3>
        {[
          { label: "Vodka", val: "Absolut (all variants), Grey Goose, Ketel One, Ketel One Botanical, Tito's, White Rhino" },
          { label: "Gin",   val: "Bombay Sapphire, Hendricks, Malfy Pink Grapefruit, Tanqueray" },
          { label: "Tequila", val: "Casamigos, Cazadores, Don Julio (Blanco/Repo/Añejo/70th), Hornitos, Maestro Dobel, Olmeca Altos, Patrón, Lalo, Clase Azul, Herradura" },
          { label: "Rum",   val: "Bacardi Superior, Captain Morgan, Malibu Coconut, Myers's" },
          { label: "Whiskey/Bourbon", val: "Beams 8 Star, Buffalo Trace, Crown Royal, Fireball, Gentlemen Jack, Jack Daniel's, Jameson, Jefferson's Bourbon, Maker's Mark, Seagram's 7, Skrewball Peanut Butter" },
          { label: "Scotch", val: "Johnnie Walker Black Label, McCallan 12y" },
          { label: "Cognac", val: "Grand Marnier, Hennessy VS" },
          { label: "Misc",   val: "Baileys, Chambord, Frangelico, Jägermeister, Kahlúa, Midori, RumChata, Rumple Mintz, Soho Lychee, X Rated Fusion" },
        ].map((s) => (
          <div key={s.label} className="menu-item items-start gap-4">
            <div>
              <p className="menu-item-name font-[family-name:var(--font-baskerville)]">{s.label}</p>
              <p className="menu-item-desc">{s.val}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
