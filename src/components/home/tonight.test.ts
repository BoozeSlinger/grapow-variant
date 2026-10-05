import { describe, expect, it } from "vitest";
import { getVenueStatus } from "@/lib/hours";
import { boardCells, barWeekLine, glue, leftValue, splitClock, ticketHead, ticketRows } from "./tonight";

const at = (iso: string) => getVenueStatus(new Date(iso), { route: "/" });
const cell = (iso: string, id: string) => boardCells(at(iso)).find((c) => c.id === id)!;
const read = (iso: string, id: string) => {
  const c = cell(iso, id);
  return `${c.label} · ${c.tag.text} / ${c.verb} / ${c.value.main}${c.value.suffix ? ` ${c.value.suffix}` : ""} / ${c.sub}`;
};

describe("Tonight Board cells (spec §12.1 clock fixtures)", () => {
  it("Fri 2026-10-02 22:30", () => {
    const t = "2026-10-02T22:30:00-07:00";
    expect(read(t, "kitchen")).toBe("Kitchen · Tomorrow / opens / 11 AM / Lunch specials back tomorrow 11 AM");
    expect(read(t, "happyHour")).toBe("Happy hour · On now / ends in / 3:30 / Drink specials till close");
    expect(read(t, "sushi")).toBe("Sushi bar · Tomorrow / opens / 5 PM / Tuesday to Saturday, from five.");
    expect(read(t, "bar")).toBe("Bar · Open / till / 2 AM / Midnight Sun–Thu · 2 AM Fri & Sat");
    expect(cell(t, "happyHour").sr).toBe("Happy hour now · till close");
  });
  it("Sun 2026-10-04 20:15", () => {
    const t = "2026-10-04T20:15:00-07:00";
    expect(read(t, "kitchen")).toBe("Kitchen · Open / till / 9 PM / Lunch specials back tomorrow 11 AM");
    expect(read(t, "happyHour")).toBe("Happy hour · Next up / starts / 9 PM / Drink specials till close");
    expect(read(t, "sushi")).toBe("Sushi bar · Back Tue / back / Tue 5 PM / Tuesday to Saturday, from five.");
    expect(read(t, "bar")).toBe("Bar · Open / till / midnight / Midnight Sun–Thu · 2 AM Fri & Sat");
  });
  it("Tue 2026-10-06 17:30: last call", () => {
    const t = "2026-10-06T17:30:00-07:00";
    expect(read(t, "happyHour")).toBe("Happy hour · On now / ends in / 30 min / Last call · till 6 PM");
    expect(read(t, "sushi")).toBe("Sushi bar · Open / till / 9 PM / Tuesday to Saturday, from five.");
  });
  it("Mon 2026-10-05 13:00: lunch line, sushi back Tue", () => {
    const t = "2026-10-05T13:00:00-07:00";
    expect(read(t, "kitchen")).toBe("Kitchen · Open / till / 9 PM / Lunch specials till 3 PM");
    expect(read(t, "happyHour")).toBe("Happy hour · Next up / starts / 3 PM / $8 bites & drink specials till 6 PM");
    expect(read(t, "sushi")).toBe("Sushi bar · Back Tue / back / Tue 5 PM / Tuesday to Saturday, from five.");
  });
  it("early window active: $8 bites in the sub-line", () => {
    expect(read("2026-10-07T15:48:00-07:00", "happyHour")).toBe("Happy hour · On now / ends in / 2:12 / Till 6 PM · $8 bites");
  });
  it("never leads with Closed", () => {
    for (let h = 0; h < 7 * 24; h++) {
      const s = getVenueStatus(Date.parse("2026-10-04T00:00:00-07:00") + h * 3_600_000);
      for (const c of boardCells(s)) expect(c.tag.text).not.toBe("Closed");
    }
  });
});

describe("Tonight ticket", () => {
  it("head + order after kitchen close (Fri 22:30)", () => {
    const s = at("2026-10-02T22:30:00-07:00");
    expect(ticketHead(s)).toEqual({ label: "Tonight · Fri, Oct 2", time: "10:30 PM" });
    expect(ticketRows(s).map((r) => `${r.label}: ${r.value}`)).toEqual([
      "Bar: Till 2 AM", "Happy hour: Till close", "Kitchen: Opens tomorrow 11 AM", "Sushi bar: Back tomorrow 5 PM",
    ]);
  });
  it("service day after midnight keeps the evening date", () => {
    expect(ticketHead(at("2026-10-03T01:30:00-07:00")).label).toBe("Tonight · Fri, Oct 2");
  });
  it("Mon 13:00: Today head, lunch sub-line on the kitchen row", () => {
    const s = at("2026-10-05T13:00:00-07:00");
    expect(ticketHead(s).label).toBe("Today · Mon, Oct 5");
    const k = ticketRows(s).find((r) => r.id === "kitchen")!;
    expect(k.sub).toBe("Lunch specials · till 3 PM");
  });
  it("Tue 17:30: last call row", () => {
    const hh = ticketRows(at("2026-10-06T17:30:00-07:00")).find((r) => r.id === "happyHour")!;
    expect(hh).toMatchObject({ now: true, value: "Last call · 30 min", dot: "now" });
  });
});

describe("helpers", () => {
  it("glue keeps a time with its meridiem", () => {
    expect(glue("Lunch specials back tomorrow 11 AM")).toBe("Lunch specials back tomorrow 11\u00a0AM");
    expect(glue("Last call · 30 min · till 6 PM")).toBe("Last call\u00a0· 30\u00a0min\u00a0· till 6\u00a0PM");
    expect(glue("Midnight Sun–Thu · 2 AM Fri & Sat")).toBe("Midnight Sun\u2060–\u2060Thu\u00a0· 2\u00a0AM Fri & Sat");
  });
  it("splitClock / leftValue / barWeekLine", () => {
    expect(splitClock("Tue 5 PM")).toEqual({ main: "Tue 5", suffix: "PM" });
    expect(splitClock("midnight")).toEqual({ main: "midnight" });
    expect(leftValue(72)).toEqual({ main: "1:12" });
    expect(leftValue(48)).toEqual({ main: "48", suffix: "min" });
    expect(barWeekLine()).toBe("Midnight Sun–Thu · 2 AM Fri & Sat");
  });
});
