"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { cldImage, ASSETS } from "@/lib/cloudinary";

const AWARDS = [
  {
    title: "Best Thai Food",
    year: "2023",
    outlet: "Riverside Press-Enterprise",
    category: "Best of Inland Empire",
    href: "https://www.pressenterprise.com/2023/09/10/best-of-inland-empire-2023-best-thai-food/",
    badgeSrc: ASSETS.bieLogo2023,
  },
  {
    title: "Best Thai Food",
    year: "2020",
    outlet: "Riverside Press-Enterprise",
    category: "Best of Inland Empire",
    href: "https://www.pressenterprise.com/2020/09/20/best-of-inland-empire-2020-best-thai-food/",
    badgeSrc: ASSETS.bieLogo2020,
  },
  {
    title: "Best Thai Food",
    year: "2019",
    outlet: "Riverside Press-Enterprise",
    category: "Best of Inland Empire",
    href: "https://www.pressenterprise.com/2019/09/12/best-of-inland-empire-2019-best-thai-food/",
    badgeSrc: ASSETS.bieLogo2019,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      delay: i * 0.14,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const noiseSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)' opacity='1'/></svg>`;

function AwardCard({ award, index }: { award: typeof AWARDS[number]; index: number }) {
  const { title, year, outlet, category, href, badgeSrc } = award;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ scale: 1.03, transition: { duration: 0.25 } }}
      className="relative rounded-2xl overflow-hidden flex flex-col justify-between p-7 min-h-[260px] cursor-pointer group"
      style={{
        background: "linear-gradient(135deg, rgba(232,160,0,0.07) 0%, rgba(255,255,255,0.03) 50%, rgba(0,0,0,0.15) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: [
          "0 0 0 1px rgba(232,160,0,0.22)",
          "0 0 28px rgba(232,160,0,0.12)",
          "0 0 60px rgba(232,160,0,0.06)",
          "inset 0 1px 0 rgba(255,255,255,0.10)",
          "inset 0 -1px 0 rgba(232,160,0,0.08)",
        ].join(", "),
      }}
    >
      {/* Inner rim shimmer */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(232,160,0,0.14) 0%, rgba(255,255,255,0.04) 30%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Large watermark year */}
      <div className="absolute right-3 bottom-1 pointer-events-none select-none" aria-hidden="true">
        <span
          className="font-bold leading-none tabular-nums"
          style={{
            fontSize: "clamp(72px, 10vw, 96px)",
            color: "rgba(232,160,0,0.07)",
            fontFamily: "Georgia, serif",
          }}
        >
          {year}
        </span>
      </div>

      {/* Badge image */}
      <div className="relative z-10 flex items-start">
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={cldImage(badgeSrc, "w_192,h_192,c_fit,f_auto,q_auto")}
            alt={`Best of Inland Empire ${year} badge`}
            fill
            className="object-contain drop-shadow-lg"
            sizes="96px"
          />
        </div>
      </div>

      {/* Card content */}
      <div className="relative z-10 flex flex-col gap-2 mt-3">
        <p className="text-[#E8A000]/60 text-[10px] tracking-[0.2em] uppercase">{category}</p>
        <h3
          className="text-white text-xl font-semibold leading-snug tracking-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {title}
        </h3>

        <div className="flex items-center justify-between mt-3">
          <span
            className="text-[#E8A000] text-[11px] tracking-widest border border-[#E8A000]/30 px-3 py-1 rounded-full"
            style={{ background: "rgba(232,160,0,0.06)" }}
          >
            {year}
          </span>
          {/* "Read article" hint on hover */}
          <span className="text-[#E8A000]/0 group-hover:text-[#E8A000]/60 transition-colors duration-300 text-[10px] tracking-widest uppercase">
            Read →
          </span>
        </div>
        <p className="text-gray-600 text-[10px] tracking-wide mt-1">{outlet}</p>
      </div>
    </motion.a>
  );
}

export default function AwardsPress() {
  return (
    <section id="media" className="relative bg-[#080808] py-24 md:py-32 px-6 overflow-hidden">
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: `url("${noiseSvg}")`, backgroundSize: "300px 300px" }}
        aria-hidden="true"
      />

      {/* Gold radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 55% at 50% 60%, rgba(232,160,0,0.09) 0%, transparent 70%)",
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
          <p className="text-gray-500 mt-4 text-sm max-w-md mx-auto leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
            Riverside&apos;s dining critics and local press have taken notice.
          </p>
        </motion.div>

        {/* Equal 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {AWARDS.map((award, i) => (
            <AwardCard key={`${award.title}-${award.year}`} award={award} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="text-center mt-14"
        >
          <a
            href="https://www.pressenterprise.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-block"
          >
            See All Press
          </a>
        </motion.div>
      </div>
    </section>
  );
}
