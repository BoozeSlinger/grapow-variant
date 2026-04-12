"use client";

import { motion } from "framer-motion";

const REVIEWS = [
  {
    quote: "The best Pad Thai in Inland Empire. Period. The balance of flavors is something you just don't find elsewhere.",
    author: "Sarah J.",
    role: "Riverside Local",
    stars: 5,
  },
  {
    quote: "The atmosphere is high-octane but the food is refined. Amazing sushi program too—try the signature rolls.",
    author: "Michael R.",
    role: "Food Critic",
    stars: 5,
  },
  {
    quote: "Gra Pow is our Friday night tradition. The cocktails and the energy are unmatched. A Riverside staple.",
    author: "David L.",
    role: "Regular Guest",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#1a1a1a] py-24 px-6 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -mr-64 -mt-64" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="font-[family-name:var(--font-baskerville)] text-gold tracking-[0.4em] uppercase text-xs mb-4">
            Guest Experiences
          </p>
          <h2 className="font-[family-name:var(--font-dancing)] text-5xl md:text-7xl text-white">
            Word on the Street
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-2xl flex flex-col gap-6 relative"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(review.stars)].map((_, i) => (
                  <svg key={i} width="16" height="16" fill="#E8A000" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-gray-200 text-lg leading-relaxed font-italic italic leading-[1.8] font-[family-name:var(--font-opensans)]">
                &ldquo;{review.quote}&rdquo;
              </blockquote>

              <div className="mt-auto pt-6 border-t border-white/10 flex flex-col">
                <span className="text-white font-bold tracking-widest text-xs uppercase">
                  {review.author}
                </span>
                <span className="text-gold/60 text-[10px] tracking-widest uppercase mt-1">
                  {review.role}
                </span>
              </div>
              
              <div className="grain-overlay opacity-5 rounded-2xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
