import { NextResponse } from "next/server";
import { formatTime12 } from "@/lib/dates";
import {
  anyChannelConfigured, insertRow, laOffsetISO, notifyStaff, validateContact, validateTable, type BookingResult,
} from "@/lib/booking-server";

const reply = (body: BookingResult, status: number) => NextResponse.json(body, { status });

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return reply({ ok: false, reason: "invalid", message: "Something went wrong. Please try again." }, 400);
  }

  const table = validateTable(body);
  if (typeof table === "string") return reply({ ok: false, reason: "invalid", message: table }, 400);
  const contact = validateContact(body);
  if (typeof contact === "string") return reply({ ok: false, reason: "invalid", message: contact }, 400);

  if (!anyChannelConfigured()) return reply({ ok: false, reason: "not_configured" }, 503);

  const reservationTime = laOffsetISO(table.date, table.time);
  const saved = await insertRow("reservations", {
    party_size: table.partySize,
    reservation_time: reservationTime,
    first_name: contact.firstName,
    last_name: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    notes: contact.notes || null,
    status: "pending",
  });

  const notified = await notifyStaff(`Table request: ${contact.firstName} ${contact.lastName}, party of ${table.partySize}`, [
    ["When", `${table.date} at ${formatTime12(table.time)} (Pacific)`],
    ["Party", String(table.partySize)],
    ["Name", `${contact.firstName} ${contact.lastName}`.trim()],
    ["Phone", contact.phone],
    ["Email", contact.email],
    ["Notes", contact.notes],
  ]);

  return saved || notified ? reply({ ok: true }, 200) : reply({ ok: false, reason: "failed" }, 502);
}
