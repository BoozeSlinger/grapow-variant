"use client";
/** Framer runs only through `m.*` under LazyMotion + domAnimation + strict (spec §7.3, §10.16). */
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
