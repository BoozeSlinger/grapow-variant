/**
 * /about, Slate 02 (spec §12.7): "What we cook". The Press-Enterprise paraphrase, then the three signatures
 * it named as order tickets (descriptions and prices come straight from the menu data).
 */
import Button from "@/components/ui/Button";
import { DishTicket } from "@/components/ui/DishTicket";
import { Slate } from "@/components/ui/Slate";
import { getItem } from "@/data/menu";
import { TRACKS } from "@/data/hours";
import { COPY } from "@/data/venue";

const SIGNATURE_IDS = ["kung-pik-pow", "crying-tiger-steak", "gra-pow-seafood"] as const;

export function SignaturesSection() {
  const items = SIGNATURE_IDS.map((id) => getItem(id)).filter((i) => i !== undefined);
  return (
    <section aria-labelledby="about-cook" className="section-s">
      <div className="frame">
        <Slate index="02" title="What we cook" titleId="about-cook" />
        <div className="grid-page mt-10">
          <p className="col-span-full t-body measure text-pretty sm:col-span-6 lg:col-span-6 lg:col-start-5">{COPY.peParaphrase}</p>
        </div>
        <ul className="mt-8 grid list-none gap-6 p-0 lg:grid-cols-3 lg:gap-8">
          {items.map((item) => (
            <li key={item.id} className="min-w-0 max-w-[34rem] lg:max-w-none">
              <DishTicket item={item} context="Press-Enterprise 2019" />
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button href={TRACKS.kitchen.href} variant="quiet" arrow>See the food menu</Button>
        </div>
      </div>
    </section>
  );
}
