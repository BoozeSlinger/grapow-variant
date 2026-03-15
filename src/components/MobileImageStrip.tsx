"use client";
import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  src: string;
  alt: string;
  height?: number; // px
}

const noiseSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='1'/></svg>`;

export default function MobileImageStrip({ src, alt, height = 280 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div
      ref={ref}
      className="md:hidden relative w-full overflow-hidden"
      style={{ height }}
    >
      {/* Image — grayscale → full colour on scroll */}
      <motion.div
        className="absolute inset-0"
        initial={{ filter: "grayscale(100%) brightness(0.45) saturate(0)", scale: 1.06 }}
        animate={
          inView
            ? { filter: "grayscale(0%) brightness(1) saturate(1)", scale: 1 }
            : { filter: "grayscale(100%) brightness(0.45) saturate(0)", scale: 1.06 }
        }
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="100vw"
          loading="lazy"
        />
      </motion.div>

      {/* Ink overlay lifts on scroll */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: inView ? 0 : 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        style={{ background: "rgba(8,8,8,0.65)" }}
        aria-hidden="true"
      />

      {/* Grain texture — same as press cards */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: `url("${noiseSvg}")`, backgroundSize: "200px 200px" }}
        aria-hidden="true"
      />

      {/* Edge fades */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.6) 100%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
