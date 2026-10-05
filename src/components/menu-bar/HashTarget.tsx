"use client";
/**
 * Deep-link sweep for pages that list items without MenuBrowser (spec §10.13): on load and on
 * hashchange, an #item-* target is focused (no extra scroll — the browser already did it) and gets
 * .is-target for 1.2s. Renders nothing.
 */
import { useEffect } from "react";

export function HashTarget() {
  useEffect(() => {
    const onHash = () => {
      if (!window.location.hash.startsWith("#item-")) return;
      const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (!el) return;
      el.focus({ preventScroll: true });
      el.classList.add("is-target");
      window.setTimeout(() => el.classList.remove("is-target"), 1200);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return null;
}
