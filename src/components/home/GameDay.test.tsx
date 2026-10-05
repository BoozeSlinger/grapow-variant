/**
 * Game Day (spec §12.1, C-12): hidden while src/data/gameday.ts is empty (the default), and — fed a fixture by the
 * test only; no sample fixtures are ever committed — one elevated ticket per game whose button opens the booking
 * sheet prefilled half an hour before kick-off.
 */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const upcoming = vi.fn();
vi.mock("@/data/gameday", async (orig) => ({ ...(await orig<typeof import("@/data/gameday")>()), upcomingFixtures: (...a: unknown[]) => upcoming(...a) }));

import ClockProvider from "@/components/ui/ClockProvider";
import MotionProvider from "@/components/ui/MotionProvider";
import { useOverlay } from "@/lib/overlay";
import { GameDay } from "./GameDay";

const NOW = Date.parse("2026-10-02T12:00:00-07:00");
const FIXTURE = { id: "demo", league: "Test League", matchup: "Home v Away", startsAt: "2026-10-03T13:00:00-07:00", note: "Doors at noon." };

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: NOW });
  upcoming.mockReset();
});
afterEach(() => {
  cleanup();
  useOverlay.setState({ overlay: null, trigger: null, bookingPrefill: null });
  vi.useRealTimers();
});

const view = () =>
  render(
    <MotionProvider>
      <ClockProvider serverNow={NOW}>
        <GameDay />
      </ClockProvider>
    </MotionProvider>,
  );

describe("GameDay", () => {
  it("ships with no fixtures at all", async () => {
    const actual = await vi.importActual<typeof import("@/data/gameday")>("@/data/gameday");
    expect(actual.FIXTURES).toEqual([]);
    expect(actual.upcomingFixtures(NOW)).toEqual([]);
  });

  it("renders nothing when there are no upcoming fixtures", () => {
    upcoming.mockReturnValue([]);
    const { container } = view();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a ticket per fixture and prefills the booking half an hour before kick-off", () => {
    upcoming.mockReturnValue([FIXTURE]);
    view();
    const section = document.getElementById("game-day");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("data-ground", "ink-2");
    expect(screen.getByRole("heading", { level: 2, name: "On the screens" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Home v Away" })).toBeInTheDocument();
    expect(screen.getByText("Test League")).toBeInTheDocument();
    expect(screen.getByText("Sat, Oct 3 · 1 PM")).toBeInTheDocument();
    expect(screen.getByText("Doors at noon.")).toBeInTheDocument();

    act(() => { fireEvent.click(screen.getByRole("button", { name: "Request a table for this game" })); });
    const o = useOverlay.getState().overlay;
    expect(o).toMatchObject({ kind: "booking", detail: { date: "2026-10-03", time: "12:30", source: "gameday" } });
  });
});
