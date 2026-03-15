"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cldImage, ASSETS } from "@/lib/cloudinary";

const NAV = [
  { label: "Food",       href: "/menu/food" },
  { label: "Happy Hour", href: "/menu/happy-hour" },
  { label: "Drinks",     href: "/menu/drinks" },
  { label: "Sushi Bar",  href: "/menu/sushi" },
  { label: "Events",     href: "/#events" },
  { label: "The Wok",    href: "/#wook" },
  { label: "Press",      href: "/#media" },
  { label: "Find Us",    href: "/#site-footer" },
];

export default function Header() {
  const [open, setOpen]         = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Mobile nav overlay ───────────────────────────── */}
      <nav
        className={`fixed inset-0 z-[200] bg-[#111111] flex-col items-center justify-center gap-8 ${open ? "flex" : "hidden"}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-6 left-6 text-white p-2"
          aria-label="Close navigation"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="font-[family-name:var(--font-dancing)] text-5xl text-white hover:text-[#E8A000] transition-colors"
          >
            {item.label}
          </Link>
        ))}
        <Link href="#site-footer" onClick={() => setOpen(false)} className="btn-outline mt-2">
          Reserve a Table
        </Link>
      </nav>

      {/* ── Header bar ──────────────────────────────────── */}
      <header
        id="site-header"
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500"
        style={{
          background:     pastHero ? "rgba(0,0,0,0.18)" : "transparent",
          backdropFilter: pastHero ? "blur(12px)" : "none",
          WebkitBackdropFilter: pastHero ? "blur(12px)" : "none",
          borderBottom:   "none",
        }}
        role="banner"
      >
        <div className="flex items-center justify-between px-5 py-4 max-w-screen-2xl mx-auto">

          {/* Hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col gap-[5px] p-1"
            aria-label="Open navigation menu"
            aria-expanded={open}
          >
            <span className="block w-[26px] h-[2px] bg-white rounded-sm" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))" }} />
            <span className="block w-[26px] h-[2px] bg-white rounded-sm" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))" }} />
            <span className="block w-[26px] h-[2px] bg-white rounded-sm" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))" }} />
          </button>

          {/* Center logo — animates in after scrolling past hero */}
          <Link
            href="/"
            aria-label="Gra Pow home"
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-500"
            style={{
              opacity:   pastHero ? 1 : 0,
              transform: `translateX(-50%) translateY(${pastHero ? "0px" : "-10px"})`,
              pointerEvents: pastHero ? "auto" : "none",
            }}
          >
            <Image
              src={cldImage(ASSETS.logo, "h_80,f_auto,q_auto")}
              alt="Gra Pow"
              width={80}
              height={64}
              className="h-12 w-auto object-contain drop-shadow-lg"
            />
          </Link>

          {/* Right: social + reserve */}
          <div className="flex items-center gap-2 md:gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
               className="social-sq" aria-label="Instagram">
              <svg width="18" height="18" fill="#111" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
               className="social-sq" aria-label="Facebook">
              <svg width="18" height="18" fill="#111" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <Link href="#site-footer" className="btn-gold hidden sm:inline-block">Reserve</Link>
          </div>
        </div>
      </header>
    </>
  );
}
