"use client";
import { motion } from "framer-motion";
import Link from "next/link";

/* ── Publication SVG logos ───────────────────────────────────────── */
function PressEnterpriseLogo() {
  return (
    <svg viewBox="0 0 200 32" className="h-5 w-auto opacity-50" fill="currentColor" aria-label="Riverside Press-Enterprise">
      <rect x="0" y="10" width="8" height="12" rx="1" />
      <rect x="12" y="6" width="8" height="20" rx="1" />
      <rect x="24" y="2" width="8" height="28" rx="1" />
      <text x="40" y="22" fontSize="13" fontFamily="serif" letterSpacing="1">PRESS-ENTERPRISE</text>
    </svg>
  );
}

function IEWeeklyLogo() {
  return (
    <svg viewBox="0 0 160 32" className="h-5 w-auto opacity-50" fill="currentColor" aria-label="IE Weekly">
      <rect x="0" y="4" width="20" height="4" rx="1" />
      <rect x="0" y="12" width="14" height="4" rx="1" />
      <rect x="0" y="20" width="20" height="4" rx="1" />
      <text x="28" y="22" fontSize="13" fontFamily="serif" letterSpacing="2">IE WEEKLY</text>
    </svg>
  );
}

function OCRegisterLogo() {
  return (
    <svg viewBox="0 0 160 32" className="h-5 w-auto opacity-50" fill="currentColor" aria-label="OC Register">
      <circle cx="12" cy="16" r="11" strokeWidth="3" stroke="currentColor" fill="none" />
      <circle cx="12" cy="16" r="5" />
      <text x="30" y="21" fontSize="13" fontFamily="serif" letterSpacing="1">OC REGISTER</text>
    </svg>
  );
}

/* ── Animated noise overlay ─────────────────────────────────────── */
const noiseSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)' opacity='1'/></svg>`;

/* ── Award cards data ───────────────────────────────────────────── */
const AWARDS = [
  {
    title: "Best Thai Restaurant",
    years: ["2022", "2023", "2024"],
    outlet: "Riverside Press-Enterprise",
    category: "Readers' Choice Award",
    Logo: PressEnterpriseLogo,
    wide: true,
  },
  {
    title: "Top Sports Bar IE",
    years: ["2023", "2024"],
    outlet: "IE Weekly",
    category: "Best of the Inland Empire",
    Logo: IEWeeklyLogo,
    wide: false,
  },
  {
    title: "Must-Try Cocktails",
    years: ["2024"],
    outlet: "OC Register",
    category: "Food & Drink Section",
    Logo: OCRegisterLogo,
    wide: false,
  },
];

/* ── Card ────────────────────────────────────────────────────────── */
function AwardCard({ award, index }: { award: typeof AWARDS[number]; index: number }) {
  const { title, years, outlet, category, Logo, wide } = award;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
      whileHover={{ scale: 1.02, filter: "brightness(1.2)" }}
      className={`
        relative rounded-3xl overflow-hidden
        bg-white/[0.03] backdrop-blur-2xl
        border border-white/[0.08]
        p-8 flex flex-col justify-between gap-6
        ${wide ? "col-span-2" : "col-span-1"}
        min-h-[200px]
      `}
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(255,255,255,0.08) 0%, transparent 60%), linear-gradient(to bottom right, rgba(255,255,255,0.03), transparent)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Rim light border */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ background: "linear-gradient(to bottom right, rgba(255,255,255,0.15), transparent 50%)", mask: "linear-gradient(black,black) content-box, linear-gradient(black,black)", maskComposite: "exclude", padding: "1px" }}
        aria-hidden="true"
      />

      {/* Large background year watermark */}
      <div className="absolute right-4 bottom-2 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <span className="text-white/[0.06] font-serif text-[100px] font-bold leading-none tabular-nums">
          {years[years.length - 1]}
        </span>
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        {/* Logo */}
        <div className="text-gray-300">
          <Logo />
        </div>

        {/* Title */}
        <h3
          className="font-serif text-white text-xl md:text-2xl font-semibold leading-tight tracking-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {title}
        </h3>

        {/* Category */}
        <p className="text-gray-400 text-xs tracking-widest uppercase">
          {category}
        </p>
      </div>

      {/* Year pills */}
      <div className="relative z-10 flex flex-wrap gap-2 mt-auto">
        {years.map((y) => (
          <span
            key={y}
            className="text-[#E8A000]/80 text-xs tracking-widest border border-[#E8A000]/20 px-3 py-1 rounded-full"
          >
            {y}
          </span>
        ))}
        <span className="text-gray-600 text-xs self-center ml-1 tracking-wide">{outlet}</span>
      </div>
    </motion.div>
  );
}

/* ── Section ─────────────────────────────────────────────────────── */
export default function AwardsPress() {
  return (
    <section id="media" className="relative bg-[#080808] py-24 md:py-32 px-6 overflow-hidden">
      {/* Animated noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: `url("${noiseSvg}")`, backgroundSize: "300px 300px" }}
        aria-hidden="true"
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(232,160,0,0.06) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-[#E8A000] tracking-[0.3em] text-xs uppercase mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Recognized Excellence
          </p>
          <h2
            className="text-white text-5xl md:text-6xl font-semibold leading-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Awards &amp; Press
          </h2>
          <p className="text-gray-500 mt-4 text-sm max-w-md mx-auto leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
            Riverside&apos;s dining critics and local press have taken notice.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {AWARDS.map((award, i) => (
            <AwardCard key={award.title} award={award} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-14"
        >
          <Link href="#press-full" className="btn-outline inline-block">See All Press</Link>
        </motion.div>
      </div>
    </section>
  );
}
