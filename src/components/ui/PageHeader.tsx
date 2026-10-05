/**
 * Page header (spec §10.15): label · h1 (t-d1; titleLines become block spans) · lede · live line ·
 * actions · optional media (cols 7–12 at ≥1024, bleeding right). The h1 is never animated (LCP on text pages).
 */
export function PageHeader({ label, title, titleLines, lede, live, actions, media, ground = "ink", className }: {
  label?: string; title: string; titleLines?: string[]; lede?: React.ReactNode; live?: React.ReactNode;
  actions?: React.ReactNode; media?: React.ReactNode; ground?: "ink" | "rice"; className?: string;
}) {
  return (
    <header
      data-ground={ground}
      className={["pb-[clamp(40px,6vw,80px)] pt-[calc(var(--header-full)+clamp(32px,6vw,72px))]", className].filter(Boolean).join(" ")}
    >
      <div className="frame grid-page items-end gap-y-8">
        <div className={media ? "col-span-full lg:col-span-6" : "col-span-full lg:col-span-10"}>
          {label ? <p className="mb-4 t-label text-accent">{label}</p> : null}
          <h1 className="t-d1 text-balance">
            {titleLines?.length ? titleLines.map((l, i) => <span key={l} className="block">{i > 0 ? " " : null}{l}</span>) : title}
          </h1>
          {lede ? <div className="mt-6 t-lede measure-lede text-pretty">{lede}</div> : null}
          {live ? <div className="mt-6 t-small">{live}</div> : null}
          {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {media ? (
          <div className="col-span-full lg:col-span-6 lg:col-start-7 lg:-mr-(--margin)">{media}</div>
        ) : null}
      </div>
    </header>
  );
}
