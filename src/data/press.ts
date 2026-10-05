/** Press (spec §9.11). Thumbnails come from the photo registry. */
import type { PhotoKey } from "@/data/photos";

export type PressItem = { id: string; date: string; publication: string; title: string; url: string; thumb: PhotoKey };

export const PRESS: PressItem[] = [
  { id: "iem-dec-2019", date: "December 2019", publication: "Inland Empire Magazine", title: "Chef-owner Patrick Sura", url: "https://grapow.net/gra-pow-december-2019-inland-empire-magazine/", thumb: "pressIem2019" },
  { id: "primetime-2019", date: "December 2019", publication: "Inland Empire Magazine", title: "PrimeTime 2019", url: "https://grapow.net/primetime-2019/", thumb: "pressPrimeTime" },
  { id: "new-moves", date: "January 2017", publication: "Inland Empire Magazine", title: "New Moves", url: "https://grapow.net/elementor-1096/", thumb: "pressNewMoves" },
  { id: "your-villa", date: "November 2015 – January 2016", publication: "Your Villa Riverside", title: "Feature", url: "https://grapow.net/your-villa-riverside-november-2015-january-2016/", thumb: "pressYourVilla" },
];
