/** The GRA!POW wordmark (spec §10.2). The bang — the red dot — only ever means now / live. */
import { VENUE } from "@/data/venue";

export function Bang({ className }: { className?: string }) {
  return <span className={["bang", className].filter(Boolean).join(" ")} aria-hidden="true" />;
}

const SIZE = {
  sm: "text-[1.375rem] leading-none",   // 22px
  md: "text-[1.75rem] leading-none",    // 28px
  xl: "t-wordmark-xl",
} as const;

/** GRA<Bang/>POW in Archivo 900 / 62%, uppercase. The letters are aria-hidden; one sr-only name. */
export function Wordmark({ size = "md", as: Tag = "span", className }: { size?: "sm" | "md" | "xl"; as?: "span" | "div"; className?: string }) {
  return (
    <Tag className={["inline-block whitespace-nowrap", className].filter(Boolean).join(" ")}>
      <span
        aria-hidden="true"
        className={`block font-sans font-black uppercase [font-stretch:62%] ${SIZE[size]}`}
      >
        GRA<Bang />POW
      </span>
      <span className="sr-only">{VENUE.name}</span>
    </Tag>
  );
}
