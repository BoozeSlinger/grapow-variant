"use client";
/**
 * Transcript persistence (spec §13.6 privacy): sessionStorage["gp:host:v1"], last 30 turns. Guest text is
 * stored with phone and email patterns redacted; host turns are the reply objects (item ids, never card
 * data); booking outcomes carry the summary only. Names, phones and emails are never stored.
 */
import { useCallback, useEffect, useState } from "react";
import type { HostTurn } from "@/lib/concierge/types";

export const TRANSCRIPT_KEY = "gp:host:v1";
const MAX_TURNS = 30;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;

export function redact(text: string): string {
  return text.replace(EMAIL_RE, "[email]").replace(PHONE_RE, "[phone]");
}

export function serializeTurns(turns: HostTurn[]): string {
  return JSON.stringify(turns.slice(-MAX_TURNS).map((t) => (t.role === "guest" && t.text ? { ...t, text: redact(t.text) } : t)));
}

function read(): HostTurn[] {
  try {
    const raw = window.sessionStorage.getItem(TRANSCRIPT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as HostTurn[]).filter((t) => t && (t.role === "guest" || t.role === "host")) : [];
  } catch {
    return [];
  }
}

export function useTranscript(): { turns: HostTurn[]; append: (...t: HostTurn[]) => void; clear: () => void } {
  const [turns, setTurns] = useState<HostTurn[]>(read);

  useEffect(() => {
    try {
      if (turns.length) window.sessionStorage.setItem(TRANSCRIPT_KEY, serializeTurns(turns));
      else window.sessionStorage.removeItem(TRANSCRIPT_KEY);
    } catch {
      /* storage unavailable: the transcript lasts for this page view */
    }
  }, [turns]);

  const append = useCallback((...t: HostTurn[]) => {
    setTurns((prev) => [...prev, ...t.map((x) => (x.role === "guest" && x.text ? { ...x, text: redact(x.text) } : x))].slice(-MAX_TURNS));
  }, []);
  const clear = useCallback(() => setTurns([]), []);
  return { turns, append, clear };
}
