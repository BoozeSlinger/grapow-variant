// Browser-side submit for the booking forms. Success only on a verified { ok: true } from the server.
export const RESTAURANT_PHONE = { display: '(951) 780-1132', href: 'tel:+19517801132' };

/** Returns null on success, or a message to show the guest. */
export async function postBooking(url: '/api/reservations' | '/api/inquiry', payload: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.ok) return null;
    if (data?.reason === 'invalid' && data.message) return data.message;
    if (data?.reason === 'not_configured') return `Online booking isn't available right now. Please call us at ${RESTAURANT_PHONE.display}.`;
  } catch {
    // network error: fall through
  }
  return `We couldn't send your request. Please try again, or call us at ${RESTAURANT_PHONE.display}.`;
}
