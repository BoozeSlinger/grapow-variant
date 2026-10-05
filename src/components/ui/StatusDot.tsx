/** 8px status dot (spec §10.7). Decorative: text ALWAYS accompanies a dot. */
const STATE = {
  open: "bg-open",
  later: "bg-accent",
  closed: "bg-transparent shadow-[inset_0_0_0_1.5px_var(--line)]",
  now: "bg-chili-lit",
} as const;

export function StatusDot({ state, live, className }: { state: "open" | "later" | "closed" | "now"; live?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={["inline-block size-2 shrink-0 rounded-pill", STATE[state], live ? "dot-live" : "", className ?? ""].filter(Boolean).join(" ")}
    />
  );
}
