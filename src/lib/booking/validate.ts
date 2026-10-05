/**
 * Pure booking validation (spec §9.7) — used by every form for inline errors AND by the server action.
 * Date and time are checked with isBookable(date, time, now) in LA time.
 */
import { BOOKING_RULES } from "@/data/hours";
import { VENUE } from "@/data/venue";
import { getBookableSlots, isBookable } from "@/lib/hours";
import type { BookingInput, BookingSource, FieldErrors } from "./types";

export const NOTES_MAX = 500;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCES: BookingSource[] = ["sheet", "page", "host"];

export const BOOKING_MESSAGES = {
  partySize: "Choose how many guests.",
  partySizeGroups: `For 9 or more, please call ${VENUE.phone.display}.`, // OWNER-CONFIRM(C-13): max party 8; 9+ call
  date: "Choose a date.",
  dateUnavailable: "That date isn't available.",
  time: "Choose a time.",
  timeUnavailable: "That time isn't available — pick another.",
  name: "Enter your name.",
  phone: "Enter a 10-digit mobile number.",
  email: "Enter a valid email.", // OWNER-CONFIRM(C-13): email is required (the DB column is NOT NULL)
  notes: `Notes can be up to ${NOTES_MAX} characters.`,
} as const;

/** 10 digits, or 11 starting with 1 → "(951) 780-1132"; anything else → null. */
export function normalizePhone(raw: string): string | null {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  if (d.length !== 10) return null;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Trim; split on the first whitespace run; `last` may be "". */
export function splitName(full: string): { first: string; last: string } {
  const t = String(full ?? "").trim();
  const m = t.match(/^(\S+)\s+([\s\S]+)$/);
  return m ? { first: m[1], last: m[2].trim().replace(/\s+/g, " ") } : { first: t, last: "" };
}

function str(v: unknown): string {
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
}

function isRealDate(dateISO: string): boolean {
  if (!DATE_RE.test(dateISO)) return false;
  const [y, m, d] = dateISO.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

export function validateBookingInput(raw: unknown, now: Date | number):
  { ok: true; value: BookingInput } | { ok: false; fields: FieldErrors } {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const fields: FieldErrors = {};

  const partyRaw = r.partySize;
  const partySize = typeof partyRaw === "number" ? partyRaw : Number(str(partyRaw).trim() || NaN);
  if (!Number.isInteger(partySize) || partySize < BOOKING_RULES.minParty) fields.partySize = BOOKING_MESSAGES.partySize;
  else if (partySize > BOOKING_RULES.maxParty) fields.partySize = BOOKING_MESSAGES.partySizeGroups;

  const date = str(r.date).trim();
  const time = str(r.time).trim();
  let dateOk = false;
  if (!date) fields.date = BOOKING_MESSAGES.date;
  else if (!isRealDate(date) || getBookableSlots(date, now).length === 0) fields.date = BOOKING_MESSAGES.dateUnavailable;
  else dateOk = true;
  if (!time) fields.time = BOOKING_MESSAGES.time;
  else if (!TIME_RE.test(time) || (dateOk && !isBookable(date, time, now))) fields.time = BOOKING_MESSAGES.timeUnavailable;

  const name = str(r.name).trim().replace(/\s+/g, " ");
  if (!name) fields.name = BOOKING_MESSAGES.name;

  const phone = normalizePhone(str(r.phone));
  if (!phone) fields.phone = BOOKING_MESSAGES.phone;

  const email = str(r.email).trim();
  if (!EMAIL_RE.test(email) || email.length > 254) fields.email = BOOKING_MESSAGES.email;

  const notes = str(r.notes).trim();
  if (notes.length > NOTES_MAX) fields.notes = BOOKING_MESSAGES.notes;

  if (Object.keys(fields).length) return { ok: false, fields };

  const source = SOURCES.includes(r.source as BookingSource) ? (r.source as BookingSource) : "page";
  const company = str(r.company);
  return {
    ok: true,
    value: {
      partySize, date, time, name, phone: phone as string, email,
      ...(notes ? { notes } : {}),
      ...(company ? { company } : {}),
      source,
    },
  };
}
