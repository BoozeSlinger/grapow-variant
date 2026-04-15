"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Flame, Star, Leaf, Clock, ArrowRight } from "lucide-react";
import { useHoursStatus } from "@/hooks/useHoursStatus";
import Breadcrumbs from "@/components/Breadcrumbs";
import ScrollReveal from "@/components/ScrollReveal";
import { cldImage, ASSETS } from "@/lib/cloudinary";
import Magnetic from "@/components/Magnetic";

const CATEGORIES = [
  { id: "lunch", label: "Lunch Specials" },
  { id: "appetizers", label: "Appetizers" },
  { id: "soup-salad", label: "Soups & Salads" },
  { id: "entrees", label: "Entrées" },
  { id: "noddles-rice", label: "Noodles & Rice" },
  { id: "curry", label: "Curry" },
  { id: "special", label: "Specials" },
  { id: "dessert", label: "Dessert" },
];

const SIGNATURES = [
  { 
    name: "Pad Gra Pow", 
    price: "$22", 
    desc: "A bold, savory stir-fry with holy basil, garlic, and fresh chilies. Served with jasmine rice and a crispy fried egg.",
    image: "/images/pad-gra-pow.png",
    spicy: 3,
    featured: true 
  },
  {
    name: "Crying Tiger Steak",
    price: "$30",
    desc: "Tender New York Steak, grilled to perfection and sliced. Served with our signature 'Jaew' spicy dipping sauce.",
    spicy: 2,
    featured: true
  }
];

const LUNCH = [
  { name: "Cashew Chicken", price: "$18" },
  { name: "Orange Chicken", price: "$18", popular: true },
  { name: "B.B.Q. Chicken, Beef or Pork", price: "$18" },
  { name: "Gra/Pow Chicken or Beef", price: "$18", spicy: 3 },
  { name: "Yellow Curry Chicken", price: "$18", spicy: 1 },
  { name: "Red Curry Beef", price: "$18", spicy: 2 },
  { name: "Eggplant & Tofu", price: "$18", veggie: true },
  { name: "Salmon with Teriyaki Sauce", price: "$22" },
];

const APPETIZERS = [
  { name: "Egg Rolls (5)", price: "$12", veggie: true },
  { name: "Fresh Spring Roll", price: "$15", veggie: true },
  { name: "Dumplings (10)", price: "$14" },
  { name: "Fantastic Four", price: "$23", desc: "A sampler of our most popular starters." },
  { name: "Deep Fried Calamari", price: "$17" },
  { name: "Thai Tacos (3)", price: "$14", spicy: 1 },
  { name: "Edamame — Spicy Garlic", price: "$11", spicy: 2, veggie: true },
];

export default function FoodMenu() {
  const { status, isOpen } = useHoursStatus();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* ── Premium Hero Section ─────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0">
          <Image
            src={cldImage(ASSETS.foodBg || "grapow/interior-wide")}
            alt="Thai Culinary Artistry"
            fill
            className="object-cover scale-105 animate-pan"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="mb-8 flex justify-center">
              <Breadcrumbs />
            </div>

            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border border-white/10 mb-8 overflow-hidden group">
              <div className="absolute inset-0 bg-gold/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-400" : "bg-red-400"} shadow-[0_0_10px_rgba(52,211,153,0.5)]`} />
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-white/80">{status}</span>
            </div>
            
            <h1 className="font-[family-name:var(--font-dancing)] text-8xl md:text-[12rem] text-white mb-6 drop-shadow-2xl leading-tight">
              Food Menu
            </h1>
            
            <p className="font-[family-name:var(--font-baskerville)] text-white/60 text-sm md:text-base tracking-[0.3em] uppercase max-w-2xl mx-auto leading-relaxed italic">
              Authentic Thai flavors meets modern culinary artistry.
            </p>
          </motion.div>
        </div>
        
        {/* Animated scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">Scroll to Explore</span>
          <div className="w-px h-16 bg-gradient-to-b from-gold/50 to-transparent relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 64] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-white"
            />
          </div>
        </motion.div>
      </section>

      {/* Signature Showcase */}
      <section className="max-w-screen-xl mx-auto px-6 py-20">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-12">
            <Star className="text-gold w-5 h-5 fill-gold" />
            <h2 className="font-[family-name:var(--font-dancing)] text-4xl">Chef's Signature</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {SIGNATURES.map((dish, i) => (
            <ScrollReveal key={dish.name} delay={i * 0.1}>
              <div className="relative group overflow-hidden rounded-[3rem] bg-white/5 border border-white/10 p-2">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {dish.image && (
                    <div className="relative w-full md:w-1/2 aspect-square rounded-[2.5rem] overflow-hidden">
                      <Image 
                        src={dish.image} 
                        alt={dish.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className={`p-8 ${dish.image ? 'md:w-1/2' : 'w-full'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      {Array.from({ length: dish.spicy || 0 }).map((_, i) => (
                        <Flame key={i} className="w-4 h-4 text-orange-500 fill-orange-500" />
                      ))}
                    </div>
                    <h3 className="font-[family-name:var(--font-baskerville)] text-3xl mb-4 group-hover:text-gold transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-6">
                      {dish.desc}
                    </p>
                    <span className="text-2xl text-gold font-light">{dish.price}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-16">
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-32 space-y-2">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-bold mb-6 px-4">Categories</p>
            {CATEGORIES.map((cat, i) => (
              <motion.a 
                key={cat.id}
                href={`#${cat.id}`}
                whileHover={{ x: 8, color: "var(--gold)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.05 }}
                className="block px-4 py-3 rounded-2xl text-[10px] tracking-widest uppercase font-bold text-white/40 hover:bg-white/5 transition-all outline-none focus-visible:ring-1 ring-gold"
              >
                {cat.label}
              </motion.a>
            ))}
          </div>
        </aside>

        {/* Menu Sections */}
        <div className="flex-1 space-y-32">
          
          <div id="lunch" className="scroll-mt-40">
            <ScrollReveal>
              <SectionHeader title="Lunch Specials" note="Served daily until 3:00 p.m. Served with salad, chicken dumpling, and rice." />
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {LUNCH.map((item, i) => (
                <MenuItem key={item.name} {...item} index={i} />
              ))}
            </div>
          </div>

          <div id="appetizers" className="scroll-mt-40">
            <ScrollReveal>
              <SectionHeader title="Appetizers" />
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {APPETIZERS.map((item, i) => (
                <MenuItem key={item.name} {...item} index={i} />
              ))}
            </div>
          </div>

          {/* More sections can be added here with the same pattern */}
          <ScrollReveal>
            <div className="p-12 md:p-24 rounded-[4rem] bg-zinc-900 border border-white/5 text-center relative overflow-hidden group">
              <div className="relative z-10 max-w-2xl mx-auto">
                <h3 className="font-[family-name:var(--font-dancing)] text-6xl md:text-8xl mb-8 text-white">Join the Table</h3>
                <p className="font-[family-name:var(--font-baskerville)] text-lg md:text-xl tracking-wide mb-14 text-white/50 leading-relaxed italic">
                  An unforgettable fusion of Thai heritage and modern culinary innovation awaits in Mission Grove.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-10">
                  <Magnetic strength={0.2}>
                    <motion.button 
                      onClick={() => window.dispatchEvent(new CustomEvent("open-reservation"))}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-gold px-12 py-6 text-[10px] font-black tracking-[0.4em] uppercase"
                    >
                      BOOK YOUR TABLE
                    </motion.button>
                  </Magnetic>
                  
                  <Magnetic strength={0.2}>
                    <Link href="/menu/drinks">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-outline px-12 py-6 text-[10px] font-black tracking-[0.4em] uppercase border-white/10 hover:border-gold"
                      >
                        EXPLORE THE BAR
                      </motion.button>
                    </Link>
                  </Magnetic>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent opacity-50" />
            </div>
          </ScrollReveal>

        </div>
      </div>
    </main>
  );
}

function SectionHeader({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-14 relative">
      <h2 className="font-[family-name:var(--font-dancing)] text-5xl md:text-6xl mb-6">{title}</h2>
      {note && (
        <div className="flex items-start gap-2.5 text-white/40 italic max-w-md">
          <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gold/50" />
          <p className="text-[11px] leading-relaxed tracking-wide">{note}</p>
        </div>
      )}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-12 bg-gold/20 rounded-full" />
    </div>
  );
}

function MenuItem({ name, price, desc, popular, spicy, veggie, index }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: (index % 4) * 0.1 }}
      className="group py-5 border-b border-white/5 hover:border-gold/20 transition-all duration-500"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-[family-name:var(--font-baskerville)] text-lg md:text-xl group-hover:text-gold transition-colors leading-tight italic">
              {name}
            </h4>
            <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              {popular && <Star className="w-3.5 h-3.5 text-gold fill-gold" />}
              {veggie && <Leaf className="w-3.5 h-3.5 text-green-500 fill-green-500" />}
              {Array.from({ length: spicy || 0 }).map((_, i) => (
                <Flame key={i} className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              ))}
            </div>
          </div>
          {desc && (
            <p className="text-[11px] text-white/30 font-light leading-relaxed max-w-sm group-hover:text-white/50 transition-colors">
              {desc}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-gold font-bold text-lg">{price}</span>
          <ArrowRight className="w-3 h-3 text-gold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}
