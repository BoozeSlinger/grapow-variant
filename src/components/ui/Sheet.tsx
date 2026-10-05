"use client";
/**
 * The single dialog primitive (spec §10.4): native <dialog> with showModal()/show(),
 * @starting-style motion (globals.css), Esc via `cancel`, backdrop-click close and focus return.
 * Variants: bottom (<1024) · right (≥1024) · full (nav) · pad (desktop concierge, always non-modal).
 */
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Sheet({
  open, onClose, variant, modal: modalProp = true, title, titleId, label, headerExtra, footer, closeLabel = "Close",
  tone = "rice", initialFocus, returnFocus, className, children,
}: {
  open: boolean; onClose: () => void;
  variant: "bottom" | "right" | "full" | "pad";
  modal?: boolean;
  title: React.ReactNode; titleId: string;
  label?: React.ReactNode;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel?: string;
  tone?: "rice" | "ink";
  initialFocus?: React.RefObject<HTMLElement | null>;
  returnFocus?: HTMLElement | null;
  className?: string; children: React.ReactNode;
}) {
  const modal = variant === "pad" ? false : modalProp;
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Open / close the native dialog; return focus on close.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      const active = document.activeElement;
      restoreRef.current = returnFocus ?? (active instanceof HTMLElement && active !== document.body ? active : null);
      if (modal) d.showModal();
      else d.show();
      (initialFocus?.current ?? closeRef.current)?.focus();
    } else if (!open && d.open) {
      d.close();
      const target = restoreRef.current;
      restoreRef.current = null;
      if (target && target.isConnected) target.focus({ preventScroll: true });
    }
  }, [open, modal, returnFocus, initialFocus]);

  // Esc: modal → `cancel` (preventDefault, then onClose); non-modal → keydown Escape.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onCloseRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!modal && e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    // Backdrop click (modal only): the click target is the <dialog> element itself.
    const onClick = (e: MouseEvent) => {
      if (modal && e.target === d) onCloseRef.current();
    };
    d.addEventListener("cancel", onCancel);
    d.addEventListener("keydown", onKey);
    d.addEventListener("click", onClick);
    return () => {
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("keydown", onKey);
      d.removeEventListener("click", onClick);
    };
  }, [modal]);

  // Unmounting while open: release the top layer.
  useEffect(() => {
    const d = ref.current;
    return () => {
      if (d?.open) d.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={["sheet", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-ground={tone}
      aria-labelledby={titleId}
      aria-modal={modal ? undefined : "false"}
    >
      {/* Plain divs, not <header>/<footer>: inside a dialog those would expose a second banner/contentinfo landmark. */}
      <div className="flex flex-none items-start gap-3 border-b border-hair bg-bg px-4 pt-3 pb-3 sm:px-6">
        <div className="min-w-0 flex-1 pt-1">
          {label ? <p className="t-label text-fg-muted">{label}</p> : null}
          <h2 id={titleId} className="t-d3 mt-1 text-balance">{title}</h2>
          {headerExtra ? <div className="mt-2 t-small">{headerExtra}</div> : null}
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={() => onCloseRef.current()}
          aria-label={closeLabel}
          className="inline-flex size-11 flex-none items-center justify-center rounded-sm shadow-[inset_0_0_0_1.5px_var(--line)] transition-colors duration-(--dur-1) fine:hover:bg-bg-raised"
        >
          <X size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      <div className="sheet-body px-4 py-5 sm:px-6">{children}</div>
      {footer ? (
        <div className="flex-none border-t border-hair bg-bg px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] sm:px-6">{footer}</div>
      ) : null}
    </dialog>
  );
}
