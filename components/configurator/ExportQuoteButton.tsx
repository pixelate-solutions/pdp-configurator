"use client";

import { Download, Printer } from "lucide-react";
import type { BomSummary, ConfiguratorData } from "@/lib/configurator-types";

function csvEscape(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function ExportQuoteButton({
  data,
  bom,
}: {
  data: ConfiguratorData;
  bom: BomSummary;
}) {
  const exportCsv = () => {
    const rows = [
      ["Item type", "Catalog number", "Description", "Quantity", "Unit price", "Extended price"],
      ...bom.lines.map((line) => [
        line.itemType,
        line.catalogNumber,
        line.description,
        line.quantity,
        line.unitSellPrice,
        line.extendedSellPrice,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${data.selectedFrame.catalogNumber}-bom.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <button
        type="button"
        className="pressable inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-full border border-white/70 bg-white/78 px-3 text-[10px] font-semibold leading-none text-foreground shadow-sm backdrop-blur transition hover:cursor-pointer hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => window.print()}
      >
        <Printer className="size-3" />
        PDF quote
      </button>
      <button
        type="button"
        className="pressable inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-full border border-white/70 bg-white/78 px-3 text-[10px] font-semibold leading-none text-foreground shadow-sm backdrop-blur transition hover:cursor-pointer hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={exportCsv}
      >
        <Download className="size-3" />
        CSV BOM
      </button>
    </div>
  );
}
