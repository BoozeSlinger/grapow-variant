// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  getBookableDates, getBookableSlots, getDayTimeline, getHoursRows, getServiceDay, getVenueStatus,
  isBookable, lastSlotAtOrBefore, nearestSlots, serviceLines,
} from "@/lib/hours";
import {
  addDaysISO, formatClock, formatDateLong, formatDateShort, formatRange, formatSlot, laParts,
  minutesToHHMM, toLaInstant, toLaOffsetISO, weekdayOfISO,
} from "@/lib/la-time";

// Explicit offsets: these instants hold in any process TZ.
const at = (iso: string) => new Date(iso).getTime();

describe("la-time", () => {
  it("formats clock times", () => {
    expect(formatClock(540)).toBe("9 AM");
    expect(formatClock(1170)).toBe("7:30 PM");
    expect(formatClock(0)).toBe("midnight");
    expect(formatClock(1440)).toBe("midnight");
    expect(formatClock(720)).toBe("noon");
    expect(formatClock(1560)).toBe("2 AM");
  });
  it("formats ranges with an en dash and no spaces", () => {
    expect(formatRange(900, 1080)).toBe("3–6 PM");
    expect(formatRange(540, 660)).toBe("9–11 AM");
    expect(formatRange(660, 1260)).toBe("11 AM–9 PM");
    expect(formatRange(1260, 1440, { endWord: "close" })).toBe("9 PM–close");
    expect(formatRange(660, 1440)).toBe("11 AM–midnight");
    expect(formatRange(660, 1560)).toBe("11 AM–2 AM");
  });
  it("formats slots and dates", () => {
    expect(formatSlot("19:00")).toBe("7:00 PM");
    expect(formatSlot("11:30")).toBe("11:30 AM");
    expect(minutesToHHMM(1170)).toBe("19:30");
    expect(minutesToHHMM(1560)).toBe("02:00");
    expect(formatDateShort("2026-10-03")).toBe("Sat, Oct 3");
    expect(formatDateLong("2026-10-03")).toBe("Saturday, October 3");
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
    expect(weekdayOfISO("2026-10-03")).toBe(6);
  });
  it("reads LA wall-clock parts", () => {
    const p = laParts(at("2026-10-02T22:30:00-07:00"));
    expect(p).toMatchObject({ dateISO: "2026-10-02", weekday: 5, hour: 22, minute: 30, minutes: 1350 });
  });
  it("is DST-safe", () => {
    expect(toLaOffsetISO("2026-11-01", "19:00")).toBe("2026-11-01T19:00:00-08:00");
    expect(toLaOffsetISO("2026-10-31", "19:00")).toBe("2026-10-31T19:00:00-07:00");
    expect(toLaOffsetISO("2026-03-08", "19:00")).toBe("2026-03-08T19:00:00-07:00");
    expect(toLaOffsetISO("2026-03-07", "19:00")).toBe("2026-03-07T19:00:00-08:00");
    expect(toLaInstant("2026-11-01", "19:00").toISOString()).toBe("2026-11-02T03:00:00.000Z");
  });
});

describe("venue status fixtures (§9.3)", () => {
  it("Fri 2026-10-02 22:30", () => {
    const s = getVenueStatus(at("2026-10-02T22:30:00-07:00"));
    expect(s.headline).toBe("Bar open · till 2 AM");
    expect(s.compact).toBe("Bar till 2 AM");
    expect(s.tracks.kitchen.text).toBe("Kitchen closed · opens tomorrow 11 AM");
    expect(s.tracks.happyHour.text).toBe("Happy hour now · till close");
    expect(s.tracks.happyHour.minutesLeft).toBe(210);
    expect(s.tracks.sushi.text).toBe("Sushi bar closed · back tomorrow 5 PM");
    expect(s.dot).toBe("open");
    expect(s.order).toEqual(["bar", "happyHour", "kitchen", "sushi"]);
  });

  it("Sun 2026-10-04 20:15", () => {
    const s = getVenueStatus(at("2026-10-04T20:15:00-07:00"));
    expect(s.tracks.kitchen.text).toBe("Kitchen open · till 9 PM");
    expect(s.tracks.bar.text).toBe("Bar open · till midnight");
    expect(s.tracks.sushi.text).toBe("Sushi bar closed today · back Tue 5 PM");
    expect(s.tracks.happyHour.text).toBe("Happy hour from 9 PM");
    expect(s.headline).toBe("Kitchen open · till 9 PM");
    expect(s.compact).toBe("Kitchen till 9 PM");
    expect(s.order).toEqual(["kitchen", "sushi", "happyHour", "bar"]);
  });

  it("Mon 2026-10-05 13:00 on /menu/sushi", () => {
    const s = getVenueStatus(at("2026-10-05T13:00:00-07:00"), { route: "/menu/sushi" });
    expect(s.primary).toBe("sushi");
    expect(s.order[0]).toBe("sushi");
    expect(s.tracks.sushi.text).toBe("Sushi bar closed today · back Tue 5 PM");
    expect(s.tracks.sushi.short).toBe("Back Tue 5 PM");
    expect(s.tracks.lunch.text).toBe("Lunch specials · till 3 PM");
    expect(getVenueStatus(at("2026-10-05T13:00:00-07:00")).primary).toBe("venue");
    expect(getVenueStatus(at("2026-10-05T13:00:00-07:00"), { route: "/menu/happy-hour" }).primary).toBe("happyHour");
    expect(getVenueStatus(at("2026-10-05T13:00:00-07:00"), { route: "/menu/drinks" }).primary).toBe("bar");
  });

  it("Sat 2026-10-03 01:30 belongs to Friday's service day", () => {
    const t = at("2026-10-03T01:30:00-07:00");
    expect(getServiceDay(t)).toEqual({ dateISO: "2026-10-02", weekday: 5, minutes: 1530 });
    const s = getVenueStatus(t);
    expect(s.serviceWeekday).toBe(5);
    expect(s.tracks.bar.text).toBe("Bar open · till 2 AM");
    expect(s.tracks.happyHour.open).toBe(true);
    expect(s.tracks.happyHour.minutesLeft).toBe(30);
  });

  it("Sat 2026-10-03 03:00 is closed until 11 AM", () => {
    const s = getVenueStatus(at("2026-10-03T03:00:00-07:00"));
    expect(s.headline).toBe("Closed · opens 11 AM");
    expect(s.compact).toBe("Opens 11 AM");
    expect(s.dot).toBe("later");
    expect(s.tracks.kitchen.text).toBe("Kitchen opens 11 AM");
  });

  it("Tue 2026-10-06 17:30 is happy hour last call", () => {
    const s = getVenueStatus(at("2026-10-06T17:30:00-07:00"));
    expect(s.tracks.happyHour.open).toBe(true);
    expect(s.tracks.happyHour.window).toBe(0);
    expect(s.tracks.happyHour.minutesLeft).toBe(30);
    expect(s.tracks.happyHour.lastCall).toBe(true);
    expect(s.tracks.happyHour.text).toBe("Happy hour now · till 6 PM");
    expect(s.tracks.sushi.text).toBe("Sushi bar open · till 9 PM");
    expect(s.order).toEqual(["happyHour", "kitchen", "sushi", "bar"]);
  });

  it("other templates", () => {
    const morning = getVenueStatus(at("2026-10-06T09:00:00-07:00"));
    expect(morning.headline).toBe("Closed · opens 11 AM");
    expect(morning.tracks.happyHour.text).toBe("Happy hour from 3 PM");
    expect(morning.tracks.happyHour.startsInMinutes).toBe(360);
    expect(morning.tracks.sushi.text).toBe("Sushi bar opens 5 PM");
    expect(morning.tracks.kitchen.text).toBe("Kitchen opens 11 AM");
    const lunchOver = getVenueStatus(at("2026-10-06T16:00:00-07:00"));
    expect(lunchOver.tracks.lunch.text).toBe("Lunch specials · back tomorrow 11 AM");
    expect(getVenueStatus(at("2026-10-08T23:00:00-07:00")).tracks.bar.text).toBe("Bar open · till midnight");
    const closedLate = getVenueStatus(at("2026-10-05T00:30:00-07:00")); // Sun service day, after midnight close
    expect(closedLate.headline).toBe("Closed · opens 11 AM");
    expect(closedLate.dot).toBe("later");
  });

  it("never says Closed while the bar is open", () => {
    for (let h = 0; h < 24 * 7; h++) {
      const s = getVenueStatus(at("2026-10-04T00:00:00-07:00") + h * 3_600_000);
      if (s.tracks.bar.open) expect(s.headline.startsWith("Closed")).toBe(false);
    }
  });
});

describe("timeline, rows and service lines", () => {
  it("day timeline", () => {
    const fri = getDayTimeline(5);
    expect(fri.map((b) => b.track)).toEqual(["lunch", "kitchen", "happyHour", "happyHour", "sushi", "bar"]);
    expect(fri.find((b) => b.track === "kitchen")?.text).toBe("11 AM–10 PM");
    expect(fri.find((b) => b.track === "sushi")?.uncertainEnd).toBe(true);
    expect(getDayTimeline(0).some((b) => b.track === "sushi")).toBe(false);
  });
  it("hours rows", () => {
    const grouped = getHoursRows("grouped");
    expect(grouped.map((r) => r.days)).toEqual(["Sun–Thu", "Fri–Sat"]);
    expect(grouped[0]).toMatchObject({ kitchen: "11 AM–9 PM", bar: "11 AM–midnight", sushi: "Tue–Thu from 5 PM" });
    expect(grouped[1]).toMatchObject({ kitchen: "11 AM–10 PM", bar: "11 AM–2 AM", sushi: "Fri–Sat from 5 PM" });
    const week = getHoursRows("week");
    expect(week).toHaveLength(7);
    expect(week[0]).toMatchObject({ days: "Sunday", sushi: "Closed" });
    expect(week[2]).toMatchObject({ days: "Tuesday", sushi: "From 5 PM" });
  });
  it("service lines", () => {
    expect(serviceLines()).toEqual({
      lunch: "Lunch specials daily until 3 PM",
      happyHour: "Happy hour daily 3–6 PM & 9 PM–close",
      sushi: "Sushi bar Tue–Sat from 5 PM · closed Sun & Mon",
    });
  });
});

describe("bookable slots", () => {
  const satNoon = at("2026-10-03T12:00:00-07:00");
  it("a full day runs 11:00 to kitchen close − 60", () => {
    const slots = getBookableSlots("2026-10-04", satNoon);
    expect(slots[0].time).toBe("11:00");
    expect(slots[slots.length - 1].time).toBe("20:00");
    expect(slots[0].label).toBe("11:00 AM");
    expect(slots.find((s) => s.time === "14:30")?.group).toBe("lunch");
    expect(slots.find((s) => s.time === "15:00")?.group).toBe("afternoon");
    expect(slots.find((s) => s.time === "16:30")?.group).toBe("afternoon");
    expect(slots.find((s) => s.time === "17:00")?.group).toBe("dinner");
  });
  it("today respects the 30-minute lead time", () => {
    const slots = getBookableSlots("2026-10-03", at("2026-10-03T18:10:00-07:00"));
    expect(slots[0].time).toBe("19:00");
    expect(slots[slots.length - 1].time).toBe("21:00");
  });
  it("outside the 30-day window → []", () => {
    expect(getBookableSlots(addDaysISO("2026-10-03", 31), satNoon)).toEqual([]);
    expect(getBookableSlots(addDaysISO("2026-10-03", 30), satNoon)).toEqual([]);
    expect(getBookableSlots(addDaysISO("2026-10-03", 29), satNoon).length).toBeGreaterThan(0);
    expect(getBookableSlots("2026-10-02", satNoon)).toEqual([]);
  });
  it("isBookable, nearestSlots, lastSlotAtOrBefore", () => {
    expect(isBookable("2026-10-04", "19:00", satNoon)).toBe(true);
    expect(isBookable("2026-10-04", "20:30", satNoon)).toBe(false);
    expect(isBookable("2026-10-03", "11:00", satNoon)).toBe(false);
    expect(nearestSlots("2026-10-04", "21:00", satNoon, 3).map((s) => s.time)).toEqual(["19:00", "19:30", "20:00"]);
    expect(lastSlotAtOrBefore("2026-10-04", 18 * 60 + 45, satNoon)?.time).toBe("18:30");
    expect(lastSlotAtOrBefore("2026-10-04", 600, satNoon)).toBeNull();
  });
  it("bookable dates", () => {
    const dates = getBookableDates(at("2026-10-03T21:45:00-07:00"));
    expect(dates).toHaveLength(30);
    expect(dates[0]).toMatchObject({ dateISO: "2026-10-03", label: "Today", hasSlots: false, tags: ["Sushi from 5"] });
    expect(dates[1]).toMatchObject({ dateISO: "2026-10-04", label: "Tomorrow", hasSlots: true, tags: [] });
    expect(dates[2]).toMatchObject({ label: "Mon 5", tags: [] });
    expect(dates[3]).toMatchObject({ label: "Tue 6", tags: ["Sushi from 5"] });
  });
});
