"use client";

import type { Frame } from "@/lib/configurator-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function FrameSelector({
  frames,
  selectedFrame,
  onSelectFrame,
}: {
  frames: Frame[];
  selectedFrame: Frame;
  onSelectFrame: (frameId: string) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">1. Choose frame</p>
          <h2 className="mt-1 text-xl font-semibold">{selectedFrame.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedFrame.catalogNumber} • {selectedFrame.panelType} •{" "}
            {selectedFrame.heightInches} in
          </p>
        </div>
        <Badge>{selectedFrame.mainBusAmps}A</Badge>
      </div>

      <div className="mt-4 grid gap-2">
        {frames.map((frame) => (
          <Button
            key={frame.id}
            type="button"
            variant={frame.id === selectedFrame.id ? "default" : "secondary"}
            className="justify-between"
            onClick={() => onSelectFrame(frame.id)}
          >
            <span>{frame.name}</span>
            <span>{frame.heightInches} in</span>
          </Button>
        ))}
      </div>
    </section>
  );
}
