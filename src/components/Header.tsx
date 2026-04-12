"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cldImage, ASSETS } from "@/lib/cloudinary";
import { useHoursStatus } from "@/hooks/useHoursStatus";
import Breadcrumbs from "./Breadcrumbs";

const NAV = [
  { label: "Food",       href: "/menu/food" },
  { label: "Happy Hour", href: "/menu/happy-hour" },
  { label: "Drinks",     href: "/menu/drinks" },
  { label: "Sushi Bar",  href: "/menu/sushi" },
  { label: "Reservations", href: "/reservations" },
  { label: "Events",     href: "/#events" },
  { label: "The Wok",    href: "/#wook" },
  { label: "Press",      href: "/#media" },
  { label: "Find Us",    href: "/#site-footer" },
];

export default function Header() {
  const [open, setOpen]         = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const pathname = usePathname();
  const { status, isOpen } = useHoursStatus();

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > 80);
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
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="fixed inset-0 z-[200] bg-[#0a0a0a]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-8 left-8 text-white p-2 hover:text-[#E8A000] transition-colors"
              aria-label="Close navigation"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {NAV.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`font-[family-name:var(--font-baskerville)] text-4xl text-white/90 hover:text-[#E8A000] transition-colors italic ${pathname === item.href ? "text-gold" : ""}`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.5 }}
               className="mt-6"
            >
              <Link href="/reservations" onClick={() => setOpen(false)} className="btn-gold px-12 py-4">
                Reserve
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Header bar ──────────────────────────────────── */}
      <header
        id="site-header"
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-700"
        style={{
          background:     pastHero ? "rgba(10,10,10,0.85)" : "transparent",
          backdropFilter: pastHero ? "blur(20px)" : "none",
          WebkitBackdropFilter: pastHero ? "blur(20px)" : "none",
          borderBottom:   pastHero ? "1px solid rgba(255,255,255,0.1)" : "none",
          paddingTop: pastHero ? "0.75rem" : "1.25rem",
          paddingBottom: pastHero ? "0.75rem" : "1.25rem",
        }}
        role="banner"
      >
        <div className="flex items-center justify-between px-6 max-w-screen-2xl mx-auto">

          <div className="flex items-center gap-6">
            {/* Hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="group flex flex-col gap-[6px] p-1"
              aria-label="Open navigation menu"
              aria-expanded={open}
            >
              <span className="block w-6 h-[2px] bg-white group-hover:bg-gold transition-colors" />
              <span className="block w-4 h-[2px] bg-white group-hover:bg-gold transition-colors" />
              <span className="block w-6 h-[2px] bg-white group-hover:bg-gold transition-colors" />
            </button>

            {/* Breadcrumbs - Only visible on wider screens when scrolled */}
            <div className={`hidden lg:block transition-opacity duration-300 ${pastHero ? "opacity-100" : "opacity-0"}`}>
              <Breadcrumbs />
            </div>
          </div>

          {/* Center logo */}
          <Link
            href="/"
            aria-label="Gra Pow home"
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-500"
            style={{
              opacity:   pastHero ? 1 : 1, // Keep visible but maybe scale?
              transform: `translateX(-50%) scale(${pastHero ? 0.85 : 1})`,
            }}
          >
            <Image
              src="/grapow-new-logo.png"
              alt="Gra Pow Riverside logo"
              width={140}
              height={100}
              className="h-10 md:h-12 w-auto object-contain drop-shadow-2xl"
              priority
            />
          </Link>

          {/* Right: Status + Reserve */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOpen ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-[10px] uppercase tracking-widest font-medium text-white/60">
                {status}
              </span>
            </div>
            
            <Link 
              href="/reservations" 
              className={`btn-gold !py-2 !px-6 text-xs transition-all duration-300 ${pastHero ? "scale-90" : "scale-100"}`}
            >
              Reserve
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
