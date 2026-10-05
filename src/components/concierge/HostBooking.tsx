"use client";
/**
 * Booking inside the host stand (spec §13.6). Slot-filling, one question per turn — guests, day, time,
 * details — each answer echoed as a "You" slip with "Change"; then a review ticket and "Send request",
 * which goes through the SAME requestTable action as the booking sheet and /reservations. Honest states:
 * pending, ok (REQUESTED stamp), not_configured, failed (Try again keeps every field), invalid (inline).
 *
 * Choices are native radio groups (ChoiceGroup): a pointer pick, Enter or Space answers; arrow keys only
 * move the selection, and "Continue" always works for assistive tech.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { CallLink } from "@/components/ui/ActionButtons";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { TextField } from "@/components/ui/TextField";
import { Ticket } from "@/components/ui/Ticket";
import { BOOKING_RULES } from "@/data/hours";
import { BOOKING_COPY, bookingSummary } from "@/lib/booking/copy";
import type { FieldErrors } from "@/lib/booking/types";
import { NOTES_MAX, normalizePhone } from "@/lib/booking/validate";
import { getBookableDates, getBookableSlots, isBookable, nearestSlots } from "@/lib/hours";
import { addDaysISO, laParts } from "@/lib/la-time";
import type { OpenBookingDetail } from "@/lib/overlay";
import { EMPTY_DRAFT, checkDraft, submitHostBooking, type HostBookingDraft, type HostBookingOutcome } from "@/lib/concierge/booking";
import { requestedTime } from "@/lib/concierge/parse";
import { BOOKING_HOST } from "@/lib/concierge/replies";
import type { HostReply } from "@/lib/concierge/types";

type Step = "confirm" | "groups" | "party" | "day" | "time" | "details" | "review";
type Values = { party?: number; date?: string; time?: string; detailsDone: boolean };
const ORDER: Step[] = ["party", "day", "time", "details", "review"];
const QUESTION: Partial<Record<Step, string>> = {
  party: BOOKING_HOST.askParty, day: BOOKING_HOST.askDay, time: BOOKING_HOST.askTime, details: BOOKING_HOST.askDetails,
};
const PARTY_OPTIONS = [
  ...Array.from({ length: BOOKING_RULES.maxParty }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
  { value: "groups", label: `${BOOKING_RULES.maxParty + 1}+` },
];

const missing = (s: Step, v: Values) =>
  s === "party" ? !v.party : s === "day" ? !v.date : s === "time" ? !v.time : s === "details" ? !v.detailsDone : s === "review";

export function HostBooking({ prefill, requestText, now, active, onBack, onOutcome }: {
  prefill?: OpenBookingDetail; requestText?: string; now: number; active: boolean;
  onBack: () => void; onOutcome: (r: HostReply) => void;
}) {
  const tooMany = (prefill?.partySize ?? 0) > BOOKING_RULES.maxParty;
  const [party, setParty] = useState<number | undefined>(tooMany ? undefined : prefill?.partySize);
  const [date, setDate] = useState<string | undefined>(prefill?.date);
  const [time, setTime] = useState<string | undefined>(prefill?.time);
  const [asked] = useState(() => (requestText && prefill?.date && !prefill.time ? requestedTime(requestText, now) : undefined));
  const [step, setStep] = useState<Step>(tooMany ? "groups" : prefill?.partySize || prefill?.date || prefill?.time ? "confirm" : "party");
  const [detailsDone, setDetailsDone] = useState(false);
  const [draft, setDraft] = useState<HostBookingDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "pending" | "ok" | "not_configured" | "failed">("idle");
  const [outcome, setOutcome] = useState<HostBookingOutcome | null>(null);
  const [moreTimes, setMoreTimes] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const values: Values = { party, date, time, detailsDone };
  const goNext = (from: Step | null, v: Values) => {
    const start = from ? ORDER.indexOf(from) + 1 : 0;
    setStep(ORDER.slice(start).find((s) => missing(s, v)) ?? "review");
  };

  // Each new question takes focus (its first control), so keyboard and screen-reader users follow the turn.
  useEffect(() => {
    if (!active) return;
    const cur = rootRef.current?.querySelector<HTMLElement>("[data-current]");
    const target = cur?.querySelector<HTMLElement>("input:checked, input:not([tabindex='-1']), textarea, button") ?? cur;
    target?.focus({ preventScroll: false });
  }, [step, active]);

  useEffect(() => {
    if (status !== "idle" && status !== "pending") resultRef.current?.focus();
  }, [status]);

  const pickParty = (v: string) => {
    if (v === "groups") return setStep("groups");
    const n = Number(v);
    setParty(n);
    goNext("party", { ...values, party: n });
  };
  const pickDay = (iso: string) => {
    const keep = time && isBookable(iso, time, now) ? time : undefined;
    setDate(iso);
    setTime(keep);
    setPicking(false);
    setMoreTimes(false);
    goNext("day", { ...values, date: iso, time: keep });
  };
  const pickTime = (t: string) => {
    setTime(t);
    goNext("time", { ...values, time: t });
  };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = checkDraft({ ...draft, partySize: party, date, time }, now);
    const own: FieldErrors = { name: errs.name, phone: errs.phone, email: errs.email, notes: errs.notes };
    const firstBad = (["name", "phone", "email", "notes"] as const).find((k) => own[k]);
    setErrors(errs);
    if (firstBad) {
      document.getElementById(`host-${firstBad}`)?.focus();
      return;
    }
    if (errs.date) return setStep("day");
    if (errs.time) return setStep("time");
    setDetailsDone(true);
    goNext("details", { ...values, detailsDone: true });
  };

  const send = async () => {
    setStatus("pending");
    const out = await submitHostBooking({ ...draft, partySize: party, date, time }, Date.now());
    if (out.status === "invalid") {
      setErrors(out.fields);
      setStatus("idle");
      if (out.fields.date) setStep("day");
      else if (out.fields.time) setStep("time");
      else {
        setDetailsDone(false);
        setStep("details");
      }
      return;
    }
    setOutcome(out);
    setStatus(out.status);
    onOutcome(BOOKING_HOST.outcome(out.status, { partySize: party, date, time }));
  };

  const today = laParts(now).dateISO;
  const dates = getBookableDates(now).slice(0, 7).filter((d, i) => i > 0 || d.hasSlots);
  const slots = date ? getBookableSlots(date, now) : [];
  const unavailable = asked && date && !time && !isBookable(date, asked, now) ? asked : undefined;
  const shownSlots = moreTimes ? slots : unavailable ? nearestSlots(date as string, unavailable, now, 3) : slots.slice(0, 8);
  const locked = status !== "idle";

  /** Typing in a field clears that field's error (it re-checks on Review request). */
  const edit = (patch: Partial<HostBookingDraft>, field: keyof FieldErrors) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  };

  const echo = (s: Step): string =>
    s === "party" ? BOOKING_HOST.partyEcho(party ?? 0)
    : s === "day" ? BOOKING_HOST.dayEcho(date ?? today)
    : s === "time" ? BOOKING_HOST.timeEcho(time ?? "00:00")
    : "Name, mobile and email added";

  const reached = ORDER.indexOf(step);
  const statusLabel = status === "idle" ? "Draft" : status === "pending" ? "Sending…" : status === "ok" ? "Requested" : "Not sent";

  return (
    <div ref={rootRef} className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="quiet" size="sm" icon={ArrowLeft} onClick={onBack}>Back to chat</Button>
        <span className="t-label text-fg-muted">Table request</span>
      </div>

      <HostLine text={BOOKING_HOST.handoff} />

      {step === "confirm" ? (
        <div data-current className="flex flex-col gap-3">
          <HostLine text={BOOKING_HOST.confirm({ partySize: party, date, time })} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Button variant="secondary" size="sm" onClick={() => goNext(null, values)}>Yes, that&apos;s right</Button>
            <Button variant="quiet" size="sm" onClick={() => setStep("party")}>Change</Button>
          </div>
        </div>
      ) : null}

      {step === "groups" ? (
        <div data-current className="flex flex-col gap-3">
          <HostLine text={BOOKING_HOST.groups} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <CallLink label="full" variant="primary" size="sm" />
            <Button variant="quiet" size="sm" onClick={() => setStep("party")}>Change the party size</Button>
          </div>
        </div>
      ) : null}

      {reached >= 0 ? ORDER.slice(0, reached + 1).map((s) => {
        const current = s === step;
        if (s === "review") return null;
        if (!current) {
          return (
            <div key={s} className="flex flex-col gap-2">
              <HostLine text={QUESTION[s] as string} />
              <YouSlip text={echo(s)} onChange={locked && status !== "failed" ? undefined : () => { setStatus("idle"); setOutcome(null); setStep(s); }} what={QUESTION[s] as string} />
            </div>
          );
        }
        return (
          <div key={s} data-current className="flex flex-col gap-3">
            <HostLine text={QUESTION[s] as string} hidden={s !== "details"} />
            {s === "party" ? (
              <AutoChoice legend={BOOKING_HOST.askParty} name="host-party" columns={5}
                value={party ? String(party) : null} options={PARTY_OPTIONS} onPick={pickParty} />
            ) : null}
            {s === "day" ? (
              <>
                <AutoChoice legend={BOOKING_HOST.askDay} name="host-day" error={errors.date}
                  value={picking ? "pick" : date ?? null}
                  options={[...dates.map((d) => ({ value: d.dateISO, label: d.label })), { value: "pick", label: "Pick a date" }]}
                  onPick={(v) => (v === "pick" ? setPicking(true) : pickDay(v))} onSelect={(v) => setPicking(v === "pick")} />
                {picking ? (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-0">
                      <label htmlFor="host-date" className="mb-2 block t-label">Pick a date</label>
                      <input id="host-date" type="date" min={today} max={addDaysISO(today, BOOKING_RULES.windowDays - 1)}
                        defaultValue={date ?? ""} aria-describedby={pickError ? "host-date-error" : undefined} aria-invalid={pickError ? true : undefined}
                        className="h-12 rounded-sm bg-bg-raised px-3 text-[1.0625rem] shadow-[inset_0_0_0_1.5px_var(--line)]"
                        onChange={(e) => {
                          const v = e.target.value;
                          if (!v) return;
                          if (getBookableSlots(v, now).length === 0) setPickError(BOOKING_HOST.noSlots);
                          else {
                            setPickError(null);
                            pickDay(v);
                          }
                        }} />
                    </div>
                    {pickError ? <p id="host-date-error" className="t-small text-flag">{pickError}</p> : null}
                  </div>
                ) : null}
              </>
            ) : null}
            {s === "time" ? (
              slots.length === 0 ? (
                <div className="flex flex-col gap-2">
                  <HostLine text={BOOKING_HOST.noSlots} />
                  <Button variant="secondary" size="sm" onClick={() => setStep("day")}>Pick another day</Button>
                </div>
              ) : (
                <>
                  {unavailable && !moreTimes ? <HostLine text={BOOKING_HOST.unavailable(unavailable)} /> : null}
                  <AutoChoice legend={BOOKING_HOST.askTime} name="host-time" error={errors.time} size="sm"
                    value={time ?? null} options={shownSlots.map((sl) => ({ value: sl.time, label: sl.label }))} onPick={pickTime} />
                  {!moreTimes && shownSlots.length < slots.length ? (
                    <Button variant="quiet" size="sm" onClick={() => setMoreTimes(true)}>More times</Button>
                  ) : null}
                </>
              )
            ) : null}
            {s === "details" ? (
              <form noValidate onSubmit={submitDetails} className="flex flex-col gap-4" aria-label="Your details">
                <TextField id="host-name" name="name" label="Name" required autoComplete="name" value={draft.name}
                  onChange={(v) => edit({ name: v }, "name")} error={errors.name} />
                <TextField id="host-phone" name="phone" label="Mobile" type="tel" inputMode="tel" autoComplete="tel" required
                  hint="We'll call or text to confirm" value={draft.phone} onChange={(v) => edit({ phone: v }, "phone")} error={errors.phone} />
                <TextField id="host-email" name="email" label="Email" type="email" inputMode="email" autoComplete="email" required
                  value={draft.email} onChange={(v) => edit({ email: v }, "email")} error={errors.email} />
                <TextField id="host-notes" name="notes" label="Notes" multiline rows={2} maxLength={NOTES_MAX}
                  value={draft.notes} onChange={(v) => edit({ notes: v }, "notes")} error={errors.notes} />
                <div className="hp-field" aria-hidden="true">
                  <label htmlFor="host-company">Company</label>
                  <input id="host-company" name="company" tabIndex={-1} autoComplete="off" value={draft.company}
                    onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))} />
                </div>
                <div>
                  <Button type="submit" variant="secondary" size="md" arrow>Review request</Button>
                </div>
              </form>
            ) : null}
          </div>
        );
      }) : null}

      {step === "review" ? (
        <div data-current className="flex flex-col gap-4">
          {status === "idle" ? <HostLine text={BOOKING_HOST.review} /> : null}
          <Ticket paper="card" labelledBy="host-ticket-title"
            head={<><span id="host-ticket-title" className="t-label">Table request</span><span className="t-label tnum text-fg-muted">{statusLabel}</span></>}
            stub={
              status === "idle" || status === "pending" ? (
                <>
                  <Button variant="primary" size="md" aria-disabled={status === "pending" || undefined} aria-busy={status === "pending" || undefined} onClick={send}>
                    {status === "pending" ? "Sending…" : "Send request"}
                  </Button>
                  {status === "idle" ? <Button variant="quiet" size="sm" onClick={() => { setDetailsDone(false); setStep("details"); }}>Change</Button> : null}
                </>
              ) : status === "ok" ? (
                <Button variant="secondary" size="md" onClick={onBack}>Done</Button>
              ) : (
                <>
                  <CallLink label="full" variant="primary" size="md" />
                  {status === "failed" ? (
                    <Button variant="secondary" size="md" onClick={() => { setStatus("idle"); setOutcome(null); }}>Try again</Button>
                  ) : (
                    <Button variant="quiet" size="sm" onClick={onBack}>Back to chat</Button>
                  )}
                </>
              )
            }>
            <div className="relative py-1" aria-busy={status === "pending" || undefined}>
              <p className="t-d3 tnum text-balance">{bookingSummary({ partySize: party, date, time })}</p>
              <p className="mt-2 t-small text-fg-muted break-words">{[draft.name.trim(), normalizePhone(draft.phone) ?? draft.phone].filter(Boolean).join(" · ")}</p>
              {status === "ok" ? (
                <span aria-hidden="true" className="stamp-in absolute -top-1 right-0 rotate-[-6deg] rounded-sm px-2 py-1 t-d3 text-flag shadow-[inset_0_0_0_3px_var(--color-chili-deep)]">
                  Requested
                </span>
              ) : null}
            </div>
          </Ticket>
          <div role="status" aria-live="polite" className="t-body leading-7">
            {status === "pending" ? BOOKING_COPY.pending : null}
            {status === "ok" && outcome ? (
              <div ref={resultRef} tabIndex={-1} className="flex flex-col gap-1 outline-none">
                <p className="text-pretty">{outcome.message}</p>
                {outcome.ref ? <p className="t-small tnum text-fg-muted">Ref {outcome.ref}</p> : null}
              </div>
            ) : null}
          </div>
          {status === "not_configured" || status === "failed" ? (
            <div ref={resultRef} tabIndex={-1} role="alert" className="rounded-sm bg-bg px-3 py-2 t-body leading-7 text-pretty shadow-[inset_0_0_0_1.5px_var(--flag)] outline-none">
              {outcome?.message}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function HostLine({ text, hidden }: { text: string; hidden?: boolean }) {
  return (
    <div className="flex flex-col gap-1" aria-hidden={hidden || undefined}>
      <span aria-hidden="true" className="t-label text-fg-muted">Host</span>
      <p className="t-body leading-7 text-pretty">
        <span className="sr-only">Host: </span>
        {text}
      </p>
    </div>
  );
}

function YouSlip({ text, onChange, what }: { text: string; onChange?: () => void; what: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-end gap-x-3 pl-10 text-right">
      <p className="font-semibold underline decoration-chili-deep decoration-2 underline-offset-[5px]">
        <span className="sr-only">You: </span>
        {text}
      </p>
      {onChange ? (
        <Button variant="quiet" size="sm" onClick={onChange}>
          Change<span className="sr-only"> — {what}</span>
        </Button>
      ) : null}
    </div>
  );
}

/**
 * ChoiceGroup that answers on a pointer pick, Enter or Space; arrow keys only move the selection
 * (they fire synthetic clicks with detail 0). "Continue" answers with the current selection.
 */
function AutoChoice({ onPick, onSelect, value, ...p }: {
  legend: string; name: string; value: string | null; options: Array<{ value: string; label: string }>;
  onPick: (v: string) => void; onSelect?: (v: string) => void; columns?: number; size?: "sm" | "md"; error?: string;
}) {
  const [sel, setSel] = useState<string | null>(value);
  return (
    <div
      className="flex flex-col gap-3"
      onClickCapture={(e) => {
        const t = e.target as HTMLInputElement;
        if (t.type === "radio" && e.detail > 0) onPick(t.value);
      }}
      onKeyDown={(e) => {
        const t = e.target as HTMLInputElement;
        if (t.type === "radio" && e.key === "Enter") {
          e.preventDefault();
          onPick(t.value);
        }
      }}
      onKeyUp={(e) => {
        const t = e.target as HTMLInputElement;
        if (t.type === "radio" && e.key === " ") onPick(t.value);
      }}
    >
      <ChoiceGroup legend={p.legend} legendHidden name={p.name} value={sel} columns={p.columns} size={p.size} error={p.error}
        options={p.options} onChange={(v) => { setSel(v); onSelect?.(v); }} />
      {sel && sel !== value ? (
        <div>
          <Button variant="secondary" size="sm" onClick={() => onPick(sel)}>Continue</Button>
        </div>
      ) : null}
    </div>
  );
}
