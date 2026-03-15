"use client";
import Image from "next/image";
import Link from "next/link";
import { cldImage, cldVideo, ASSETS } from "@/lib/cloudinary";

export default function VideoHero() {
  return (
    <section
      id="video-hero"
      className="relative h-[90vh] min-h-[600px] overflow-hidden flex items-center justify-center"
      aria-label="Welcome to Gra Pow"
    >
      {/* Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source
          src={`https://res.cloudinary.com/dqj3xyvey/video/upload/q_auto/${ASSETS.heroVideo}`}
          type="video/mp4"
        />
      </video>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.80) 82%, rgba(0,0,0,1) 100%)",
        }}
      />

      {/* Grain texture */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center px-6">
        <Image
          src={cldImage(ASSETS.logo, "h_300,f_auto,q_auto")}
          alt="Gra Pow Thai & Sports Bar"
          width={300}
          height={300}
          className="w-[230px] md:w-[346px] lg:w-[461px] h-auto object-contain drop-shadow-2xl"
          priority
        />
        <p className="font-[family-name:var(--font-baskerville)] text-white/80 tracking-[0.25em] text-xs md:text-sm uppercase">
          Thai Kitchen &amp; Sports Bar &nbsp;·&nbsp; Riverside, CA
        </p>
        <Link href="#hero-diagonal" className="btn-outline mt-2">
          Explore the Menu
        </Link>

        {/* Scroll cue */}
        <div className="scroll-cue mt-6 opacity-60" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8A000" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
