"use client";

import type {
  BreakerOption,
  ConfiguratorData,
  PanelSlot,
  SlotSelection,
} from "@/lib/configurator-types";
import { Badge } from "@/components/ui/badge";
import { BreakerSlot } from "@/components/configurator/BreakerSlot";

export function PanelboardGraphic({
  data,
  selections,
  selectedSlotId,
  invalidSlotId,
  onSelectSlot,
}: {
  data: ConfiguratorData;
  selections: SlotSelection;
  selectedSlotId: string | null;
  invalidSlotId?: string | null;
  onSelectSlot: (slot: PanelSlot) => void;
}) {
  const breakerById = new Map(data.breakerOptions.map((item) => [item.id, item]));

  const selectedBreakerFor = (slot: PanelSlot): BreakerOption | null => {
    const selected = selections[slot.id];
    return selected ? breakerById.get(selected) ?? null : null;
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-white p-3 shadow-sm sm:p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">2. Tap a slot</p>
          <h2 className="mt-1 text-xl font-semibold">Panelboard layout</h2>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            {data.selectedFrame.catalogNumber} • {data.selectedFrame.systemVoltage}
          </p>
        </div>
        <Badge className="shrink-0" variant="muted">
          {data.slots.length} slots
        </Badge>
      </div>

      <div className="mt-4 w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-100 p-2 sm:p-3">
        <div className="relative mx-auto h-[980px] w-full max-w-[420px] overflow-hidden rounded-md border-4 border-slate-700 bg-slate-200 shadow-inner sm:h-[1040px] sm:max-w-[520px] lg:h-[960px]">
          <div className="absolute left-[8%] top-[4%] flex h-[15%] w-[84%] min-w-0 flex-col justify-center rounded-md border-2 border-slate-700 bg-slate-800 p-3 text-white shadow sm:p-4">
            <span className="text-sm font-bold tracking-normal text-accent">
              MAIN
            </span>
            <span className="mt-1 truncate text-lg font-semibold sm:text-xl">
              {data.mainBreaker.family}
            </span>
            <span className="text-base">
              {data.mainBreaker.amps}A/{data.mainBreaker.poles}P
            </span>
            <span className="mt-2 truncate text-xs text-slate-300">
              {data.mainBreaker.catalogNumber}
            </span>
          </div>

          <div className="absolute left-[8%] right-[8%] top-[21%] h-px bg-slate-500" />
          <div className="absolute left-1/2 top-[22%] h-[72%] w-1 -translate-x-1/2 rounded bg-slate-500" />

          {data.slots.map((slot) => (
            <BreakerSlot
              key={slot.id}
              slot={slot}
              selected={slot.id === selectedSlotId}
              breaker={selectedBreakerFor(slot)}
              invalid={slot.id === invalidSlotId}
              onSelect={() => onSelectSlot(slot)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
