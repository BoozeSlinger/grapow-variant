"use client";
/**
 * Mobile dock (spec §11.5): Call · Request a table · Ask, below 1024 only. Hidden with CSS at 1024 and up
 * and in short landscape (so the server HTML is right on every device — no hydration flash), and not
 * rendered at all on /reservations, where the form has its own sticky Send bar. Body padding and
 * scroll-padding (globals.css) keep it from ever covering focus.
 */
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import { BookButton, CallLink } from "@/components/ui/ActionButtons";
import { openConcierge } from "@/lib/overlay";

export default function Dock() {
  const pathname = usePathname();
  if (pathname === "/reservations") return null;
  return (
    <nav
      aria-label="Quick actions"
      data-ground="ink-2"
      className="fixed inset-x-0 bottom-0 z-(--z-dock) border-t border-hair bg-ink-2 px-3 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] lg:hidden short:hidden"
    >
      <div className="grid grid-cols-[1fr_1.6fr_1fr] gap-2">
        <CallLink label="short" variant="secondary" size="md" className="justify-center px-2" />
        <BookButton size="md" detail={{ source: "dock" }} className="px-2">
          Request<span className="max-[359.98px]:sr-only"> a table</span>
        </BookButton>
        <Button
          variant="secondary"
          size="md"
          icon={MessageSquare}
          aria-label="Ask the host"
          aria-haspopup="dialog"
          className="px-2"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => openConcierge(undefined, e.currentTarget)}
        >
          Ask
        </Button>
      </div>
    </nav>
  );
}
