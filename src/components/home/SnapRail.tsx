"use client";
/**
 * A list that is a grid at 1024+ and a scroll-snap rail below, with a visible "1 / 3" position counter
 * (aria-hidden — the <ul aria-label> carries the semantics). Children are the <li> items.
 */
import { useEffect, useRef, useState } from "react";

export function SnapRail({ label, count, className, listClassName, children }: {
  label: string; count: number; className?: string; listClassName?: string; children: React.ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(1);

  useEffect(() => {
    const ul = ref.current;
    if (!ul) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const items = [...ul.children] as HTMLElement[];
      if (!items.length) return;
      const left = ul.getBoundingClientRect().left;
      // The item whose left edge sits closest to the rail's snap start.
      const pad = parseFloat(getComputedStyle(ul).scrollPaddingLeft) || 0;
      let best = 0, bestD = Infinity;
      items.forEach((el, i) => {
        const d = Math.abs(el.getBoundingClientRect().left - left - pad);
        if (d < bestD) { bestD = d; best = i; }
      });
      setIndex(best + 1);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    ul.addEventListener("scroll", onScroll, { passive: true });
    return () => { ul.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  return (
    <div className={className}>
      <ul ref={ref} aria-label={label} className={listClassName}>
        {children}
      </ul>
      <p aria-hidden="true" className="mt-3 t-label tnum text-fg-muted lg:hidden">
        {index} / {count}
      </p>
    </div>
  );
}
