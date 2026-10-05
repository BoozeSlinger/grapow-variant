import type { Metadata, Viewport } from "next";
import { Archivo, Newsreader } from "next/font/google";
import "./globals.css";
import MotionProvider from "@/components/ui/MotionProvider";
import { PHOTOS } from "@/data/photos";
import { SITE_DESCRIPTION, SITE_TITLE, VENUE } from "@/data/venue";
import { CLD_BASE } from "@/lib/cloudinary";

// Variable wght 100–900 + wdth 62–125; tabular figures. Preloaded.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
// Italic only (no opsz axis). Not preloaded: never the LCP.
const newsreader = Newsreader({ subsets: ["latin"], style: ["italic"], variable: "--font-newsreader", display: "swap", preload: false });

const OG_IMAGE = `${CLD_BASE}/image/upload/c_fill,g_east,w_1200,h_630,e_vibrance:-10,e_contrast:10/f_jpg,q_auto/${PHOTOS.roomBar.publicId}`;

export const metadata: Metadata = {
  metadataBase: new URL(VENUE.siteUrl),
  title: { default: SITE_TITLE, template: `%s — ${VENUE.name}, ${VENUE.address.city}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: VENUE.name,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: PHOTOS.roomBar.alt }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0F0D0C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${archivo.variable} ${newsreader.variable}`}>
      <body data-ground="ink" className="bg-bg text-fg font-sans antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
