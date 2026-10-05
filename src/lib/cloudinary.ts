/**
 * Image delivery (spec §6.1). Per-image loaders for `getImageProps` — there is no global loaderFile,
 * so local /public assets keep Next's default loader. Pure TypeScript: safe in Server Components.
 */
import type { ImageLoader } from "next/image";
import { PHOTOS, type PhotoEntry, type PhotoKey, type PhotoRecipe } from "@/data/photos";

export const CLOUD = "dqj3xyvey";
export const CLD_BASE = `https://res.cloudinary.com/${CLOUD}`;

/** `{base}/image/upload/{pre/}{main},w_{w}/f_auto,q_{q ?? 'auto'}/{publicId}` — width capped at `recipe.maxW` (never upscaled). */
export function cldUrl(publicId: string, recipe: PhotoRecipe, width: number, quality?: number): string {
  const w = Math.min(Math.round(width), recipe.maxW);
  const pre = recipe.pre ? `${recipe.pre}/` : "";
  const main = recipe.main ? `${recipe.main},w_${w}` : `w_${w}`;
  return `${CLD_BASE}/image/upload/${pre}${main}/f_auto,q_${quality ?? "auto"}/${publicId}`;
}

/** WordPress / Jetpack press scans: `${src}?w=${w}&quality=${q ?? 75}&strip=all`. */
export function wpUrl(src: string, recipe: PhotoRecipe, width: number, quality?: number): string {
  const w = Math.min(Math.round(width), recipe.maxW);
  return `${src}?w=${w}&quality=${quality ?? 75}&strip=all`;
}

/** The URL for one registry photo at one width. */
export function photoSrc(entry: PhotoEntry, recipe: PhotoRecipe, width: number, quality?: number): string {
  return entry.source === "wp" ? wpUrl(entry.publicId, recipe, width, quality) : cldUrl(entry.publicId, recipe, width, quality);
}

/** A next/image loader bound to one photo + recipe. Pass to `getImageProps({ loader })` in a Server Component only. */
export function photoLoader(entry: PhotoEntry, recipe: PhotoRecipe): ImageLoader {
  return ({ width, quality }) => photoSrc(entry, recipe, width, quality);
}

/** Convenience: an absolute URL for a registry slot (e.g. Open Graph images). */
export function photoUrl(key: PhotoKey, slot: string, width: number, which: "desktop" | "mobile" = "desktop"): string {
  const entry = PHOTOS[key];
  const s = entry.slots[slot];
  if (!s) throw new Error(`Unknown photo slot "${key}.${slot}"`);
  const recipe = which === "mobile" ? (s.mobile ?? s.desktop) : s.desktop;
  return photoSrc(entry, recipe, width);
}

/**
 * Rewrites a `srcSet` so each candidate's descriptor matches the width actually delivered
 * (capped at maxW) and drops duplicates — the browser never picks an "upscaled" candidate.
 */
export function capSrcSet(srcSet: string | undefined, maxW: number): string | undefined {
  if (!srcSet) return srcSet;
  const seen = new Set<number>();
  const out: string[] = [];
  for (const cand of srcSet.split(", ")) {
    const m = cand.match(/^(\S+) (\d+)w$/);
    if (!m) { out.push(cand); continue; }
    const w = Math.min(Number(m[2]), maxW);
    if (seen.has(w)) continue;
    seen.add(w);
    out.push(`${m[1]} ${w}w`);
  }
  return out.join(", ");
}
