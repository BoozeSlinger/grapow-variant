/** Renders a data string with the venue phone number kept on one line (tabular figures). */
import { VENUE } from "@/data/venue";

export function NoBreakPhone({ text }: { text: string }) {
  const at = text.indexOf(VENUE.phone.display);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="whitespace-nowrap tnum">{VENUE.phone.display}</span>
      {text.slice(at + VENUE.phone.display.length)}
    </>
  );
}
