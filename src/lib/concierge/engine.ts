/**
 * The rule engine that ships (spec §13.3). Deterministic, no API key, no artificial delay: it classifies
 * with the ordered intent table and answers through replies.ts. `history` is accepted for the interface
 * (a future LLM engine may use it); the rule engine answers each message on its own.
 */
import { classify } from "./intents";
import { buildReply, openingReply } from "./replies";
import type { ConciergeEngine, HostReply } from "./types";

/** Synchronous core, shared by the engine and the tests. */
export function answer(text: string, now: number, path: string): HostReply {
  const { intent, ctx } = classify(text, now, path);
  return buildReply(intent, ctx);
}

export function createRuleEngine(): ConciergeEngine {
  return {
    reply: async ({ text, now, path }) => answer(text, now, path),
  };
}

export { openingReply };
