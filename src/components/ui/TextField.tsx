"use client";
/**
 * Labelled text input (spec §10.10). Label above with "(required)" / "(optional)" in text; 48px input,
 * 17px text; hint + error linked by aria-describedby; error = text-flag + icon + aria-invalid.
 */
import { AlertCircle } from "lucide-react";

export function TextField({ id, name, label, required, type = "text", inputMode, autoComplete, value, onChange, hint, error, maxLength, multiline, rows = 4, className, inputRef }: {
  id: string; name: string; label: string; required?: boolean; type?: "text" | "tel" | "email";
  inputMode?: "text" | "tel" | "email"; autoComplete?: string; value: string; onChange: (v: string) => void; hint?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CONTRACT (spec §10.10): input or textarea ref
  error?: string; maxLength?: number; multiline?: boolean; rows?: number; className?: string; inputRef?: React.Ref<any>;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const field = [
    "block w-full rounded-sm bg-bg-raised px-3.5 text-[1.0625rem] leading-snug text-fg",
    "shadow-[inset_0_0_0_1.5px_var(--line)] placeholder:text-fg-muted",
    error ? "shadow-[inset_0_0_0_2px_var(--flag)]" : "",
  ].join(" ");
  const common = {
    id, name, value, required, maxLength, autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };
  return (
    <div className={["min-w-0", className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className="mb-2 block t-label">
        {label} <span className="text-fg-muted normal-case tracking-normal">{required ? "(required)" : "(optional)"}</span>
      </label>
      {multiline ? (
        <textarea {...common} ref={inputRef} rows={rows} inputMode={inputMode} className={`${field} min-h-12 py-3`} />
      ) : (
        <input {...common} ref={inputRef} type={type} inputMode={inputMode} className={`${field} h-12`} />
      )}
      {hint ? <p id={hintId} className="mt-2 t-small text-fg-muted">{hint}</p> : null}
      {error ? (
        <p id={errorId} className="mt-2 inline-flex items-center gap-1.5 t-small text-flag">
          <AlertCircle size={16} strokeWidth={2} aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
