/** Game Day fixtures (spec §9.11, C-12). */
export type Fixture = { id: string; league: string; matchup: string; startsAt: string /* ISO with offset */; note?: string };

/** Owner-maintained. Add a fixture to show the Game Day band on home and in the concierge. Past fixtures auto-hide. EMPTY BY DEFAULT. */
export const FIXTURES: Fixture[] = []; // OWNER-INPUT(C-12): fixture feed — never commit sample fixtures

/** Fixtures starting between `now` and `now + days`, soonest first. */
export function upcomingFixtures(now: Date | number, days = 7): Fixture[] {
  const t = typeof now === "number" ? now : now.getTime();
  const until = t + days * 86_400_000;
  return FIXTURES
    .map((f) => ({ f, at: Date.parse(f.startsAt) }))
    .filter(({ at }) => Number.isFinite(at) && at >= t && at <= until)
    .sort((a, b) => a.at - b.at)
    .map(({ f }) => f);
}
