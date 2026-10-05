"use client";
/**
 * The booking sheet's sticky footer element. BookingSheet provides it; BookingForm (variant "sheet")
 * portals the current step's actions into it, so the primary action sits in the Sheet footer (spec §12.8).
 */
import { createContext } from "react";

export const SheetFooterSlot = createContext<HTMLElement | null>(null);
