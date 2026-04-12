"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import { Beer, Martini, Wine, Flame, Zap } from "lucide-react";
import { useHoursStatus } from "@/hooks/useHoursStatus";
import Breadcrumbs from "@/components/Breadcrumbs";

const COCKTAILS = [
  { name: "Lycheetini",                 price: "$14", tag: "Signature", image: "/images/lycheetini.png" },
  { name: "Southern Lemonade",          price: "$13" },
  { name: "Gra Pow Mule",               price: "$13", tag: "Thai Twist", image: "/images/grapow-mule.png" },
  { name: "House Old Fashioned",        price: "$15", tag: "Classic" },
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

const DRAFT_BEER = [
  { name: "Corona Light",  price: "16oz $6 / 24oz $8" },
  { name: "805 Blonde Ale", price: "16oz $7 / 24oz $9" },
  { name: "Modelo Especial", price: "16oz $6 / 24oz $8" },
  { name: "Mango Cart",    price: "16oz $7 / 24oz $9" },
  { name: "Michelob Ultra",price: "16oz $6 / 24oz $8" },
  { name: "Kirin Ichiban",  price: "16oz $6 / 24oz $8" },
  { name: "Bud Light",     price: "16oz $6 / 24oz $8" },
  { name: "Vista Haze IPA",price: "16oz $5 / 24oz $7" },
  { name: "Dos Equis",     price: "16oz $6 / 24oz $8" },
  { name: "Guinness",      price: "16oz $7 / 24oz $9" },
  { name: "Twisted Tea",   price: "16oz $6 / 24oz $8" },
  { name: "Kona Big Wave", price: "16oz $7 / 24oz $9" },
];

const SPIRITS = [
  { label: "Vodka", val: "Absolut, Grey Goose, Ketel One, Tito's, White Rhino" },
  { label: "Gin",   val: "Bombay Sapphire, Hendricks, Malfy Pink Grapefruit, Tanqueray" },
  { label: "Tequila", val: "Casamigos, Don Julio (all), Lalo, Clase Azul, Herradura" },
  { label: "Whiskey", val: "Buffalo Trace, Jack Daniel's, Jameson, Maker's Mark" },
  { label: "Scotch", val: "Johnnie Walker Black, McCallan 12y" },
  { label: "Cognac", val: "Grand Marnier, Hennessy VS" },
];

export default function DrinksMenu() {
  const { status, isOpen } = useHoursStatus();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Hero Header */}
      <section className="relative pt-32 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent -z-10" />
        <div className="max-w-screen-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6 flex justify-center">
              <Breadcrumbs />
            </div>
            <h1 className="font-[family-name:var(--font-dancing)] text-7xl md:text-9xl text-white mb-6">
              The Bar
            </h1>
            <div className="flex flex-wrap justify-center gap-6 text-white/50 font-[family-name:var(--font-baskerville)] text-xs tracking-widest uppercase mb-10">
              <span>Signature Cocktails</span>
              <span className="text-gold">•</span>
              <span>Local Drafts</span>
              <span className="text-gold">•</span>
              <span>Premium Spirits</span>
            </div>

            <div className="flex justify-center">
              <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-full flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-[10px] tracking-widest uppercase font-medium">{status}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Sub-Nav */}
      <nav className="sticky top-20 z-40 bg-[#050505]/80 backdrop-blur-xl border-y border-white/5 py-4">
        <div className="max-w-screen-xl mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex justify-center gap-8 min-w-max">
            {[
              { id: "cocktails", label: "Cocktails", icon: <Martini className="w-4 h-4" /> },
              { id: "draft", label: "Draft Beer", icon: <Beer className="w-4 h-4" /> },
              { id: "shots", label: "Shots", icon: <Flame className="w-4 h-4" /> },
              { id: "wine", label: "Wine", icon: <Wine className="w-4 h-4" /> },
              { id: "spirits", label: "Spirits", icon: <Martini className="w-4 h-4" /> },
            ].map((item) => (
              <a 
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-medium text-white/60 hover:text-gold transition-colors"
              >
                {item.icon} {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section className="max-w-screen-xl mx-auto px-6 py-24 space-y-32">
        
        {/* Signature Cocktails Grid */}
        <div id="cocktails" className="scroll-mt-40">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="font-[family-name:var(--font-dancing)] text-5xl">Signature Drinks</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COCKTAILS.map((drink, idx) => (
              <motion.div
                key={drink.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-1 rounded-[2rem] bg-white/5 border border-white/10 hover:border-gold/50 transition-all duration-500 overflow-hidden"
              >
                {drink.image && (
                  <div className="relative aspect-[4/3] rounded-[1.75rem] overflow-hidden mb-6">
                    <Image 
                      src={drink.image} 
                      alt={drink.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {drink.tag && (
                      <span className="absolute top-4 left-4 bg-gold text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {drink.tag}
                      </span>
                    )}
                  </div>
                )}
                <div className="p-6 pt-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-[family-name:var(--font-baskerville)] text-xl group-hover:text-gold transition-colors">
                      {drink.name}
                    </h3>
                    <span className="text-gold font-medium">{drink.price}</span>
                  </div>
                  {!drink.image && drink.tag && (
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-white/30">{drink.tag}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Draft List */}
        <div id="draft" className="scroll-mt-40">
          <div className="grid lg:grid-cols-3 gap-16 items-start">
            <div className="lg:col-span-1">
              <h2 className="font-[family-name:var(--font-dancing)] text-6xl mb-6">Ice Cold Drafts</h2>
              <p className="font-[family-name:var(--font-baskerville)] text-white/40 leading-relaxed mb-8">
                Rotating local selections and global favorites. Ask your bartender about our seasonal taps.
              </p>
              <div className="p-8 rounded-3xl bg-gold/5 border border-gold/20">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-gold" />
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-gold">Happy Hour Special</span>
                </div>
                <p className="text-sm font-[family-name:var(--font-baskerville)] text-white/80">
                  Enjoy $2 off all Draft Beers during Happy Hour, daily from 3:00 PM – 6:00 PM.
                </p>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-[3rem] p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {DRAFT_BEER.map((beer) => (
                  <div key={beer.name} className="flex justify-between items-start group">
                    <h4 className="font-[family-name:var(--font-baskerville)] text-lg group-hover:text-gold transition-colors">
                      {beer.name}
                    </h4>
                    <span className="text-xs text-white/30 text-right font-medium whitespace-nowrap pt-1">
                      {beer.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Spirits Section */}
        <div id="spirits" className="scroll-mt-40 bg-white/5 border border-white/10 rounded-[4rem] p-12 md:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-[100px] -z-10" />
          <h2 className="font-[family-name:var(--font-dancing)] text-5xl mb-16 text-center">Spirits Library</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
            {SPIRITS.map((cat) => (
              <div key={cat.label}>
                <h3 className="font-[family-name:var(--font-baskerville)] text-xs tracking-[0.3em] uppercase text-gold mb-6 pb-2 border-b border-white/10">
                  {cat.label}
                </h3>
                <p className="text-sm text-white/40 leading-loose uppercase tracking-wider font-light">
                  {cat.val}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-screen-md mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-dancing)] text-5xl mb-8">Ready for a round?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/reservations" className="btn-gold">Book a Table</Link>
            <Link href="/menu/food" className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors font-medium text-sm tracking-widest uppercase">View Food Menu</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
