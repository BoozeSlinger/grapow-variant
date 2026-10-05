/**
 * A captioned photo (spec §10.5). keyline (rice): 1px keyline 8px outside + "Fig. n — caption";
 * lower-third (ink): caption plate bottom-left; plain: image only. `href` links the whole figure
 * (fine: image scale 1.03, keyline stays still). `reveal` wipes the image in (never with priority).
 */
import Link from "next/link";
import type { PhotoKey } from "@/data/photos";
import { Photo } from "./Photo";

export function Plate({ photo, slot, sizes, caption, fig, treatment = "keyline", href, priority, reveal, className }: {
  photo: PhotoKey; slot: string; sizes: string; caption?: React.ReactNode; fig?: number;
  treatment?: "keyline" | "lower-third" | "plain"; href?: string; priority?: boolean; reveal?: boolean; className?: string;
}) {
  const external = !!href && /^https?:/i.test(href);
  const image = (
    <div className={treatment === "keyline" ? "plate-keyline" : "relative"}>
      <div className="relative overflow-hidden" data-reveal={reveal && !priority ? "wipe" : undefined}>
        <Photo
          photo={photo}
          slot={slot}
          sizes={sizes}
          priority={priority}
          imgClassName={href ? "transition-transform duration-(--dur-4) ease-out fine:group-hover:scale-[1.03]" : undefined}
        />
        {treatment === "lower-third" && caption ? (
          <figcaption className="absolute bottom-0 left-0 bg-ink px-3 py-2 t-label text-rice">{caption}</figcaption>
        ) : null}
      </div>
    </div>
  );
  const below =
    treatment === "keyline" && caption ? (
      <figcaption className="mt-5 t-small text-fg-muted">
        {fig !== undefined ? <>Fig. <span className="tnum">{fig}</span> — </> : null}
        {caption}
        {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </figcaption>
    ) : treatment === "plain" && caption ? (
      <figcaption className="mt-3 t-small text-fg-muted">
        {caption}
        {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </figcaption>
    ) : null;

  const content = (
    <>
      {image}
      {below}
    </>
  );
  const linkCls = "group block";
  return (
    <figure className={["m-0", className].filter(Boolean).join(" ")}>
      {!href ? content : external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={linkCls}>{content}</a>
      ) : (
        <Link href={href} className={linkCls}>{content}</Link>
      )}
    </figure>
  );
}
