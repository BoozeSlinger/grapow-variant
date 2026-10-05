/**
 * The host's table request (spec §13.6): the SAME requestTable server action as the booking sheet and
 * /reservations, with honest outcomes. Pure apart from that one call, so the state machine is testable
 * with requestTable mocked. The draft (with the guest's contact fields) lives only in component state:
 * it is never written to the transcript or to storage.
 */
import { requestTable } from "@/app/actions/request-table";
import { BOOKING_COPY } from "@/lib/booking/copy";
import type { BookingInput, FieldErrors, RequestTableResult } from "@/lib/booking/types";
import { validateBookingInput } from "@/lib/booking/validate";

export type HostBookingDraft = {
  partySize?: number; date?: string; time?: string;
  name: string; phone: string; email: string; notes: string; company: string;
};
export type HostBookingStatus = "idle" | "pending" | "ok" | "not_configured" | "failed" | "invalid";
export type HostBookingOutcome = {
  status: Exclude<HostBookingStatus, "idle" | "pending">;
  /** role=status (ok) or role=alert (not sent) copy; empty for invalid. */
  message: string;
  fields: FieldErrors;
  ref?: string;
  /** Always the draft that was sent: "Try again" keeps every field. */
  draft: HostBookingDraft;
};

export const EMPTY_DRAFT: HostBookingDraft = { name: "", phone: "", email: "", notes: "", company: "" };

function toInput(d: HostBookingDraft): Record<string, unknown> {
  return {
    partySize: d.partySize, date: d.date, time: d.time, name: d.name, phone: d.phone, email: d.email,
    notes: d.notes, company: d.company, source: "host",
  };
}

/** Inline errors for the details form (same rules as the server). */
export function checkDraft(d: HostBookingDraft, now: number): FieldErrors {
  const v = validateBookingInput(toInput(d), now);
  return v.ok ? {} : v.fields;
}

/** Validate, then send through requestTable({ …, source: "host" }). Success only on { ok: true }. */
export async function submitHostBooking(
  draft: HostBookingDraft, now: number,
  send: (input: BookingInput) => Promise<RequestTableResult> = requestTable,
): Promise<HostBookingOutcome> {
  const v = validateBookingInput(toInput(draft), now);
  if (!v.ok) return { status: "invalid", message: "", fields: v.fields, draft };
  const input: BookingInput = { ...v.value, ...(draft.company ? { company: draft.company } : {}), source: "host" };
  let r: RequestTableResult;
  try {
    r = await send(input);
  } catch {
    r = { ok: false, reason: "failed" };
  }
  if (r.ok === true) {
    return {
      status: "ok", fields: {}, draft, ...(r.ref ? { ref: r.ref } : {}),
      message: BOOKING_COPY.success({ phone: input.phone, partySize: input.partySize, date: input.date, time: input.time }),
    };
  }
  if (r.reason === "invalid") return { status: "invalid", message: "", fields: r.fields, draft };
  if (r.reason === "not_configured") return { status: "not_configured", message: BOOKING_COPY.notConfigured, fields: {}, draft };
  return { status: "failed", message: BOOKING_COPY.failed, fields: {}, draft };
}
