/**
 * H3 · 01 The kitchen (spec §12.1, G7). Type-led (C-15: no dish photos): the "Shares our name" Pad Gra Pow
 * specimen, the cook's index, the three Press-Enterprise dishes on a ticket rail, and the lunch block.
 */
import { getImageProps } from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { DishTicket } from "@/components/ui/DishTicket";
import { LiveTrack } from "@/components/ui/LiveStatus";
import { ItemFlags, MenuItemRow } from "@/components/ui/MenuItemRow";
import { Slate } from "@/components/ui/Slate";
import { PE2019 } from "@/data/awards";
import { TRACKS } from "@/data/hours";
import { COOKS_INDEX, MENUS, getItem } from "@/data/menu";
import type { MenuItem } from "@/data/menu/types";
import { DISH_PHOTO_RECIPE } from "@/data/photos";
import { COPY } from "@/data/venue";
import { cldUrl } from "@/lib/cloudinary";
import { formatPrice, minPrice } from "@/lib/format";
import { serviceLines } from "@/lib/hours";
import { SnapRail } from "./SnapRail";

const NAMESAKE = "pad-gra-pow";
const PE_DISHES = ["kung-pik-pow", "crying-tiger-steak", "gra-pow-seafood"];
const PHONE_LUNCH = 6;

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

function Namesake() {
  const dish = getItem(NAMESAKE);
  if (!dish) return null;
  const [base, ...more] = dish.prices;
  return (
    <div>
      <p className="t-label text-open">Shares our name</p>
      <h3 className="mt-3 t-d1 text-balance">{dish.name}</h3>
      <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
        <p className="t-num-xl text-accent">
          {formatPrice(base.cents)}
          {base.label ? <span className="sr-only"> {base.label}</span> : null}
        </p>
        <div className="flex flex-col items-start gap-2 pb-2">
          {more.map((p) => (
            <p key={p.label} className="t-small">
              {p.label} <span className="t-price">{formatPrice(p.cents)}</span>
            </p>
          ))}
          <ItemFlags item={dish} />
        </div>
      </div>
      {dish.description ? <p className="mt-6 t-lede measure-lede text-pretty">{dish.description}</p> : null}
      <Button href={dish.href} variant="quiet" size="sm" arrow className="mt-5">
        See it on the menu<span className="sr-only">: {dish.name}</span>
      </Button>
    </div>
  );
}

/** C-15 slot: a 4:5 keyline plate, only when the owner approves a dish photo (none in v1). */
function DishPlate({ photo }: { photo: NonNullable<MenuItem["photo"]> }) {
  const { props } = getImageProps({
    src: photo.publicId, alt: photo.alt, fill: true, sizes: "(min-width:1024px) 30vw, 100vw", loading: "lazy",
    loader: ({ width, quality }) => cldUrl(photo.publicId, DISH_PHOTO_RECIPE, width, quality),
  });
  return (
    <figure className="m-0 plate-keyline">
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- getImageProps output; alt is set */}
        <img {...props} className="object-cover" />
      </div>
    </figure>
  );
}

function CooksIndex() {
  return (
    <div>
      <p id="cooks-index" className="t-label">Cook&rsquo;s index</p>
      <ul aria-labelledby="cooks-index" className="mt-4 border-t border-hair">
        {COOKS_INDEX.map((c) => (
          <li key={c.term} className="border-b border-hair">
            <Link
              href={c.href}
              className="group flex min-h-11 items-baseline justify-between gap-4 py-2 font-serif text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] leading-[1.15] italic"
            >
              <span>{c.term}</span>
              <span aria-hidden="true" className="font-sans text-[.6em] not-italic text-fg-muted transition-transform duration-(--dur-2) ease-out fine:group-hover:translate-x-1 fine:group-hover:text-fg">
                →
              </span>
              <span className="sr-only">: find the dishes on the food menu</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 t-micro text-fg-muted">Words from our menu descriptions — tap one to find the dishes.</p>
    </div>
  );
}

function PressDishes() {
  const dishes = PE_DISHES.map((id) => getItem(id)).filter((d): d is NonNullable<typeof d> => !!d);
  return (
    <div>
      <h3 className="t-label">Named by the Press-Enterprise, 2019</h3>
      <SnapRail
        label="Dishes named by the Press-Enterprise in 2019"
        count={dishes.length}
        className="mt-5"
        listClassName={[
          "border-t-[1.5px] border-line",
          "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 max-lg:-mx-(--margin) max-lg:scroll-px-(--margin) max-lg:px-(--margin)",
          "lg:grid lg:grid-cols-3 lg:gap-(--gutter) lg:overflow-visible lg:pb-0",
        ].join(" ")}
      >
        {dishes.map((d) => (
          <li key={d.id} className="relative w-[85vw] max-w-[24rem] shrink-0 snap-start pt-[10px] lg:w-auto lg:max-w-none">
            {/* the clip from the rail */}
            <span aria-hidden="true" className="absolute top-0 left-8 h-[10px] w-[1.5px] bg-line" />
            <DishTicket item={d} context="Kitchen · all day" headingLevel="h4" />
          </li>
        ))}
      </SnapRail>
      <p className="mt-6 t-note text-fg-muted measure text-pretty">
        <a href={PE2019} {...external} className="underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag">
          {COPY.peNote}
          <span aria-hidden="true"> ↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}

function LunchBlock() {
  const lunch = MENUS.food.sections.find((s) => s.id === "lunch");
  if (!lunch) return null;
  // "Lunch specials daily until 3 PM" → "Daily until 3 PM"
  const line = serviceLines().lunch.slice(TRACKS.lunch.label.length).trim();
  const until = line.charAt(0).toUpperCase() + line.slice(1);
  return (
    <div className="grid-page gap-y-8">
      <div className="col-span-full lg:col-span-4">
        <h3 className="t-label">{TRACKS.lunch.label} from</h3>
        <p className="mt-2 t-num-xl text-accent">{formatPrice(minPrice(lunch.items))}</p>
        <p className="mt-4 t-body font-semibold">{until}</p>
        {lunch.note ? <p className="mt-3 t-note text-fg-muted measure-lede text-pretty">{lunch.note}</p> : null}
      </div>
      <div className="col-span-full lg:col-span-8">
        <ul aria-label={lunch.title} className="sm:columns-2 sm:gap-x-(--gutter)">
          {lunch.items.map((item, i) => (
            <li key={item.id} className={["break-inside-avoid", i >= PHONE_LUNCH ? "max-sm:hidden" : ""].join(" ")}>
              <MenuItemRow item={item} variant="compact" />
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href={`${TRACKS.lunch.href}`} variant="quiet" size="sm" arrow className="sm:hidden">
            All {lunch.items.length} lunch specials
          </Button>
          <Button href={MENUS.food.href} variant="secondary">See the full food menu</Button>
        </div>
      </div>
    </div>
  );
}

export function KitchenChapter() {
  const dish = getItem(NAMESAKE);
  const photo = dish?.photo?.approved ? dish.photo : null;
  return (
    <section id="kitchen" data-ground="rice" aria-labelledby="kitchen-title" className="section-l">
      <span id="wook" aria-hidden="true" />
      <div className="frame">
        <Slate index="01" title="The kitchen" titleId="kitchen-title" datum={<LiveTrack track="kitchen" format="short" />} />

        <div className="mt-12 grid-page gap-y-14 lg:mt-16">
          <div className="col-span-full lg:col-span-7">
            <Namesake />
          </div>
          <div className="col-span-full lg:col-span-4 lg:col-start-9">
            {photo ? <DishPlate photo={photo} /> : <CooksIndex />}
          </div>
        </div>

        <div className="mt-20 lg:mt-28" data-reveal="rise">
          <PressDishes />
        </div>

        <div className="mt-20 border-t border-hair pt-12 lg:mt-28 lg:pt-16">
          <LunchBlock />
        </div>
      </div>
    </section>
  );
}
