/**
 * Photo registry (spec §6.2). Every image on the site resolves through here.
 * Never shipped: Unsplash skillet, hero video, e3lutg (Gemini mark), wtue0a mural, the BIE 2020 badge,
 * crest variants, /noise.png, AI dish renders.
 */
export type PhotoRecipe = { pre?: string; main: string; maxW: number; aspect: string /* CSS aspect-ratio e.g. "4 / 5" */ };
/** `alt` is an optional per-slot override (a crop can show a different part of the frame). */
export type PhotoSlot = { desktop: PhotoRecipe; mobile?: PhotoRecipe; alt?: string };
export type PhotoEntry = { publicId: string; source: "cld" | "wp"; alt: string; approved: boolean; ownerConfirm?: string; slots: Record<string, PhotoSlot> };
export type PhotoKey = "roomBar" | "tapWall" | "sushiCounter" | "sushiPlate" | "diningRoom" | "bie2019" | "bie2023"
  | "pressIem2019" | "pressNewMoves" | "pressPrimeTime" | "pressYourVilla";

const GRADE = "e_vibrance:-10,e_contrast:10"; // house grade, already in every venue recipe
const SUSHI_PRE = "a_-10/c_crop,w_0.66,h_0.66,g_center/e_improve";
const WP = "https://i0.wp.com/grapow.net/wp-content/uploads";
const thumb: PhotoSlot = { desktop: { main: "", maxW: 320, aspect: "3 / 4" } };
const badge: PhotoSlot = { desktop: { pre: "e_trim", main: "c_fit", maxW: 320, aspect: "320 / 283" } };

export const PHOTOS: Record<PhotoKey, PhotoEntry> = {
  roomBar: {
    publicId: "v1773465971/ChatGPT_Image_Mar_11_2026_08_45_33_AM_ubgaro.png", source: "cld", approved: true,
    ownerConfirm: "C-15: approve the retouched venue photo as representing the room",
    alt: "The bar at Gra Pow: a red feature wall with a Dodgers sign, a Happy Hour sign and TVs over a long wooden bar, with the GRA!POW mural at the far end.",
    slots: {
      /** Home hero only. */
      hero: {
        desktop: { main: `c_fill,g_east,ar_1:1,${GRADE}`, maxW: 1024, aspect: "1 / 1" },
        mobile: { main: `c_fill,g_east,ar_4:5,${GRADE}`, maxW: 819, aspect: "4 / 5" },
      },
      /** /menu/happy-hour only; /menu hub hover plate. */
      hhPlate: {
        desktop: { pre: "c_crop,x_260,y_60,w_640,h_800", main: GRADE, maxW: 640, aspect: "4 / 5" },
        alt: "The Happy Hour sign on the red wall beside a Dodgers sign, a TV showing hockey, and shelves of bottles.",
      },
    },
  },
  tapWall: {
    publicId: "v1773244271/ChatGPT_Image_Mar_11_2026_08_50_58_AM_zwbkhr.png", source: "cld", approved: true,
    ownerConfirm: "C-15: approve the retouched venue photo as representing the room",
    alt: "The tap wall: a long row of draft handles under blue-lit shelving and a Hangar 24 mural.",
    slots: {
      /** Home "turn" band; /menu/drinks hero. */
      band: {
        desktop: { main: `c_fill,g_auto,ar_21:9,${GRADE}`, maxW: 1536, aspect: "21 / 9" },
        mobile: { main: `c_fill,g_auto,ar_4:5,${GRADE}`, maxW: 819, aspect: "4 / 5" },
      },
      /** /menu hub hover plate (decorative there: pass alt=""). */
      plate: { desktop: { main: `c_fill,g_auto,ar_4:5,${GRADE}`, maxW: 819, aspect: "4 / 5" } },
    },
  },
  sushiCounter: {
    publicId: "IMG_8323_f9ja0j", source: "cld", approved: true,
    alt: "Gra Pow's sushi counter: a long wooden bar facing chilled fish cases, white subway tile and the open kitchen, with a ballgame on the TV.",
    slots: {
      /** Home sushi chapter; /menu hub hover plate. */
      plate: { desktop: { pre: SUSHI_PRE, main: "c_fill,ar_4:5,g_auto", maxW: 1600, aspect: "4 / 5" } },
      /** /menu/sushi hero. */
      band: {
        desktop: { pre: SUSHI_PRE, main: "c_fill,ar_21:9,g_auto", maxW: 2400, aspect: "21 / 9" },
        mobile: { pre: SUSHI_PRE, main: "c_fill,ar_16:9,g_auto", maxW: 1600, aspect: "16 / 9" },
      },
    },
  },
  sushiPlate: {
    publicId: "v1773613175/cropped-IMG_5383-scaled-1_glbkjb.jpg", source: "cld", approved: true,
    // Caption "From the sushi bar". Never name it as a specific roll.
    alt: "A tempura-fried specialty roll topped with spicy tuna, microgreens, eel sauce and sriracha dots on a white plate.",
    slots: {
      /** /menu/sushi, house specials section. */
      inset: {
        desktop: { main: "c_fill,ar_3:2,g_auto,e_brightness:-10", maxW: 1600, aspect: "3 / 2" },
        mobile: { main: "c_fill,ar_1:1,g_auto,e_brightness:-10", maxW: 900, aspect: "1 / 1" },
      },
    },
  },
  diningRoom: {
    publicId: "v1773465967/ChatGPT_Image_Mar_11_2026_08_38_55_AM_wc25u1.png", source: "cld", approved: true,
    ownerConfirm: "C-15", // OWNER-CONFIRM(C-15): clearance for the retouched dining-room photo; /about only
    alt: "The dining room bar under stained-glass pendant lamps, with a golden Thai figure on the counter, football on the TV and a 'To-go order pick up here' sign.",
    slots: {
      /** /about only. */
      room: {
        desktop: { main: `c_fill,g_auto,ar_16:9,e_auto_brightness,${GRADE}`, maxW: 1536, aspect: "16 / 9" },
        mobile: { main: `c_fill,g_auto,ar_4:5,e_auto_brightness,${GRADE}`, maxW: 819, aspect: "4 / 5" },
      },
    },
  },
  bie2019: {
    publicId: "v1773614798/BIE_smLogo_2019-1-38_ucd4th.png", source: "cld", approved: true,
    alt: "Press-Enterprise Best of the Inland Empire 2019 badge",
    slots: { badge },
  },
  bie2023: {
    publicId: "v1773613942/background_removed_image_9LCbtRQaR4q_tEISapRSyw_cviunc.png", source: "cld", approved: true,
    alt: "Press-Enterprise Best of the Inland Empire 2023 badge", // always captioned "Top 3"
    slots: { badge },
  },
  pressIem2019: {
    publicId: `${WP}/2019/02/2019-12-Dec-Patric.jpg`, source: "wp", approved: true,
    alt: "Inland Empire Magazine, December 2019: chef-owner Patrick Sura at the bar.",
    slots: { thumb },
  },
  pressNewMoves: {
    publicId: `${WP}/2024/08/IEM-1-17-18.jpg`, source: "wp", approved: true,
    alt: "Inland Empire Magazine, January 2017, 'New Moves': Patrick Sura holding a plate.",
    slots: { thumb },
  },
  pressPrimeTime: {
    publicId: `${WP}/2019/02/IEM-1219pages-188.png`, source: "wp", approved: true,
    alt: "Inland Empire Magazine, December 2019, 'PrimeTime' page.",
    slots: { thumb },
  },
  pressYourVilla: {
    publicId: `${WP}/2019/02/Your-Villa-2016-01-Jan-cover.webp`, source: "wp", approved: true,
    alt: "Your Villa Riverside cover, November 2015 – January 2016.",
    slots: { thumb },
  },
};

/** Recipe for future grapow.net dish photos (C-15; none approved in v1). */
export const DISH_PHOTO_RECIPE: PhotoRecipe = { main: "c_fill,g_auto,ar_4:5,e_improve,e_vibrance:15,e_brightness:-5", maxW: 600, aspect: "4 / 5" };
