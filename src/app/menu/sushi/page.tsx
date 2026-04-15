"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Clock, MapPin, Search } from "lucide-react";
import { useHoursStatus } from "@/hooks/useHoursStatus";
import Breadcrumbs from "@/components/Breadcrumbs";

const SASHIMI = [
  { name: "Tuna",         price: "Sushi(2) $12.50 / Sashimi(5) $20.50", desc: "Fresh Bigeye Tuna" },
  { name: "Salmon",       price: "Sushi(2) $12.00 / Sashimi(5) $17.00", desc: "Scottish Atlantic Salmon" },
  { name: "Albacore",     price: "Sushi(2) $12.00 / Sashimi(5) $17.50", desc: "Seared with Garlic Pepper" },
  { name: "Snapper",      price: "Sushi(2) $11.00 / Sashimi(5) $16.00", desc: "Japanese Sea Bream" },
  { name: "Octopus",      price: "Sushi(2) $12.50 / Sashimi(5) $17.00", desc: "Steamed Madako" },
  { name: "Boil Shrimp",  price: "Sushi(2) $10.00 / Sashimi(5) $15.00", desc: "Ebi Sushi" },
  { name: "Yellowtail",   price: "Sushi(2) $12.50 / Sashimi(5) $19.00", desc: "Hamachi" },
  { name: "Freshwater Eel", price: "Sushi(2) $13.00 / Sashimi(5) N/A",  desc: "Unagi with House Glaze" },
  { name: "Smoke Salmon", price: "Sushi(2) $13.00 / Sashimi(5) $19.00", desc: "Lightly Smoked" },
];

const ROLLS = {
  traditional: [
    { name: "Tuna Roll",      price: "$13", desc: "Tekka Maki" },
    { name: "Cucumber Roll",  price: "$12", desc: "Kappa Maki" },
    { name: "California Roll",price: "$14", desc: "Crab, Avocado, Cucumber" },
    { name: "Spicy Tuna Roll",price: "$15.50", desc: "Spicy Tuna, Cucumber" },
    { name: "Tempura Roll",   price: "$16", desc: "Shrimp Tempura, Avocado" },
    { name: "Salmon Roll",    price: "$15", desc: "Fresh Salmon, Cucumber" },
  ],
  specialty: [
    { name: "Dragon Roll",      price: "$19", desc: "Shrimp Tempura, Eel, Avocado" },
    { name: "Rainbow Roll",     price: "$18", desc: "California Roll topped with 4 types of fish" },
    { name: "Caterpillar Roll", price: "$19", desc: "Eel, Cucumber topped with Avocado" },
    { name: "Crunchy Roll",     price: "$18", desc: "Shrimp Tempura, Masago, Tempura Flakes" },
    { name: "Unagi Roll",       price: "$17", desc: "Broiled Eel, Avocado, Eel Sauce" },
    { name: "Philadelphia Roll",price: "$17", desc: "Salmon, Cream Cheese, Avocado" },
  ],
  house: [
    { name: "Spicy Yuzu Kanpachi Roll", price: "$21", desc: "Amberjack, Jalapeño, Yuzu Soy" },
    { name: "Smoke Salmon Roll",        price: "$21", desc: "Cream Cheese, Asparagus, Smoked Salmon" },
    { name: "The Hangover Roll",        price: "$22", desc: "Spicy Tuna, Shrimp Tempura, Seared Albacore" },
  ]
};

const BITES = [
  { name: "Yellowtail Carpaccio",      price: "$20", desc: "Thinly sliced Hamachi with Jalapeño and Ponzu" },
  { name: "Tuna Crispy Carpaccio",     price: "$20.50", desc: "Seared Tuna with Fried Shallots" },
  { name: "Yellowtail Crudo",          price: "$20.50", desc: "Premium cuts with Truffle Oil" },
  { name: "Poke Bowl",                 price: "$27", desc: "Assorted Fish over Sushi Rice" },
];

// Ideally these would be local public paths, but using the artifact filenames for now as placeholders
// In a real build, I would move these to /public/images/
const FEATURED = [
  { 
    name: "Dragon Roll", 
    image: "/dragon_roll_sushi_1775961372771.png", // artifact filename
    desc: "A masterpiece of flavors featuring shrimp tempura, cucumber, and BBQ eel." 
  },
  { 
    name: "Rainbow Roll", 
    image: "/rainbow_roll_sushi_1775961393300.png", // artifact filename
    desc: "A colorful display of our freshest catches atop a classic California roll." 
  }
];

export default function SushiMenu() {
  const [activeTab, setActiveTab] = useState("Sushi & Sashimi");
  const { status, isOpen } = useHoursStatus();

  const tabs = ["Sushi & Sashimi", "Specialty Rolls", "Plates & Bowls"];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image 
          src="/dragon_roll_sushi_1775961372771.png"
          alt="Premium Sushi"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 flex justify-center">
              <Breadcrumbs />
            </div>
            <h1 className="font-[family-name:var(--font-dancing)] text-7xl md:text-9xl text-white mb-6">
              Sushi Bar
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] tracking-[0.3em] uppercase text-gold/80">
              <span className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Tue–Sat 5PM–Close
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Riverside, CA
              </span>
              <span className={`flex items-center gap-2 ${isOpen ? "text-emerald-400" : "text-red-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOpen ? "bg-emerald-400" : "bg-red-400"}`} />
                {status}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 -mt-20 relative z-20 pb-24">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-16">
          <div className="bg-[#111] border border-white/5 p-1 rounded-full flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-full text-xs tracking-widest uppercase font-medium transition-all duration-500 relative ${
                  activeTab === tab ? "text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gold/10 border border-gold/30 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            {/* Main Menu Items */}
            <div className="lg:col-span-8">
              {activeTab === "Sushi & Sashimi" && (
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                  {SASHIMI.map((item, idx) => (
                    <MenuItem key={item.name} item={item} index={idx} />
                  ))}
                </div>
              )}

              {activeTab === "Specialty Rolls" && (
                <div className="space-y-16">
                  <MenuCategory title="House Favorites" items={ROLLS.house} />
                  <MenuCategory title="Chef's Specialty" items={ROLLS.specialty} />
                  <MenuCategory title="Traditional Rolls" items={ROLLS.traditional} />
                </div>
              )}

              {activeTab === "Plates & Bowls" && (
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                  {BITES.map((item, idx) => (
                    <MenuItem key={item.name} item={item} index={idx} />
                  ))}
                </div>
              )}
            </div>

            {/* Featured Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-[#111] border border-white/5 p-8 rounded-2xl sticky top-32">
                <h4 className="font-medium tracking-widest text-gold text-xs uppercase mb-8">Featured Items</h4>
                <div className="space-y-10">
                  {FEATURED.map((item) => (
                    <div key={item.name} className="group cursor-pointer">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 border border-white/5">
                        <Image 
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <h5 className="font-[family-name:var(--font-baskerville)] text-xl mb-2">{item.name}</h5>
                      <p className="text-white/40 text-[10px] leading-relaxed uppercase tracking-wider">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Footer CTA */}
      <section className="py-32 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full" />
        <div className="max-w-screen-md mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-[family-name:var(--font-dancing)] text-6xl mb-8">The Full Experience</h2>
            <p className="font-[family-name:var(--font-baskerville)] text-xl text-white/50 mb-12 leading-relaxed italic">
              Join us at the Sushi Bar for a chef-curated journey through the finest seasonal catches.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent("open-reservation", { detail: { type: 'dinner' } }))}
                className="btn-gold px-12 py-5"
              >
                RESERVE A SEAT
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent("open-reservation", { detail: { type: 'event' } }))}
                className="btn-outline px-12 py-5 border-white/20 hover:border-gold"
              >
                PRIVATE EVENTS
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function MenuItem({ item, index }: { item: any, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        delay: index * 0.05,
        duration: 0.5,
        ease: "easeOut"
      }}
      className="group relative flex justify-between items-start gap-6 pb-8 border-b border-white/5 hover:border-gold/20 transition-colors"
    >
      <div className="flex-1">
        <h4 className="font-[family-name:var(--font-baskerville)] text-xl mb-2 group-hover:text-gold transition-colors duration-300">
          {item.name}
        </h4>
        <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] leading-relaxed italic">
          {item.desc}
        </p>
      </div>
      <div className="text-right">
        <span className="font-[family-name:var(--font-baskerville)] text-gold text-lg font-bold tracking-tight">
          {item.price}
        </span>
      </div>
      
      {/* Decorative dot on hover */}
      <div className="absolute left-[-1.5rem] top-2 w-1.5 h-1.5 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
    </motion.div>
  );
}

function MenuCategory({ title, items }: { title: string, items: any[] }) {
  return (
    <div className="mb-20 last:mb-0">
      <ScrollReveal>
        <h3 className="font-[family-name:var(--font-dancing)] text-5xl text-white mb-12 flex items-center gap-6">
          {title}
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </h3>
      </ScrollReveal>
      <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">
        {items.map((item, idx) => (
          <MenuItem key={item.name} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
}
