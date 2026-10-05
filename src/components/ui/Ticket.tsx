/**
 * The kitchen ticket (spec §10.3): outer .ticket inherits the parent ground and captures --notch for the
 * stub notches; .ticket-paper carries its own rice/card ground.
 */
export function Ticket({ as: Tag = "div", paper = "rice", elevated, head, stub, children, className, labelledBy }: {
  as?: "div" | "article" | "li" | "section"; paper?: "rice" | "card"; elevated?: boolean;
  head?: React.ReactNode; stub?: React.ReactNode; children: React.ReactNode;
  className?: string; labelledBy?: string;
}) {
  return (
    <Tag className={["ticket", className].filter(Boolean).join(" ")} data-elevated={elevated ? "" : undefined} aria-labelledby={labelledBy}>
      <div className="ticket-paper" data-ground={paper}>
        {head ? <div className="ticket-head">{head}</div> : null}
        <div className="ticket-body">{children}</div>
        {stub ? <div className="ticket-stub">{stub}</div> : null}
      </div>
    </Tag>
  );
}
