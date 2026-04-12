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
    </main>
  );
}

function MenuItem({ item, index }: { item: any, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex justify-between items-start gap-4 pb-6 border-b border-white/5"
    >
      <div className="flex-1">
        <h4 className="font-[family-name:var(--font-baskerville)] text-lg mb-1 group-hover:text-gold transition-colors duration-300">
          {item.name}
        </h4>
        <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">
          {item.desc}
        </p>
      </div>
      <div className="text-right">
        <span className="font-[family-name:var(--font-baskerville)] text-gold text-sm whitespace-nowrap">
          {item.price}
        </span>
      </div>
    </motion.div>
  );
}

function MenuCategory({ title, items }: { title: string, items: any[] }) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-dancing)] text-4xl text-white/90 mb-8 border-l-2 border-gold pl-6">
        {title}
      </h3>
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
        {items.map((item, idx) => (
          <MenuItem key={item.name} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
}
