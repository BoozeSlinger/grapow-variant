/**
 * BookingForm (spec §12.8): the honest result states. The server action is replaced by a mock `submit`, so this
 * proves the UI only ever shows success on {ok:true}, keeps the guest's data on every failure, and maps
 * server-side field errors. Date is faked (Fri 2 Oct 2026, noon in LA) so Saturday 3 Oct 19:00 is bookable.
 */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/request-table", () => ({ requestTable: vi.fn() }));

import BookingForm from "@/components/booking/BookingForm";
import ClockProvider from "@/components/ui/ClockProvider";
import MotionProvider from "@/components/ui/MotionProvider";
import { BOOKING_COPY } from "@/lib/booking/copy";
import type { BookingInput, RequestTableResult } from "@/lib/booking/types";
import { useOverlay, type OpenBookingDetail } from "@/lib/overlay";

const NOW = Date.parse("2026-10-02T12:00:00-07:00");
const SATURDAY = "2026-10-03";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: NOW }); // only Date: Testing Library's polling keeps real timers
  window.matchMedia = ((query: string) => ({
    matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});
afterEach(() => {
  cleanup();
  useOverlay.setState({ overlay: null, trigger: null, bookingPrefill: null });
  vi.useRealTimers();
});

function setup(submit: (input: BookingInput) => Promise<RequestTableResult>, variant: "page" | "sheet" = "page", prefill?: OpenBookingDetail) {
  const view = render(
    <MotionProvider>
      <ClockProvider serverNow={NOW}>
        <BookingForm variant={variant} submit={submit} prefill={prefill} />
      </ClockProvider>
    </MotionProvider>,
  );
  const form = view.container.querySelector("form") as HTMLFormElement;
  return { ...view, form };
}

function chooseTable(form: HTMLFormElement) {
  fireEvent.click(within(form).getByRole("radio", { name: "4" }));
  fireEvent.click(form.querySelector(`input[name="bf-page-date"][value="${SATURDAY}"]`) as HTMLInputElement);
  fireEvent.click(form.querySelector('input[name="bf-page-time"][value="19:00"]') as HTMLInputElement);
}

function fillDetails() {
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Pat Guest" } });
  fireEvent.change(screen.getByLabelText(/^Mobile/), { target: { value: "951-555-0123" } });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: "pat@example.com" } });
  fireEvent.change(screen.getByLabelText(/^Notes/), { target: { value: "Birthday, high chair please" } });
}

function send() {
  fireEvent.click(screen.getAllByRole("button", { name: "Send request" })[0]);
}

describe("BookingForm", () => {
  it("shows success, the REQUESTED stamp and the ref only when the action returns {ok:true}", async () => {
    const submit = vi.fn(async (): Promise<RequestTableResult> => ({ ok: true, ref: "ABC123" }));
    const { form, container } = setup(submit);

    // Draft: no stamp, and nothing claims the table is requested.
    expect(container.querySelector(".stamp-in")).toBeNull();
    expect(screen.getByText("Draft")).toBeInTheDocument();

    chooseTable(form);
    expect(container.querySelector(".ticket-body p")).toHaveTextContent("Table for 4 · Sat, Oct 3 · 7:00 PM");
    fillDetails();
    send();

    const expected = BOOKING_COPY.success({ phone: "(951) 555-0123", partySize: 4, date: SATURDAY, time: "19:00" });
    await waitFor(() => expect(container.querySelector('[role="status"]')).toHaveTextContent(expected));
    expect(screen.getByText("Ref ABC123")).toBeInTheDocument();
    expect(container.querySelector(".stamp-in")).toHaveTextContent("Requested");
    expect(screen.getAllByRole("button", { name: "Done" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("alert")).toBeNull();

    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({
      partySize: 4, date: SATURDAY, time: "19:00", name: "Pat Guest", phone: "(951) 555-0123",
      email: "pat@example.com", notes: "Birthday, high chair please", source: "page",
    }));
  });

  it("keeps every field when the action fails, and never shows success", async () => {
    const submit = vi.fn(async (): Promise<RequestTableResult> => ({ ok: false, reason: "failed" }));
    const { form, container } = setup(submit);
    chooseTable(form);
    fillDetails();
    send();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(BOOKING_COPY.failed);
    expect(screen.getByText("Not sent")).toBeInTheDocument();
    expect(container.querySelector(".stamp-in")).toBeNull();
    expect(screen.queryByText(/requested/i)).toBeNull();
    expect(screen.queryByText(/ref /i)).toBeNull();
    expect(screen.getAllByRole("link", { name: /Call\s*\(951\) 780-1132/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Try again" }).length).toBeGreaterThan(0);

    // The data is still there.
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Pat Guest");
    expect(screen.getByLabelText(/^Mobile/)).toHaveValue("951-555-0123");
    expect(screen.getByLabelText(/^Email/)).toHaveValue("pat@example.com");
    expect(screen.getByLabelText(/^Notes/)).toHaveValue("Birthday, high chair please");
    expect(within(form).getByRole("radio", { name: "4" })).toBeChecked();
    expect(form.querySelector(`input[name="bf-page-date"][value="${SATURDAY}"]`)).toBeChecked();
    expect(form.querySelector('input[name="bf-page-time"][value="19:00"]')).toBeChecked();
  });

  it("says the honest thing when no booking channel is configured", async () => {
    const submit = vi.fn(async (): Promise<RequestTableResult> => ({ ok: false, reason: "not_configured" }));
    const { form, container } = setup(submit);
    chooseTable(form);
    fillDetails();
    send();

    expect(await screen.findByRole("alert")).toHaveTextContent(BOOKING_COPY.notConfigured);
    expect(screen.getByText("Not sent")).toBeInTheDocument();
    expect(container.querySelector(".stamp-in")).toBeNull();
    expect(screen.queryByText(/requested|confirmed/i)).toBeNull();
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Pat Guest");
  });

  it("treats a thrown action as failed, not as success", async () => {
    const submit = vi.fn(async (): Promise<RequestTableResult> => { throw new Error("network"); });
    const { form, container } = setup(submit);
    chooseTable(form);
    fillDetails();
    send();
    expect(await screen.findByRole("alert")).toHaveTextContent(BOOKING_COPY.failed);
    expect(container.querySelector(".stamp-in")).toBeNull();
  });

  it("maps server field errors onto the fields and moves focus to the summary", async () => {
    const submit = vi.fn(async (): Promise<RequestTableResult> => ({ ok: false, reason: "invalid", fields: { phone: "Enter a 10-digit mobile number." } }));
    const { form } = setup(submit);
    chooseTable(form);
    fillDetails();
    send();

    const summary = await screen.findByRole("alert");
    await waitFor(() => expect(summary).toHaveFocus());
    expect(within(summary).getByRole("link", { name: "Enter a 10-digit mobile number." })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Mobile/)).toHaveAttribute("aria-invalid", "true");
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("validates before calling the action: an empty form lists every missing field", async () => {
    const submit = vi.fn(async (): Promise<RequestTableResult> => ({ ok: true, ref: "ZZZZZZ" }));
    const { form } = setup(submit);
    send();

    const summary = await screen.findByRole("alert");
    expect(within(summary).getAllByRole("link")).toHaveLength(6);
    expect(within(form).getAllByText("Choose how many guests.").length).toBeGreaterThan(0);
    expect(submit).not.toHaveBeenCalled();
  });

  it("9+ replaces the form with the groups message and a call link", () => {
    const submit = vi.fn(async (): Promise<RequestTableResult> => ({ ok: true }));
    const { form } = setup(submit);
    fireEvent.click(within(form).getByRole("radio", { name: "9+" }));
    expect(form).toHaveTextContent(BOOKING_COPY.groups);
    expect(screen.getAllByRole("link", { name: /Call/ }).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/^Name/)).toBeNull();
  });
  it("shows a pending state while the request is in flight: Sending…, busy, read-only, status line", async () => {
    let release: (r: RequestTableResult) => void = () => {};
    const submit = vi.fn(() => new Promise<RequestTableResult>((resolve) => { release = resolve; }));
    const { form, container } = setup(submit);
    chooseTable(form);
    fillDetails();
    send();

    await waitFor(() => expect(screen.getAllByRole("button", { name: "Sending…" }).length).toBeGreaterThan(0));
    expect(form).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector('[role="status"]')).toHaveTextContent(BOOKING_COPY.pending);
    expect(screen.getByLabelText(/^Name/)).toHaveAttribute("readonly");
    expect(container.querySelector(".stamp-in")).toBeNull();

    await act(async () => release({ ok: true, ref: "XYZ789" }));
    await waitFor(() => expect(screen.getByText("Ref XYZ789")).toBeInTheDocument());
    expect(container.querySelector(".stamp-in")).not.toBeNull();
  });

  it("applies a valid prefill, and offers the closest times when the prefilled time is not bookable", () => {
    const ok = setup(vi.fn(), "page", { partySize: 6, date: SATURDAY, time: "20:00" });
    expect(within(ok.form).getByRole("radio", { name: "6" })).toBeChecked();
    expect(ok.form.querySelector(`input[name="bf-page-date"][value="${SATURDAY}"]`)).toBeChecked();
    expect(ok.form.querySelector('input[name="bf-page-time"][value="20:00"]')).toBeChecked();
    cleanup();

    const miss = setup(vi.fn(), "page", { partySize: 2, date: SATURDAY, time: "10:00" });
    expect(miss.form.querySelector(`input[name="bf-page-date"][value="${SATURDAY}"]`)).toBeChecked();
    expect(miss.form.querySelector('input[name="bf-page-time"]:checked')).toBeNull();
    expect(miss.form).toHaveTextContent("10:00 AM isn't available — here are the closest times.");
    expect(within(miss.form).getByRole("button", { name: "11:00 AM" })).toBeInTheDocument();
  });

  it("follows the overlay store's bookingPrefill on /reservations whenever its nonce changes", () => {
    const { form } = setup(vi.fn());
    act(() => useOverlay.setState({ bookingPrefill: { partySize: 3, date: SATURDAY, time: "18:30", nonce: 1 } }));
    expect(within(form).getByRole("radio", { name: "3" })).toBeChecked();
    expect(form.querySelector('input[name="bf-page-time"][value="18:30"]')).toBeChecked();
    act(() => useOverlay.setState({ bookingPrefill: { partySize: 5, date: SATURDAY, time: "19:00", nonce: 2 } }));
    expect(within(form).getByRole("radio", { name: "5" })).toBeChecked();
    expect(form.querySelector('input[name="bf-page-time"][value="19:00"]')).toBeChecked();
  });
});
