"use client";
import { motion } from "framer-motion";
import Link from "next/link";

/* ── Publication SVG logos ───────────────────────────────────────── */
function PressEnterpriseLogo() {
  return (
    <svg viewBox="0 0 200 28" className="h-4 w-auto" fill="currentColor" aria-label="Riverside Press-Enterprise">
      <rect x="0" y="8" width="6" height="12" rx="1" />
      <rect x="10" y="4" width="6" height="20" rx="1" />
      <rect x="20" y="0" width="6" height="28" rx="1" />
      <text x="34" y="20" fontSize="12" fontFamily="serif" letterSpacing="1">PRESS-ENTERPRISE</text>
    </svg>
  );
}

function IEWeeklyLogo() {
  return (
    <svg viewBox="0 0 160 28" className="h-4 w-auto" fill="currentColor" aria-label="IE Weekly">
      <rect x="0" y="2" width="18" height="4" rx="1" />
      <rect x="0" y="10" width="12" height="4" rx="1" />
      <rect x="0" y="18" width="18" height="4" rx="1" />
      <text x="26" y="20" fontSize="12" fontFamily="serif" letterSpacing="2">IE WEEKLY</text>
    </svg>
  );
}

function OCRegisterLogo() {
  return (
    <svg viewBox="0 0 160 28" className="h-4 w-auto" fill="currentColor" aria-label="OC Register">
      <circle cx="11" cy="14" r="10" strokeWidth="2.5" stroke="currentColor" fill="none" />
      <circle cx="11" cy="14" r="4" />
      <text x="28" y="19" fontSize="12" fontFamily="serif" letterSpacing="1">OC REGISTER</text>
    </svg>
  );
}

const noiseSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)' opacity='1'/></svg>`;

const AWARDS = [
  {
    title: "Best Thai Restaurant",
    years: ["2022", "2023", "2024"],
    outlet: "Riverside Press-Enterprise",
    category: "Readers' Choice Award",
    Logo: PressEnterpriseLogo,
  },
  {
    title: "Top Sports Bar IE",
    years: ["2023", "2024"],
    outlet: "IE Weekly",
    category: "Best of the Inland Empire",
    Logo: IEWeeklyLogo,
  },
  {
    title: "Must-Try Cocktails",
    years: ["2024"],
    outlet: "OC Register",
    category: "Food & Drink Section",
    Logo: OCRegisterLogo,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function AwardCard({ award, index }: { award: typeof AWARDS[number]; index: number }) {
  const { title, years, outlet, category, Logo } = award;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ scale: 1.03, transition: { duration: 0.25 } }}
      className="relative rounded-2xl overflow-hidden flex flex-col justify-between p-7 min-h-[240px]"
      style={{
        /* Deep glass base */
        background: "linear-gradient(135deg, rgba(232,160,0,0.07) 0%, rgba(255,255,255,0.03) 50%, rgba(0,0,0,0.15) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        /* Gold outer glow */
        boxShadow: [
          "0 0 0 1px rgba(232,160,0,0.22)",
          "0 0 28px rgba(232,160,0,0.12)",
          "0 0 60px rgba(232,160,0,0.06)",
          "inset 0 1px 0 rgba(255,255,255,0.10)",
          "inset 0 -1px 0 rgba(232,160,0,0.08)",
        ].join(", "),
      }}
    >
      {/* Inner top-left rim shimmer */}
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
          {years[years.length - 1]}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="text-[#E8A000]/60">
          <Logo />
        </div>
        <h3
          className="text-white text-xl font-semibold leading-snug tracking-tight mt-1"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {title}
        </h3>
        <p className="text-[#E8A000]/50 text-[10px] tracking-[0.2em] uppercase">{category}</p>
      </div>

      {/* Year pills row */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 mt-5">
        {years.map((y) => (
          <span
            key={y}
            className="text-[#E8A000] text-[10px] tracking-widest border border-[#E8A000]/30 px-2.5 py-0.5 rounded-full"
            style={{ background: "rgba(232,160,0,0.06)" }}
          >
            {y}
          </span>
        ))}
        <span className="text-gray-600 text-[10px] tracking-wide ml-1">{outlet}</span>
      </div>
    </motion.div>
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

      {/* Centered gold radial glow behind cards */}
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
            <AwardCard key={award.title} award={award} index={i} />
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
          <Link href="#press-full" className="btn-outline inline-block">See All Press</Link>
        </motion.div>
      </div>
    </section>
  );
}
