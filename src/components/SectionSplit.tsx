"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

interface Props {
  id?:             string;
  eyebrow:         string;
  heading:         string;
  body:            string;
  ctaLabel:        string;
  ctaHref:         string;
  imageSrc:        string;
  imageAlt:        string;
  reverse?:        boolean;
  dark?:           boolean;
  /** On mobile, force text block above image regardless of reverse prop */
  mobileTextFirst?: boolean;
}

export default function SectionSplit({
  id, eyebrow, heading, body, ctaLabel, ctaHref,
  imageSrc, imageAlt, reverse = false, dark = false, mobileTextFirst = false,
}: Props) {
  const bg = dark ? "bg-[#222222]" : "bg-[#1a1a1a]";

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-15% 0px" });

  const isSushi = heading.toLowerCase().includes("sushi");

  const textBlock = (
    <div className={`flex-1 ${bg} flex flex-col justify-center px-8 md:px-20 py-20 md:py-32 relative overflow-hidden`}>
      {/* Decorative large numbers or text for premium feel */}
      <div className="absolute top-0 right-0 opacity-[0.02] font-[family-name:var(--font-dancing)] text-[15rem] pointer-events-none select-none -translate-y-1/2 translate-x-1/3">
        {heading.charAt(0)}
      </div>

      <ScrollReveal>
        <p className={`font-[family-name:var(--font-baskerville)] text-[#E8A000] tracking-[0.4em] text-[10px] md:text-xs uppercase mb-6 ${isSushi ? "animate-pulse" : ""}`}>
          {isSushi ? (
            <>
              Opens at <span className="bg-[#E8A000] text-black px-2 py-0.5 font-bold rounded-sm">5PM</span> · <span className="text-red-500 font-bold border-b border-red-500/30">Closed Sun & Mon</span>
            </>
          ) : eyebrow}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <motion.h2 
          className="font-[family-name:var(--font-dancing)] text-5xl md:text-7xl text-white whitespace-pre-line leading-tight"
        >
          {heading}
        </motion.h2>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <p className="font-[family-name:var(--font-opensans)] text-gray-400 mt-8 mb-4 leading-relaxed text-sm md:text-lg max-w-xl">
          {body}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <Link href={ctaHref} className="self-start inline-block">
          <motion.button
            whileHover={{ scale: 1.05, x: 5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.95 }}
            className="btn-outline mt-10 px-10 py-4 text-xs tracking-[0.3em] font-bold uppercase transition-all hover:bg-gold hover:text-black hover:border-gold"
          >
            {ctaLabel}
          </motion.button>
        </Link>
      </ScrollReveal>
    </div>
  );

  const noiseSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='1'/></svg>`;

  const imageBlock = (
    <div className="flex-1 relative overflow-hidden group" style={{ minHeight: "450px" }}>
      {/* Image — full grayscale → full colour on scroll-in + subtle zoom */}
      <motion.div
        className="absolute inset-0"
        initial={{ filter: "grayscale(100%) brightness(0.4) saturate(0)", scale: 1.15 }}
        animate={inView
          ? { filter: "grayscale(0%) brightness(1) saturate(1.1)", scale: 1 }
          : { filter: "grayscale(100%) brightness(0.4) saturate(0)", scale: 1.15 }
        }
        transition={{ duration: 1.8, ease: [0.23, 1, 0.32, 1] }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 50vw"
          loading="lazy"
        />
      </motion.div>

      {/* Grain texture — always present, very subtle */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("${noiseSvg}")`, backgroundSize: "200px 200px" }}
        aria-hidden="true"
      />

      {/* Ink overlay — lifts on scroll */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: inView ? 0 : 1 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{ background: "rgba(8,8,8,0.75)" }}
        aria-hidden="true"
      />
      
      {/* Decorative corner element */}
      <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-gold/40 transform scale-0 group-hover:scale-100 transition-transform duration-500" />
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`flex min-h-[600px] md:flex-row ${mobileTextFirst && !reverse ? "flex-col-reverse" : "flex-col"}`}
    >
      {reverse ? <>{textBlock}{imageBlock}</> : <>{imageBlock}{textBlock}</>}
    </section>
  );
}
