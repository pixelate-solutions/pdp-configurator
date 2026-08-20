"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Download, FileDown, FileUp, Image as ImageIcon, Printer } from "lucide-react";
import type { EmBomLine, SpecRow } from "@/lib/em/types";
import {
  downloadCsvFile,
  downloadJsonFile,
  downloadSvgAsPng,
  readJsonFile,
  safeFilename,
} from "@/lib/export";
import { Button } from "@/components/ui/button";

export function ModelNumberCard({ model }: { model: string }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-bold">Model Number</h3>
      <p className="mt-2 rounded-lg bg-muted px-3 py-2 font-mono text-sm font-bold break-all text-primary">
        {model}
      </p>
    </div>
  );
}

export function WarningList({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="rounded-lg border border-accent/60 bg-accent/10 px-4 py-3">
      {warnings.map((warning) => (
        <p key={warning} className="text-sm font-semibold text-foreground">
          {warning}
        </p>
      ))}
    </div>
  );
}

export function BomTable({ lines }: { lines: EmBomLine[] }) {
  return (
    <div className="card overflow-hidden">
      <h3 className="border-b border-border px-4 py-3 text-sm font-bold">Bill of Materials</h3>
      <table className="w-full border-collapse text-sm">
        <thead className="text-left text-xs text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-2 text-center">Qty</th>
            <th className="px-2 py-2">Part Number</th>
            <th className="px-4 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={index} className="border-t border-border align-top">
              <td className="px-4 py-2 text-center font-bold text-primary">{line.quantity}</td>
              <td className="px-2 py-2 font-mono text-xs break-all">{line.catalogNumber || "—"}</td>
              <td className="px-4 py-2">{line.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SpecDetails({ specs }: { specs: SpecRow[] }) {
  return (
    <details className="card px-4 py-3">
      <summary className="cursor-pointer text-sm font-bold text-primary">
        Technical Details
      </summary>
      <dl className="mt-3 grid gap-2 text-sm">
        {specs.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-t border-border pt-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="max-w-[62%] text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export function ActionBar({
  baseName,
  exportPayload,
  onImport,
  svgRef,
  imageSize,
  bomLines,
  modelNumber,
}: {
  baseName: string;
  exportPayload: () => unknown;
  onImport: (payload: unknown) => string | null;
  svgRef: React.RefObject<SVGSVGElement | null>;
  imageSize: { width: number; height: number };
  bomLines: EmBomLine[];
  modelNumber: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filename = safeFilename(`${baseName}-${modelNumber}`);

  const handleImport = async (file: File) => {
    try {
      const payload = await readJsonFile(file);
      const error = onImport(payload);
      setMessage(error);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The file could not be imported.");
    }
  };

  const handleImage = async () => {
    if (!svgRef.current) return;
    try {
      await downloadSvgAsPng(svgRef.current, `${filename}.png`, imageSize.width, imageSize.height);
      setMessage(null);
    } catch {
      setMessage("The image could not be created.");
    }
  };

  const handleCsv = () => {
    downloadCsvFile(`${filename}-bom.csv`, [
      ["Model", modelNumber],
      [],
      ["Qty", "Part Number", "Description"],
      ...bomLines.map((line) => [line.quantity, line.catalogNumber, line.description]),
    ]);
  };

  return (
    <div className="card p-4">
      <h3 className="text-sm font-bold">Export</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => downloadJsonFile(`${filename}.json`, exportPayload())}
        >
          <FileDown className="size-4" /> Configuration
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="size-4" /> Import
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={handleImage}>
          <ImageIcon className="size-4" /> Image
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={handleCsv}>
          <Download className="size-4" /> BOM CSV
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="col-span-2"
          onClick={() => window.print()}
        >
          <Printer className="size-4" /> BOM PDF
        </Button>
      </div>
      {message ? (
        <p role="alert" className="mt-2 text-xs font-semibold text-danger">
          {message}
        </p>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImport(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export function PrintSheet({
  title,
  modelNumber,
  specs,
  bomLines,
}: {
  title: string;
  modelNumber: string;
  specs: SpecRow[];
  bomLines: EmBomLine[];
}) {
  return (
    <div className="print-sheet px-8 py-6 text-[13px] text-black">
      <div className="flex items-center justify-between border-b-2 border-[#005daa] pb-4">
        <Image src="/brand/logo-linear.svg" alt="Electro-Matic" width={200} height={51} />
        <div className="text-right">
          <p className="text-lg font-bold">{title}</p>
          <p className="font-mono">{modelNumber}</p>
        </div>
      </div>

      <h2 className="mt-6 mb-2 text-base font-bold text-[#005daa]">Bill of Materials</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-[#005daa] text-left">
            <th className="py-1 pr-4">Qty</th>
            <th className="py-1 pr-4">Part Number</th>
            <th className="py-1">Description</th>
          </tr>
        </thead>
        <tbody>
          {bomLines.map((line, index) => (
            <tr key={index} className="border-b border-gray-300 align-top">
              <td className="py-1 pr-4">{line.quantity}</td>
              <td className="py-1 pr-4 font-mono">{line.catalogNumber || "—"}</td>
              <td className="py-1">{line.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-6 mb-2 text-base font-bold text-[#005daa]">Technical Details</h2>
      <table className="w-full border-collapse">
        <tbody>
          {specs.map(([label, value]) => (
            <tr key={label} className="border-b border-gray-300">
              <td className="py-1 pr-4 text-gray-600">{label}</td>
              <td className="py-1 font-semibold">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-8 text-xs text-gray-500">
        Electro-Matic · electro-matic.com · Generated by the Electro-Matic configurator
      </p>
    </div>
  );
}
