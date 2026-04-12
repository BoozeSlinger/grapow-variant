"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useHoursStatus } from "@/hooks/useHoursStatus";

// ── NAP — update these to match your Google Business Profile exactly ──
const NAP = {
  name:      "Gra Pow Thai Fusion & Sports Bar",
  street:    "497 E Alessandro Blvd # D",
  city:      "Riverside",
  state:     "CA",
  zip:       "92508",
  country:   "US",
  phone:     "(951) 780-1132",
  phoneHref: "tel:+19517801132",
  mapsQ:     "497+E+Alessandro+Blvd+%23+D+Riverside+CA+92508",
};

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
    award: "Chef-Owner Feature",
    pub:   "Inland Empire Magazine",
    note:  "New Moves cover story",
    year:  "2024",
    href:  "https://grapow.net/elementor-1096/",
  },
  {
    award: "Best Thai Food",
    pub:   "Riverside Press-Enterprise",
    note:  "Best of Inland Empire",
    year:  "2020",
    href:  "https://www.pressenterprise.com/2020/09/20/best-of-inland-empire-2020-best-thai-food/",
  },
];

// ── Footer nav ────────────────────────────────────────────────────────
const NAV = [
  { label: "Food",       href: "/menu/food" },
  { label: "Happy Hour", href: "/menu/happy-hour" },
  { label: "Drinks",     href: "/menu/drinks" },
  { label: "Sushi Bar",  href: "/menu/sushi" },
  { label: "Bookings",   href: "/reservations" },
  { label: "Our Story",  href: "/#our-story" },
  { label: "The Wok",    href: "/#wook" },
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
  url: "https://grapow.net",
});

// ═══════════════════════════════════════════════════════════════════════
//  Map Cell
// ═══════════════════════════════════════════════════════════════════════
function MapCell() {
  const [live, setLive] = useState(false);
  const embedSrc = `https://maps.google.com/maps?q=${NAP.mapsQ}&output=embed&z=15`;

  return (
    <div
      className="relative w-full h-[150px] overflow-hidden rounded-xl cursor-pointer shadow-2xl border border-white/5"
      onMouseEnter={() => setLive(true)}
      onClick={() => setLive(true)}
      role="button"
      tabIndex={0}
      aria-label="Interactive map"
    >
      {live ? (
        <iframe
          src={embedSrc}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.9)" }}
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-[#0d1117] flex flex-col items-center justify-center p-8 text-center group font-sans">
          <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-3 group-hover:scale-110 transition-transform">
             <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
          </div>
          <p className="text-white text-xs font-bold tracking-widest uppercase mb-1">{NAP.street}</p>
          <p className="text-gray-500 text-[9px] tracking-[0.3em] uppercase">{NAP.city}, {NAP.state} {NAP.zip}</p>
          <span className="mt-4 text-[8px] text-gold/40 border-b border-gold/20 tracking-widest uppercase px-1">Hover to Activate Map</span>
        </div>
      )}
    </div>
  );
}

export default function Footer() {
  const { status, isOpen } = useHoursStatus();

  return (
    <footer id="site-footer" className="relative bg-[#050505] pt-16 pb-8 overflow-hidden border-t border-white/5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
      <div className="grain-overlay opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image src="/grapow-new-logo.png" alt="Gra Pow" width={120} height={80} className="w-auto h-12" />
            </Link>
            <p className="text-gray-500 text-[11px] leading-relaxed mb-6 max-w-[220px]">
              Thai heritage meets high-octane sports. Riverside&apos;s boldest table since 2012.
            </p>
            <div className="flex gap-3">
               {["instagram", "facebook"].map(social => (
                 <a key={social} href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-gold hover:bg-white/10 transition-all border border-white/10">
                   <span className="sr-only">{social}</span>
                   {social === "instagram" ? (
                     <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                   ) : (
                     <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                   )}
                 </a>
               ))}
             </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-white text-[10px] font-bold tracking-[0.3em] uppercase mb-6">Explore</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {NAV.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-500 hover:text-gold text-[10px] tracking-widest uppercase transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Awards */}
          <div>
            <h4 className="text-white text-[10px] font-bold tracking-[0.3em] uppercase mb-6">Awards</h4>
            <ul className="space-y-4">
              {PRESS.slice(0, 2).map(item => (
                <li key={item.award + item.year}>
                  <span className="block text-[9px] text-gold tracking-widest uppercase mb-0.5">{item.award}</span>
                  <span className="block text-gray-500 text-[10px] italic">{item.pub}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Map Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">{status}</span>
            </div>
            <div className="h-[120px]">
              <MapCell />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] tracking-[0.3em] uppercase text-gray-600">
          <p>© {new Date().getFullYear()} Gra Pow Thai Fusion & Sports Bar</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
