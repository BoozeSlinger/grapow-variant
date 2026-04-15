"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cldImage, ASSETS } from "@/lib/cloudinary";
import { useHoursStatus } from "@/hooks/useHoursStatus";
import Breadcrumbs from "./Breadcrumbs";
import Magnetic from "./Magnetic";

const NAV = [
  { label: "Food",       href: "/menu/food" },
  { label: "Happy Hour", href: "/menu/happy-hour" },
  { label: "Drinks",     href: "/menu/drinks" },
  { label: "Sushi Bar",  href: "/menu/sushi" },
  { label: "About",      href: "/about" },
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
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Mobile nav overlay ───────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0a0a0a]/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {/* Background decorative element */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 0.05 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
            >
              <h2 className="font-[family-name:var(--font-dancing)] text-[45vw] text-white select-none whitespace-nowrap opacity-20">Gra Pow</h2>
            </motion.div>

            <motion.button
              onClick={() => setOpen(false)}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-8 right-8 text-white/50 p-2 hover:text-gold transition-colors z-10"
              aria-label="Close navigation"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>

            <div className="flex flex-col items-center gap-4 relative z-10">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.1 + i * 0.05,
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group relative block py-2 px-6"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`font-[family-name:var(--font-baskerville)] text-4xl md:text-6xl text-white/90 group-hover:text-gold transition-colors italic block ${pathname === item.href ? "text-gold" : ""}`}
                    >
                      {item.label}
                    </motion.span>
                    {pathname === item.href && (
                      <motion.div 
                        layoutId="nav-active"
                        className="absolute -bottom-1 left-6 right-6 h-[1px] bg-gold"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.7 }}
               className="mt-14 relative z-10"
            >
              <motion.button 
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("open-reservation"));
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(232,160,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold px-16 py-5 text-sm tracking-[0.3em] uppercase font-bold rounded-full"
              >
                RESERVE A TABLE
              </motion.button>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Header bar ──────────────────────────────────── */}
      <header
        id="site-header"
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 ease-in-out"
        style={{
          background:     pastHero ? "rgba(8,8,8,0.92)" : "transparent",
          backdropFilter: pastHero ? "blur(24px) saturate(1.2)" : "none",
          WebkitBackdropFilter: pastHero ? "blur(24px) saturate(1.2)" : "none",
          borderBottom:   pastHero ? "1px solid rgba(255,255,255,0.08)" : "none",
          paddingTop: pastHero ? "0.6rem" : "1.5rem",
          paddingBottom: pastHero ? "0.6rem" : "1.5rem",
        }}
        role="banner"
      >
        <div className="flex items-center justify-between px-6 md:px-12 max-w-screen-2xl mx-auto">

          <div className="flex items-center gap-8">
            <Magnetic strength={0.25}>
              {/* Hamburger */}
              <motion.button
                onClick={() => setOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="group flex flex-col gap-[7px] p-2"
                aria-label="Open navigation menu"
                aria-expanded={open}
              >
                <motion.span 
                  animate={{ width: open ? 0 : 24 }}
                  className="block h-[1.5px] bg-white group-hover:bg-gold transition-colors" 
                />
                <motion.span 
                  animate={{ width: open ? 0 : 16 }}
                  className="block h-[1.5px] bg-white group-hover:bg-gold transition-colors ml-auto" 
                />
                <motion.span 
                  animate={{ width: open ? 0 : 24 }}
                  className="block h-[1.5px] bg-white group-hover:bg-gold transition-colors" 
                />
              </motion.button>
            </Magnetic>

            {/* Breadcrumbs - Only visible on wider screens when scrolled */}
            <div className={`hidden lg:block transition-all duration-700 transform ${pastHero ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}>
              <Breadcrumbs />
            </div>
          </div>

          {/* Center logo */}
          <Magnetic strength={0.15}>
            <Link
              href="/"
              aria-label="Gra Pow home"
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{
                transform: `translateX(-50%) scale(${pastHero ? 0.75 : 1})`,
              }}
            >
              <motion.div
                whileHover={{ y: -3, filter: "brightness(1.2)" }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src="/grapow-new-logo.png"
                  alt="Gra Pow Riverside logo"
                  width={160}
                  height={120}
                  className="h-10 md:h-14 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                  priority
                />
              </motion.div>
            </Link>
          </Magnetic>

          {/* Right: Status + Reserve */}
          <div className="flex items-center gap-6">
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"} animate-pulse`} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80">
                {status}
              </span>
            </motion.div>
            
            <Magnetic strength={0.3}>
              <motion.button 
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.dispatchEvent(new CustomEvent("open-reservation"))}
                className={`btn-gold !py-2.5 !px-8 text-[11px] font-bold tracking-[0.2em] transition-all duration-700 ${pastHero ? "shadow-2xl" : ""}`}
              >
                RESERVE
              </motion.button>
            </Magnetic>
          </div>
        </div>
      </header>
    </>
  );
}
