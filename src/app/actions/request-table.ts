"use server";
/**
 * The ONE booking pipeline (spec §9.7, §14): used by the booking sheet, /reservations and the host.
 * Never logs names, phone numbers, emails or notes.
 */
import { configuredChannels, deliver, type ReservationRecord } from "@/lib/booking/channels";
import type { BookingInput, RequestTableResult } from "@/lib/booking/types";
import { splitName, validateBookingInput } from "@/lib/booking/validate";
import { formatDateShort, formatSlot, toLaOffsetISO } from "@/lib/la-time";

export async function requestTable(input: BookingInput): Promise<RequestTableResult> {
  // 1. Honeypot: silent failure for bots; no channel is contacted.
  const company = input && typeof input === "object" ? (input as { company?: unknown }).company : undefined;
  if (typeof company === "string" && company.trim() !== "") {
    console.warn("[request-table] honeypot");
    return { ok: false, reason: "failed" };
  }

  // 2. Validate (LA time).
  const v = validateBookingInput(input, Date.now());
  if (!v.ok) return { ok: false, reason: "invalid", fields: v.fields };

  // 3. Channels.
  const channels = configuredChannels(process.env);
  if (channels.length === 0) return { ok: false, reason: "not_configured" };

  // 4. Record — the timestamp is built HERE, on the server, in LA time.
  const { partySize, date, time, name, phone, email, notes, source } = v.value;
  const id = crypto.randomUUID();
  const ref = id.slice(0, 6).toUpperCase();
  const { first, last } = splitName(name);
  const rec: ReservationRecord = {
    id, ref, party_size: partySize, reservation_time: toLaOffsetISO(date, time),
    first_name: first, last_name: last, email, phone, notes: notes ?? null, status: "pending", source,
    dateLabel: formatDateShort(date), timeLabel: formatSlot(time),
  };

  // 5. Deliver to every configured channel in parallel.
  const { configured, succeeded, failed } = await deliver(rec, process.env);

  // 7. Log (no PII).
  console.info(`[request-table] ref=${ref} configured=[${configured.join(",")}] succeeded=[${succeeded.join(",")}] failed=[${failed.join(",")}]`);

  // 6. Result.
  return succeeded.length > 0 ? { ok: true, id, ref } : { ok: false, reason: "failed" };
}
