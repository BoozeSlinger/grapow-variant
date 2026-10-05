"use client";
/**
 * The table-request form (spec §12.8, CONTRACT). One component, two variants:
 * - "page": every group on one screen (/reservations), then review and Send. Below 1024 its action lives in
 *   the fixed ReservationsBar; it also follows useOverlay().bookingPrefill whenever the nonce changes.
 * - "sheet": three steps ("Step n of 3": When · Your details · Review & send) with the step's primary action
 *   portalled into the Sheet's sticky footer (BookingSheet provides the slot).
 * Both submit through the ONE server action, requestTable, and only {ok:true} ever shows success.
 */
import { useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { requestTable } from "@/app/actions/request-table";
import { CallLink } from "@/components/ui/ActionButtons";
import Button from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { Slate } from "@/components/ui/Slate";
import { TextField } from "@/components/ui/TextField";
import { BOOKING_RULES, SCHEDULE } from "@/data/hours";
import { VENUE } from "@/data/venue";
import { BOOKING_COPY, bookingSummary } from "@/lib/booking/copy";
import type { BookingField, BookingInput, FieldErrors, RequestTableResult } from "@/lib/booking/types";
import { NOTES_MAX, normalizePhone, validateBookingInput } from "@/lib/booking/validate";
import { useNow } from "@/lib/clock";
import { getBookableDates, getBookableSlots, isBookable, nearestSlots, type Slot } from "@/lib/hours";
import { formatClock, formatDateShort, formatSlot, weekdayOfISO } from "@/lib/la-time";
import { useOverlay, type OpenBookingDetail } from "@/lib/overlay";
import { NoBreakPhones } from "./NoBreakPhones";
import { ReservationsBar } from "./ReservationsBar";
import { SheetFooterSlot } from "./sheet-footer";
import { TicketPreview, type TicketStatus } from "./TicketPreview";

type Props = {
  variant: "page" | "sheet";
  prefill?: OpenBookingDetail;
  onDone?: (r: RequestTableResult) => void;
  titleId?: string;
  /** Defaults to the requestTable server action; injectable for tests only. */
  submit?: (input: BookingInput) => Promise<RequestTableResult>;
};

type Values = { party: string | null; date: string | null; time: string | null; name: string; phone: string; email: string; notes: string; company: string };
type Outcome = { kind: "ok"; result: RequestTableResult; input: BookingInput } | { kind: "not_configured" } | { kind: "failed" };
type Miss = { time: string; options: Slot[] };
type Step = 1 | 2 | 3;

export const BOOKING_FORM_DOM_ID = "booking-form";
const GROUPS = `${BOOKING_RULES.maxParty + 1}+`; // "9+": groups and events call (C-13)
const PARTY_OPTIONS = [
  ...Array.from({ length: BOOKING_RULES.maxParty - BOOKING_RULES.minParty + 1 }, (_, i) => String(BOOKING_RULES.minParty + i)),
  GROUPS,
].map((v) => ({ value: v, label: v }));
const DATE_CHIPS = 14;
const EMPTY: Values = { party: null, date: null, time: null, name: "", phone: "", email: "", notes: "", company: "" };
const STEPS: Record<Step, { title: string; fields: BookingField[] }> = {
  1: { title: "When", fields: ["partySize", "date", "time"] },
  2: { title: "Your details", fields: ["name", "phone", "email", "notes"] },
  3: { title: "Review & send", fields: [] },
};
const FIELD_ORDER: BookingField[] = ["partySize", "date", "time", "name", "phone", "email", "notes"];
const REQUIRED: BookingField[] = ["partySize", "date", "time", "name", "phone", "email"];
const SLOT_GROUPS: Slot["group"][] = ["lunch", "afternoon", "dinner"];
const VALUE_KEY: Record<BookingField, keyof Values> = {
  partySize: "party", date: "date", time: "time", name: "name", phone: "phone", email: "email", notes: "notes",
};

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const pick = (e: FieldErrors, keys: BookingField[]): FieldErrors =>
  Object.fromEntries(keys.filter((k) => e[k]).map((k) => [k, e[k]])) as FieldErrors;
const firstStep = (e: FieldErrors): Step => ((([1, 2] as Step[]).find((s) => STEPS[s].fields.some((f) => e[f])) ?? 3) as Step);

/** Prefill is applied only where valid; an unbookable time keeps the date and offers the nearest slots. */
function fromPrefill(p: OpenBookingDetail | null | undefined, now: number): { patch: Partial<Values>; miss: Miss | null } {
  const patch: Partial<Values> = {};
  let miss: Miss | null = null;
  if (!p) return { patch, miss };
  if (p.partySize && Number.isInteger(p.partySize) && p.partySize >= BOOKING_RULES.minParty) {
    patch.party = p.partySize > BOOKING_RULES.maxParty ? GROUPS : String(p.partySize);
  }
  if (p.date && getBookableSlots(p.date, now).length > 0) {
    patch.date = p.date;
    if (p.time && isBookable(p.date, p.time, now)) patch.time = p.time;
    else if (p.time && /^\d{2}:\d{2}$/.test(p.time)) {
      const options = nearestSlots(p.date, p.time, now);
      if (options.length) miss = { time: p.time, options };
    }
  }
  return { patch, miss };
}

function lunchLegend(dateISO: string): string {
  const lunch = SCHEDULE.lunch[weekdayOfISO(dateISO)][0];
  return lunch ? `Lunch · until ${formatClock(lunch.close)}` : "Lunch";
}
const GROUP_LEGEND: Record<Slot["group"], (dateISO: string) => string> = {
  lunch: lunchLegend,
  afternoon: () => "Afternoon",
  dinner: () => "Dinner",
};

/** Error-summary links, the bar's "Next" and the page prefill land on the field itself (radios: the checked or first option). */
function focusFieldEl(prefix: string, f: BookingField) {
  const el = document.getElementById(`${prefix}-${f}`);
  if (!el) return;
  const target = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
    ? el
    : el.querySelector<HTMLInputElement>("input:checked:not(:disabled)") ?? el.querySelector<HTMLInputElement>("input:not(:disabled)");
  target?.focus();
}

export default function BookingForm({ variant, prefill, onDone, titleId, submit = requestTable }: Props) {
  const now = useNow();
  const sheet = variant === "sheet";
  const p = `bf-${variant}`;

  const [init] = useState(() => fromPrefill(prefill, now));
  const [values, setValues] = useState<Values>(() => ({ ...EMPTY, ...init.patch }));
  const [miss, setMiss] = useState<Miss | null>(init.miss);
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [pending, startTransition] = useTransition();

  // /reservations: apply useOverlay().bookingPrefill whenever its nonce changes (never a stale one at mount).
  const storePrefill = useOverlay((s) => (sheet ? null : s.bookingPrefill));
  const [seenPrefill, setSeenPrefill] = useState(storePrefill);
  if (storePrefill !== seenPrefill) {
    setSeenPrefill(storePrefill);
    if (storePrefill && outcome?.kind !== "ok") {
      const { patch, miss: m } = fromPrefill(storePrefill, now);
      setValues((v) => withValidTime({ ...v, ...patch }, now));
      setMiss(m);
      setOutcome(null);
    }
  }

  const footerSlot = useContext(SheetFooterSlot);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLHeadingElement>(null);
  const textRefs = useRef<Array<HTMLInputElement | HTMLTextAreaElement | null>>([]);
  const focusNext = useRef<null | "summary" | "result" | "step" | "top">(null);

  // A header / nav / hero "Request a table" on this page lands focus on the form's first control. The closing nav
  // sheet returns focus to its own trigger a moment later, so claim it again once that has settled.
  const mountedPrefill = useRef(storePrefill);
  useEffect(() => {
    if (storePrefill === mountedPrefill.current) return;
    const id = window.setTimeout(() => {
      if (!formRef.current?.contains(document.activeElement)) focusFieldEl(p, "partySize");
    }, 60);
    return () => window.clearTimeout(id);
  }, [storePrefill, p]);

  const dates = useMemo(() => getBookableDates(now), [now]);
  const chips = dates.slice(0, DATE_CHIPS);
  const slots = useMemo(() => (values.date ? getBookableSlots(values.date, now) : []), [values.date, now]);

  const groups = values.party === GROUPS;
  const ok = outcome?.kind === "ok";
  const locked = pending || ok;
  const partySize = values.party && !groups ? Number(values.party) : undefined;
  const summary = bookingSummary({ partySize, date: values.date ?? undefined, time: values.time ?? undefined });
  const status: TicketStatus = pending ? "sending" : ok ? "requested" : outcome ? "not-sent" : "draft";

  // Move focus after the render that shows the target (error summary, result, step heading, ticket).
  // Results bring the ticket back into view first, so the stamp / NOT SENT is seen with the message.
  useEffect(() => {
    const target = focusNext.current;
    if (!target) return;
    focusNext.current = null;
    if (target === "summary") {
      summaryRef.current?.focus();
      return;
    }
    const el = target === "step" ? stepRef.current : target === "result" ? resultRef.current : formRef.current;
    const sheetBody = formRef.current?.closest(".sheet-body");
    if (sheetBody) sheetBody.scrollTo({ top: 0 });
    else formRef.current?.scrollIntoView?.({ block: "start" }); // CSS scroll-behavior follows reduced motion
    el?.focus({ preventScroll: true });
  });

  // Pending and sent requests are read-only (TextField has no readOnly prop; set it on the DOM nodes).
  useEffect(() => {
    for (const el of textRefs.current) if (el) el.readOnly = locked;
  }, [locked, step]);

  function update(patch: Partial<Values>) {
    if (locked) return;
    setValues((v) => withValidTime({ ...v, ...patch }, now));
    if (outcome) setOutcome(null);
    if ("date" in patch || "time" in patch) setMiss(null);
    const touched = FIELD_ORDER.filter((f) => VALUE_KEY[f] in patch);
    if (touched.some((f) => errors[f])) {
      setErrors((e) => {
        const n = { ...e };
        for (const f of touched) delete n[f];
        return n;
      });
    }
  }

  function raw() {
    return {
      partySize: groups ? BOOKING_RULES.maxParty + 1 : partySize,
      date: values.date ?? "", time: values.time ?? "",
      name: values.name, phone: values.phone, email: values.email, notes: values.notes,
      company: values.company, source: sheet ? "sheet" : "page",
    };
  }

  function showErrors(fields: FieldErrors) {
    if (sheet) {
      const s = firstStep(fields);
      setStep(s);
      fields = pick(fields, STEPS[s].fields);
    }
    setErrors(fields);
    setSummaryOpen(true);
    focusNext.current = "summary";
  }

  function goStep(s: Step) {
    setStep(s);
    setErrors({});
    setSummaryOpen(false);
    if (outcome && !ok) setOutcome(null);
    focusNext.current = "step";
  }

  function send(input: BookingInput) {
    setErrors({});
    setSummaryOpen(false);
    setOutcome(null);
    setMiss(null);
    startTransition(async () => {
      let r: RequestTableResult;
      try {
        r = await submit(input);
      } catch {
        r = { ok: false, reason: "failed" };
      }
      startTransition(() => {
        if (r.ok) setOutcome({ kind: "ok", result: r, input });
        else if (r.reason === "invalid") return showErrors(r.fields);
        else setOutcome({ kind: r.reason });
        focusNext.current = "result";
      });
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked || groups) return;
    const v = validateBookingInput(raw(), now);
    const fields = v.ok ? {} : v.fields;
    if (sheet && step < 3) {
      const mine = pick(fields, STEPS[step].fields);
      if (Object.keys(mine).length) return showErrors(mine);
      return goStep((step + 1) as Step);
    }
    if (!v.ok) return showErrors(fields);
    send(v.value);
  }

  function done() {
    if (outcome?.kind === "ok") onDone?.(outcome.result);
    if (!sheet) {
      setValues(EMPTY);
      setOutcome(null);
      setMiss(null);
      focusNext.current = "top";
    }
  }

  const focusField = (f: BookingField) => focusFieldEl(p, f);

  const missing = REQUIRED.find((f) => (f === "partySize" ? !values.party : !values[VALUE_KEY[f]]));
  const errorList = FIELD_ORDER.filter((f) => errors[f]);

  /* ── Actions: one primary per state (chili budget) ── */
  const call = (label: "full" | "short" = "full") => <CallLink key="call" label={label} variant="primary" size="md" />;
  const sendLabel = pending ? "Sending…" : sheet && step === 1 ? "Next: your details" : sheet && step === 2 ? "Next: review" : "Send request";
  const sendButton = (full?: boolean) => (
    <Button
      key="send"
      type="submit"
      form={BOOKING_FORM_DOM_ID}
      size="md"
      full={full}
      aria-busy={pending || undefined}
      arrow={!pending && sheet && step < 3}
    >
      {sendLabel}
    </Button>
  );
  const doneButton = (full?: boolean) => (
    <Button key="done" size="md" full={full} onClick={done}>Done</Button>
  );
  const tryAgain = (
    <Button key="retry" type="submit" form={BOOKING_FORM_DOM_ID} variant="secondary" size="md">Try again</Button>
  );

  function actions(where: "footer" | "inline" | "bar"): React.ReactNode[] {
    if (groups) return [call(where === "bar" ? "short" : "full")];
    if (ok) return [doneButton(where === "footer")];
    if (outcome?.kind === "failed") return [tryAgain, call("short")];
    if (outcome?.kind === "not_configured") return [call(where === "bar" ? "short" : "full")];
    if (where === "bar" && missing && !pending) {
      return [<Button key="send" size="md" arrow onClick={() => focusField(missing)}>Next</Button>];
    }
    return [sendButton(where === "footer" && !(sheet && step > 1))];
  }

  const back = sheet && step > 1 && !ok ? (
    <Button key="back" variant="secondary" size="md" icon={ArrowLeft} aria-disabled={pending || undefined} onClick={() => goStep((step - 1) as Step)}>
      Back
    </Button>
  ) : null;

  const footer = sheet ? (
    <div className="flex items-center gap-3 [&>*:last-child]:flex-1">
      {back}
      {actions("footer")}
    </div>
  ) : null;

  /* ── Groups ── */
  const party = (
    <div id={`${p}-partySize`}>
      <ChoiceGroup
        legend="Guests"
        name={`${p}-party`}
        value={values.party}
        onChange={(v) => update({ party: v })}
        options={PARTY_OPTIONS}
        error={errors.partySize}
        className="[&>div]:grid [&>div]:grid-cols-5 @min-[36rem]:[&>div]:grid-cols-9 [&_.choice]:px-2"
      />
    </div>
  );

  const groupsNote = (
    <div className="rounded-sm bg-bg-raised p-5 shadow-[inset_3px_0_0_var(--accent)]">
      <p className="t-body text-pretty"><NoBreakPhones text={BOOKING_COPY.groups} /></p>
      {!sheet ? <div className="mt-4 hidden lg:block short:block">{call("full")}</div> : null}
    </div>
  );

  const lastDate = dates[dates.length - 1]?.dateISO;
  const date = (
    <div id={`${p}-date`}>
      <ChoiceGroup
        legend="Date"
        name={`${p}-date`}
        value={values.date}
        onChange={(v) => update({ date: v })}
        options={chips.map((d) => ({
          value: d.dateISO,
          label: d.label,
          sub: d.tags.join(" · ") || undefined,
          disabled: !d.hasSlots,
          reason: d.hasSlots ? undefined : "No times left today",
        }))}
        error={errors.date}
        size="sm"
        className="[&>div]:grid [&>div]:grid-cols-3 @min-[25rem]:[&>div]:grid-cols-4 @min-[38rem]:[&>div]:grid-cols-7 [&_.choice]:px-1.5"
      />
      <div className="mt-4 max-w-72">
        <label htmlFor={`${p}-date-other`} className="mb-2 block t-label">Another date</label>
        <input
          id={`${p}-date-other`}
          ref={(el) => { textRefs.current[4] = el; }}
          type="date"
          min={dates[0]?.dateISO}
          max={lastDate}
          value={values.date ?? ""}
          onChange={(e) => update({ date: e.target.value || null })}
          aria-describedby={`${p}-date-other-hint`}
          className="block h-12 w-full rounded-sm bg-bg-raised px-3.5 text-[1.0625rem] leading-snug text-fg shadow-[inset_0_0_0_1.5px_var(--line)]"
        />
        {lastDate ? <p id={`${p}-date-other-hint`} className="mt-2 t-small text-fg-muted">Up to {formatDateShort(lastDate)}</p> : null}
      </div>
    </div>
  );

  const byGroup = SLOT_GROUPS.map((g) => ({ g, slots: slots.filter((s) => s.group === g) })).filter((x) => x.slots.length);
  const time = (
    <fieldset
      id={`${p}-time`}
      className="min-w-0 border-0 p-0"
      aria-describedby={errors.time ? `${p}-time-error` : undefined}
      aria-invalid={errors.time ? true : undefined}
    >
      <legend className="mb-3 t-label">Time</legend>
      {miss ? (
        <div className="mb-5 rounded-sm bg-bg-raised p-4 shadow-[inset_3px_0_0_var(--accent)]">
          <p className="t-small">{formatSlot(miss.time)} isn&apos;t available — here are the closest times.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {miss.options.map((s) => (
              <Button key={s.time} variant="secondary" size="sm" className="tnum" onClick={() => update({ time: s.time })}>
                {s.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
      {!values.date ? (
        <p className="t-small text-fg-muted">Choose a date to see the times.</p>
      ) : byGroup.length === 0 ? (
        <p className="t-small">No times left on this date — pick another day, or call <NoBreakPhones text={VENUE.phone.display} />.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {byGroup.map(({ g, slots: list }) => (
            <ChoiceGroup
              key={g}
              legend={GROUP_LEGEND[g](values.date as string)}
              name={`${p}-time`}
              value={values.time}
              onChange={(v) => update({ time: v })}
              options={list.map((s) => ({ value: s.time, label: s.label }))}
              size="sm"
              className="[&>legend]:mb-2 [&>legend]:text-fg-muted [&>div]:grid [&>div]:grid-cols-3 @min-[25rem]:[&>div]:grid-cols-4 @min-[38rem]:[&>div]:grid-cols-6 [&_.choice]:px-1.5"
            />
          ))}
        </div>
      )}
      {errors.time ? (
        <p id={`${p}-time-error`} className="mt-3 inline-flex items-center gap-1.5 t-small text-flag">
          <AlertCircle size={16} strokeWidth={2} aria-hidden="true" />
          {errors.time}
        </p>
      ) : null}
    </fieldset>
  );

  const details = (
    <div className="grid gap-x-4 gap-y-5 @min-[34rem]:grid-cols-2">
      <TextField
        id={`${p}-name`} name="name" label="Name" required autoComplete="name"
        value={values.name} onChange={(v) => update({ name: v })} error={errors.name}
        inputRef={(el: HTMLInputElement | null) => { textRefs.current[0] = el; }}
        className="@min-[34rem]:col-span-2"
      />
      <TextField
        id={`${p}-phone`} name="phone" label="Mobile" required type="tel" inputMode="tel" autoComplete="tel"
        hint="We'll call or text to confirm"
        value={values.phone} onChange={(v) => update({ phone: v })} error={errors.phone}
        inputRef={(el: HTMLInputElement | null) => { textRefs.current[1] = el; }}
      />
      <TextField
        id={`${p}-email`} name="email" label="Email" required type="email" inputMode="email" autoComplete="email"
        value={values.email} onChange={(v) => update({ email: v })} error={errors.email}
        inputRef={(el: HTMLInputElement | null) => { textRefs.current[2] = el; }}
      />
      <TextField
        id={`${p}-notes`} name="notes" label="Notes" multiline rows={3} maxLength={NOTES_MAX}
        hint={`Up to ${NOTES_MAX} characters`}
        value={values.notes} onChange={(v) => update({ notes: v })} error={errors.notes}
        inputRef={(el: HTMLTextAreaElement | null) => { textRefs.current[3] = el; }}
        className="@min-[34rem]:col-span-2"
      />
      {/* Honeypot: off-screen, hidden from assistive tech, never in the tab order. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor={`${p}-company`}>Company</label>
        <input
          id={`${p}-company`} name="company" type="text" tabIndex={-1} autoComplete="off"
          value={values.company} onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
        />
      </div>
    </div>
  );

  const errorSummary = summaryOpen && errorList.length ? (
    <div
      ref={summaryRef}
      role="alert"
      tabIndex={-1}
      aria-labelledby={`${p}-errors-title`}
      className="rounded-sm bg-bg-raised p-5 shadow-[inset_3px_0_0_var(--flag)]"
    >
      <p id={`${p}-errors-title`} className="inline-flex items-center gap-2 t-title">
        <AlertCircle size={18} strokeWidth={2} aria-hidden="true" className="text-flag" />
        {errorList.length === 1 ? "One thing to fix before we can send this:" : `${errorList.length} things to fix before we can send this:`}
      </p>
      <ul className="mt-2 flex flex-col">
        {errorList.map((f) => (
          <li key={f}>
            <a
              href={`#${p}-${f}`}
              onClick={(e) => { e.preventDefault(); focusField(f); }}
              className="inline-flex min-h-11 items-center t-small text-flag underline decoration-1 underline-offset-[.22em] fine:hover:decoration-2"
            >
              {errors[f]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  const okInput = outcome?.kind === "ok" ? outcome.input : null;
  const refCode = outcome?.kind === "ok" && outcome.result.ok ? outcome.result.ref : undefined;
  const box = "mt-4 rounded-sm bg-bg-raised p-5";
  // The ticket + its result: one persistent role=status region (pending, success) and a role=alert when not sent.
  const ticket = (
    <div>
      <TicketPreview partySize={partySize} date={values.date ?? undefined} time={values.time ?? undefined} status={status} />
      <div ref={resultRef} tabIndex={-1} className="outline-offset-4">
        <div role="status">
          {pending ? <p className={cx(box, "t-body shadow-[inset_3px_0_0_var(--accent)]")}>{BOOKING_COPY.pending}</p> : null}
          {okInput ? (
            <div className={cx(box, "shadow-[inset_3px_0_0_var(--accent)]")}>
              <p className="t-body text-pretty">
                <NoBreakPhones text={BOOKING_COPY.success({ phone: okInput.phone, partySize: okInput.partySize, date: okInput.date, time: okInput.time })} />
              </p>
              {refCode ? <p className="mt-3 t-label tnum">Ref {refCode}</p> : null}
            </div>
          ) : null}
        </div>
        {outcome?.kind === "not_configured" || outcome?.kind === "failed" ? (
          <div role="alert" className={cx(box, "shadow-[inset_3px_0_0_var(--flag)]")}>
            <p className="t-body text-pretty">
              <NoBreakPhones text={outcome.kind === "not_configured" ? BOOKING_COPY.notConfigured : BOOKING_COPY.failed} />
            </p>
          </div>
        ) : null}
        {!sheet && outcome ? <div className="mt-4 hidden flex-wrap items-center gap-3 lg:flex short:flex">{actions("inline")}</div> : null}
      </div>
    </div>
  );

  /* ── Sheet: three steps ── */
  if (sheet) {
    const normalized = normalizePhone(values.phone) ?? values.phone;
    return (
      <form
        id={BOOKING_FORM_DOM_ID}
        ref={formRef}
        noValidate
        onSubmit={onSubmit}
        aria-labelledby={titleId}
        aria-busy={pending || undefined}
        tabIndex={-1}
        className="@container flex flex-col gap-6 outline-none"
      >
        <div>
          <p className="t-label text-fg-muted">Step <span className="tnum">{step}</span> of 3</p>
          <h3 ref={stepRef} tabIndex={-1} className="mt-1 t-title outline-offset-4">{STEPS[step].title}</h3>
          <div aria-hidden="true" className="mt-3 grid grid-cols-3 gap-1.5">
            {([1, 2, 3] as Step[]).map((s) => (
              <span key={s} className={cx("h-1 rounded-sm", s <= step ? "bg-fg" : "bg-hair")} />
            ))}
          </div>
        </div>
        {ticket}
        {errorSummary}
        {step === 1 ? (
          <>
            {party}
            {groups ? groupsNote : (<>{date}{time}</>)}
          </>
        ) : null}
        {step === 2 ? details : null}
        {step === 3 && !ok ? (
          <div className="flex flex-col gap-5">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 border-y border-hair py-4 t-small">
              <dt className="t-label text-fg-muted">When</dt>
              <dd className="tnum">{summary}</dd>
              <dt className="t-label text-fg-muted">Name</dt>
              <dd className="min-w-0 break-words">{values.name}</dd>
              <dt className="t-label text-fg-muted">Mobile</dt>
              <dd className="tnum">{normalized}</dd>
              <dt className="t-label text-fg-muted">Email</dt>
              <dd className="min-w-0 break-words">{values.email}</dd>
              {values.notes.trim() ? (
                <>
                  <dt className="t-label text-fg-muted">Notes</dt>
                  <dd className="min-w-0 break-words whitespace-pre-line">{values.notes.trim()}</dd>
                </>
              ) : null}
            </dl>
            <div className="flex flex-wrap gap-x-6">
              <Button variant="quiet" size="sm" onClick={() => goStep(1)} aria-disabled={pending || undefined}>Change the time</Button>
              <Button variant="quiet" size="sm" onClick={() => goStep(2)} aria-disabled={pending || undefined}>Change your details</Button>
            </div>
            <p className="t-small text-fg-muted text-pretty">{BOOKING_COPY.standfirst}</p>
          </div>
        ) : null}
        {/* Keep the honeypot in the form on every step. */}
        {step !== 2 ? (
          <div className="hp-field" aria-hidden="true">
            <label htmlFor={`${p}-company`}>Company</label>
            <input
              id={`${p}-company`} name="company" type="text" tabIndex={-1} autoComplete="off"
              value={values.company} onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
            />
          </div>
        ) : null}
        {footerSlot ? createPortal(footer, footerSlot) : footer}
      </form>
    );
  }

  /* ── Page: every group on one screen, then review & send ── */
  return (
    <form
      id={BOOKING_FORM_DOM_ID}
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      aria-labelledby={titleId}
      aria-label={titleId ? undefined : "Table request"}
      aria-busy={pending || undefined}
      tabIndex={-1}
      className="@container flex flex-col gap-8 outline-none"
    >
      {ticket}
      {errorSummary}
      <section aria-labelledby={`${p}-when`} className="flex flex-col gap-8">
        <Slate index="01" title="When" titleId={`${p}-when`} />
        {party}
        {groups ? groupsNote : (<>{date}{time}</>)}
      </section>
      {!groups ? (
        <>
          <section aria-labelledby={`${p}-details`} className="flex flex-col gap-6">
            <Slate index="02" title="Your details" titleId={`${p}-details`} />
            {details}
          </section>
          <section aria-labelledby={`${p}-review`} className="flex flex-col gap-5">
            <Slate index="03" title="Review & send" titleId={`${p}-review`} />
            <p className="t-title tnum text-balance">{summary}</p>
            {values.name || values.phone || values.email ? (
              <p className="-mt-3 t-small text-fg-muted break-words">
                {[values.name.trim(), normalizePhone(values.phone) ?? values.phone.trim(), values.email.trim()].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            {!outcome ? (
              <div className="hidden flex-wrap items-center gap-3 lg:flex short:flex">{actions("inline")}</div>
            ) : null}
          </section>
        </>
      ) : null}
      <ReservationsBar summary={summary}>{actions("bar")}</ReservationsBar>
    </form>
  );
}

/** Keep the chosen time only while it is bookable on the chosen date. */
function withValidTime(v: Values, now: number): Values {
  if (v.date && v.time && !isBookable(v.date, v.time, now)) return { ...v, time: null };
  if (!v.date && v.time) return { ...v, time: null };
  return v;
}
