"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cldImage, cldVideo, ASSETS } from "@/lib/cloudinary";

export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Non-standard Safari AirPlay attribute — set imperatively to avoid JSX typing.
    video.setAttribute("x-webkit-airplay", "deny");

    // iOS Low Power Mode blocks autoplay — call play() explicitly and
    // catch the rejection silently (poster stays visible as fallback).
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked (Low Power Mode, background tab, etc.)
        // The poster image is already shown — nothing else needed.
      });
    }

    // Pause the video when it scrolls completely off-screen to save
    // battery on mobile; resume when it comes back into view.
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

  // Cloudinary video URLs
  // WebM (VP9) — smaller file, chosen by Chrome / Firefox / Android
  const webmSrc = cldVideo(ASSETS.heroVideo, "q_auto,f_webm,vc_vp9");
  // MP4 (H.264) — Safari / iOS fallback
  // #t=0.001 tells iOS Safari to seek to 1 ms so it renders the first
  // frame instead of a black box while waiting for autoplay to fire.
  const mp4Src  = `${cldVideo(ASSETS.heroVideo, "q_auto,f_mp4,vc_h264")}#t=0.001`;
  // Poster: Cloudinary extracts the first frame of the video on-the-fly.
  // This gives iOS a proper thumbnail to show before the video loads.
  const posterSrc = cldVideo(ASSETS.heroVideo, "so_0,f_jpg,q_auto,w_1280");

  return (
    <section
      id="video-hero"
      className="relative h-[90vh] min-h-[600px] overflow-hidden flex items-center justify-center"
      aria-label="Welcome to Gra Pow"
    >
      {/* ── Video ─────────────────────────────────────────────────── */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y: useTransform(scrollY, [0, 500], [0, 150]) }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-center"
          autoPlay
          muted          // required for autoplay on iOS
          loop
          playsInline    // required for inline playback on iOS (no fullscreen hijack)
          preload="metadata"  // load enough to show first frame; avoids draining
                              // mobile data/battery with "auto" on slow connections
          poster={posterSrc}
          disablePictureInPicture
          aria-hidden="true"
        >
          {/* WebM first — Chrome/Firefox/Android choose this */}
          <source src={webmSrc} type="video/webm" />
          {/* MP4 fallback — Safari/iOS */}
          <source src={mp4Src} type="video/mp4" />
        </video>
      </motion.div>

      {/* ── Gradient overlay ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.80) 82%, rgba(0,0,0,1) 100%)",
        }}
      />

      {/* ── Grain texture ─────────────────────────────────────────── */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center px-6 mt-12 md:mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="animate-float"
        >
          <Image
            src="/grapow-new-logo.png"
            alt="Gra Pow Thai & Sports Bar"
            width={500}
            height={500}
            className="w-[230px] md:w-[346px] lg:w-[461px] h-auto object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-[family-name:var(--font-baskerville)] text-white/80 tracking-[0.25em] text-xs md:text-sm uppercase"
        >
          Thai Kitchen &amp; Sports Bar &nbsp;·&nbsp; Riverside, CA
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-2"
        >
          <Link href="#hero-diagonal" className="btn-outline">
            Explore the Menu
          </Link>
          <Link href="#site-footer" className="btn-gold px-8 py-3.5 border-2 border-transparent hover:border-white/20">
            Reserve Now
          </Link>
        </motion.div>

        {/* Scroll cue */}
        <Link 
          href="#hero-diagonal"
          className="scroll-cue mt-10 opacity-60 hover:opacity-100 transition-opacity animate-pulse-slow" 
          aria-hidden="true"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8A000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 13 12 18 17 13"></polyline>
            <polyline points="7 6 12 11 17 6"></polyline>
          </svg>
        </Link>
      </div>
    </section>
  );
}
