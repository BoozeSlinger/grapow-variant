/**
 * Full-bleed sushi-counter band on /menu/sushi (spec §12.4): 21:9 at ≥1024 / 16:9 below, capped at 60svh,
 * lower-third caption. The page's priority (LCP) image. The width is pinned to 100% so the height cap
 * crops through object-fit instead of shrinking the width via the aspect ratio.
 */
import { Plate } from "@/components/ui/Plate";

export function CounterBand() {
  return (
    <div data-ground="ink">
      <Plate
        photo="sushiCounter"
        slot="band"
        treatment="lower-third"
        caption="The sushi counter"
        sizes="100vw"
        priority
        className="[&_div:has(>picture)]:max-h-[60svh] [&_div:has(>picture)]:w-full"
      />
    </div>
  );
}
