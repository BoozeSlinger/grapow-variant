/**
 * Registry photo (spec §10.5). Server component: getImageProps per recipe (no global loaderFile, no
 * /_next/image) → <picture> with an art-directed mobile <source>. The wrapper reserves the recipe's
 * aspect ratio (mobile ratio below 1024). Renders nothing for unapproved photos.
 */
import { getImageProps } from "next/image";
import { PHOTOS, type PhotoKey } from "@/data/photos";
import { capSrcSet, photoLoader } from "@/lib/cloudinary";

export function Photo({ photo, slot, sizes, priority, alt, className, imgClassName, fit = "cover" }: {
  photo: PhotoKey; slot: string; sizes: string; priority?: boolean; alt?: string;
  className?: string; imgClassName?: string; fit?: "cover" | "contain";
}) {
  const entry = PHOTOS[photo];
  const s = entry.slots[slot];
  if (!entry.approved || !s) return null;
  const desktop = s.desktop;
  const mobile = s.mobile;
  const altText = alt ?? s.alt ?? entry.alt;

  const common = { alt: altText, fill: true, sizes, src: entry.publicId } as const;
  const d = getImageProps({
    ...common,
    loader: photoLoader(entry, desktop),
    ...(priority ? { priority: true, fetchPriority: "high" as const } : { loading: "lazy" as const }),
  }).props;
  const mob = mobile ? getImageProps({ ...common, loader: photoLoader(entry, mobile) }).props : null;

  const style = {
    "--ar-d": desktop.aspect,
    "--ar-m": (mobile ?? desktop).aspect,
  } as React.CSSProperties;

  return (
    <div className={["relative overflow-hidden aspect-(--ar-m) lg:aspect-(--ar-d)", className].filter(Boolean).join(" ")} style={style}>
      <picture>
        {mob ? <source media="(max-width: 1023.98px)" srcSet={capSrcSet(mob.srcSet, mobile!.maxW)} sizes={mob.sizes} /> : null}
        {/* eslint-disable-next-line jsx-a11y/alt-text -- getImageProps output; alt is set */}
        <img
          {...d}
          srcSet={capSrcSet(d.srcSet, desktop.maxW)}
          className={[fit === "contain" ? "object-contain" : "object-cover", imgClassName].filter(Boolean).join(" ")}
        />
      </picture>
    </div>
  );
}
