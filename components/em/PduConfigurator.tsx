"use client";

import { useRef, useState } from "react";
import {
  DEFAULT_PDU_SELECTIONS,
  PDU_BRANCH_FRAME_OPTIONS,
  PDU_DISCONNECT_OPTIONS,
  PDU_INFEED_OPTIONS,
  PDU_KVA_OPTIONS,
  PDU_MONITORING_OPTIONS,
  PDU_OUTPUT_OPTIONS,
  PDU_PROTOCOL_OPTIONS,
  PDU_SCCR_OPTIONS,
  PDU_SURGE_OPTIONS,
  PDU_TRIP_OPTIONS,
  buildPduBom,
  buildPduExport,
  buildPduModelNumber,
  buildPduSpecs,
  parsePduExport,
  pduWarnings,
  type PduSelections,
} from "@/lib/em/pdu";
import { PDU_IMAGE_SIZE, PduGraphic } from "@/components/em/graphics";
import { CountSelect, OptionButtons, YesNoButtons } from "@/components/em/fields";
import {
  ActionBar,
  BomTable,
  ModelNumberCard,
  PrintSheet,
  SpecDetails,
  WarningList,
} from "@/components/em/summary";

const COUNTS = Array.from({ length: 17 }, (_, index) => index);

export function PduConfigurator() {
  const [sel, setSel] = useState<PduSelections>(DEFAULT_PDU_SELECTIONS);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const set = <K extends keyof PduSelections>(key: K, value: PduSelections[K]) =>
    setSel((current) => ({ ...current, [key]: value }));

  const model = buildPduModelNumber(sel);
  const bom = buildPduBom(sel);
  const specs = buildPduSpecs(sel);
  const warnings = pduWarnings(sel);

  return (
    <>
      <div className="no-print mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <h1 className="text-3xl font-bold">Power Distribution Units</h1>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="card grid gap-6 p-5">
            <OptionButtons label="Capacity" options={PDU_KVA_OPTIONS} value={sel.kva} onChange={(v) => set("kva", v)} />
            <OptionButtons label="Output Voltage" options={PDU_OUTPUT_OPTIONS} value={sel.outputVoltage} onChange={(v) => set("outputVoltage", v)} columns={2} />
            <OptionButtons label="SCCR Rating" options={PDU_SCCR_OPTIONS} value={sel.sccr} onChange={(v) => set("sccr", v)} />
            <OptionButtons label="Main Disconnect" options={PDU_DISCONNECT_OPTIONS} value={sel.disconnect} onChange={(v) => set("disconnect", v)} columns={2} />
            <OptionButtons label="Infeed Entry" options={PDU_INFEED_OPTIONS} value={sel.infeed} onChange={(v) => set("infeed", v)} columns={2} />
            <YesNoButtons label="Deadfront Panel" value={sel.deadfront} onChange={(v) => set("deadfront", v)} />
            <OptionButtons label="Branch Trip Unit" options={PDU_TRIP_OPTIONS} value={sel.tripUnit} onChange={(v) => set("tripUnit", v)} />

            <div className="grid grid-cols-[1fr_100px] items-end gap-3">
              <OptionButtons label="Branch Group 1" options={PDU_BRANCH_FRAME_OPTIONS} value={sel.branch1Frame} onChange={(v) => set("branch1Frame", v)} columns={4} />
              <CountSelect label="Qty" counts={COUNTS} value={sel.branch1Qty} onChange={(v) => set("branch1Qty", v)} />
            </div>
            <div className="grid grid-cols-[1fr_100px] items-end gap-3">
              <OptionButtons label="Branch Group 2" options={PDU_BRANCH_FRAME_OPTIONS} value={sel.branch2Frame} onChange={(v) => set("branch2Frame", v)} columns={4} />
              <CountSelect label="Qty" counts={COUNTS} value={sel.branch2Qty} onChange={(v) => set("branch2Qty", v)} />
            </div>

            <OptionButtons label="Power Monitoring" options={PDU_MONITORING_OPTIONS} value={sel.monitoring} onChange={(v) => set("monitoring", v)} />
            <OptionButtons label="Communication Protocol" options={PDU_PROTOCOL_OPTIONS} value={sel.protocol} onChange={(v) => set("protocol", v)} disabled={sel.monitoring !== "PM2"} />
            <OptionButtons label="Surge Protection" options={PDU_SURGE_OPTIONS} value={sel.surge} onChange={(v) => set("surge", v)} columns={2} />
          </div>

          <div className="grid gap-4">
            <div className="card p-4">
              <PduGraphic sel={sel} svgRef={svgRef} />
            </div>
            <WarningList warnings={warnings} />
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div className="grid gap-4">
                <ModelNumberCard model={model} />
                <ActionBar
                  baseName="empdu"
                  exportPayload={() => buildPduExport(sel)}
                  onImport={(payload) => {
                    const parsed = parsePduExport(payload);
                    if (!parsed) return "This file is not an EMPDU configuration.";
                    setSel(parsed);
                    return null;
                  }}
                  svgRef={svgRef}
                  imageSize={PDU_IMAGE_SIZE}
                  bomLines={bom}
                  modelNumber={model}
                />
              </div>
              <SpecDetails specs={specs} />
            </div>
            <BomTable lines={bom} />
          </div>
        </div>
      </div>
      <PrintSheet title="Power Distribution Unit" modelNumber={model} specs={specs} bomLines={bom} />
    </>
  );
}
