/**
 * H6 · The turn (spec §12.1, G23): the site's one scroll moment. A full-bleed tap-wall band (21:9 ≥1024,
 * 4:5 below) opens from its centre like the house lights coming up (`data-reveal="open"`, CSS view
 * timeline, only where supported and motion is allowed). Rice gives way to ink here, once.
 * No text over the image except the lower-third caption plate, which sits outside the clip so it never hides.
 */
import { Photo } from "@/components/ui/Photo";

export function TapWallTurn() {
  return (
    <section aria-label="The tap wall" data-ground="ink">
      <figure className="relative m-0">
        <div data-reveal="open">
          <Photo photo="tapWall" slot="band" sizes="100vw" />
        </div>
        <figcaption className="absolute bottom-0 left-(--margin) bg-ink px-3 py-2 t-label text-rice">The tap wall</figcaption>
      </figure>
    </section>
  );
}
