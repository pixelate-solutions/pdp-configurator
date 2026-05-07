"use client";

import { Download, Printer } from "lucide-react";
import type { BomSummary, ConfiguratorData } from "@/lib/configurator-types";
import { Button } from "@/components/ui/button";

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
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="secondary" onClick={() => window.print()}>
        <Printer className="size-4" />
        PDF quote
      </Button>
      <Button type="button" variant="secondary" onClick={exportCsv}>
        <Download className="size-4" />
        CSV BOM
      </Button>
    </div>
  );
}
