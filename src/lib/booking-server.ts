// Server-only helpers for /api/reservations and /api/inquiry.
// Storage: Supabase REST (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY; RLS lets anon INSERT pending rows only).
// Staff alerts (optional): Resend email (RESEND_API_KEY + RESTAURANT_EMAIL + RESEND_FROM) and/or DISCORD_WEBHOOK_URL.
import { laTodayISO, RESTAURANT_TZ } from "@/lib/dates";

export const PHONE_DISPLAY = "(951) 780-1132";

export type BookingResult = { ok: true } | { ok: false; reason: "invalid" | "not_configured" | "failed"; message?: string };

/** "2026-10-03" + "19:00" → "2026-10-03T19:00:00-07:00" (the Riverside offset on that date). */
export function laOffsetISO(date: string, time: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const offsetAt = (instant: number) => {
    const p = new Intl.DateTimeFormat("en-US", {
      timeZone: RESTAURANT_TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).formatToParts(new Date(instant));
    const g = (t: string) => Number(p.find((x) => x.type === t)!.value);
    return (Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute")) - instant) / 60000;
  };
  const off = offsetAt(wall - offsetAt(wall) * 60000);
  const a = Math.abs(off);
  return `${date}T${time}:00${off < 0 ? "-" : "+"}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ── Validation ────────────────────────────────────────────────────────────
type Contact = { firstName: string; lastName: string; email: string; phone: string; notes: string };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateContact(b: Record<string, unknown>): Contact | string {
  const c = { firstName: str(b.firstName), lastName: str(b.lastName), email: str(b.email), phone: str(b.phone), notes: str(b.notes) };
  if (!c.firstName || c.firstName.length > 80) return "Please enter your first name.";
  if (c.lastName.length > 80) return "Please shorten your last name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) || c.email.length > 254) return "Please enter a valid email address.";
  const digits = c.phone.replace(/\D/g, "").length;
  if (digits < 7 || digits > 15 || c.phone.length > 32) return "Please enter a valid phone number.";
  if (c.notes.length > 1000) return "Please keep notes under 1,000 characters.";
  return c;
}

export function validateTable(b: Record<string, unknown>): { partySize: number; date: string; time: string } | string {
  const partySize = Number(b.partySize);
  const date = str(b.date);
  const time = str(b.time);
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) return "Please choose a party size.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < laTodayISO()) return "Please choose today or a later date.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return "Please choose a time.";
  return { partySize, date, time };
}

// ── Channels ──────────────────────────────────────────────────────────────
function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return url && key && !url.includes("placeholder") ? { url: url.replace(/\/+$/, ""), key } : null;
}

const resendEnv = () => {
  const key = process.env.RESEND_API_KEY?.trim(), to = process.env.RESTAURANT_EMAIL?.trim(), from = process.env.RESEND_FROM?.trim();
  return key && to && from ? { key, to, from } : null;
};

export const anyChannelConfigured = () => Boolean(supabaseEnv() || resendEnv() || process.env.DISCORD_WEBHOOK_URL?.trim());

/** Insert one row; true only on a 2xx. Never reads anything back. */
export async function insertRow(table: "reservations" | "inquiries", row: Record<string, unknown>): Promise<boolean> {
  const sb = supabaseEnv();
  if (!sb) return false;
  try {
    const res = await fetch(`${sb.url}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`[booking] ${table} insert failed: HTTP ${res.status}`);
    return res.ok;
  } catch (err) {
    console.error(`[booking] ${table} insert error:`, err instanceof Error ? err.name : "unknown");
    return false;
  }
}

/** Best-effort staff alert. True if at least one configured channel accepted it. */
export async function notifyStaff(subject: string, fields: [string, string][]): Promise<boolean> {
  const jobs: Promise<boolean>[] = [];
  const resend = resendEnv();
  if (resend) {
    const html = `<h2>${escapeHtml(subject)}</h2>` + fields.map(([k, v]) => `<p><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v || "—")}</p>`).join("")
      + `<p><em>Pending — please call or text the guest to confirm.</em></p>`;
    jobs.push(fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resend.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: resend.from, to: [resend.to], subject: subject.replace(/[\r\n]+/g, " "), html }),
      signal: AbortSignal.timeout(8000),
    }).then((r) => r.ok, () => false));
  }
  const discord = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (discord) {
    jobs.push(fetch(discord, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `**${subject}**\n` + fields.map(([k, v]) => `${k}: ${v || "—"}`).join("\n"), allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(8000),
    }).then((r) => r.ok, () => false));
  }
  const results = await Promise.all(jobs);
  return results.some(Boolean);
}
