/**
 * /reservations below 1024 (spec §8.3, §12.8): the dock renders null there, so the form carries its own
 * fixed bar — bookingSummary (truncating) + the form's primary action. Same height as the dock, so the
 * body padding and scroll-padding from globals.css keep focused fields above it. Hidden in short landscape,
 * where the dock is hidden too and the inline action shows instead.
 */
export function ReservationsBar({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <div
      data-ground="ink-2"
      className="fixed inset-x-0 bottom-0 z-(--z-dock) flex h-[calc(var(--dock-h)+env(safe-area-inset-bottom))] items-center gap-3 border-t border-hair px-3 pb-[env(safe-area-inset-bottom)] sm:px-(--margin) lg:hidden short:hidden"
    >
      {/* Duplicates the ticket preview for sighted users; screen readers already have the ticket. */}
      <p aria-hidden="true" className="min-w-0 flex-1 truncate t-small tnum text-fg-muted">{summary}</p>
      <div className="flex flex-none items-center gap-2">{children}</div>
    </div>
  );
}
