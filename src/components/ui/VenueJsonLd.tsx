/**
 * One Restaurant JSON-LD block per route (spec §10.16), mounted by the site layout.
 * Opening hours come from the KITCHEN schedule (bar hours stay on the page). No geo, no rating, no email.
 */
import { SCHEDULE } from "@/data/hours";
import { MENUS } from "@/data/menu";
import { VENUE } from "@/data/venue";
import { WEEKDAY_LONG, minutesToHHMM, type Weekday } from "@/lib/la-time";

const DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

function kitchenHours() {
  // Group days with identical kitchen windows: Su–Th 11:00–21:00, Fr–Sa 11:00–22:00. OWNER-CONFIRM(C-4)
  const groups = new Map<string, { opens: string; closes: string; days: string[] }>();
  for (const d of DAYS) {
    for (const w of SCHEDULE.kitchen[d]) {
      const opens = minutesToHHMM(w.open), closes = minutesToHHMM(w.close);
      const key = `${opens}-${closes}`;
      const g = groups.get(key) ?? { opens, closes, days: [] };
      g.days.push(WEEKDAY_LONG[d]);
      groups.set(key, g);
    }
  }
  return [...groups.values()].map((g) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: g.days, opens: g.opens, closes: g.closes }));
}

export default function VenueJsonLd() {
  const e164 = VENUE.phone.e164; // E.164 → "+1-NPA-NXX-XXXX"
  const telephone = `${e164.slice(0, 2)}-${e164.slice(2, 5)}-${e164.slice(5, 8)}-${e164.slice(8)}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: VENUE.name,
    url: VENUE.siteUrl,
    telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${VENUE.address.street}, ${VENUE.address.suite}`,
      addressLocality: VENUE.address.city,
      addressRegion: VENUE.address.region,
      postalCode: VENUE.address.postalCode,
      addressCountry: VENUE.address.country,
    },
    servesCuisine: ["Thai", "Asian fusion", "Sushi"],
    priceRange: VENUE.priceRange,
    openingHoursSpecification: kitchenHours(),
    hasMenu: Object.values(MENUS).map((m) => `${VENUE.siteUrl}${m.href}`),
    sameAs: [...VENUE.sameAs],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
