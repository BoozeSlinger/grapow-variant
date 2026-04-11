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
    <div className={`flex-1 ${bg} flex flex-col justify-center px-10 md:px-16 py-16`}>
      <ScrollReveal>
        <p className={`font-[family-name:var(--font-baskerville)] text-[#E8A000] tracking-widest text-xs uppercase mb-3 ${isSushi ? "animate-pulse" : ""}`}>
          {isSushi ? (
            <>
              Opens at <span className="bg-[#E8A000] text-black px-1.5 py-0.5 font-bold rounded-sm">5PM</span> · <span className="text-red-500 font-bold border-b border-red-500/30">Closed Sun & Mon</span>
            </>
          ) : eyebrow}
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="font-[family-name:var(--font-dancing)] text-5xl md:text-6xl text-white whitespace-pre-line"
        >
          {heading}
        </motion.h2>
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <p className="font-[family-name:var(--font-opensans)] text-gray-300 mt-6 leading-relaxed text-sm md:text-base">
          {body}
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.3}>
        <Link href={ctaHref} className="btn-outline mt-8 self-start inline-block">
          {ctaLabel}
        </Link>
      </ScrollReveal>
    </div>
  );

  const noiseSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='1'/></svg>`;

  const imageBlock = (
    <div className="flex-1 relative overflow-hidden" style={{ minHeight: "360px" }}>
      {/* Image — full grayscale → full colour on scroll-in */}
      <motion.div
        className="absolute inset-0"
        initial={{ filter: "grayscale(100%) brightness(0.45) saturate(0)", scale: 1.06 }}
        animate={inView
          ? { filter: "grayscale(0%) brightness(1) saturate(1)", scale: 1 }
          : { filter: "grayscale(100%) brightness(0.45) saturate(0)", scale: 1.06 }
        }
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 50vw"
          loading="lazy"
        />
      </motion.div>

      {/* Grain texture — always present, very subtle */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: `url("${noiseSvg}")`, backgroundSize: "200px 200px" }}
        aria-hidden="true"
      />

      {/* Ink overlay — lifts on scroll */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: inView ? 0 : 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        style={{ background: "rgba(8,8,8,0.70)" }}
        aria-hidden="true"
      />
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`flex min-h-[520px] md:flex-row ${mobileTextFirst && !reverse ? "flex-col-reverse" : "flex-col"}`}
    >
      {reverse ? <>{textBlock}{imageBlock}</> : <>{imageBlock}{textBlock}</>}
    </section>
  );
}
