"use client";
/**
 * Navigation pending line (spec §11.1). Each chrome <Link> holds a <NavPending/>, which reads
 * useLinkStatus() and reports to the header; the header draws ONE fixed 2px chili-lit bar under itself.
 * The bar grows with transform: scaleX after a 100ms delay (no flicker on fast navigations) and is a
 * static full-width line under reduced motion.
 */
import { createContext, useContext, useEffect } from "react";
import { useLinkStatus } from "next/link";

/** Header-provided reporter: +1 while a link is pending, −1 when it settles. */
export const PendingContext = createContext<((delta: 1 | -1) => void) | null>(null);

export function NavPending() {
  const { pending } = useLinkStatus();
  const report = useContext(PendingContext);
  useEffect(() => {
    if (!pending || !report) return;
    report(1);
    return () => report(-1);
  }, [pending, report]);
  return null;
}

/** The single bar; the header renders it as a direct child so `top-full` sits on its bottom edge. */
export function PendingBar({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "pointer-events-none absolute inset-x-0 top-full h-0.5 origin-left bg-chili-lit transition-[scale,opacity] ease-out",
        active
          ? "scale-x-[.85] opacity-100 delay-100 duration-[1600ms] motion-reduce:scale-x-100"
          : "scale-x-0 opacity-0 duration-(--dur-2)",
      ].join(" ")}
    />
  );
}
