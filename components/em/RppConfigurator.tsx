"use client";

import { useRef, useState } from "react";
import {
  DEFAULT_RPP_SELECTIONS,
  RPP_BREAKER_AMPS,
  RPP_DISCONNECT_OPTIONS,
  RPP_KVA_OPTIONS,
  RPP_MONITORING_OPTIONS,
  RPP_PROTOCOL_OPTIONS,
  RPP_SCCR_OPTIONS,
  RPP_SURGE_OPTIONS,
  RPP_TRANSFORMER_OPTIONS,
  RPP_VOLTAGE_OPTIONS,
  buildRppBom,
  buildRppExport,
  buildRppModelNumber,
  buildRppSpecs,
  parseRppExport,
  rppWarnings,
  type RppSelections,
} from "@/lib/em/rpp";
import { RPP_IMAGE_SIZE, RppGraphic } from "@/components/em/graphics";
import { CountSelect, OptionButtons, SelectField, YesNoButtons } from "@/components/em/fields";
import {
  ActionBar,
  BomTable,
  ModelNumberCard,
  PrintSheet,
  SpecDetails,
  WarningList,
} from "@/components/em/summary";

const COUNTS = Array.from({ length: 25 }, (_, index) => index);

export function RppConfigurator() {
  const [sel, setSel] = useState<RppSelections>(DEFAULT_RPP_SELECTIONS);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const set = <K extends keyof RppSelections>(key: K, value: RppSelections[K]) =>
    setSel((current) => ({ ...current, [key]: value }));

  const model = buildRppModelNumber(sel);
  const bom = buildRppBom(sel);
  const specs = buildRppSpecs(sel);
  const warnings = rppWarnings(sel);

  return (
    <>
      <div className="no-print mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <h1 className="text-3xl font-bold">Remote Power Panels</h1>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="card grid gap-6 p-5">
            <SelectField
              label="Capacity"
              options={RPP_KVA_OPTIONS.map((option) => ({ value: String(option.value), label: option.label }))}
              value={String(sel.kva)}
              onChange={(v) => set("kva", Number(v))}
            />
            <OptionButtons label="Input Voltage" options={RPP_VOLTAGE_OPTIONS} value={sel.inputVoltage} onChange={(v) => set("inputVoltage", v)} columns={2} />
            <OptionButtons label="Output Voltage" options={RPP_VOLTAGE_OPTIONS} value={sel.outputVoltage} onChange={(v) => set("outputVoltage", v)} columns={2} />
            <OptionButtons label="Transformer" options={RPP_TRANSFORMER_OPTIONS} value={sel.transformer} onChange={(v) => set("transformer", v)} columns={2} />
            <OptionButtons label="Main Disconnect" options={RPP_DISCONNECT_OPTIONS} value={sel.disconnect} onChange={(v) => set("disconnect", v)} columns={2} />
            <YesNoButtons label="Deadfront Panel" value={sel.deadfront} onChange={(v) => set("deadfront", v)} />

            <div>
              <h3 className="text-sm font-bold">Branch Breakers</h3>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {RPP_BREAKER_AMPS.map((amp) => (
                  <CountSelect
                    key={amp}
                    label={`${amp} A`}
                    counts={COUNTS}
                    value={sel.breakerCounts[amp]}
                    onChange={(count) =>
                      set("breakerCounts", { ...sel.breakerCounts, [amp]: count })
                    }
                  />
                ))}
              </div>
            </div>

            <OptionButtons label="SCCR Rating" options={RPP_SCCR_OPTIONS} value={sel.sccr} onChange={(v) => set("sccr", v)} />
            <OptionButtons label="Power Monitoring" options={RPP_MONITORING_OPTIONS} value={sel.monitoring} onChange={(v) => set("monitoring", v)} />
            <OptionButtons label="Communication Protocol" options={RPP_PROTOCOL_OPTIONS} value={sel.protocol} onChange={(v) => set("protocol", v)} disabled={sel.monitoring !== "PM2"} />
            <OptionButtons label="Surge Protection" options={RPP_SURGE_OPTIONS} value={sel.surge} onChange={(v) => set("surge", v)} columns={2} />
          </div>

          <div className="grid gap-4">
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div className="card p-4">
                <RppGraphic sel={sel} svgRef={svgRef} />
              </div>
              <div className="grid gap-4">
                <ModelNumberCard model={model} />
                <WarningList warnings={warnings} />
                <ActionBar
                  baseName="emrpp"
                  exportPayload={() => buildRppExport(sel)}
                  onImport={(payload) => {
                    const parsed = parseRppExport(payload);
                    if (!parsed) return "This file is not an EMRPP configuration.";
                    setSel(parsed);
                    return null;
                  }}
                  svgRef={svgRef}
                  imageSize={RPP_IMAGE_SIZE}
                  bomLines={bom}
                  modelNumber={model}
                />
                <SpecDetails specs={specs} />
              </div>
            </div>
            <BomTable lines={bom} />
          </div>
        </div>
      </div>
      <PrintSheet title="Remote Power Panel" modelNumber={model} specs={specs} bomLines={bom} />
    </>
  );
}
