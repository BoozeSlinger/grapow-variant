const CLOUD = "dqj3xyvey";
const BASE  = `https://res.cloudinary.com/${CLOUD}`;

export function cldImage(publicId: string, transforms = "f_auto,q_auto") {
  return `${BASE}/image/upload/${transforms}/${publicId}`;
}

export function cldVideo(publicId: string, transforms = "q_auto") {
  return `${BASE}/video/upload/${transforms}/${publicId}`;
}

// ── Named assets ─────────────────────────────────────────
export const ASSETS = {
  logo:       "v1773466015/background_removed_image_4n1wXXSKQ9eYzg39SUhGWQ_ywnqei.png",
  heroVideo:  "v1773499070/202603140730_zllqmo.mp4",
  // hero columns
  foodBg:     "v1773465967/ChatGPT_Image_Mar_11_2026_08_38_55_AM_wc25u1.png",
  barBg:      "v1773467162/bar-interior_e3lutg.jpg",
  drinksBg:   "v1773465966/ChatGPT_Image_Mar_11_2026_08_50_58_AM_cw5p4p.png",
  // sections
  eventsBg:   "v1773465971/ChatGPT_Image_Mar_11_2026_08_45_33_AM_ubgaro.png",
  sushiBg:    "v1773465967/grapow-thai-riverside_sudx3u.png",
  aboutBg:    "v1773243954/ChatGPT_Image_Mar_11_2026_08_45_33_AM_lauctt.png",
  wookBg:     "v1773465967/ChatGPT_Image_Mar_11_2026_08_38_55_AM_wc25u1.png",
};
