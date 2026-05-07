"use client";

import { CircleSlash, Info } from "lucide-react";
import type {
  BreakerOption,
  ConfiguratorData,
  PanelSlot,
} from "@/lib/configurator-types";
import { getAllowedBreakers } from "@/lib/bom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SlotEditorPanel({
  data,
  selectedSlot,
  selectedBreakerId,
  validationMessage,
  onChooseBreaker,
}: {
  data: ConfiguratorData;
  selectedSlot: PanelSlot | null;
  selectedBreakerId: string | null;
  validationMessage?: string;
  onChooseBreaker: (breaker: BreakerOption | null) => void;
}) {
  if (!selectedSlot) {
    return (
      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-primary">3. Select amperage</p>
        <div className="mt-4 rounded-md bg-muted p-4 text-sm leading-6 text-muted-foreground">
          Tap a breaker slot on the panelboard to choose an amperage or leave it
          empty for a cover plate.
        </div>
      </section>
    );
  }

  const allowedBreakers = getAllowedBreakers(data, selectedSlot.id);

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">3. Select amperage</p>
          <h2 className="mt-1 text-xl font-semibold">{selectedSlot.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Circuits {selectedSlot.circuitNumbers}
          </p>
        </div>
        <Badge>{selectedSlot.breakerFamily}</Badge>
      </div>

      {validationMessage ? (
        <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm font-medium text-danger">
          {validationMessage}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={selectedBreakerId ? "secondary" : "default"}
          className="justify-start"
          onClick={() => onChooseBreaker(null)}
        >
          <CircleSlash className="size-5" />
          Empty
        </Button>
        {allowedBreakers.map((breaker) => (
          <Button
            key={breaker.id}
            type="button"
            variant={selectedBreakerId === breaker.id ? "default" : "secondary"}
            className="justify-start"
            onClick={() => onChooseBreaker(breaker)}
          >
            {breaker.amps}A
          </Button>
        ))}
      </div>

      <details className="mt-4 rounded-md border border-border bg-muted p-3">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <Info className="size-4" /> Details
        </summary>
        <dl className="mt-3 grid gap-2 text-sm text-muted-foreground">
          <div className="flex justify-between gap-4">
            <dt>Unique ID</dt>
            <dd className="font-medium text-foreground">{selectedSlot.uniqueId}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Interrupt rating</dt>
            <dd className="font-medium text-foreground">
              {selectedSlot.interruptRating}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Lug size</dt>
            <dd className="text-right font-medium text-foreground">
              {selectedSlot.lugSize}
            </dd>
          </div>
        </dl>
      </details>
    </section>
  );
}
