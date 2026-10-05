"use client";
/**
 * The four shared actions (spec §10.1). Every booking CTA goes through openBooking(); every
 * "Ask the host" through openConcierge(). Phone and map links come from VENUE only.
 */
import { MessageSquare, Phone } from "lucide-react";
import { VENUE } from "@/data/venue";
import { openBooking, openConcierge, type OpenBookingDetail } from "@/lib/overlay";
import Button, { type ButtonProps } from "./Button";

type Variant = "primary" | "secondary" | "quiet";
type Size = "sm" | "md" | "lg";

/** Default label "Request a table", variant primary; onClick → openBooking(detail, trigger). */
export function BookButton(p: Omit<ButtonProps, "href" | "onClick" | "children"> & { detail?: OpenBookingDetail; children?: React.ReactNode }) {
  const { detail, children, variant = "primary", ...rest } = p;
  const buttonProps = rest as Omit<Extract<ButtonProps, { href?: undefined }>, "children" | "variant" | "onClick">;
  return (
    <Button
      {...buttonProps}
      variant={variant}
      aria-haspopup="dialog"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => openBooking(detail, e.currentTarget)}
    >
      {children ?? "Request a table"}
    </Button>
  );
}

/** Default label "Ask the host" → openConcierge(prompt, trigger). */
export function AskHostButton({ prompt, label = "Ask the host", variant = "secondary", size = "sm", className }: {
  prompt?: string; label?: string; variant?: Variant; size?: Size; className?: string;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      icon={variant === "quiet" ? undefined : MessageSquare}
      className={className}
      aria-haspopup="dialog"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => openConcierge(prompt, e.currentTarget)}
    >
      {label}
    </Button>
  );
}

/** full "Call <phone>" | short "Call" (the number stays in the accessible name) | any custom label. Phone from VENUE. */
export function CallLink({ label = "full", variant = "quiet", size = "sm", className }: {
  label?: "full" | "short" | (string & {}); variant?: Variant; size?: Size; className?: string;
}) {
  const text =
    label === "full" ? <>Call <span className="tnum">{VENUE.phone.display}</span></>
    : label === "short" ? <>Call<span className="sr-only"> {VENUE.phone.display}</span></>
    : label;
  return (
    <Button href={VENUE.phone.href} variant={variant} size={size} icon={Phone} className={className}>
      {text}
    </Button>
  );
}

/** "Directions" — external ↗ to Google (default) or Apple Maps. */
export function DirectionsLink({ provider = "google", label = "Directions", variant = "quiet", size = "sm", className }: {
  provider?: "google" | "apple"; label?: string; variant?: Variant; size?: Size; className?: string;
}) {
  return (
    <Button href={VENUE.directions[provider]} external variant={variant} size={size} className={className}>
      {label}
    </Button>
  );
}
