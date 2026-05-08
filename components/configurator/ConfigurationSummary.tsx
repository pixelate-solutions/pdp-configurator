"use client";

import type { ConfiguratorData } from "@/lib/configurator-types";
import { Badge } from "@/components/ui/badge";

export function ConfigurationSummary({ data }: { data: ConfiguratorData }) {
  const frame = data.selectedFrame;
  const details = [
    ["Panel type", frame.panelType],
    ["Catalog", frame.catalogNumber],
    ["Voltage", frame.systemVoltage],
    ["IR rating", frame.irRating],
    ["Main bus", `${frame.mainBusAmps}A ${frame.busMaterial}`],
    ["Feed", frame.feed],
    ["Mounting", frame.mounting],
    ["Conduit area", frame.conduitArea],
    ["SE label", frame.seLabel ? "Yes" : "No"],
    ["Series rated", frame.seriesRated ? "Yes" : "No"],
    ["Main lugs", data.mainBreaker.lugDescription],
  ];

  return (
    <details className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <summary className="cursor-pointer text-sm font-semibold text-primary">
        Technical details
      </summary>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{frame.heightInches} in</Badge>
        <Badge variant="muted">{frame.enclosure}</Badge>
        <Badge variant="muted">{data.mainBreaker.family}</Badge>
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        {details.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-t border-border pt-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="max-w-[62%] text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
