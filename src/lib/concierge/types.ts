/**
 * The host stand's engine interface (spec §13.3, CONTRACT). The rule engine ships; an LLM engine may
 * later implement the same interface on the server (tools: getVenueStatus, searchMenu, getBookableSlots,
 * getItem) and must pass ungroundedTokens() or the rule engine answers instead.
 */
import type { OpenBookingDetail } from "@/lib/overlay";

export type IntentId = "greeting" | "thanks" | "status.now" | "status.at" | "hours.week" | "happyhour" | "sushi" | "lunch" | "kids"
  | "menu.item" | "menu.category" | "menu.spicy" | "menu.recommend" | "dietary" | "location" | "parking" | "contact"
  | "pickup" | "delivery" | "booking" | "groups" | "sports" | "awards" | "story" | "fallback";

export type HostAction =
  | { type: "ask"; text: string } | { type: "link"; href: string } | { type: "call" } | { type: "directions" }
  | { type: "book"; prefill?: OpenBookingDetail } | { type: "focus"; placeholder?: string };

export type Chip = { label: string; action: HostAction };

export type HostBlock =
  | { kind: "voice"; text: string }                                   // opening line only (Newsreader italic)
  | { kind: "text"; text: string }                                    // built ONLY in replies.ts from data
  | { kind: "status"; at?: number }                                   // live status card, or status at a parsed instant
  | { kind: "hours"; layout: "grouped" | "week" }
  | { kind: "items"; itemIds: string[]; moreHref?: string; moreLabel?: string }
  | { kind: "notice"; tone: "allergy" | "raw" | "info"; text: string }
  | { kind: "links"; links: Array<{ label: string; href: string }> }
  | { kind: "actions"; actions: Array<"call" | "directions" | "book"> }
  | { kind: "booking"; prefill?: OpenBookingDetail };                 // hands off to HostBooking

export type HostReply = { intent: IntentId; confidence: number; blocks: HostBlock[]; chips: Chip[]; sources: string[] };

export type HostTurn = { role: "guest" | "host"; text?: string; reply?: HostReply; at: number };

export interface ConciergeEngine {
  reply(input: { text: string; now: number; path: string; history: HostTurn[] }): Promise<HostReply>;
}
