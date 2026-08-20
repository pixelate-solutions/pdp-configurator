import type { EmBomLine, Option, SpecRow } from "@/lib/em/types";

export type PduKva = 500 | 750 | 1000;
export type PduSccr = 10 | 25 | 65;
export type PduDisconnect = "ND" | "MD";
export type PduInfeed = "T" | "B";
export type PduOutputVoltage = "415/240" | "208/120";
export type PduTripUnit = "LI" | "LSI" | "LSIG";
export type PduBranchFrame = "A" | "B" | "C" | "D";
export type PduMonitoring = "PM0" | "PM1" | "PM2";
export type PduProtocol = "MOD" | "BAC" | "SNMP";
export type PduSurge = "SP0" | "SP200";

export type PduSelections = {
  kva: PduKva;
  sccr: PduSccr;
  disconnect: PduDisconnect;
  infeed: PduInfeed;
  deadfront: boolean;
  outputVoltage: PduOutputVoltage;
  tripUnit: PduTripUnit;
  branch1Frame: PduBranchFrame;
  branch1Qty: number;
  branch2Frame: PduBranchFrame;
  branch2Qty: number;
  monitoring: PduMonitoring;
  protocol: PduProtocol;
  surge: PduSurge;
};

export const PDU_KVA_OPTIONS: Option<PduKva>[] = [
  { value: 500, label: "500 kVA" },
  { value: 750, label: "750 kVA" },
  { value: 1000, label: "1000 kVA" },
];

export const PDU_SCCR_OPTIONS: Option<PduSccr>[] = [
  { value: 10, label: "10 kA" },
  { value: 25, label: "25 kA" },
  { value: 65, label: "65 kA" },
];

export const PDU_DISCONNECT_OPTIONS: Option<PduDisconnect>[] = [
  { value: "MD", label: "Main Disconnect Handle" },
  { value: "ND", label: "No Disconnect Handle" },
];

export const PDU_INFEED_OPTIONS: Option<PduInfeed>[] = [
  { value: "T", label: "Top Feed" },
  { value: "B", label: "Bottom Feed" },
];

export const PDU_OUTPUT_OPTIONS: Option<PduOutputVoltage>[] = [
  { value: "415/240", label: "415/240 V" },
  { value: "208/120", label: "208/120 V" },
];

export const PDU_TRIP_OPTIONS: Option<PduTripUnit>[] = [
  { value: "LI", label: "LI" },
  { value: "LSI", label: "LSI" },
  { value: "LSIG", label: "LSIG" },
];

export const PDU_BRANCH_FRAME_OPTIONS: Option<PduBranchFrame>[] = [
  { value: "A", label: "250 A" },
  { value: "B", label: "400 A" },
  { value: "C", label: "600 A" },
  { value: "D", label: "800 A" },
];

export const PDU_MONITORING_OPTIONS: Option<PduMonitoring>[] = [
  { value: "PM0", label: "None" },
  { value: "PM1", label: "Basic" },
  { value: "PM2", label: "Advanced + Comms" },
];

export const PDU_PROTOCOL_OPTIONS: Option<PduProtocol>[] = [
  { value: "MOD", label: "Modbus TCP/IP" },
  { value: "BAC", label: "BACnet IP" },
  { value: "SNMP", label: "SNMP" },
];

export const PDU_SURGE_OPTIONS: Option<PduSurge>[] = [
  { value: "SP0", label: "None" },
  { value: "SP200", label: "200 kA SPD" },
];

export const PDU_BRANCH_FRAME_AMPS: Record<PduBranchFrame, number> = {
  A: 250,
  B: 400,
  C: 600,
  D: 800,
};

type PduFixedSpecs = {
  mainBreakerAmps: number;
  inputFla: number;
  continuousSizing: number;
  secondaryFla415: number;
  secondaryFla208: number;
};

export const PDU_FIXED_SPECS: Record<PduKva, PduFixedSpecs> = {
  500: { mainBreakerAmps: 800, inputFla: 601, continuousSizing: 751, secondaryFla415: 696, secondaryFla208: 1388 },
  750: { mainBreakerAmps: 1200, inputFla: 902, continuousSizing: 1128, secondaryFla415: 1043, secondaryFla208: 2082 },
  1000: { mainBreakerAmps: 1600, inputFla: 1203, continuousSizing: 1504, secondaryFla415: 1391, secondaryFla208: 2776 },
};

export const DEFAULT_PDU_SELECTIONS: PduSelections = {
  kva: 500,
  sccr: 65,
  disconnect: "MD",
  infeed: "T",
  deadfront: true,
  outputVoltage: "415/240",
  tripUnit: "LSIG",
  branch1Frame: "A",
  branch1Qty: 6,
  branch2Frame: "D",
  branch2Qty: 0,
  monitoring: "PM2",
  protocol: "MOD",
  surge: "SP200",
};

export function buildPduModelNumber(sel: PduSelections) {
  const segments = [
    "EMPDU",
    String(sel.kva),
    String(sel.sccr),
    sel.disconnect,
    sel.infeed,
  ];
  if (sel.deadfront) segments.push("DF");
  segments.push(sel.outputVoltage, sel.tripUnit);
  if (sel.branch1Qty > 0) segments.push(`${sel.branch1Frame}${sel.branch1Qty}`);
  if (sel.branch2Qty > 0) segments.push(`${sel.branch2Frame}${sel.branch2Qty}`);
  segments.push(sel.monitoring);
  if (sel.monitoring === "PM2") segments.push(sel.protocol);
  segments.push(sel.surge);
  return segments.join("-");
}

export function pduSecondaryFla(sel: PduSelections) {
  const specs = PDU_FIXED_SPECS[sel.kva];
  return sel.outputVoltage === "415/240" ? specs.secondaryFla415 : specs.secondaryFla208;
}

export function pduBranchTotalAmps(sel: PduSelections) {
  return (
    PDU_BRANCH_FRAME_AMPS[sel.branch1Frame] * sel.branch1Qty +
    PDU_BRANCH_FRAME_AMPS[sel.branch2Frame] * sel.branch2Qty
  );
}

export function pduWarnings(sel: PduSelections): string[] {
  const warnings: string[] = [];
  if (sel.branch1Qty + sel.branch2Qty === 0) {
    warnings.push("Add at least one branch breaker.");
  }
  return warnings;
}

export function buildPduSpecs(sel: PduSelections): SpecRow[] {
  const specs = PDU_FIXED_SPECS[sel.kva];
  const transformerType =
    sel.outputVoltage === "415/240"
      ? "Autotransformer"
      : "Full isolation delta-wye (K-13, K-20 optional)";

  return [
    ["Input voltage", "480 VAC 3-phase, 3-wire + ground"],
    ["Output voltage", `${sel.outputVoltage} V, 4-wire + ground`],
    ["Transformer", `${sel.kva} kVA ${transformerType}`],
    ["Transformer windings", "Al or Cu, DOE 2016, 150°C rise"],
    ["Main disconnect breaker", `${specs.mainBreakerAmps} A Siemens 3WA draw-out with ETU`],
    ["Typical input FLA (480 V)", `${specs.inputFla} A`],
    ["125% continuous load sizing", `${specs.continuousSizing} A`],
    ["Secondary FLA", `${pduSecondaryFla(sel)} A`],
    ["Branch breakers", "Siemens 3VA6 with ETU 8-series power monitoring"],
    ["Branch trip unit", sel.tripUnit],
    ["SCCR", `${sel.sccr} kA`],
    ["Listing", "UL 891 switchboard"],
    ["Harmonics rating", "K-13 standard, K-20 optional"],
  ];
}

export function buildPduBom(sel: PduSelections): EmBomLine[] {
  const specs = PDU_FIXED_SPECS[sel.kva];
  const lines: EmBomLine[] = [
    {
      quantity: 1,
      catalogNumber: buildPduModelNumber(sel),
      description: `EMPDU ${sel.kva} kVA power distribution unit, 480 VAC input, ${sel.outputVoltage} V output`,
    },
    {
      quantity: 1,
      catalogNumber: "",
      description: `Siemens 3WA ${specs.mainBreakerAmps} A draw-out main breaker with ETU`,
    },
    {
      quantity: 1,
      catalogNumber: "",
      description:
        sel.outputVoltage === "415/240"
          ? `${sel.kva} kVA autotransformer`
          : `${sel.kva} kVA full-isolation delta-wye transformer (K-13)`,
    },
  ];

  if (sel.branch1Qty > 0) {
    lines.push({
      quantity: sel.branch1Qty,
      catalogNumber: "",
      description: `Siemens 3VA6 branch breaker, ${PDU_BRANCH_FRAME_AMPS[sel.branch1Frame]} A, ETU 8-series (${sel.tripUnit})`,
    });
  }
  if (sel.branch2Qty > 0) {
    lines.push({
      quantity: sel.branch2Qty,
      catalogNumber: "",
      description: `Siemens 3VA6 branch breaker, ${PDU_BRANCH_FRAME_AMPS[sel.branch2Frame]} A, ETU 8-series (${sel.tripUnit})`,
    });
  }
  if (sel.disconnect === "MD") {
    lines.push({ quantity: 1, catalogNumber: "", description: "Main disconnect handle, lockable" });
  }
  if (sel.deadfront) {
    lines.push({ quantity: 1, catalogNumber: "", description: "Deadfront safety panel" });
  }
  if (sel.monitoring !== "PM0") {
    lines.push({
      quantity: 1,
      catalogNumber: "",
      description:
        sel.monitoring === "PM1"
          ? "Basic power monitoring package"
          : `Advanced power monitoring package with ${
              PDU_PROTOCOL_OPTIONS.find((option) => option.value === sel.protocol)?.label
            } communications`,
    });
  }
  if (sel.surge === "SP200") {
    lines.push({
      quantity: 1,
      catalogNumber: "",
      description: "Integrated 200 kA transient surge protection device",
    });
  }
  return lines;
}

export type PduExportFile = {
  product: "EMPDU";
  version: 1;
  model: string;
  selections: PduSelections;
};

export function buildPduExport(sel: PduSelections): PduExportFile {
  return { product: "EMPDU", version: 1, model: buildPduModelNumber(sel), selections: sel };
}

function oneOf<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function intIn(value: unknown, min: number, max: number, fallback: number) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < min || num > max) return fallback;
  return num;
}

export function parsePduExport(payload: unknown): PduSelections | null {
  if (!payload || typeof payload !== "object") return null;
  const file = payload as Partial<PduExportFile>;
  if (file.product !== "EMPDU" || !file.selections || typeof file.selections !== "object") {
    return null;
  }
  const sel = file.selections as Partial<PduSelections>;
  const defaults = DEFAULT_PDU_SELECTIONS;
  return {
    kva: oneOf(sel.kva, [500, 750, 1000] as const, defaults.kva),
    sccr: oneOf(sel.sccr, [10, 25, 65] as const, defaults.sccr),
    disconnect: oneOf(sel.disconnect, ["ND", "MD"] as const, defaults.disconnect),
    infeed: oneOf(sel.infeed, ["T", "B"] as const, defaults.infeed),
    deadfront: typeof sel.deadfront === "boolean" ? sel.deadfront : defaults.deadfront,
    outputVoltage: oneOf(sel.outputVoltage, ["415/240", "208/120"] as const, defaults.outputVoltage),
    tripUnit: oneOf(sel.tripUnit, ["LI", "LSI", "LSIG"] as const, defaults.tripUnit),
    branch1Frame: oneOf(sel.branch1Frame, ["A", "B", "C", "D"] as const, defaults.branch1Frame),
    branch1Qty: intIn(sel.branch1Qty, 0, 16, defaults.branch1Qty),
    branch2Frame: oneOf(sel.branch2Frame, ["A", "B", "C", "D"] as const, defaults.branch2Frame),
    branch2Qty: intIn(sel.branch2Qty, 0, 16, defaults.branch2Qty),
    monitoring: oneOf(sel.monitoring, ["PM0", "PM1", "PM2"] as const, defaults.monitoring),
    protocol: oneOf(sel.protocol, ["MOD", "BAC", "SNMP"] as const, defaults.protocol),
    surge: oneOf(sel.surge, ["SP0", "SP200"] as const, defaults.surge),
  };
}
