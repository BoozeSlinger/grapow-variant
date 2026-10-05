/**
 * Framer presets (spec §7.3). Framer is used only inside client islands through `m.*` under
 * LazyMotion + domAnimation + strict (MotionProvider). `motion.*` throws under strict and is banned.
 */
import type { Transition, Variants } from "framer-motion";

export const EASE = { out: [0.22, 1, 0.36, 1], inOut: [0.65, 0, 0.35, 1], stamp: [0.34, 1.56, 0.64, 1] } as const;
export const DUR = { press: 0.12, quick: 0.2, base: 0.32, slow: 0.56, story: 0.9 } as const;
export const tQuick: Transition = { duration: DUR.quick, ease: EASE.out };
export const tBase: Transition = { duration: DUR.base, ease: EASE.inOut };
/** Client-only appearance (concierge entries, ticket slot write-ins). Never on SSR'd above-fold content. */
export const entryRise: Variants = { hidden: { opacity: 0, y: 8 }, shown: { opacity: 1, y: 0, transition: tQuick } };
/** Swap one value for another (board cells, step panels). Use with AnimatePresence mode="popLayout" on a plain m.span. */
export const swapFade: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: tQuick }, exit: { opacity: 0, transition: { duration: 0.14 } } };
/** Concierge chat ↔ booking panel swap. */
export const panelSwap: Variants = { hidden: { opacity: 0, x: 12 }, shown: { opacity: 1, x: 0, transition: tBase }, exit: { opacity: 0, x: -12, transition: { duration: 0.22, ease: EASE.inOut } } };
/** Ticket slot write-in. */
export const slotWrite: Variants = { hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0, transition: tQuick } };
