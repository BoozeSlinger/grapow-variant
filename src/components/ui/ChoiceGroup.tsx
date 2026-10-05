"use client";
/**
 * Radio chips (spec §10.10): <fieldset> + native radios inside .choice labels (arrow keys are native).
 * Checked: inverted fill + a visible ✓ (never colour alone). Disabled options carry their reason as sr text + title.
 */
import { useId } from "react";
import { AlertCircle, Check } from "lucide-react";

export function ChoiceGroup<T extends string>({ legend, legendHidden, name, value, onChange, options, columns, size = "md", error, className }: {
  legend: string; legendHidden?: boolean; name: string; value: T | null;
  onChange: (v: T) => void; options: Array<{ value: T; label: string; sub?: string; disabled?: boolean; reason?: string }>;
  columns?: number; size?: "sm" | "md"; error?: string; className?: string;
}) {
  const uid = useId();
  const errorId = `${uid}-error`;
  return (
    <fieldset className={["min-w-0 border-0 p-0", className].filter(Boolean).join(" ")} aria-describedby={error ? errorId : undefined} aria-invalid={error ? true : undefined}>
      <legend className={legendHidden ? "sr-only" : "mb-3 t-label"}>{legend}</legend>
      <div
        className={columns ? "grid gap-2" : "flex flex-wrap gap-2"}
        style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
      >
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={["choice", size === "sm" ? "t-small font-semibold" : "t-ui", o.sub ? "flex-col gap-0.5 py-2" : ""].filter(Boolean).join(" ")}
              title={o.disabled ? o.reason : undefined}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                disabled={o.disabled}
                onChange={() => onChange(o.value)}
              />
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                {checked ? <Check size={16} strokeWidth={2.25} aria-hidden="true" /> : null}
                <span className="tnum">{o.label}</span>
              </span>
              {o.sub ? <span className="t-micro opacity-80">{o.sub}</span> : null}
              {o.disabled && o.reason ? <span className="sr-only"> ({o.reason})</span> : null}
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} className="mt-2 inline-flex items-center gap-1.5 t-small text-flag">
          <AlertCircle size={16} strokeWidth={2} aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
