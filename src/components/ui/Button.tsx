/**
 * Button (spec §10.1). Server-compatible: renders next/link for internal hrefs, <a> for tel:/mailto:/http
 * (external adds target=_blank, ↗ and sr " (opens in a new tab)"), otherwise <button type="button">.
 * Never nests <a><button>. Sizes: sm 44px · md 48px · lg 56px.
 */
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Common = {
  variant?: "primary" | "secondary" | "quiet"; size?: "sm" | "md" | "lg"; icon?: LucideIcon;
  iconPosition?: "start" | "end"; arrow?: boolean; full?: boolean; className?: string; children: React.ReactNode;
};
export type ButtonProps = Common & (
  | ({ href: string; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">)
  | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">));

const SIZE = {
  sm: "h-11 px-[18px]",
  md: "h-12 px-[22px]",
  lg: "h-14 px-[22px]",
} as const;
const QUIET_SIZE = { sm: "min-h-11", md: "min-h-12", lg: "min-h-14" } as const;

const VARIANT = {
  primary: "justify-center bg-chili text-rice fine:hover:bg-chili-deep",
  secondary:
    "justify-center bg-transparent shadow-[inset_0_0_0_1.5px_currentColor] fine:hover:bg-fg fine:hover:text-bg fine:hover:shadow-none",
  quiet:
    "underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2 fine:hover:decoration-flag",
} as const;

export function buttonClasses(variant: NonNullable<Common["variant"]>, size: NonNullable<Common["size"]>, opts: { full?: boolean; disabled?: boolean; className?: string } = {}): string {
  // No class merging library: a caller's unprefixed `hidden` / `px-*` replaces the default display / padding.
  const own = opts.className ?? "";
  const display = /(^|\s)hidden(\s|$)/.test(own) ? "" : "inline-flex";
  const size_ = variant === "quiet" ? QUIET_SIZE[size] : /(^|\s)px-/.test(own) ? SIZE[size].replace(/\s*px-\S+/, "") : SIZE[size];
  return [
    `group ${display} items-center gap-[10px] rounded-sm t-ui whitespace-nowrap`,
    "transition-[background-color,color,box-shadow,transform,text-decoration-color] duration-(--dur-1) ease-out active:translate-y-px",
    size_,
    VARIANT[variant],
    opts.full ? "w-full justify-center" : "",
    opts.disabled ? "pointer-events-none opacity-45" : "",
    opts.className ?? "",
  ].filter(Boolean).join(" ");
}

export default function Button(p: ButtonProps) {
  const {
    variant = "primary", size = "md", icon: Icon, iconPosition = "start", arrow, full, className, children, ...rest
  } = p;
  const ariaDisabled = (rest as { "aria-disabled"?: unknown })["aria-disabled"];
  const nativeDisabled = (rest as { disabled?: boolean }).disabled;
  const disabled = ariaDisabled === true || ariaDisabled === "true" || nativeDisabled === true;
  const cls = buttonClasses(variant, size, { full, disabled, className });
  const icon = Icon ? <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" /> : null;

  const inner = (external: boolean) => (
    <>
      {iconPosition === "start" && icon}
      <span>{children}</span>
      {iconPosition === "end" && icon}
      {external && (
        <>
          <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
      {arrow && (
        <span aria-hidden="true" className="inline-block transition-transform duration-(--dur-2) ease-out fine:group-hover:translate-x-1">
          →
        </span>
      )}
    </>
  );

  if (p.href !== undefined) {
    const { href, external: externalProp, onClick, ...anchor } = rest as Omit<Extract<ButtonProps, { href: string }>, keyof Common>;
    const isHttp = /^https?:/i.test(href);
    const external = !!externalProp || isHttp;
    const guarded = disabled && onClick ? (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault() : onClick;
    const common = { ...anchor, onClick: guarded, className: cls, "aria-disabled": disabled ? true : anchor["aria-disabled"] };
    if (!external && href.startsWith("/")) {
      return <Link href={href} {...common}>{inner(false)}</Link>;
    }
    return (
      <a href={href} {...common} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {inner(external)}
      </a>
    );
  }

  const { onClick, type, disabled: _native, ...button } = rest as Omit<Extract<ButtonProps, { href?: undefined }>, keyof Common>;
  void _native;
  const guarded = disabled && onClick ? (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault() : onClick;
  return (
    <button
      type={type ?? "button"}
      {...button}
      onClick={guarded}
      aria-disabled={disabled ? true : button["aria-disabled"]}
      className={cls}
    >
      {inner(false)}
    </button>
  );
}
