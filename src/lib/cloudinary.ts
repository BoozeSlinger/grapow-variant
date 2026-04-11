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
  drinksBg:   "grapow-sports-bar-draft",
  // sections
  fromTheWokBg: "v1773616152/photo-1717321302149-3c6c9c76de67_lxmmtp.jpg",
  eventsBg:   "v1773465971/ChatGPT_Image_Mar_11_2026_08_45_33_AM_ubgaro.png",
  sushiBg:    "v1773613175/cropped-IMG_5383-scaled-1_glbkjb.jpg",
  aboutBg:    "v1773243954/ChatGPT_Image_Mar_11_2026_08_45_33_AM_lauctt.png",
  wookBg:     "v1773465967/ChatGPT_Image_Mar_11_2026_08_38_55_AM_wc25u1.png",
  // awards — Best of Inland Empire badge images
  bieLogo2019: "v1773614798/BIE_smLogo_2019-1-38_ucd4th.png",
  bieLogo2020: "v1773615014/BIE-LOGO-0920-v3-95_bwklhs.png",
  bieLogo2023: "v1773613942/background_removed_image_9LCbtRQaR4q_tEISapRSyw_cviunc.png",
};
