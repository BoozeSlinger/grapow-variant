"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

interface Props {
  id?:        string;
  eyebrow:    string;
  heading:    string;
  body:       string;
  ctaLabel:   string;
  ctaHref:    string;
  imageSrc:   string;
  imageAlt:   string;
  reverse?:   boolean;
  dark?:      boolean;
}

export default function SectionSplit({
  id, eyebrow, heading, body, ctaLabel, ctaHref,
  imageSrc, imageAlt, reverse = false, dark = false,
}: Props) {
  const bg = dark ? "bg-[#222222]" : "bg-[#1a1a1a]";

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-15% 0px" });

  const textBlock = (
    <div className={`flex-1 ${bg} flex flex-col justify-center px-10 md:px-16 py-16`}>
      <ScrollReveal>
        <p className="font-[family-name:var(--font-baskerville)] text-[#E8A000] tracking-widest text-xs uppercase mb-3">
          {eyebrow}
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <h2 className="font-[family-name:var(--font-dancing)] text-5xl md:text-6xl text-white whitespace-pre-line">
          {heading}
        </h2>
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

  const imageBlock = (
    <div className="flex-1 relative overflow-hidden" style={{ minHeight: "360px" }}>
      {/* Image — transitions from grayscale to full color on scroll */}
      <motion.div
        className="absolute inset-0"
        animate={inView
          ? { filter: "grayscale(0%) brightness(1) saturate(1)", scale: 1 }
          : { filter: "grayscale(85%) brightness(0.55) saturate(0.3)", scale: 1.03 }
        }
        transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
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

      {/* Dark ink overlay that lifts on scroll */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={inView
          ? { opacity: 0 }
          : { opacity: 1 }
        }
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ background: "rgba(10,10,10,0.55)" }}
        aria-hidden="true"
      />
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      className="flex min-h-[520px] flex-col md:flex-row"
    >
      {reverse ? <>{textBlock}{imageBlock}</> : <>{imageBlock}{textBlock}</>}
    </section>
  );
}
