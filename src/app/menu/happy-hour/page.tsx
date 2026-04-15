"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Beer, Martini, Utensils, Clock, Zap } from "lucide-react";
import { useHoursStatus } from "@/hooks/useHoursStatus";
import { cldImage, ASSETS } from "@/lib/cloudinary";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import ScrollReveal from "@/components/ScrollReveal";

const APPS = [
  { name: "Eggrolls",           desc: "5 vegetable egg rolls served with sweet & sour sauce",    price: "$8" },
  { name: "Cream Cheese Wontons",desc:"6 pineapple cream cheese wontons with sweet & sour sauce", price: "$8" },
  { name: "Dragon Wings",       desc: "6 bone-in wings tossed in our signature dragon sauce",       price: "$8" },
  { name: "Spicy Cheese Balls", desc: "7 spicy cheese balls with sweet & sour and spicy mayo", price: "$8" },
  { name: "French Fries",       desc: "Regular or Sweet Potato — (+$2 Garlic Fries)", price: "$8" },
  { name: "Edamame",            desc: "Regular with sea salt or Spicy Garlic",                      price: "$8" },
];

const DRINKS = [
  { name: "$2 Off All Beers",       desc: "16oz & 24oz drafts — Rotating local selections",   price: "−$2" },
  { name: "House Wines",            desc: "Cabernet, Chardonnay, or Merlot",                    price: "$5" },
  { name: "Happy Dad & Nutrl",      desc: "Hard seltzers and vodka seltzers",                   price: "$5" },
  { name: "Well Drinks",            desc: "House spirits with mixer",                           price: "$5" },
  { name: "Herradura Tequila",      desc: "Premium silver tequila",                            price: "$7" },
  { name: "Absolut Vodka",          desc: "Original or flavors",                                price: "$7" },
  { name: "Fireball",               desc: "Cinnamon whiskey shot",                              price: "$8" },
];

export default function HappyHourMenu() {
  const { status, isOpen } = useHoursStatus();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* ── Premium Hero Section ─────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={cldImage(ASSETS.barBg)} 
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

            <h1 className="font-[family-name:var(--font-dancing)] text-8xl md:text-[11rem] text-white mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-none">
              Happy Hour
            </h1>

            <p className="font-[family-name:var(--font-baskerville)] text-white/70 text-sm md:text-base tracking-[0.4em] uppercase mb-12 italic leading-relaxed">
              Everyday 3PM – 6PM &bull; Late Night 9PM – 12AM
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-8 py-4 rounded-full flex items-center gap-4 transition-all hover:bg-black/60 hover:border-gold/30 gold-glow">
                <Clock className="w-4 h-4 text-gold" />
                <span className="text-[11px] tracking-[0.2em] uppercase font-bold text-white/90">3:00 PM – 6:00 PM</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-8 py-4 rounded-full flex items-center gap-4 transition-all hover:bg-black/60 hover:border-gold/30">
                <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? "bg-emerald-400 shadow-[0_0_12px_#34d399]" : "bg-red-400 shadow-[0_0_12px_#f87171]"}`} />
                <span className="text-[11px] tracking-[0.2em] uppercase font-bold text-white/90">{status}</span>
              </div>
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

      <section className="max-w-screen-xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Appetizers Section */}
          <ScrollReveal>
             <div className="flex items-center gap-4 mb-10">
               <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                 <Utensils className="w-6 h-6 text-gold" />
               </div>
               <h2 className="font-[family-name:var(--font-dancing)] text-4xl text-white">Social Bites</h2>
             </div>

             <div className="grid sm:grid-cols-1 gap-6">
               {APPS.map((item, idx) => (
                 <div 
                   key={item.name}
                   className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-gold/30 hover:bg-gold/[0.02] transition-all duration-300"
                 >
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="font-[family-name:var(--font-baskerville)] text-xl group-hover:text-gold transition-colors">{item.name}</h3>
                     <span className="text-gold font-medium">{item.price}</span>
                   </div>
                   <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed italic">{item.desc}</p>
                 </div>
               ))}
             </div>
          </ScrollReveal>

          {/* Drinks Section */}
          <ScrollReveal delay={0.2}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                <Martini className="w-6 h-6 text-gold" />
              </div>
              <h2 className="font-[family-name:var(--font-dancing)] text-4xl text-white">Liquid Therapy</h2>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] -z-10" />
              <div className="space-y-8">
                {DRINKS.map((item) => (
                  <div 
                    key={item.name}
                    className="flex justify-between items-center group cursor-default"
                  >
                    <div>
                      <h4 className="font-[family-name:var(--font-baskerville)] text-lg group-hover:text-gold transition-all duration-300">{item.name}</h4>
                      {item.desc && <p className="text-white/30 text-[10px] uppercase tracking-wider italic">{item.desc}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-px w-8 bg-white/10 group-hover:w-12 transition-all duration-300" />
                      <span className="text-gold font-medium">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-12 border-t border-white/5 flex items-start gap-4 text-white/30 italic">
                <Zap className="w-5 h-5 flex-shrink-0 text-gold/50 animate-pulse" />
                <p className="text-xs leading-relaxed">
                  Late Night Drink Specials available daily from 9:00 PM – 12:00 AM. Prices and availability subject to change. Please drink responsibly.
                </p>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/5 bg-[#080808]">
        <div className="max-w-screen-md mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-dancing)] text-5xl mb-6">Planning a Group?</h2>
          <p className="font-[family-name:var(--font-baskerville)] text-lg text-white/50 mb-10 leading-relaxed">
            Our spacious bar and patio areas are perfect for after-work drinks or birthday celebrations.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-reservation", { detail: { type: 'event' } }))}
            className="btn-gold inline-flex items-center gap-2 group"
          >
            Inquire About Events <Clock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </section>
    </main>
  );
}
