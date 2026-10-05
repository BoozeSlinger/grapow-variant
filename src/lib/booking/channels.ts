/**
 * Table-request delivery channels (spec §9.7). SERVER-ONLY by convention: import this ONLY from
 * src/app/actions/request-table.ts and tests. Plain fetch — no supabase-js.
 * Never log names, phone numbers, emails or notes.
 */
import type { BookingSource } from "./types";

export type ChannelId = "supabase" | "resend" | "discord" | "sheets";
export type ReservationRecord = {
  id: string; ref: string; party_size: number; reservation_time: string; first_name: string; last_name: string;
  email: string; phone: string; notes: string | null; status: "pending"; source: BookingSource; dateLabel: string; timeLabel: string;
};
type Env = Record<string, string | undefined>;

const TIMEOUT_MS = 8000;
const DEFAULT_FROM = "Gra Pow Reservations <onboarding@resend.dev>";

const val = (env: Env, ...names: string[]): string => {
  for (const n of names) {
    const v = env[n]?.trim();
    if (v) return v;
  }
  return "";
};

function supabaseConfig(env: Env): { url: string; key: string } | null {
  const url = val(env, "SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const key = val(env, "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key || url.includes("placeholder")) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

export function configuredChannels(env: Env = process.env): ChannelId[] {
  const out: ChannelId[] = [];
  if (supabaseConfig(env)) out.push("supabase");
  if (val(env, "RESEND_API_KEY") && val(env, "RESTAURANT_EMAIL")) out.push("resend");
  if (val(env, "DISCORD_WEBHOOK_URL")) out.push("discord");
  if (val(env, "GOOGLE_SHEETS_SCRIPT_URL", "GOOGLE_SHEETS_WEBHOOK_URL")) out.push("sheets");
  return out;
}

/** & < > " ' → entities. */
export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const oneLine = (s: string) => String(s).replace(/[\r\n]+/g, " ").trim();
const fullName = (rec: ReservationRecord) => [rec.first_name, rec.last_name].filter(Boolean).join(" ");

export function renderEmail(rec: ReservationRecord): { subject: string; html: string; text: string } {
  const name = fullName(rec);
  const subject = oneLine(`Table request · ${name} · ${rec.party_size} guests · ${rec.dateLabel} ${rec.timeLabel}`);
  const rows: Array<[string, string]> = [
    ["When", `${rec.dateLabel} at ${rec.timeLabel}`],
    ["Party", `${rec.party_size} guests`],
    ["Name", name],
    ["Mobile", rec.phone],
    ["Email", rec.email],
    ["Notes", rec.notes ?? "—"],
    ["Ref", rec.ref],
    ["Source", rec.source],
  ];
  const e = escapeHtml;
  const html = [
    `<p><strong>Pending — call or text the guest to confirm.</strong></p>`,
    `<table cellpadding="6" style="border-collapse:collapse">`,
    ...rows.map(([k, v]) => `<tr><th align="left">${e(k)}</th><td>${e(v)}</td></tr>`),
    `</table>`,
  ].join("\n");
  const text = ["Pending — call or text the guest to confirm.", "", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");
  return { subject, html, text };
}

/** Escape Discord markdown so guest text can't format, link or mention. */
function escapeDiscord(s: string): string {
  return String(s).replace(/([\\*_~`|>#[\]()-])/g, "\\$1").replace(/@/g, "@\u200b");
}

type Sender = (rec: ReservationRecord, env: Env, signal: AbortSignal) => Promise<Response>;

const SENDERS: Record<ChannelId, Sender> = {
  supabase: (rec, env, signal) => {
    const { url, key } = supabaseConfig(env)!;
    return fetch(`${url}/rest/v1/reservations`, {
      method: "POST",
      signal,
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        id: rec.id, party_size: rec.party_size, reservation_time: rec.reservation_time,
        first_name: rec.first_name, last_name: rec.last_name, email: rec.email, phone: rec.phone,
        notes: rec.notes, status: "pending",
      }),
    });
  },
  resend: (rec, env, signal) => {
    const { subject, html, text } = renderEmail(rec);
    return fetch("https://api.resend.com/emails", {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${val(env, "RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: val(env, "RESEND_FROM") || DEFAULT_FROM,
        to: [val(env, "RESTAURANT_EMAIL")],
        reply_to: rec.email,
        subject, html, text,
      }),
    });
  },
  discord: (rec, env, signal) => {
    const d = escapeDiscord;
    const content = [
      `Table request (pending — call or text to confirm) · ref ${d(rec.ref)}`,
      `${d(rec.dateLabel)} at ${d(rec.timeLabel)} · ${rec.party_size} guests`,
      `${d(fullName(rec))} · ${d(rec.phone)} · ${d(rec.email)}`,
      rec.notes ? `Notes: ${d(oneLine(rec.notes))}` : "",
    ].filter(Boolean).join("\n");
    return fetch(val(env, "DISCORD_WEBHOOK_URL"), {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });
  },
  sheets: (rec, env, signal) =>
    fetch(val(env, "GOOGLE_SHEETS_SCRIPT_URL", "GOOGLE_SHEETS_WEBHOOK_URL"), {
      method: "POST",
      signal,
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ref: rec.ref, date: rec.dateLabel, time: rec.timeLabel, partySize: rec.party_size, name: fullName(rec),
        phone: rec.phone, email: rec.email, notes: rec.notes ?? "", source: rec.source, submittedAt: new Date().toISOString(),
      }),
    }),
};

/** Runs every configured channel in parallel (Promise.allSettled), each with an 8 s timeout. */
export async function deliver(rec: ReservationRecord, env: Env = process.env):
  Promise<{ configured: ChannelId[]; succeeded: ChannelId[]; failed: ChannelId[] }> {
  const configured = configuredChannels(env);
  const results = await Promise.allSettled(configured.map((id) => SENDERS[id](rec, env, AbortSignal.timeout(TIMEOUT_MS))));
  const succeeded: ChannelId[] = [], failed: ChannelId[] = [];
  results.forEach((r, i) => (r.status === "fulfilled" && r.value.ok ? succeeded : failed).push(configured[i]));
  return { configured, succeeded, failed };
}
