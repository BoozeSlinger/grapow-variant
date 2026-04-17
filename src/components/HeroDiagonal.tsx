"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cldImage, ASSETS } from "@/lib/cloudinary";

const COLS = [
  {
    id:    "hcol-1",
    label: "Food",
    href:  "/menu/food",
    img:   ASSETS.foodBg,
    alt:   "Thai food dishes",
    style: {
      left:      "0",
      width:     "calc(100% / 3 + 90px)",
      clipPath:  "polygon(0 0, 100% 0, calc(100% - 90px) 100%, 0 100%)",
      zIndex:    3,
    },
  },
  {
    id:    "hcol-2",
    label: "Happy Hour",
    href:  "/menu/happy-hour",
    img:   ASSETS.barBg,
    alt:   "Gra Pow bar interior",
    style: {
      left:      "calc(100% / 3)",
      width:     "calc(100% / 3 + 90px)",
      clipPath:  "polygon(0 0, 100% 0, calc(100% - 90px) 100%, 0 100%)",
      zIndex:    2,
    },
  },
  {
    id:    "hcol-3",
    label: "Drinks",
    href:  "/menu/drinks",
    img:   ASSETS.drinksBg,
    alt:   "Craft beers and cocktails",
    style: {
      left:      "calc(100% * 2 / 3)",
      right:     "0",
      zIndex:    1,
    },
  },
];

export default function HeroDiagonal() {
  return (
    <section
      id="hero-diagonal"
      className="relative overflow-hidden"
      style={{ height: "100vh", minHeight: "580px" }}
      aria-label="Explore our menu categories"
    >
      {COLS.map((col, i) => (
        <motion.div
          key={col.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          style={col.style as React.CSSProperties}
          className="hcol"
        >
          <Link
            id={col.id}
            href={col.href}
            className="block w-full h-full relative group lift-on-hover"
            aria-label={`Explore ${col.label}`}
          >
            {/* Background image */}
            <div
              className="hcol-bg group-hover:scale-110 transition-transform duration-1000"
              style={{ backgroundImage: `url('${cldImage(col.img)}')` }}
              role="img"
              aria-label={col.alt}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors duration-500" />
            
            {/* Action Overlay Color */}
            <div className="absolute inset-0 bg-[#E8A000]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-shine" 
                   style={{ width: '200%', left: '-100%' }} />
            </div>

            {/* Label + CTA */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-6 px-4">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 + 0.4 }}
                className="font-[family-name:var(--font-dancing)] text-5xl md:text-7xl text-white drop-shadow-xl select-none"
              >
                {col.label}
              </motion.h2>
              <div className="h-0.5 w-0 md:group-hover:w-20 bg-gold transition-all duration-700 ease-out rounded-full" />
              <span className="btn-outline opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 scale-90 md:scale-100">
                Explore
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </section>
  );
}
