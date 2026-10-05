"use client";
/**
 * Opening hours as a real <table> (spec §10.12). Today's row gets a 3px accent rule AND a "Today" tag —
 * never colour alone. Client only for the today highlight (shared clock).
 */
import { useVenueStatus } from "@/lib/clock";
import { getHoursRows, serviceLines, sushiDays } from "@/lib/hours";

/** Keep the hour and its AM/PM together so ranges wrap only after the en dash. */
const keep = (s: string) => s.replace(/ (?=(?:AM|PM)\b)/g, "\u00a0");

export function HoursTable({ layout = "grouped", showServiceLines = true, caption = "Opening hours", className }: {
  layout?: "grouped" | "week"; showServiceLines?: boolean; caption?: string; className?: string;
}) {
  const s = useVenueStatus();
  const rows = getHoursRows(layout);
  const lines = serviceLines();
  const closed = sushiDays().closed;
  return (
    <div className={["min-w-0", className].filter(Boolean).join(" ")}>
      <table className="w-full border-collapse text-left t-small">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            {["Days", "Kitchen", "Bar", "Sushi bar"].map((h) => (
              <th key={h} scope="col" className="py-2 pr-3 align-bottom t-label text-fg-muted last:pr-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const today = r.weekdays.includes(s.serviceWeekday);
            return (
              <tr key={r.days} className="border-b border-hair align-top">
                <th scope="row" className={["py-2.5 pr-3 font-semibold", today ? "pl-3 shadow-[inset_3px_0_0_var(--accent)]" : ""].join(" ")}>
                  <span className="block">{r.days}</span>
                  {today ? <span className="mt-1 block t-label text-accent">Today</span> : null}
                </th>
                <td className="py-2.5 pr-3 tnum">{keep(r.kitchen)}</td>
                <td className="py-2.5 pr-3 tnum">{keep(r.bar)}</td>
                <td className="py-2.5 tnum">{keep(r.sushi)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showServiceLines ? (
        <ul className="mt-4 flex flex-col gap-1.5 t-small text-fg-muted">
          <li>{lines.lunch}</li>
          <li>{lines.happyHour}</li>
          <li>{lines.sushi}</li>
        </ul>
      ) : layout === "grouped" && closed ? (
        <p className="mt-3 t-small text-fg-muted">Sushi bar closed {closed}.</p>
      ) : null}
    </div>
  );
}
