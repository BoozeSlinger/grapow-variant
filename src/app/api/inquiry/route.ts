import { NextResponse } from 'next/server';
import { anyChannelConfigured, insertRow, notifyStaff, validateContact, type BookingResult } from '@/lib/booking-server';

const TYPES = new Set(['event_interest', 'general_inquiry']);
const reply = (body: BookingResult, status: number) => NextResponse.json(body, { status });

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return reply({ ok: false, reason: 'invalid', message: 'Something went wrong. Please try again.' }, 400);
  }

  const contact = validateContact(body);
  if (typeof contact === 'string') return reply({ ok: false, reason: 'invalid', message: contact }, 400);
  const type = typeof body.type === 'string' && TYPES.has(body.type) ? body.type : 'general_inquiry';

  if (!anyChannelConfigured()) return reply({ ok: false, reason: 'not_configured' }, 503);

  const saved = await insertRow('inquiries', {
    first_name: contact.firstName,
    last_name: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    message: contact.notes || null,
    type,
    status: 'new',
  });

  const notified = await notifyStaff(`Event inquiry: ${contact.firstName} ${contact.lastName}`, [
    ['Name', `${contact.firstName} ${contact.lastName}`.trim()],
    ['Phone', contact.phone],
    ['Email', contact.email],
    ['Message', contact.notes],
  ]);

  return saved || notified ? reply({ ok: true }, 200) : reply({ ok: false, reason: 'failed' }, 502);
}
