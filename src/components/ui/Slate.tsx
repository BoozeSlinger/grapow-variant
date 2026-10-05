/** Section opener (spec §10.6): index · chapter name (h2) · hairline · live datum. */
export function Slate({ index, title, titleId, as: H = "h2", datum, className }: {
  index?: string; title: string; titleId?: string; as?: "h2" | "h3"; datum?: React.ReactNode; className?: string;
}) {
  return (
    <div className={["slate", className].filter(Boolean).join(" ")}>
      {index ? <span className="t-label tnum text-accent">{index}</span> : null}
      <H id={titleId} className="t-label">{title}</H>
      <span className="slate-rule" aria-hidden="true" />
      {datum ? <span className="t-label text-fg-muted max-sm:basis-full">{datum}</span> : null}
    </div>
  );
}
