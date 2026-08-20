"use client";

import type { Option } from "@/lib/em/types";
import { cn } from "@/lib/utils";

export function OptionButtons<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  columns,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  columns?: number;
}) {
  return (
    <div className={cn(disabled && "pointer-events-none opacity-40")}>
      <h3 className="text-sm font-bold">{label}</h3>
      <div
        className="mt-2 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns ?? Math.min(options.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "pressable cursor-pointer rounded-lg border px-2 py-2 text-center text-sm font-semibold",
              option.value === value
                ? "border-primary bg-primary text-white"
                : "border-border bg-card text-foreground hover:border-primary/50",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CountSelect({
  label,
  counts,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  counts: number[];
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn("block", disabled && "pointer-events-none opacity-40")}>
      <span className="text-sm font-bold">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 block w-full cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
      >
        {counts.map((count) => (
          <option key={count} value={count}>
            {count}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn("block", disabled && "pointer-events-none opacity-40")}>
      <span className="text-sm font-bold">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block w-full cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function YesNoButtons({
  label,
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <OptionButtons
      label={label}
      options={[
        { value: "yes", label: yesLabel },
        { value: "no", label: noLabel },
      ]}
      value={value ? "yes" : "no"}
      onChange={(next) => onChange(next === "yes")}
      columns={2}
    />
  );
}
