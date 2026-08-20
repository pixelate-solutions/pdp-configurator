"use client";

import { useRef, useState } from "react";
import {
  CONTROL_FRAME_CONFIG,
  CONTROL_FRAME_OPTIONS,
  CONTROL_KNOCKOUT_OPTIONS,
  DC_CODE_LABELS,
  DEFAULT_CONTROL_SELECTIONS,
  DEFAULT_WELD_SELECTIONS,
  E2_CODE_LABELS,
  PDP_CERT_OPTIONS,
  PDP_LANGUAGE_OPTIONS,
  PDP_VOLTAGE_OPTIONS,
  WELD_BRANCH_AMP_VALUES,
  WELD_FRAME_OPTIONS,
  WELD_KNOCKOUT_OPTIONS,
  buildControlBom,
  buildControlModelNumber,
  buildControlSpecs,
  buildPdpExport,
  buildWeldBom,
  buildWeldModelNumber,
  buildWeldSpecs,
  controlWarnings,
  parsePdpExport,
  weldSizeGroups,
  weldWarnings,
  type ControlSelections,
  type PdpFamily,
  type WeldBranchAmp,
  type WeldSelections,
} from "@/lib/em/pdp";
import {
  CONTROL_PDP_IMAGE_SIZE,
  ControlPdpGraphic,
  WELD_PDP_IMAGE_SIZE,
  WeldPdpGraphic,
} from "@/components/em/graphics";
import { CountSelect, OptionButtons, SelectField, YesNoButtons } from "@/components/em/fields";
import {
  ActionBar,
  BomTable,
  ModelNumberCard,
  PrintSheet,
  SpecDetails,
  WarningList,
} from "@/components/em/summary";

const GROUP_LABELS: Record<string, string> = {
  size1: "Branch Group 1",
  size2: "Branch Group 2",
  size3: "Branch Group 3",
};

export function PdpConfigurator() {
  const [family, setFamily] = useState<PdpFamily>("weld");
  const [weld, setWeld] = useState<WeldSelections>(DEFAULT_WELD_SELECTIONS);
  const [control, setControl] = useState<ControlSelections>(DEFAULT_CONTROL_SELECTIONS);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const setW = <K extends keyof WeldSelections>(key: K, value: WeldSelections[K]) =>
    setWeld((current) => {
      const next = { ...current, [key]: value };
      if (key === "frame") {
        for (const group of weldSizeGroups(next.frame)) {
          const qtyKey = `${group.key}Qty` as const;
          if (!group.counts.includes(next[qtyKey])) {
            next[qtyKey] = group.counts[group.counts.length - 1];
          }
        }
        if (next.frame === 200) {
          next.size3Amp = "0";
          next.size3Qty = 0;
        }
      }
      return next;
    });
  const setC = <K extends keyof ControlSelections>(key: K, value: ControlSelections[K]) =>
    setControl((current) => {
      const next = { ...current, [key]: value };
      if (key === "frame") {
        const config = CONTROL_FRAME_CONFIG[next.frame];
        if (!config.branch30Counts.includes(next.branch30Qty)) {
          next.branch30Qty = config.branch30Counts[0];
        }
        if (!config.largeOptions.some((option) => option.code === next.largeCode)) {
          next.largeCode = "0";
        }
        if (!config.e2Codes.includes(next.e2Code)) next.e2Code = "000";
        if (config.dcCodes.length === 0 || !config.dcCodes.includes(next.dcCode)) {
          next.dcCode = "000";
        }
      }
      return next;
    });

  const isWeld = family === "weld";
  const sel = isWeld ? weld : control;
  const model = isWeld ? buildWeldModelNumber(weld) : buildControlModelNumber(control);
  const bom = isWeld ? buildWeldBom(weld) : buildControlBom(control);
  const specs = isWeld ? buildWeldSpecs(weld) : buildControlSpecs(control);
  const warnings = isWeld ? weldWarnings(weld) : controlWarnings(control);
  const controlConfig = CONTROL_FRAME_CONFIG[control.frame];

  return (
    <>
      <div className="no-print mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <h1 className="text-3xl font-bold">Power Distribution Panels</h1>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="card grid gap-6 p-5">
            <OptionButtons<PdpFamily>
              label="Panel Type"
              options={[
                { value: "weld", label: "Weld PDP" },
                { value: "control", label: "Control PDP" },
              ]}
              value={family}
              onChange={setFamily}
              columns={2}
            />

            {isWeld ? (
              <>
                <OptionButtons label="Main Breaker" options={WELD_FRAME_OPTIONS} value={weld.frame} onChange={(v) => setW("frame", v)} />
                <OptionButtons label="Incoming Voltage" options={PDP_VOLTAGE_OPTIONS} value={weld.voltage} onChange={(v) => setW("voltage", v)} columns={4} />
                <OptionButtons label="Certification" options={PDP_CERT_OPTIONS} value={weld.cert} onChange={(v) => setW("cert", v)} />
                <SelectField
                  label="Label Language"
                  options={PDP_LANGUAGE_OPTIONS}
                  value={weld.language}
                  onChange={(v) => setW("language", v as WeldSelections["language"])}
                />
                {weldSizeGroups(weld.frame).map((group) => {
                  const ampKey = `${group.key}Amp` as const;
                  const qtyKey = `${group.key}Qty` as const;
                  return (
                    <div key={group.key} className="grid grid-cols-[1fr_100px] items-end gap-3">
                      <SelectField
                        label={GROUP_LABELS[group.key]}
                        options={group.amps.map((amp) => ({
                          value: amp,
                          label: amp === "0" ? "None" : `${WELD_BRANCH_AMP_VALUES[amp as Exclude<WeldBranchAmp, "0">]} A`,
                        }))}
                        value={weld[ampKey]}
                        onChange={(v) => setW(ampKey, v as WeldBranchAmp)}
                      />
                      <CountSelect
                        label="Qty"
                        counts={group.counts}
                        value={weld[qtyKey]}
                        onChange={(v) => setW(qtyKey, v)}
                        disabled={weld[ampKey] === "0"}
                      />
                    </div>
                  );
                })}
                <OptionButtons label="Branch Feed Knockouts" options={WELD_KNOCKOUT_OPTIONS} value={weld.knockout} onChange={(v) => setW("knockout", v)} columns={2} />
              </>
            ) : (
              <>
                <OptionButtons label="Main Breaker" options={CONTROL_FRAME_OPTIONS} value={control.frame} onChange={(v) => setC("frame", v)} columns={4} />
                <OptionButtons label="Incoming Voltage" options={PDP_VOLTAGE_OPTIONS} value={control.voltage} onChange={(v) => setC("voltage", v)} columns={4} />
                <OptionButtons label="Certification" options={PDP_CERT_OPTIONS} value={control.cert} onChange={(v) => setC("cert", v)} />
                <SelectField
                  label="Label Language"
                  options={PDP_LANGUAGE_OPTIONS}
                  value={control.language}
                  onChange={(v) => setC("language", v as ControlSelections["language"])}
                />
                <CountSelect
                  label="30 A Branch Breakers"
                  counts={controlConfig.branch30Counts}
                  value={control.branch30Qty}
                  onChange={(v) => setC("branch30Qty", v)}
                />
                <SelectField
                  label="Larger Branch Breakers"
                  options={controlConfig.largeOptions.map((option) => ({
                    value: option.code,
                    label: option.label,
                  }))}
                  value={control.largeCode}
                  onChange={(v) => setC("largeCode", v)}
                />
                <YesNoButtons
                  label={`Isolation Transformer (${controlConfig.isoKva} kVA)`}
                  value={control.isoTransformer}
                  onChange={(v) => setC("isoTransformer", v)}
                />
                <SelectField
                  label="Control Transformer"
                  options={controlConfig.e2Codes.map((code) => ({
                    value: code,
                    label: E2_CODE_LABELS[code] ?? code,
                  }))}
                  value={control.e2Code}
                  onChange={(v) => setC("e2Code", v)}
                />
                {controlConfig.dcCodes.length > 0 ? (
                  <SelectField
                    label="24 VDC Power"
                    options={controlConfig.dcCodes.map((code) => ({
                      value: code,
                      label: DC_CODE_LABELS[code] ?? code,
                    }))}
                    value={control.dcCode}
                    onChange={(v) => setC("dcCode", v)}
                  />
                ) : null}
                <OptionButtons label="Branch Feed Knockouts" options={CONTROL_KNOCKOUT_OPTIONS} value={control.knockout} onChange={(v) => setC("knockout", v)} columns={3} />
              </>
            )}
          </div>

          <div className="grid gap-4">
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div className="card p-4">
                {isWeld ? (
                  <WeldPdpGraphic sel={weld} svgRef={svgRef} />
                ) : (
                  <ControlPdpGraphic sel={control} svgRef={svgRef} />
                )}
              </div>
              <div className="grid gap-4">
                <ModelNumberCard model={model} />
                <WarningList warnings={warnings} />
                <ActionBar
                  baseName={isWeld ? "weld-pdp" : "control-pdp"}
                  exportPayload={() => buildPdpExport(family, sel)}
                  onImport={(payload) => {
                    const parsed = parsePdpExport(payload);
                    if (!parsed) return "This file is not a PDP configuration.";
                    setFamily(parsed.family);
                    if (parsed.family === "weld") setWeld(parsed.selections);
                    else setControl(parsed.selections);
                    return null;
                  }}
                  svgRef={svgRef}
                  imageSize={isWeld ? WELD_PDP_IMAGE_SIZE : CONTROL_PDP_IMAGE_SIZE}
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
      <PrintSheet
        title={isWeld ? "Weld Power Distribution Panel" : "Control Power Distribution Panel"}
        modelNumber={model}
        specs={specs}
        bomLines={bom}
      />
    </>
  );
}
