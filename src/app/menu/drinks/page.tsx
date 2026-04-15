"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import { Beer, Martini, Wine, Flame, Zap } from "lucide-react";
import { useHoursStatus } from "@/hooks/useHoursStatus";
import { cldImage, ASSETS } from "@/lib/cloudinary";
import Breadcrumbs from "@/components/Breadcrumbs";
import ScrollReveal from "@/components/ScrollReveal";

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
      {/* ── Premium Hero Section ─────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={cldImage(ASSETS.drinksBg)} 
            alt="Gra Pow Bar Interior" 
            fill 
            className="object-cover scale-105 animate-pan opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#050505] z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-10" />
        </div>

        <div className="relative z-20 max-w-screen-xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="mb-8 flex justify-center">
              <Breadcrumbs />
            </div>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass border border-white/10 mb-8 overflow-hidden group">
              <div className="absolute inset-0 bg-gold/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? "bg-emerald-400" : "bg-red-400"} shadow-[0_0_12px_rgba(52,211,153,0.6)]`} />
              <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-white/90">{status}</span>
            </div>
            
            <h1 className="font-[family-name:var(--font-dancing)] text-8xl md:text-[11rem] text-white mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-none">
              The Bar
            </h1>

            <div className="flex flex-wrap justify-center gap-8 text-white/60 font-[family-name:var(--font-baskerville)] text-xs md:text-sm tracking-[0.4em] uppercase italic">
              <span className="hover:text-gold transition-colors cursor-default">Signature Cocktails</span>
              <span className="text-gold/40">•</span>
              <span className="hover:text-gold transition-colors cursor-default">Local Drafts</span>
              <span className="text-gold/40">•</span>
              <span className="hover:text-gold transition-colors cursor-default">Premium Spirits</span>
            </div>
          </motion.div>
        </div>
        
        {/* Animated scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="w-px h-20 bg-gradient-to-b from-gold/50 to-transparent relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 80] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/3 bg-white"
            />
          </div>
        </motion.div>
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
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <p className="text-gold/60 text-[10px] tracking-[0.4em] uppercase mb-4 font-bold">House Specialties</p>
                <h2 className="font-[family-name:var(--font-dancing)] text-5xl md:text-7xl">Signature Drinks</h2>
              </div>
              <div className="h-px flex-1 bg-white/5 mx-8 mb-4 hidden md:block" />
              <p className="font-[family-name:var(--font-baskerville)] text-white/30 italic text-sm md:text-base max-w-xs mb-2">
                Expertly crafted with fresh botanicals and premium spirits.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {COCKTAILS.map((drink, idx) => (
              <motion.div 
                key={drink.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (idx % 3) * 0.12 }}
                className="group p-1.5 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-white/[0.08] transition-all duration-700 overflow-hidden cursor-none"
              >
                {drink.image && (
                  <div className="relative aspect-[1/1] rounded-[2.2rem] overflow-hidden mb-6">
                    <Image 
                      src={drink.image} 
                      alt={drink.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    {drink.tag && (
                      <div className="absolute top-5 left-5 bg-gold/90 backdrop-blur-md text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                        {drink.tag}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-7 pt-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-[family-name:var(--font-baskerville)] text-2xl group-hover:text-gold transition-colors leading-tight italic">
                        {drink.name}
                      </h3>
                      {!drink.image && drink.tag && (
                        <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold">{drink.tag}</p>
                      )}
                    </div>
                    <span className="text-gold font-bold text-xl">{drink.price}</span>
                  </div>
                  <div className="mt-6 h-px w-0 group-hover:w-full bg-gold/20 transition-all duration-700" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Draft List */}
        <div id="draft" className="scroll-mt-40">
          <div className="grid lg:grid-cols-3 gap-16 items-start">
            <div className="lg:col-span-1 lg:sticky lg:top-40">
              <ScrollReveal>
                <p className="text-gold/60 text-[10px] tracking-[0.4em] uppercase mb-4 font-bold">On Tap</p>
                <h2 className="font-[family-name:var(--font-dancing)] text-6xl md:text-7xl mb-8 text-balance">Ice Cold Drafts</h2>
                <p className="font-[family-name:var(--font-baskerville)] text-white/40 leading-loose mb-10 italic text-lg">
                  Rotating local selections and global favorites, poured to perfection.
                </p>
                <motion.div 
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="p-10 rounded-[2.5rem] bg-gold text-black overflow-hidden relative group cursor-pointer"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-5 h-5 fill-black" />
                      <span className="text-[10px] tracking-[0.3em] uppercase font-black">Happy Hour</span>
                    </div>
                    <p className="text-sm font-[family-name:var(--font-baskerville)] font-medium leading-relaxed">
                      Enjoy <span className="text-xl font-black italic">$2 OFF</span> all Draft Beers during Happy Hour, daily from 3:00 PM – 6:00 PM.
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 blur-[50px] -z-0 translate-x-1/2 -translate-y-1/2" />
                </motion.div>
              </ScrollReveal>
            </div>
            
            <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-[3.5rem] p-8 md:p-16 relative overflow-hidden group">
              {/* Decorative grain/glow */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.png')] opacity-20" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 relative z-10">
                {DRAFT_BEER.map((beer, i) => (
                  <motion.div 
                    key={beer.name} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 8) * 0.05 }}
                    className="flex justify-between items-start group/item pb-4 border-b border-white/5 hover:border-gold/30 transition-all duration-500"
                  >
                    <div className="flex flex-col gap-1">
                      <h4 className="font-[family-name:var(--font-baskerville)] text-xl group-hover/item:text-gold transition-colors italic">
                        {beer.name}
                      </h4>
                      <div className="w-0 group-hover/item:w-12 h-[1px] bg-gold/40 transition-all duration-500" />
                    </div>
                    <span className="text-[11px] text-white/30 text-right font-bold tracking-widest whitespace-nowrap pt-2 group-hover/item:text-gold/80 transition-colors">
                      {beer.price}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Spirits Section */}
        <ScrollReveal>
          <div id="spirits" className="scroll-mt-40 bg-white/5 border border-white/10 rounded-[4rem] p-12 md:p-24 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-gold/5 via-transparent to-white/[0.02] -z-10" />
            <div className="absolute -top-20 -right-20 w-[40rem] h-[40rem] bg-gold/[0.03] blur-[120px] rounded-full -z-10 animate-pulse" />
            
            <div className="text-center mb-20">
              <p className="text-gold/60 text-[10px] tracking-[0.5em] uppercase mb-4 font-black">Top Shelf Selection</p>
              <h2 className="font-[family-name:var(--font-dancing)] text-6xl md:text-8xl mb-6">Spirits Library</h2>
              <div className="w-24 h-px bg-gold/30 mx-auto" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-16">
              {SPIRITS.map((cat, i) => (
                <motion.div 
                  key={cat.label} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group/cat"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="font-[family-name:var(--font-baskerville)] text-[11px] tracking-[0.4em] uppercase text-gold/80 font-black whitespace-nowrap">
                      {cat.label}
                    </h3>
                    <div className="h-px flex-1 bg-white/10 group-hover/cat:bg-gold/30 transition-colors" />
                  </div>
                  <p className="text-[11px] text-white/40 leading-[2.2] uppercase tracking-[0.15em] font-medium group-hover/cat:text-white/70 transition-colors">
                    {cat.val}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

      </section>

      {/* CTA Section */}
      <section className="py-40 border-t border-white/5 relative overflow-hidden bg-[#080808]">
        {/* Animated Background Text */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
          <h2 className="font-[family-name:var(--font-dancing)] text-[30vw] whitespace-nowrap">Cheers Riverside</h2>
        </div>

        <div className="max-w-screen-md mx-auto px-6 text-center relative z-10">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-dancing)] text-6xl md:text-8xl mb-12">Ready for a round?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/reservations" className="block">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(232,160,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto btn-gold !px-14 !py-5 text-xs font-black"
                >
                  BOOK A TABLE
                </motion.button>
              </Link>
              <Link href="/menu/food" className="block">
                <motion.button 
                  whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-14 py-5 rounded-full border border-white/10 font-bold text-[10px] tracking-[0.3em] uppercase transition-all"
                >
                  FOOD MENU
                </motion.button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
