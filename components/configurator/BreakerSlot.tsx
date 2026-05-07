"use client";

import type { BreakerOption, PanelSlot } from "@/lib/configurator-types";
import { cn } from "@/lib/utils";

export function BreakerSlot({
  slot,
  selected,
  breaker,
  invalid,
  onSelect,
}: {
  slot: PanelSlot;
  selected: boolean;
  breaker: BreakerOption | null;
  invalid?: boolean;
  onSelect: () => void;
}) {
  const filled = Boolean(breaker);

  return (
    <button
      type="button"
      className={cn(
        "absolute flex min-h-12 min-w-0 flex-col justify-center overflow-hidden rounded-md border p-1.5 text-left shadow-sm transition tap-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-h-14 sm:p-2",
        "hover:shadow-md",
        filled
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-dashed border-slate-300 bg-white/80 text-muted-foreground",
        selected && "border-accent bg-amber-50 ring-2 ring-accent",
        invalid && "border-danger bg-orange-50 ring-2 ring-danger",
      )}
      style={{
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        width: `${slot.width}%`,
        height: `${slot.height}%`,
      }}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="block w-full truncate text-[11px] font-bold uppercase tracking-normal text-slate-600 sm:text-xs">
        {slot.label} • {slot.breakerFamily}
      </span>
      <span className="mt-0.5 block w-full truncate text-xs font-semibold text-foreground sm:text-sm">
        {slot.circuitNumbers}
      </span>
      <span className="mt-1 inline-flex max-w-full truncate rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 sm:text-xs">
        {breaker ? `${breaker.amps}A` : "Empty"}
      </span>
    </button>
  );
}
