"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { cldImage, cldVideo, ASSETS } from "@/lib/cloudinary";
import { useHoursStatus } from "@/hooks/useHoursStatus";

const TAGLINES = [
  "Thai heritage meets high-octane sports",
  "Beyond the Burn. Above the Game.",
  "Riverside's Boldest Table",
  "Thai Street Food. Redefined.",
];

export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();
  const hours = useHoursStatus();
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.setAttribute("x-webkit-airplay", "deny");
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const webmSrc = cldVideo(ASSETS.heroVideo, "q_auto,f_webm,vc_vp9");
  const mp4Src  = `${cldVideo(ASSETS.heroVideo, "q_auto,f_mp4,vc_h264")}#t=0.001`;
  const posterSrc = cldVideo(ASSETS.heroVideo, "so_0,f_jpg,q_auto,w_1280");

  return (
    <section
      id="video-hero"
      className="relative h-screen min-h-[700px] overflow-hidden flex items-center justify-center pt-20"
      aria-label="Welcome to Gra Pow"
    >
      {/* ── Video Background ─────────────────────────────────────────── */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y: useTransform(scrollY, [0, 500], [0, 150]) }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          disablePictureInPicture
          aria-hidden="true"
        >
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>
      </motion.div>

      {/* ── Overlay System ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 85%, rgba(0,0,0,1) 100%)",
        }}
      />
      <div className="grain-overlay opacity-[0.05]" aria-hidden="true" />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 text-center px-6 max-w-5xl">
        
        {/* Badges */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 md:gap-8 mb-4"
        >
          {["Best Thai Food 2023", "Chef Feature '24", "Riverside Favorite"].map((text) => (
            <div key={text} className="flex items-center gap-2 text-[9px] md:text-[10px] tracking-[0.3em] font-bold text-gold uppercase border-l border-gold/30 pl-4 h-4">
              {text}
            </div>
          ))}
        </motion.div>

        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative group"
        >
          <Image
            src="/grapow-new-logo.png"
            alt="Gra Pow Thai & Sports Bar"
            width={500}
            height={500}
            className="w-[280px] md:w-[400px] lg:w-[480px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            priority
          />
          <div className="absolute -inset-10 bg-gold/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </motion.div>

        {/* Rotating Taglines */}
        <div className="h-8 md:h-10 overflow-hidden relative w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={taglineIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 font-[family-name:var(--font-baskerville)] text-white/90 tracking-[0.2em] text-sm md:text-lg uppercase italic font-medium"
            >
              {TAGLINES[taglineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Status indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-3 glass px-5 py-2 rounded-full border border-white/10"
        >
          <span 
            className={`w-2 h-2 rounded-full animate-pulse-slow`} 
            style={{ 
              backgroundColor: hours.color,
              boxShadow: `0 0 10px ${hours.color}`
            }} 
          />
          <span className="text-[10px] tracking-[0.25em] text-white/70 uppercase">
            {hours.status} {hours.isHappyHour ? "• Happy Hour On" : ""}
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-5 mt-4"
        >
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-reservation"))}
            className="bg-gold text-dark font-bold text-[10px] md:text-[11px] tracking-[0.3em] uppercase px-12 py-5 rounded-sm gold-glow hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_15px_30px_rgba(232,160,0,0.3)]"
          >
            Reserve a Table
          </button>
          <Link 
            href="/menu/food" 
            className="border border-white/20 text-white font-bold text-[10px] md:text-[11px] tracking-[0.3em] uppercase px-10 py-5 rounded-sm hover:bg-white hover:text-dark transition-all backdrop-blur-md transform hover:scale-105"
          >
            Explore the Menu
          </Link>
        </motion.div>

        {/* Scroll cue */}
        <Link 
          href="#our-story"
          className="mt-12 opacity-40 hover:opacity-100 transition-opacity animate-bounce" 
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="gold" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 13 12 18 17 13"></polyline>
            <polyline points="7 6 12 11 17 6"></polyline>
          </svg>
        </Link>
      </div>
    </section>
  );
}
