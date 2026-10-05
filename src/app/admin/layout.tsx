import type { Metadata } from "next";

// Staff-only view: no public chrome, never indexed (spec §12.9).
export const metadata: Metadata = { title: "Reservations (staff)", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div data-ground="ink" className="min-h-svh frame section-s">{children}</div>;
}
