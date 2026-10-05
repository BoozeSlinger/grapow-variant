/**
 * An order ticket for one dish (spec §10.14): context · name · flags · official description · price ·
 * "See it on the menu →". A 4:5 photo slot renders only when item.photo is approved (none in v1, C-15).
 */
import { getImageProps } from "next/image";
import Link from "next/link";
import type { MenuItem } from "@/data/menu/types";
import { DISH_PHOTO_RECIPE } from "@/data/photos";
import { cldUrl } from "@/lib/cloudinary";
import { ItemFlags, PriceText, TierLine } from "./MenuItemRow";
import { Ticket } from "./Ticket";

function DishPhoto({ photo }: { photo: NonNullable<MenuItem["photo"]> }) {
  const { props } = getImageProps({
    src: photo.publicId, alt: photo.alt, fill: true, sizes: "(min-width:1024px) 25vw, 85vw", loading: "lazy",
    loader: ({ width, quality }) => cldUrl(photo.publicId, DISH_PHOTO_RECIPE, width, quality),
  });
  return (
    <div className="relative mb-4 aspect-[4/5] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- getImageProps output; alt is set */}
      <img {...props} className="object-cover" />
    </div>
  );
}

export function DishTicket({ item, context, headingLevel: H = "h3", elevated, className }: {
  item: MenuItem & { href: string }; context: string; headingLevel?: "h3" | "h4"; elevated?: boolean; className?: string;
}) {
  const single = item.prices.length === 1 && !item.prices[0].label ? item.prices[0] : null;
  return (
    <Ticket
      as="article"
      elevated={elevated}
      className={["h-full transition-transform duration-(--dur-2) ease-out fine:hover:-translate-y-1.5 [&>.ticket-paper]:flex [&>.ticket-paper]:h-full [&>.ticket-paper]:flex-col [&_.ticket-body]:flex-1", className].filter(Boolean).join(" ")}
      head={<span className="t-label">{context}</span>}
      stub={
        <Link href={item.href} className="inline-flex min-h-11 items-center t-ui underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag">
          See it on the menu<span aria-hidden="true">&nbsp;→</span>
          <span className="sr-only">: {item.name}</span>
        </Link>
      }
    >
      {item.photo?.approved ? <DishPhoto photo={item.photo} /> : null}
      <H className="t-d3 text-balance">{item.name}</H>
      {(item.spicy || item.minSpice) && <div className="mt-2"><ItemFlags item={item} /></div>}
      {item.description ? <p className="mt-3 t-desc text-pretty">{item.description}</p> : null}
      <div className="mt-3">
        {item.priceNote ? <span className="t-price">{item.priceNote}</span> : single ? <PriceText cents={single.cents} /> : <TierLine prices={item.prices} />}
      </div>
    </Ticket>
  );
}
