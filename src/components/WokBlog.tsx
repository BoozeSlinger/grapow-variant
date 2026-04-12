"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cldImage, ASSETS } from "@/lib/cloudinary";

const POSTS = [
  {
    title: "The Alchemy of the Perfect Pad Thai",
    excerpt: "Discover the precise balance of tamarind, palm sugar, and heat that defines our signature dish.",
    image: ASSETS.foodBg,
    category: "Culinary Secrets",
  },
  {
    title: "Sourcing the Inland Empire",
    excerpt: "Meet the local farmers who bring Riverside's freshest basil and chili to your table every morning.",
    image: ASSETS.aboutBg,
    category: "Community",
  },
  {
    title: "Late Night Athletics: The Bar Logic",
    excerpt: "Crafting cocktails designed to survive overtime. A deep dive into our game-day beverage program.",
    image: ASSETS.drinksBg,
    category: "The Lab",
  },
];

export default function WokBlog() {
  return (
    <section id="wook" className="bg-[#111] py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <p className="font-[family-name:var(--font-baskerville)] text-gold tracking-[0.4em] uppercase text-xs mb-4">
              Behind the Burn
            </p>
            <h2 className="font-[family-name:var(--font-dancing)] text-5xl md:text-7xl text-white">
              The Wok
            </h2>
          </div>
          <div className="flex flex-col gap-4 max-w-sm">
            <p className="text-gray-400 text-sm leading-relaxed font-[family-name:var(--font-opensans)]">
              Stories from the kitchen, the bar, and the bustling heart of Riverside. Subscribe for exclusive recipes and event early access.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-[10px] tracking-widest text-white focus:outline-none focus:border-gold transition-colors flex-1"
              />
              <button className="bg-gold text-dark font-bold text-[10px] tracking-widest px-6 py-2 rounded-sm hover:bg-white transition-colors uppercase">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {POSTS.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative flex flex-col h-[500px] overflow-hidden rounded-2xl lift-on-hover"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={cldImage(post.image)}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              </div>

              <div className="relative z-10 p-8 mt-auto flex flex-col gap-4">
                <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">
                  {post.category}
                </span>
                <h3 className="text-2xl font-bold text-white tracking-tight leading-tight group-hover:text-gold transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="pt-4 flex items-center gap-2 text-[10px] tracking-widest uppercase text-white/40 group-hover:text-white transition-colors">
                  Read Article
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>

              <div className="grain-overlay opacity-10" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
