// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestTable } from "@/app/actions/request-table";
import { configuredChannels, deliver, escapeHtml, renderEmail, type ReservationRecord } from "@/lib/booking/channels";
import { BOOKING_COPY, bookingSummary } from "@/lib/booking/copy";
import type { BookingInput } from "@/lib/booking/types";
import { normalizePhone, splitName, validateBookingInput } from "@/lib/booking/validate";
import { laParts, toLaInstant, toLaOffsetISO } from "@/lib/la-time";

const ENV_KEYS = [
  "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "RESEND_API_KEY", "RESTAURANT_EMAIL", "RESEND_FROM", "DISCORD_WEBHOOK_URL", "GOOGLE_SHEETS_SCRIPT_URL", "GOOGLE_SHEETS_WEBHOOK_URL",
];
const NOW = new Date("2026-10-02T12:00:00-07:00").getTime(); // Fri noon, LA

const good = (over: Partial<BookingInput> = {}): BookingInput => ({
  partySize: 4, date: "2026-10-03", time: "19:00", name: "Ana  Maria Lopez", phone: "951 555 0100",
  email: "ana@example.com", notes: "Window seat", source: "sheet", ...over,
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  for (const k of ENV_KEYS) vi.stubEnv(k, "");
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("normalizePhone / splitName", () => {
  it("normalizes 10 and 11 digit numbers", () => {
    expect(normalizePhone("9517801132")).toBe("(951) 780-1132");
    expect(normalizePhone("+1 (951) 780-1132")).toBe("(951) 780-1132");
    expect(normalizePhone("1-951-780-1132")).toBe("(951) 780-1132");
    expect(normalizePhone("780-1132")).toBeNull();
    expect(normalizePhone("29517801132")).toBeNull();
    expect(normalizePhone("")).toBeNull();
  });
  it("splits on the first whitespace", () => {
    expect(splitName("  Ana Maria Lopez ")).toEqual({ first: "Ana", last: "Maria Lopez" });
    expect(splitName("Cher")).toEqual({ first: "Cher", last: "" });
  });
});

describe("validateBookingInput", () => {
  it("accepts a good request and normalizes it", () => {
    const r = validateBookingInput(good(), NOW);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toMatchObject({ partySize: 4, phone: "(951) 555-0100", name: "Ana Maria Lopez", source: "sheet" });
  });
  it("uses the exact messages", () => {
    const r = validateBookingInput({ partySize: 0, date: "", time: "", name: " ", phone: "123", email: "nope", notes: "x".repeat(501) }, NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fields).toEqual({
      partySize: "Choose how many guests.",
      date: "Choose a date.",
      time: "Choose a time.",
      name: "Enter your name.",
      phone: "Enter a 10-digit mobile number.",
      email: "Enter a valid email.",
      notes: "Notes can be up to 500 characters.",
    });
  });
  it("sends 9+ to the phone", () => {
    const r = validateBookingInput(good({ partySize: 9 }), NOW);
    expect(!r.ok && r.fields.partySize).toBe("For 9 or more, please call (951) 780-1132.");
  });
  it("rejects dates and times outside the window", () => {
    const past = validateBookingInput(good({ date: "2026-10-01" }), NOW);
    expect(!past.ok && past.fields.date).toBe("That date isn't available.");
    const far = validateBookingInput(good({ date: "2026-11-15" }), NOW);
    expect(!far.ok && far.fields.date).toBe("That date isn't available.");
    const late = validateBookingInput(good({ time: "21:30" }), NOW);
    expect(!late.ok && late.fields.time).toBe("That time isn't available — pick another.");
    const soon = validateBookingInput(good({ date: "2026-10-02", time: "12:00" }), NOW);
    expect(!soon.ok && soon.fields.time).toBe("That time isn't available — pick another.");
  });
});

describe("the LA date bug", () => {
  it("a Saturday pick stays Saturday 19:00 in LA", () => {
    expect(toLaOffsetISO("2026-10-03", "19:00")).toBe("2026-10-03T19:00:00-07:00");
    expect(laParts(toLaInstant("2026-10-03", "19:00")).weekday).toBe(6);
  });
});

describe("copy", () => {
  it("summarizes a booking", () => {
    expect(bookingSummary({ partySize: 4, date: "2026-10-03", time: "19:00" })).toBe("Table for 4 · Sat, Oct 3 · 7:00 PM");
    expect(bookingSummary({})).toBe("Table for — · — · —");
  });
  it("builds the success line", () => {
    expect(BOOKING_COPY.success({ phone: "9515550100", partySize: 4, date: "2026-10-03", time: "19:00" }))
      .toBe("Request received. We'll call or text (951) 555-0100 to confirm a table for 4 on Sat, Oct 3 at 7:00 PM. It isn't booked until we do.");
    expect(BOOKING_COPY.notConfigured).toContain("(951) 780-1132");
  });
});

describe("channels", () => {
  it("reads env names", () => {
    expect(configuredChannels({})).toEqual([]);
    expect(configuredChannels({ SUPABASE_URL: "https://placeholder-url.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "k" })).toEqual([]);
    expect(configuredChannels({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "k" })).toEqual(["supabase"]);
    expect(configuredChannels({ RESEND_API_KEY: "k" })).toEqual([]);
    expect(configuredChannels({ RESEND_API_KEY: "k", RESTAURANT_EMAIL: "a@b.co", DISCORD_WEBHOOK_URL: "https://d", GOOGLE_SHEETS_WEBHOOK_URL: "https://s" }))
      .toEqual(["resend", "discord", "sheets"]);
  });
  it("escapes HTML", () => {
    expect(escapeHtml(`<script>steal("x")</script> & 'y'`)).toBe("&lt;script&gt;steal(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;");
  });
  it("renders an escaped email with a one-line subject", () => {
    const rec: ReservationRecord = {
      id: "abc", ref: "ABC123", party_size: 4, reservation_time: "2026-10-03T19:00:00-07:00", first_name: "<script>Ana",
      last_name: "Lo\r\npez", email: "a@b.co", phone: "(951) 555-0100", notes: "<img src=x onerror=steal(1)>", status: "pending",
      source: "page", dateLabel: "Sat, Oct 3", timeLabel: "7:00 PM",
    };
    const e = renderEmail(rec);
    expect(e.subject).not.toMatch(/[\r\n]/);
    expect(e.subject).toContain("4 guests · Sat, Oct 3 7:00 PM");
    expect(e.html).not.toContain("<script>");
    expect(e.html).not.toContain("<img");
    expect(e.html).toContain("&lt;script&gt;Ana");
    expect(e.html).toContain("Pending — call or text the guest to confirm.");
  });
  it("posts Supabase REST with return=minimal and no select", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const rec = { id: "id-1", ref: "ID-1", party_size: 2, reservation_time: "2026-10-03T19:00:00-07:00", first_name: "A", last_name: "B",
      email: "a@b.co", phone: "(951) 555-0100", notes: null, status: "pending", source: "page", dateLabel: "Sat, Oct 3", timeLabel: "7:00 PM" } as const;
    const r = await deliver({ ...rec }, { SUPABASE_URL: "https://x.supabase.co/", SUPABASE_SERVICE_ROLE_KEY: "svc" });
    expect(r).toEqual({ configured: ["supabase"], succeeded: ["supabase"], failed: [] });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://x.supabase.co/rest/v1/reservations");
    expect((init.headers as Record<string, string>).Prefer).toBe("return=minimal");
    expect(JSON.parse(String(init.body))).toEqual({
      id: "id-1", party_size: 2, reservation_time: "2026-10-03T19:00:00-07:00", first_name: "A", last_name: "B",
      email: "a@b.co", phone: "(951) 555-0100", notes: null, status: "pending",
    });
  });
});

describe("requestTable", () => {
  it("not_configured with no env", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await requestTable(good())).toEqual({ ok: false, reason: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("invalid with field messages", async () => {
    const r = await requestTable(good({ name: "", phone: "12" }));
    expect(r).toEqual({ ok: false, reason: "invalid", fields: { name: "Enter your name.", phone: "Enter a 10-digit mobile number." } });
  });
  it("failed when every channel returns 500", async () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.test/hook");
    const fetchMock = vi.fn(async () => new Response("no", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await requestTable(good())).toEqual({ ok: false, reason: "failed" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("ok when one channel returns 201, with the LA Saturday timestamp", async () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.test/hook");
    const fetchMock = vi.fn(async (url: string) => new Response(null, { status: url.includes("supabase") ? 201 : 500 }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await requestTable(good());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(r.ref).toBe(r.id!.slice(0, 6).toUpperCase());
    }
    const sb = fetchMock.mock.calls.find(([u]) => String(u).includes("supabase")) as unknown as [string, RequestInit];
    const body = JSON.parse(String(sb[1].body));
    expect(body.reservation_time).toBe("2026-10-03T19:00:00-07:00");
    expect(body.reservation_time.endsWith("-07:00")).toBe(true);
    expect(laParts(new Date(body.reservation_time)).weekday).toBe(6);
    expect(body).toMatchObject({ first_name: "Ana", last_name: "Maria Lopez", phone: "(951) 555-0100", status: "pending" });
    // No PII in logs.
    const logged = (console.info as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().join(" ");
    expect(logged).toContain("[request-table] ref=");
    expect(logged).not.toMatch(/Ana|Lopez|\(951\) 555|example\.com|Window/);
  });
  it("the honeypot fails silently and contacts no channel", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.test/hook");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await requestTable(good({ company: "Acme" }))).toEqual({ ok: false, reason: "failed" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith("[request-table] honeypot");
  });
});
