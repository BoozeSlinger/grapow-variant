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
      <div
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
        <div className="grid grid-cols-3 items-start justify-items-center gap-4 sm:gap-12">
          {AWARDS.map((award, i) => (
            <motion.a
              key={award.year}
              href={award.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              whileHover={{ scale: 1.1, transition: { duration: 0.25 } }}
              className="flex flex-col items-center gap-4 group cursor-pointer"
              aria-label={`Best of Inland Empire ${award.year} – Best Thai Food`}
            >
              {/* Badge image */}
              <div className="relative w-24 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 drop-shadow-2xl">
                <Image
                  src={cldImage(award.badgeSrc, "w_320,h_320,c_fit,f_auto,q_auto")}
                  alt={`Best of Inland Empire ${award.year} badge`}
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              </div>

              {/* Year + link cue */}
              <div className="text-center relative">
                <p
                  className="text-[#E8A000] text-sm tracking-[0.2em] uppercase"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {award.year}
                </p>
                <p className="text-gray-600 text-[10px] tracking-widest uppercase mt-1 group-hover:text-[#E8A000]/80 transition-colors duration-300">
                  Read Article →
                </p>
                {/* Center growing underline */}
                <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-[#E8A000] transition-all duration-300 group-hover:w-full group-hover:left-0" />
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] block"
                style={{ boxShadow: "0 0 0 1px rgba(232,160,0,0.15), 0 8px 32px rgba(0,0,0,0.4)" }}
                aria-label={`${item.title} — ${item.publication} ${item.year}`}
              >
                <Image
                  src={item.imgSrc}
                  alt={`${item.title} — ${item.publication}`}
                  fill
                  className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
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
