/**
 * Venue facts + the copy deck (spec §2.3). The only place the phone number, address and fixed
 * copy strings live. Interim values carry OWNER-CONFIRM codes (spec §2.1).
 */
import { SCHEDULE } from "@/data/hours";
import { AWARD_LINE, AWARD_SHORT } from "@/data/awards";
import { WEEKDAY_LONG, formatClock, type Weekday } from "@/lib/la-time";
import { serviceLines } from "@/lib/hours";

export const VENUE = {
  name: "Gra Pow", // OWNER-CONFIRM(C-1): exact Google Business Profile name
  descriptor: "Thai kitchen · Sushi bar · Sports bar", // C-11
  tagline: "Lunch to last call.", // OWNER-CONFIRM(C-11): approve the tagline
  phone: { display: "(951) 780-1132", e164: "+19517801132", href: "tel:+19517801132" },
  address: {
    street: "497 E Alessandro Blvd", suite: "Suite D", city: "Riverside", region: "CA", postalCode: "92508", country: "US",
    center: "Mission Grove Shopping Center", oneLine: "497 E Alessandro Blvd, Suite D, Riverside, CA 92508",
  },
  directions: {
    google: "https://www.google.com/maps/dir/?api=1&destination=Gra%20Pow%2C%20497%20E%20Alessandro%20Blvd%20Suite%20D%2C%20Riverside%2C%20CA%2092508",
    apple: "https://maps.apple.com/?q=Gra%20Pow&address=497%20E%20Alessandro%20Blvd%20Suite%20D%2C%20Riverside%2C%20CA%2092508",
  },
  socials: {
    instagram: { url: "https://www.instagram.com/grapow_ig/", handle: "@grapow_ig" },
    facebook: { url: "https://www.facebook.com/p/Gra-Pow-100063506142426/" },
  },
  sameAs: [
    "https://www.instagram.com/grapow_ig/", "https://www.facebook.com/p/Gra-Pow-100063506142426/",
    "https://www.yelp.com/biz/gra-pow-riverside-4", "https://www.grubhub.com/restaurant/gra-pow-497-e-alessandro-blvd-d-riverside/14073936",
  ],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://grapow.net", // OWNER-CONFIRM(C-2): production domain; no public email
  chefOwner: "Patrick Sura",
  pickupLine: "Order pickup: call (951) 780-1132", // OWNER-CONFIRM(C-17): pickup policy; no delivery links
  sportsLine: "Games on the TVs over the bar.", // OWNER-CONFIRM(C-12): approve the sports line
  groupsLine: "Coming with a group? Call ahead: (951) 780-1132.",
  thaiMotif: false, // OWNER-CONFIRM(C-7): Thai-script motif
  priceRange: "$$",
} as const;

const PHONE = VENUE.phone.display;

/** Every string in spec §2.3, keyed as in that table. */
export const COPY = {
  tagline: VENUE.tagline,
  descriptor: VENUE.descriptor,
  heroEyebrow: "Gra Pow · Mission Grove, Riverside",
  heroH1: ["Thai kitchen.", "Sushi bar.", "Sports bar."], // uppercased by CSS
  heroLede: "Asian fusion cooked with Thai spices, sauces and herbs — a sushi counter from five, and games on the TVs over the bar.",
  awardShort: AWARD_SHORT,
  awardLine: AWARD_LINE, // OWNER-CONFIRM(C-6): award wording
  peNote: "Crying Tiger Steak, Kung Pik Pow and the Gra/Pow seafood hot plates were named by the Press-Enterprise in 2019.",
  storyShort: "Chef-owner Patrick Sura runs Gra Pow in Riverside's Mission Grove Shopping Center: an Asian-fusion menu cooked with Thai spices, sauces and herbs, a sushi bar, and a sports bar.",
  sportsLine: VENUE.sportsLine, // OWNER-CONFIRM(C-12): approve the sports line
  groupsLine: VENUE.groupsLine,
  sushiDisplay: "Tuesday to Saturday, from five.", // OWNER-CONFIRM(C-4): sushi hours
  barDisplay: "Open till midnight. Till 2 on Friday and Saturday.", // OWNER-CONFIRM(C-4): bar hours
  hhDisplay: { text: "Happy hour,", em: "twice a day." }, // "Happy hour," + italic "twice a day."
  foodLede: "Asian fusion cooked with Thai spices, sauces and herbs.",
  sushiLede: "Tuesday to Saturday from 5 PM.", // OWNER-CONFIRM(C-4): sushi hours
  barLede: "Cocktails, shots, draft, bottles, wine and spirits.",
  aboutLede: "Patrick Sura's Asian-fusion kitchen, with a sushi bar and a sports bar, in Riverside's Mission Grove Shopping Center.",
  iemParaphrase: "In December 2019, Inland Empire Magazine profiled chef-owner Patrick Sura and Gra Pow: Asian fusion dining in the Mission Grove Shopping Center, with a creative menu, a sleek sushi bar and a sports bar.",
  peParaphrase: "The Press-Enterprise described a menu of dishes from Asia and beyond, all prepared with Thai spices, sauces and herbs, and called out three signatures:",
  pickupLine: VENUE.pickupLine, // OWNER-CONFIRM(C-17): pickup policy
  allergyNote: "If you have any food allergies please notify your server before ordering.",
  priceNote: "Prices subject to change without notice.",
  rawAdvisory: "* Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions.",
  drinkNote: "Please drink responsibly.",
  hhFootnote: "Prices and availability subject to change. Please drink responsibly.",
  bookingStandfirst: "Tell us when and how many. We'll call or text to confirm — it isn't booked until we do.",
  bookingPending: "Sending to the host stand…",
  bookingSuccess: "Request received. We'll call or text {phone} to confirm a table for {n} on {date} at {time}. It isn't booked until we do.",
  bookingFailed: `That didn't go through — nothing was booked. Please call ${PHONE}.`,
  bookingNotConfigured: `Online table requests aren't switched on yet — nothing was sent. Call ${PHONE} and we'll set it up.`,
  bookingGroups: `For 9 or more, or for an event, please call ${PHONE}.`, // OWNER-CONFIRM(C-13): max party 8
  notFoundH1: "This page has been 86'd.",
  notFoundBody: "In kitchen talk, 86'd means it's off the menu.",
  hostTitle: "Ask the host",
  hostLabel: "Host stand · No. 0497", // uppercased by the label style
  hostSub: "Automated host — answers from our posted menu & hours",
  hostHello: "Hi — I'm Gra Pow's automated host. I can check today's hours, find a dish and its price, or send a table request to the team.",
  hostFallback: `I don't have that written down, and I'd rather not guess. The team can help at ${PHONE}.`,
  hostDiet: `I can't confirm ingredients or allergens online. Please tell your server about any allergies before ordering, or call ${PHONE}.`,
} as const;

/* ── Page metadata (spec §15). Descriptions with times are built from SCHEDULE. ── */
const sushiOpenDays = ([0, 1, 2, 3, 4, 5, 6] as Weekday[]).filter((d) => SCHEDULE.sushi[d].length > 0);
const sushiFrom = formatClock(SCHEDULE.sushi[sushiOpenDays[0]][0].open);
const sushiSpan = `${WEEKDAY_LONG[sushiOpenDays[0]]} to ${WEEKDAY_LONG[sushiOpenDays[sushiOpenDays.length - 1]]}`;
const barLate = formatClock(SCHEDULE.bar[5][0].close);
const barWeek = formatClock(SCHEDULE.bar[0][0].close);
const lunchUntil = formatClock(SCHEDULE.lunch[0][0].close);
const lines = serviceLines();

export const SITE_TITLE = "Gra Pow — Thai kitchen, sushi bar & sports bar in Riverside, CA";
export const SITE_DESCRIPTION = `Asian fusion cooked with Thai spices, a sushi bar ${sushiSpan} from ${sushiFrom}, and a sports bar open till ${barLate} ${WEEKDAY_LONG[5]} and ${WEEKDAY_LONG[6]}. ${VENUE.address.street}, Mission Grove, ${VENUE.address.city}.`;

export const PAGE_META = {
  "/menu": { title: "Menus", description: `Food, sushi bar, bar and happy hour menus at ${VENUE.name} in ${VENUE.address.city}.` },
  "/menu/food": { title: "Food menu", description: `The full kitchen menu — lunch specials daily until ${lunchUntil}, curries, noodles, rice and Pad Gra Pow.` },
  "/menu/sushi": { title: "Sushi bar", description: `Nigiri, sashimi, rolls and house specials — ${sushiSpan} from ${sushiFrom}.` },
  "/menu/drinks": { title: "The bar", description: `Cocktails, shots, draft and bottled beer, wine and spirits. Open till ${barWeek}; till ${barLate} ${WEEKDAY_LONG[5]} and ${WEEKDAY_LONG[6]}.` },
  "/menu/happy-hour": { title: "Happy hour", description: `${lines.happyHour.replace(" & ", " and ")}: $8 appetizers and drink specials.` }, // OWNER-CONFIRM(C-5): $8 appetizers 3–6 PM only
  "/about": { title: "Our story", description: `Chef-owner ${VENUE.chefOwner}'s Asian-fusion kitchen, sushi bar and sports bar in Mission Grove.` },
  "/reservations": { title: "Request a table", description: "Send a table request — we'll call or text to confirm." },
  "/visit": { title: "Hours & directions", description: `Hours for the kitchen, bar, sushi bar and happy hour, plus directions to ${VENUE.address.street}.` },
} as const;
