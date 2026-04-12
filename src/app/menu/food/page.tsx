"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Flame, Star, Leaf, Clock, ArrowRight } from "lucide-react";
import { useHoursStatus } from "@/hooks/useHoursStatus";
import Breadcrumbs from "@/components/Breadcrumbs";

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
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/10 to-transparent -z-10" />
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6 flex justify-center">
              <Breadcrumbs />
            </div>
            <h1 className="font-[family-name:var(--font-dancing)] text-7xl md:text-9xl text-white mb-6">
              Menu
            </h1>
            <p className="font-[family-name:var(--font-baskerville)] text-white/50 text-xs tracking-[0.4em] uppercase max-w-2xl mx-auto leading-loose mb-10">
              Authentic Thai flavors meets modern culinary artistry. Every dish is a journey through the streets of Bangkok.
            </p>

            <div className="flex justify-center">
              <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-full flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-[10px] tracking-widest uppercase font-medium">{status}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Signature Showcase */}
      <section className="max-w-screen-xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-12">
          <Star className="text-gold w-5 h-5 fill-gold" />
          <h2 className="font-[family-name:var(--font-dancing)] text-4xl">Chef's Signature</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {SIGNATURES.map((dish) => (
            <motion.div
              key={dish.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden rounded-[3rem] bg-white/5 border border-white/10 p-2"
            >
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
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-16">
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-32 space-y-2">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-bold mb-6 px-4">Categories</p>
            {CATEGORIES.map((cat) => (
              <a 
                key={cat.id}
                href={`#${cat.id}`}
                className="block px-4 py-3 rounded-2xl text-xs tracking-widest uppercase font-medium text-white/50 hover:text-gold hover:bg-white/5 transition-all"
              >
                {cat.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Menu Sections */}
        <div className="flex-1 space-y-32">
          
          <div id="lunch" className="scroll-mt-40">
            <SectionHeader title="Lunch Specials" note="Served daily until 3:00 p.m. Served with salad, chicken dumpling, and rice." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {LUNCH.map((item) => (
                <MenuItem key={item.name} {...item} />
              ))}
            </div>
          </div>

          <div id="appetizers" className="scroll-mt-40">
            <SectionHeader title="Appetizers" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {APPETIZERS.map((item) => (
                <MenuItem key={item.name} {...item} />
              ))}
            </div>
          </div>

          {/* More sections can be added here with the same pattern */}
          <div className="p-12 rounded-[4rem] bg-gold text-black text-center relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-[family-name:var(--font-dancing)] text-5xl mb-6">Hungry yet?</h3>
              <p className="font-[family-name:var(--font-baskerville)] text-sm tracking-widest uppercase mb-8 opacity-80">
                Join us for an unforgettable dining experience.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/reservations" className="bg-black text-white px-10 py-4 rounded-full font-bold text-xs tracking-[0.2em] uppercase hover:scale-105 transition-transform">
                  Reserve Now
                </Link>
                <Link href="/menu/drinks" className="bg-transparent border border-black/20 text-black px-10 py-4 rounded-full font-bold text-xs tracking-[0.2em] uppercase hover:bg-black/5 transition-colors">
                  Bar Menu
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] -z-0 translate-x-1/2 -translate-y-1/2" />
          </div>

        </div>
      </div>
    </main>
  );
}

function SectionHeader({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-12">
      <h2 className="font-[family-name:var(--font-dancing)] text-5xl mb-4">{title}</h2>
      {note && (
        <div className="flex items-start gap-2 text-white/40 italic">
          <Clock className="w-3 h-3 mt-1 flex-shrink-0" />
          <p className="text-xs leading-relaxed">{note}</p>
        </div>
      )}
    </div>
  );
}

function MenuItem({ name, price, desc, popular, spicy, veggie }: any) {
  return (
    <div className="group py-6 border-b border-white/5 hover:border-gold/30 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h4 className="font-[family-name:var(--font-baskerville)] text-lg group-hover:text-gold transition-colors leading-tight">
              {name}
            </h4>
            <div className="flex gap-1">
              {popular && <Star className="w-3 h-3 text-gold fill-gold" />}
              {veggie && <Leaf className="w-3 h-3 text-green-500 fill-green-500" />}
              {Array.from({ length: spicy || 0 }).map((_, i) => (
                <Flame key={i} className="w-3 h-3 text-orange-500 fill-orange-500" />
              ))}
            </div>
          </div>
          {desc && <p className="text-xs text-white/30 font-light leading-relaxed max-w-sm">{desc}</p>}
        </div>
        <span className="text-gold font-medium pt-1">{price}</span>
      </div>
    </div>
  );
}
