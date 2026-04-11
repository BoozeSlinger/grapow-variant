"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cldImage, ASSETS } from "@/lib/cloudinary";

// ── NAP — update these to match your Google Business Profile exactly ──
const NAP = {
  name:      "Gra Pow Thai Fusion & Sports Bar",
  street:    "3637 Merrill Ave",
  city:      "Riverside",
  state:     "CA",
  zip:       "92506",
  country:   "US",
  phone:     "(951) 780-1132",
  phoneHref: "tel:+19517801132",
  mapsQ:     "Gra+Pow+Thai+Fusion+Sports+Bar+Riverside+CA",
};

// ── Restaurant close hour by day (0 = Sun … 6 = Sat) ─────────────────
const CLOSE_BY_DAY = [21, 21, 21, 21, 21, 22, 22]; // 9 PM Sun-Thu, 10 PM Fri-Sat
const OPEN_HOUR    = 11;

// ── Press / Awards ────────────────────────────────────────────────────
const PRESS = [
  {
    award: "Best Thai Food",
    pub:   "Riverside Press-Enterprise",
    note:  "Best of Inland Empire",
    year:  "2023",
    href:  "https://www.pressenterprise.com/2023/09/10/best-of-inland-empire-2023-best-thai-food/",
  },
  {
    award: "Best Thai Food",
    pub:   "Riverside Press-Enterprise",
    note:  "Best of Inland Empire",
    year:  "2020",
    href:  "https://www.pressenterprise.com/2020/09/20/best-of-inland-empire-2020-best-thai-food/",
  },
  {
    award: "Best Thai Food",
    pub:   "Riverside Press-Enterprise",
    note:  "Best of Inland Empire",
    year:  "2019",
    href:  "https://www.pressenterprise.com/2019/09/12/best-of-inland-empire-2019-best-thai-food/",
  },
  {
    award: "Chef-Owner Feature",
    pub:   "Inland Empire Magazine",
    note:  "New Moves cover story",
    year:  "2024",
    href:  "https://grapow.net/elementor-1096/",
  },
];

// ── Footer nav ────────────────────────────────────────────────────────
const NAV = [
  { label: "Food",       href: "/menu/food" },
  { label: "Happy Hour", href: "/menu/happy-hour" },
  { label: "Drinks",     href: "/menu/drinks" },
  { label: "Sushi Bar",  href: "/menu/sushi" },
  { label: "Reservations", href: "/reservations" },
  { label: "Events",     href: "/#events" },
  { label: "The Wok",    href: "/#wook" },
  { label: "Press",      href: "/#media" },
];

// ── JSON-LD LocalBusiness + Restaurant schema ─────────────────────────
const SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": ["Restaurant", "BarOrPub"],
  name:  NAP.name,
  telephone: "+1-951-780-1132",
  servesCuisine: ["Thai", "Sushi", "Sports Bar"],
  priceRange: "$$",
  address: {
    "@type":          "PostalAddress",
    streetAddress:    NAP.street,
    addressLocality:  NAP.city,
    addressRegion:    NAP.state,
    postalCode:       NAP.zip,
    addressCountry:   NAP.country,
  },
  geo: {
    "@type":    "GeoCoordinates",
    latitude:   33.9425,
    longitude:  -117.3962,
  },
  url: "https://grapow.net",
  openingHoursSpecification: [
    {
      "@type":    "OpeningHoursSpecification",
      dayOfWeek:  ["Sunday","Monday","Tuesday","Wednesday","Thursday"],
      opens:      "11:00",
      closes:     "21:00",
    },
    {
      "@type":    "OpeningHoursSpecification",
      dayOfWeek:  ["Friday","Saturday"],
      opens:      "11:00",
      closes:     "22:00",
    },
  ],
});

// ── Noise texture SVG (matches site-wide grain) ───────────────────────
const NOISE = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='1'/></svg>`;

// ── Shared serif style ────────────────────────────────────────────────
const SERIF: React.CSSProperties = { fontFamily: "Georgia, 'Times New Roman', serif" };


// ═══════════════════════════════════════════════════════════════════════
//  Real-time hours hook
// ═══════════════════════════════════════════════════════════════════════
type HoursStatus = { open: boolean; label: string; color: string };

function useHoursStatus(): HoursStatus | null {
  const [status, setStatus] = useState<HoursStatus | null>(null);

  useEffect(() => {
    function compute() {
      const now   = new Date();
      const day   = now.getDay();
      const hour  = now.getHours() + now.getMinutes() / 60;
      const close = CLOSE_BY_DAY[day];
      const closeLabel = close === 21 ? "9 PM" : "10 PM";

      if (hour >= OPEN_HOUR && hour < close) {
        const minsLeft = (close - hour) * 60;
        if (minsLeft <= 60) {
          setStatus({ open: true,  label: `Closing Soon · ${closeLabel}`,      color: "#F59E0B" });
        } else {
          setStatus({ open: true,  label: `Open Now · Closes ${closeLabel}`,   color: "#22C55E" });
        }
      } else if (hour < OPEN_HOUR) {
        setStatus({ open: false, label: "Opens at 11 AM",                      color: "#E8A000" });
      } else {
        setStatus({ open: false, label: "Closed · Opens at 11 AM",             color: "#6B7280" });
      }
    }

    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, []);

  return status;
}


// ═══════════════════════════════════════════════════════════════════════
//  Map Cell — CSS pseudo-map → live iframe on hover/tap (no API key)
// ═══════════════════════════════════════════════════════════════════════
function MapCell() {
  const [live, setLive] = useState(false);
  const embedSrc = `https://maps.google.com/maps?q=${NAP.mapsQ}&output=embed&z=15`;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl cursor-pointer lift-on-hover"
      style={{
        minHeight: "260px",
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.10)",
      }}
      onMouseEnter={() => setLive(true)}
      onClick={() => setLive(true)}
      role="button"
      tabIndex={0}
      aria-label="Interactive map — hover or tap to explore"
      onKeyDown={(e) => e.key === "Enter" && setLive(true)}
    >
      {/* Live iframe — only mounts once activated, never unmounts */}
      {live && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <iframe
            src={embedSrc}
            className="absolute inset-0 w-full h-full"
            style={{
              border: 0,
              // CSS dark-mode trick — inverts the default light map
              filter: "invert(92%) hue-rotate(180deg) saturate(0.65) brightness(0.88)",
            }}
            allowFullScreen
            loading="lazy"
            title={`${NAP.name} location map`}
          />
        </motion.div>
      )}

      {/* Static placeholder — fades out on activation */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: live ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        style={{ pointerEvents: live ? "none" : "auto" }}
      >
        {/* Horizontal grid lines */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={`h${i}`}
            className="absolute inset-x-0"
            style={{ top: `${(i + 1) * 12.5}%`, height: 1, background: "rgba(255,255,255,0.04)" }}
          />
        ))}
        {/* Vertical grid lines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`v${i}`}
            className="absolute inset-y-0"
            style={{ left: `${(i + 1) * 20}%`, width: 1, background: "rgba(255,255,255,0.04)" }}
          />
        ))}
        {/* Street lines */}
        <div className="absolute inset-x-0" style={{ top: "55%",  height: 2, background: "rgba(255,255,255,0.09)" }} />
        <div className="absolute inset-y-0" style={{ left: "38%", width: 2,  background: "rgba(255,255,255,0.09)" }} />
        <div className="absolute inset-x-0" style={{ top: "72%",  height: 1, background: "rgba(255,255,255,0.05)" }} />
        <div className="absolute"           style={{ top: "48%", left: "38%", right: 0, height: 2, background: "rgba(232,160,0,0.18)" }} />

        {/* Location pin */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div
              className="mb-2 text-black text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide whitespace-nowrap"
              style={{ background: "#E8A000", boxShadow: "0 2px 12px rgba(232,160,0,0.45)" }}
            >
              GRA POW
            </div>
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{
                background: "#E8A000",
                boxShadow: "0 0 0 5px rgba(232,160,0,0.22), 0 0 20px rgba(232,160,0,0.5)",
              }}
            />
            <div className="w-px h-3 mt-0.5" style={{ background: "rgba(232,160,0,0.5)" }} />
          </div>
        </div>

        {/* Hint */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(232,160,0,0.45)", ...SERIF }}>
            Hover to explore
          </span>
        </div>
      </motion.div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════
//  Fat Footer
// ═══════════════════════════════════════════════════════════════════════
export default function Footer() {
  const hours = useHoursStatus();

  return (
    <footer id="site-footer" className="relative bg-[#0a0a0a] overflow-hidden" role="contentinfo">

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />

      {/* Analog noise texture */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: "200px 200px", opacity: 0.04 }}
        aria-hidden="true"
      />

      {/* Top gold rim light */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none z-10"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(232,160,0,0.35) 20%, rgba(232,160,0,0.85) 50%, rgba(232,160,0,0.35) 80%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-10">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 xl:gap-8">

          {/* ═══ Col 1 · Brand & Social ════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <Link href="/" aria-label="Gra Pow home" className="inline-block self-start group">
              <Image
                src="/grapow-new-logo.png"
                alt="Gra Pow Riverside logo"
                width={120}
                height={100}
                className="h-16 w-auto object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(232,160,0,0.5)] group-hover:scale-110"
              />
            </Link>

            <p className="text-sm leading-relaxed max-w-[210px] animate-pulse-slow"
               style={{ color: "rgba(156,163,175,1)", ...SERIF, fontStyle: "italic" }}>
              Thai heritage meets high-octane sports — Riverside&apos;s boldest table.
            </p>

            {/* 48×48px touch-target social icons */}
            <div className="flex items-center gap-2.5" role="list" aria-label="Social media links">

              {/* Instagram */}
              <motion.a
                href="https://www.instagram.com/grapow_ig/"
                target="_blank" rel="noopener noreferrer"
                aria-label="Follow Gra Pow on Instagram"
                role="listitem"
                whileHover={{ scale: 1.15, rotate: -5 }}
                className="group flex items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] shine-effect"
                style={{
                  width: 48, height: 48, flexShrink: 0, color: "rgba(156,163,175,1)",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.07)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#E8A000"; e.currentTarget.style.borderColor = "rgba(232,160,0,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(156,163,175,1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </motion.a>

              {/* Facebook */}
              <motion.a
                href="https://www.facebook.com/p/Gra-Pow-100063506142426/"
                target="_blank" rel="noopener noreferrer"
                aria-label="Follow Gra Pow on Facebook"
                role="listitem"
                whileHover={{ scale: 1.15, rotate: 5 }}
                className="flex items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] shine-effect"
                style={{
                  width: 48, height: 48, flexShrink: 0, color: "rgba(156,163,175,1)",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.07)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#E8A000"; e.currentTarget.style.borderColor = "rgba(232,160,0,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(156,163,175,1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
              >
                <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </motion.a>
            </div>
          </motion.div>


          {/* ═══ Col 2 · Venue & Real-Time Hours (Liquid Glass) ════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div
              className="rounded-2xl p-6 h-full"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.10), 0 8px 32px rgba(0,0,0,0.35)",
              }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase mb-5"
                 style={{ color: "rgba(232,160,0,0.65)", ...SERIF }}>
                The Venue
              </p>

              {/* NAP with schema microdata */}
              <address
                className="not-italic"
                itemScope
                itemType="https://schema.org/LocalBusiness"
              >
                <meta itemProp="name" content={NAP.name} />
                <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)", ...SERIF }}>
                    <span itemProp="streetAddress">{NAP.street}</span><br />
                    <span itemProp="addressLocality">{NAP.city}</span>,{" "}
                    <span itemProp="addressRegion">{NAP.state}</span>{" "}
                    <span itemProp="postalCode">{NAP.zip}</span>
                  </p>
                </div>
                <a
                  href={NAP.phoneHref}
                  itemProp="telephone"
                  className="text-sm mt-1.5 inline-block transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A000] rounded"
                  style={{ color: "#E8A000", ...SERIF }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F5BC30")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#E8A000")}
                >
                  {NAP.phone}
                </a>
              </address>

              <a
                href={`https://maps.google.com/?q=${NAP.mapsQ}`}
                target="_blank" rel="noopener noreferrer"
                className="text-[10px] tracking-widest uppercase mt-1 inline-block transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A000] rounded"
                style={{ color: "rgba(107,114,128,1)", ...SERIF }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(232,160,0,0.65)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(107,114,128,1)")}
              >
                Get Directions →
              </a>

              <div className="my-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />

              {/* Live status pill */}
              <div className="flex items-center gap-2.5 mb-5" role="status" aria-live="polite">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: hours?.color ?? "#6B7280",
                    boxShadow: hours?.open
                      ? `0 0 0 3px ${hours.color}22, 0 0 10px ${hours.color}55`
                      : "none",
                  }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium" style={{ color: hours?.color ?? "#6B7280", ...SERIF }}>
                  {hours?.label ?? "—"}
                </span>
              </div>

              {/* Hours table */}
              <div className="space-y-4 text-xs" style={SERIF}>
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-1.5"
                     style={{ color: "rgba(232,160,0,0.5)" }}>
                    Restaurant
                  </p>
                  <div className="space-y-0.5" style={{ color: "rgba(156,163,175,1)" }}>
                    <div className="flex justify-between">
                      <span>Sun – Thu</span>
                      <span style={{ color: "rgba(209,213,219,1)" }}>11 AM – 9 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fri – Sat</span>
                      <span style={{ color: "rgba(209,213,219,1)" }}>11 AM – 10 PM</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-1.5"
                     style={{ color: "rgba(232,160,0,0.5)" }}>
                    Bar
                  </p>
                  <div className="space-y-0.5" style={{ color: "rgba(156,163,175,1)" }}>
                    <div className="flex justify-between">
                      <span>Sun – Thu</span>
                      <span style={{ color: "rgba(209,213,219,1)" }}>Until Midnight</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fri – Sat</span>
                      <span style={{ color: "rgba(209,213,219,1)" }}>Until 2 AM</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] leading-snug" style={{ color: "rgba(232,160,0,0.38)" }}>
                  *Kitchen closes 9 PM · Happy Hour: Daily 3–6 PM &amp; 9 PM–Close<br />
                  Sushi Bar: 5 PM+ · Closed Sun &amp; Mon
                </p>
              </div>
            </div>
          </motion.div>


          {/* ═══ Col 3 · Press & Recognition ═══════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase mb-6"
               style={{ color: "rgba(232,160,0,0.65)", ...SERIF }}>
              Recognition
            </p>

            <ul className="space-y-6" role="list">
              {PRESS.map((item) => (
                <li key={`${item.pub}-${item.year}`}>
                  <a
                    href={item.href}
                    target="_blank" rel="noopener noreferrer"
                    aria-label={`${item.award} — ${item.pub}, ${item.year}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A000] rounded"
                  >
                    <p
                      className="text-sm leading-snug transition-colors duration-200"
                      style={{ color: "rgba(255,255,255,0.76)", ...SERIF, fontStyle: "italic" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.76)")}
                    >
                      &ldquo;{item.award}&rdquo;
                    </p>
                    <p className="text-[10px] tracking-wide mt-0.5 uppercase"
                       style={{ color: "rgba(232,160,0,0.5)" }}>
                      {item.pub} &middot; {item.year}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "rgba(107,114,128,1)", ...SERIF }}>
                      {item.note}
                    </p>
                  </a>
                </li>
              ))}
            </ul>

            {/* Hyper-local community anchor */}
            <p className="mt-8 text-xs leading-relaxed"
               style={{ color: "rgba(107,114,128,1)", ...SERIF, fontStyle: "italic" }}>
              Located in the heart of{" "}
              <a
                href="https://maps.google.com/?q=Riverside,CA"
                target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E8A000] rounded"
                style={{ color: "rgba(156,163,175,1)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(232,160,0,0.65)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(156,163,175,1)")}
              >
                Riverside
              </a>
              , serving the Lake Mathews and Inland Empire communities.
            </p>
          </motion.div>


          {/* ═══ Col 4 · Hyper-Local Map ═══════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase"
               style={{ color: "rgba(232,160,0,0.65)", ...SERIF }}>
              Find Us
            </p>

            <MapCell />

            <a
              href={`https://maps.google.com/?q=${NAP.mapsQ}`}
              target="_blank" rel="noopener noreferrer"
              className="text-center text-[10px] tracking-widest uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A000] rounded py-0.5"
              style={{ color: "rgba(232,160,0,0.45)", ...SERIF }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E8A000")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,160,0,0.45)")}
            >
              Open in Google Maps →
            </a>
          </motion.div>

        </div>{/* /grid */}


        {/* ── Bottom bar ─────────────────────────────────────────────── */}
        <div
          className="mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative group text-[10px] tracking-[0.2em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A000] rounded"
                style={{ color: "rgba(75,85,99,1)", ...SERIF }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E8A000")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(75,85,99,1)")}
              >
                {item.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-[#E8A000] transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </Link>
            ))}
          </nav>

          <p
            className="text-[10px] tracking-wide text-center md:text-right"
            style={{ color: "rgba(55,65,81,1)", ...SERIF }}
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} Gra Pow Thai &amp; Sports Bar · Riverside, CA · All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
