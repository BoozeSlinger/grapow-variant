"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { cldImage, ASSETS } from "@/lib/cloudinary";

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
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#E8A000]/70 tracking-[0.3em] text-xs uppercase mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Recognized Excellence
          </p>
          <h2 className="text-white text-5xl md:text-6xl font-semibold leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Awards &amp; Press
          </h2>
          <p className="text-gray-500 mt-4 text-sm max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
            Best Thai Food — Best of Inland Empire
          </p>
        </motion.div>

        {/* Badge row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16">
          {AWARDS.map((award, i) => (
            <motion.a
              key={award.year}
              href={award.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              whileHover={{ scale: 1.08, transition: { duration: 0.25 } }}
              className="flex flex-col items-center gap-4 group cursor-pointer"
              aria-label={`Best of Inland Empire ${award.year} – Best Thai Food`}
            >
              {/* Badge image */}
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 drop-shadow-2xl">
                <Image
                  src={cldImage(award.badgeSrc, "w_320,h_320,c_fit,f_auto,q_auto")}
                  alt={`Best of Inland Empire ${award.year} badge`}
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              </div>

              {/* Year + link cue */}
              <div className="text-center">
                <p
                  className="text-[#E8A000] text-sm tracking-[0.2em] uppercase"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {award.year}
                </p>
                <p className="text-gray-600 text-[10px] tracking-widest uppercase mt-1 group-hover:text-[#E8A000]/50 transition-colors duration-300">
                  Read Article →
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
