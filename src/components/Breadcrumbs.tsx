"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const paths = pathname.split("/").filter(Boolean);
  
  return (
    <nav className="relative z-20 flex items-center gap-2 mb-8 text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-baskerville)]" aria-label="Breadcrumb">
      <Link href="/" className="text-white/40 hover:text-gold transition-colors">
        Home
      </Link>
      
      {paths.map((path, idx) => {
        const href = `/${paths.slice(0, idx + 1).join("/")}`;
        const isCurrent = idx === paths.length - 1;
        const label = path.replace(/-/g, " ");

        return (
          <div key={path} className="flex items-center gap-2">
            <span className="text-white/20">/</span>
            {isCurrent ? (
              <span className="text-gold">{label}</span>
            ) : (
              <Link href={href} className="text-white/40 hover:text-gold transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
