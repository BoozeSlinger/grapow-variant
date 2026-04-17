"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { cldImage, ASSETS } from "@/lib/cloudinary";

const PRESS = [
  {
    title: "New Moves",
    publication: "Inland Empire Magazine",
    year: "2024",
    href: "https://grapow.net/elementor-1096/",
    imgSrc: "https://i0.wp.com/grapow.net/wp-content/uploads/2024/08/IEM-1-17-18.jpg",
    imgW: 800, imgH: 600,
  },
  {
    title: "Gra Pow — Chef-Owner Patrick Sura",
    publication: "Inland Empire Magazine",
    year: "Dec 2019",
    href: "https://grapow.net/gra-pow-december-2019-inland-empire-magazine/",
    imgSrc: "https://i0.wp.com/grapow.net/wp-content/uploads/2019/02/2019-12-Dec-Patric.jpg",
    imgW: 1249, imgH: 1488,
  },
  {
    title: "PrimeTime",
    publication: "Inland Empire Magazine",
    year: "2019",
    href: "https://grapow.net/primetime-2019/",
    imgSrc: "https://i0.wp.com/grapow.net/wp-content/uploads/2019/02/IEM-1219pages-188.png",
    imgW: 2514, imgH: 3264,
  },
  {
    title: "Your Villa Riverside",
    publication: "Your Villa Riverside",
    year: "2015–2016",
    href: "https://grapow.net/your-villa-riverside-november-2015-january-2016/",
    imgSrc: "https://i0.wp.com/grapow.net/wp-content/uploads/2019/02/Your-Villa-2016-01-Jan-cover.webp",
    imgW: 500, imgH: 590,
  },
];

const AWARDS = [
  {
    year: "2023",
    href: "https://www.pressenterprise.com/2023/09/10/best-of-inland-empire-2023-best-thai-food/",
    badgeSrc: ASSETS.bieLogo2023,
  },
  {
    year: "2020",
    href: "https://www.pressenterprise.com/2020/09/20/best-of-inland-empire-2020-best-thai-food/",
    badgeSrc: ASSETS.bieLogo2020,
  },
  {
    year: "2019",
    href: "https://www.pressenterprise.com/2019/09/12/best-of-inland-empire-2019-best-thai-food/",
    badgeSrc: ASSETS.bieLogo2019,
  },
];

export default function AwardsPress() {
  return (
    <section id="media" className="relative bg-[#080808] py-20 md:py-28 px-6 overflow-hidden">
      {/* Subtle gold radial glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.07, 0.1, 0.07],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(232,160,0,0.07) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#E8A000]/70 tracking-[0.3em] text-xs uppercase mb-4" 
            style={{ fontFamily: "Georgia, serif" }}
          >
            Recognized Excellence
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white text-5xl md:text-6xl font-semibold leading-tight" 
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Awards &amp; Press
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 mt-4 text-sm max-w-sm mx-auto leading-relaxed" 
            style={{ fontFamily: "Georgia, serif" }}
          >
            Best Thai Food — Best of Inland Empire
          </motion.p>
        </motion.div>

        {/* Badge row — always horizontal, 3 equal columns */}
        <div className="grid grid-cols-3 items-start justify-items-center gap-4 sm:gap-12 md:gap-20">
          {AWARDS.map((award, i) => (
            <motion.a
              key={award.year}
              href={award.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="flex flex-col items-center gap-4 group cursor-pointer"
              aria-label={`Best of Inland Empire ${award.year} – Best Thai Food`}
            >
              {/* Badge image */}
              <div className="relative w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_20px_40px_rgba(232,160,0,0.3)] transition-all duration-500">
                <Image
                  src={cldImage(award.badgeSrc, "w_320,h_320,c_fit,f_auto,q_auto")}
                  alt={`Best of Inland Empire ${award.year} badge`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 30vw, 160px"
                />
              </div>

              {/* Year + link cue */}
              <div className="text-center relative">
                <p
                  className="text-white/60 text-[10px] md:text-sm tracking-[0.2em] uppercase transition-colors group-hover:text-[#E8A000]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {award.year}
                </p>
                <div className="overflow-hidden h-4 md:h-5 mt-1">
                  <p className="text-[#E8A000] text-[9px] md:text-[10px] tracking-widest uppercase transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    View Winner →
                  </p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* ── Press Coverage ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20"
        >
          <p className="text-center text-[#E8A000]/60 tracking-[0.25em] text-xs uppercase mb-10" style={{ fontFamily: "Georgia, serif" }}>
            In The Press
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRESS.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 20px 40px rgba(232,160,0,0.2)",
                  borderColor: "rgba(232,160,0,0.5)"
                }}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] block border border-transparent transition-all duration-300"
                aria-label={`${item.title} — ${item.publication} ${item.year}`}
              >
                <Image
                  src={item.imgSrc}
                  alt={`${item.title} — ${item.publication}`}
                  fill
                  className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 25vw"
                  unoptimized
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"
                  aria-hidden="true"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-semibold leading-snug line-clamp-2" style={{ fontFamily: "Georgia, serif" }}>
                    {item.title}
                  </p>
                  <p className="text-[#E8A000]/70 text-[10px] tracking-wide mt-0.5">{item.publication} · {item.year}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
