"use client";

import type { BomLine } from "@/lib/configurator-types";
import { Badge } from "@/components/ui/badge";

const labels: Record<BomLine["itemType"], string> = {
  frame: "Frame",
  main_breaker: "Main",
  accessory: "Accessory",
  breaker: "Breaker",
  cover_plate: "Cover plate",
};

export function BomLineItem({ line }: { line: BomLine }) {
  return (
    <article className="min-w-0 rounded-lg border border-border bg-white p-3">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <div className="rounded bg-muted px-2 py-1 text-center text-sm font-bold text-primary">
          {line.quantity}
        </div>
        <div className="min-w-0">
          <Badge variant={line.itemType === "cover_plate" ? "muted" : "default"}>
            {labels[line.itemType]}
          </Badge>
          <h3 className="mt-2 break-words text-sm font-semibold">
            {line.catalogNumber}
          </h3>
          <p className="mt-1 break-words text-sm leading-5 text-muted-foreground">
            {line.description}
          </p>
        </div>
      </div>
    </article>
  );
}
