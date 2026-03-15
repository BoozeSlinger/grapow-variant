import Link from "next/link";
import { cldImage, ASSETS } from "@/lib/cloudinary";

const COLS = [
  {
    id:    "hcol-1",
    label: "Food",
    href:  "/menu/food",
    img:   ASSETS.foodBg,
    alt:   "Thai food dishes",
    // right edge diagonal; extends past visual 1/3
    style: {
      left:      "0",
      width:     "calc(100% / 3 + 90px)",
      clipPath:  "polygon(0 0, 100% 0, calc(100% - 90px) 100%, 0 100%)",
      zIndex:    3,
    },
  },
  {
    id:    "hcol-2",
    label: "Happy Hour",
    href:  "/menu/happy-hour",
    img:   ASSETS.barBg,
    alt:   "Gra Pow bar interior",
    style: {
      left:      "calc(100% / 3)",
      width:     "calc(100% / 3 + 90px)",
      clipPath:  "polygon(0 0, 100% 0, calc(100% - 90px) 100%, 0 100%)",
      zIndex:    2,
    },
  },
  {
    id:    "hcol-3",
    label: "Drinks",
    href:  "/menu/drinks",
    img:   ASSETS.drinksBg,
    alt:   "Craft beers and cocktails",
    style: {
      left:      "calc(100% * 2 / 3)",
      right:     "0",
      zIndex:    1,
    },
  },
];

export default function HeroDiagonal() {
  return (
    <section
      id="hero-diagonal"
      className="relative overflow-hidden"
      style={{ height: "100vh", minHeight: "580px" }}
      aria-label="Explore our menu categories"
    >
      {COLS.map((col) => (
        <Link
          key={col.id}
          id={col.id}
          href={col.href}
          className="hcol"
          style={col.style as React.CSSProperties}
          aria-label={`Explore ${col.label}`}
        >
          {/* Background image */}
          <div
            className="hcol-bg"
            style={{ backgroundImage: `url('${cldImage(col.img)}')` }}
            role="img"
            aria-label={col.alt}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/45" />
          {/* Label + CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <h2 className="font-[family-name:var(--font-dancing)] text-6xl md:text-7xl text-white drop-shadow-xl">
              {col.label}
            </h2>
            <span className="btn-outline">Explore</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
