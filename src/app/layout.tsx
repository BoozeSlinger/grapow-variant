import type { Metadata } from "next";
import { Dancing_Script, Libre_Baskerville, Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import GrainOverlay from "@/components/GrainOverlay";
import MobileFABs from "@/components/MobileFABs";
import ReservationModal from "@/components/reservations/ReservationModal";

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-dancing",
  display: "swap",
});

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-baskerville",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-opensans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gra Pow Thai & Sports Bar | Riverside, CA",
  description:
    "Gra Pow — bold Thai flavors, craft cocktails, and the best sports bar in Riverside, CA. Happy Hour daily 3–6PM. Sushi Bar opens at 5PM.",
  openGraph: {
    title: "Gra Pow Thai & Sports Bar",
    description: "Thai Kitchen & Sports Bar in Riverside, CA",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dancing.variable} ${baskerville.variable} ${openSans.variable} scroll-smooth`}
    >
      <body className="bg-[#111111] font-[family-name:var(--font-opensans)] antialiased cursor-none md:cursor-auto">
        <CustomCursor />
        <GrainOverlay />
        <Header />
        {children}
        <MobileFABs />
        <ReservationModal />
        <Footer />
      </body>
    </html>
  );
}
