"use client";

import type { BomSummary } from "@/lib/configurator-types";
import { BomLineItem } from "@/components/configurator/BomLineItem";

export function LiveBom({ bom }: { bom: BomSummary }) {
  return (
    <section id="live-bom" className="glass-panel min-w-0 overflow-hidden rounded-[2rem] p-4 sm:p-6">
      <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        Bill of Materials
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="min-w-0 rounded-2xl border border-white/70 bg-white/54 p-2 shadow-sm backdrop-blur sm:p-3">
          <p className="text-lg font-bold">{bom.filledSlotCount}</p>
          <p className="text-xs text-muted-foreground">Breakers</p>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/70 bg-white/54 p-2 shadow-sm backdrop-blur sm:p-3">
          <p className="text-lg font-bold">{bom.emptySlotCount}</p>
          <p className="text-xs text-muted-foreground">Covered</p>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/70 bg-white/54 p-2 shadow-sm backdrop-blur sm:p-3">
          <p className="text-lg font-bold">{bom.lines.length}</p>
          <p className="text-xs text-muted-foreground">Items</p>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-white/60 bg-white/42 backdrop-blur md:block">
        <table className="w-full border-collapse text-sm">
          <thead className="text-left text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            <tr>
              <th className="border-b-2 border-border px-2 py-2 text-center">Qty</th>
              <th className="px-3 py-2">Catalog</th>
              <th className="px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {bom.lines.map((line) => (
              <tr key={line.id} className="border-t border-border align-top">
                <td className="px-2 py-2 text-center font-bold text-primary">
                  {line.quantity}
                </td>
                <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                  {line.catalogNumber}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {line.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {bom.lines.map((line) => (
          <BomLineItem key={line.id} line={line} />
        ))}
      </div>
    </section>
  );
}
