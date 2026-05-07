"use client";

import type { BomSummary } from "@/lib/configurator-types";
import { currency, percent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BomLineItem } from "@/components/configurator/BomLineItem";

export function LiveBom({ bom }: { bom: BomSummary }) {
  return (
    <section id="live-bom" className="min-w-0 overflow-hidden rounded-lg border border-border bg-white p-3 shadow-sm sm:p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">4. Review BOM</p>
          <h2 className="mt-1 text-xl font-semibold">Live bill of materials</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates instantly as slots change.
          </p>
        </div>
        <Badge className="shrink-0" variant="success">
          {currency(bom.totalSellPrice)}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="min-w-0 rounded-md bg-muted p-2 sm:p-3">
          <p className="text-lg font-bold">{bom.filledSlotCount}</p>
          <p className="text-xs text-muted-foreground">Filled</p>
        </div>
        <div className="min-w-0 rounded-md bg-muted p-2 sm:p-3">
          <p className="text-lg font-bold">{bom.emptySlotCount}</p>
          <p className="text-xs text-muted-foreground">Empty</p>
        </div>
        <div className="min-w-0 rounded-md bg-muted p-2 sm:p-3">
          <p className="text-lg font-bold">{percent(bom.margin)}</p>
          <p className="text-xs text-muted-foreground">Margin</p>
        </div>
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Catalog</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Unit</th>
              <th className="px-3 py-2 text-right">Ext.</th>
            </tr>
          </thead>
          <tbody>
            {bom.lines.map((line) => (
              <tr key={line.id} className="border-t border-border align-top">
                <td className="px-3 py-2 capitalize">
                  {line.itemType.replace("_", " ")}
                </td>
                <td className="px-3 py-2 font-semibold">{line.catalogNumber}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {line.description}
                </td>
                <td className="px-3 py-2 text-right">{line.quantity}</td>
                <td className="px-3 py-2 text-right">
                  {currency(line.unitSellPrice)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {currency(line.extendedSellPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:hidden">
        {bom.lines.map((line) => (
          <BomLineItem key={line.id} line={line} />
        ))}
      </div>
    </section>
  );
}
