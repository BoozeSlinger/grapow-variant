/** Official menu notes (spec §10.13): top = one line joined with " · "; bottom = a bordered note block. */
export function MenuNotes({ notes, variant, className }: { notes: string[]; variant: "top" | "bottom"; className?: string }) {
  if (!notes.length) return null;
  if (variant === "top") {
    return <p className={["t-small text-fg-muted text-pretty", className].filter(Boolean).join(" ")}>{notes.join(" · ")}</p>;
  }
  return (
    <div className={["rounded-sm p-5 shadow-[inset_0_0_0_1.5px_var(--line)] sm:p-6", className].filter(Boolean).join(" ")}>
      <ul className="flex flex-col gap-2 t-small text-pretty">
        {notes.map((n) => <li key={n}>{n}</li>)}
      </ul>
    </div>
  );
}
