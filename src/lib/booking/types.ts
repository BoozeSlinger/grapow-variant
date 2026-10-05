/** Booking pipeline types (spec §9.7). One pipeline: requestTable — used by the sheet, /reservations and the host. */
export type BookingSource = "sheet" | "page" | "host";
export type BookingInput = {
  partySize: number; date: string; time: string; name: string; phone: string; email: string;
  notes?: string; company?: string /* honeypot */; source: BookingSource;
};
export type BookingField = "partySize" | "date" | "time" | "name" | "phone" | "email" | "notes";
export type FieldErrors = Partial<Record<BookingField, string>>;
export type RequestTableResult =
  | { ok: true; id?: string; ref?: string }
  | { ok: false; reason: "invalid"; fields: FieldErrors }
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "failed" };
