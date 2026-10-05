/**
 * The REQUESTED stamp (spec §12.8): a chili-deep 3px border box with the t-d3 word. The −6° tilt and the
 * overshoot come from the gp-stamp keyframes (.stamp-in, fill both) — the site's only bounce. Under reduced
 * motion the keyframes collapse to 0.01ms, so the stamp simply appears in place. Decorative: the ticket head
 * carries the same word as text.
 */
export function Stamp({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={["stamp-in inline-block rounded-sm border-[3px] border-chili-deep px-3 pt-1.5 pb-1 t-d3 text-chili-deep", className]
        .filter(Boolean)
        .join(" ")}
    >
      Requested
    </span>
  );
}
