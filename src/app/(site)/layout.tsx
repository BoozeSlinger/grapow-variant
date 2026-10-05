import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";
import Dock from "@/components/chrome/Dock";
import BookingSheet from "@/components/booking/BookingSheet";
import Concierge from "@/components/concierge/Concierge";
import ClockProvider from "@/components/ui/ClockProvider";
import VenueJsonLd from "@/components/ui/VenueJsonLd";
import { requestTime } from "@/lib/la-time";

export const revalidate = 60; // status text is at most 60 s stale on first paint; the client clock corrects it

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const serverNow = requestTime();
  return (
    <ClockProvider serverNow={serverNow}>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />                                        {/* <header id="site-header"> */}
      <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      <Footer />                                        {/* <footer id="site-footer"> */}
      <Dock />                                          {/* below 1024 only */}
      <BookingSheet />                                  {/* listens to useOverlay: booking */}
      <Concierge />                                     {/* desktop tab + pad; mobile sheet via useOverlay: concierge */}
      <VenueJsonLd />
    </ClockProvider>
  );
}
