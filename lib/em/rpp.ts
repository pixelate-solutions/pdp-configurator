import type { EmBomLine, Option, SpecRow } from "@/lib/em/types";

export type RppVoltage = "415/240" | "208/120";
export type RppDisconnect = "ND" | "MD";
export type RppTransformer = "TR0" | "TR1";
export type RppMonitoring = "PM0" | "PM1" | "PM2";
export type RppProtocol = "MOD" | "BAC" | "SNMP";
export type RppSccr = 10 | 25 | 65;
export type RppSurge = "SP0" | "SP200";

export const RPP_BREAKER_AMPS = [20, 30, 40, 50, 60, 100] as const;
export type RppBreakerAmp = (typeof RPP_BREAKER_AMPS)[number];

export type RppSelections = {
  kva: number;
  disconnect: RppDisconnect;
  inputVoltage: RppVoltage;
  outputVoltage: RppVoltage;
  deadfront: boolean;
  transformer: RppTransformer;
  breakerCounts: Record<RppBreakerAmp, number>;
  monitoring: RppMonitoring;
  protocol: RppProtocol;
  sccr: RppSccr;
  surge: RppSurge;
};

export const RPP_KVA_OPTIONS: Option<number>[] = [50, 75, 100, 125, 150, 175, 200, 225, 250].map(
  (kva) => ({ value: kva, label: `${kva} kVA` }),
);

export const RPP_VOLTAGE_OPTIONS: Option<RppVoltage>[] = [
  { value: "415/240", label: "415/240 V" },
  { value: "208/120", label: "208/120 V" },
];

export const RPP_DISCONNECT_OPTIONS: Option<RppDisconnect>[] = [
  { value: "MD", label: "Main Disconnect Handle" },
  { value: "ND", label: "No Disconnect Handle" },
];

export const RPP_TRANSFORMER_OPTIONS: Option<RppTransformer>[] = [
  { value: "TR0", label: "Direct Panelboard" },
  { value: "TR1", label: "Local Isolation Transformer" },
];

export const RPP_MONITORING_OPTIONS: Option<RppMonitoring>[] = [
  { value: "PM0", label: "None" },
  { value: "PM1", label: "Basic" },
  { value: "PM2", label: "Advanced + Comms" },
];

export const RPP_PROTOCOL_OPTIONS: Option<RppProtocol>[] = [
  { value: "MOD", label: "Modbus TCP/IP" },
  { value: "BAC", label: "BACnet IP" },
  { value: "SNMP", label: "SNMP" },
];

export const RPP_SCCR_OPTIONS: Option<RppSccr>[] = [
  { value: 10, label: "10 kA" },
  { value: 25, label: "25 kA" },
  { value: 65, label: "65 kA" },
];

export const RPP_SURGE_OPTIONS: Option<RppSurge>[] = [
  { value: "SP0", label: "None" },
  { value: "SP200", label: "200 kA SPD" },
];

export const DEFAULT_RPP_SELECTIONS: RppSelections = {
  kva: 100,
  disconnect: "MD",
  inputVoltage: "415/240",
  outputVoltage: "415/240",
  deadfront: true,
  transformer: "TR0",
  breakerCounts: { 20: 12, 30: 6, 40: 0, 50: 0, 60: 2, 100: 0 },
  monitoring: "PM1",
  protocol: "MOD",
  sccr: 65,
  surge: "SP0",
};

export function rppTotalPoles(sel: RppSelections) {
  return RPP_BREAKER_AMPS.reduce((sum, amp) => sum + sel.breakerCounts[amp], 0);
}

export function buildRppModelNumber(sel: RppSelections) {
  const segments = [
    "EMRPP",
    String(sel.kva),
    sel.disconnect,
    sel.inputVoltage,
    sel.outputVoltage,
    `P${rppTotalPoles(sel)}`,
    sel.transformer,
  ];
  if (sel.deadfront) segments.push("DF");
  segments.push(sel.monitoring);
  if (sel.monitoring === "PM2") segments.push(sel.protocol);
  segments.push(String(sel.sccr), sel.surge);
  return segments.join("-");
}

export function rppWarnings(sel: RppSelections): string[] {
  const warnings: string[] = [];
  if (sel.transformer === "TR0" && sel.inputVoltage !== sel.outputVoltage) {
    warnings.push("Voltage conversion requires the local isolation transformer.");
  }
  if (rppTotalPoles(sel) === 0) {
    warnings.push("Add at least one branch breaker.");
  }
  return warnings;
}

export function buildRppSpecs(sel: RppSelections): SpecRow[] {
  return [
    ["Input voltage", `${sel.inputVoltage} V`],
    ["Output voltage", `${sel.outputVoltage} V`],
    ["Capacity", `${sel.kva} kVA`],
    [
      "Transformer",
      sel.transformer === "TR1"
        ? "Local isolation transformer installed"
        : "None (direct panelboard)",
    ],
    ["Branch breakers", `${rppTotalPoles(sel)} poles total`],
    ["SCCR", `${sel.sccr} kA`],
    ["Application", "Remote power panel for server-rack row distribution, fed from a PDU"],
  ];
}

export function buildRppBom(sel: RppSelections): EmBomLine[] {
  const lines: EmBomLine[] = [
    {
      quantity: 1,
      catalogNumber: buildRppModelNumber(sel),
      description: `EMRPP ${sel.kva} kVA remote power panel, ${sel.inputVoltage} V input, ${sel.outputVoltage} V output`,
    },
  ];

  if (sel.transformer === "TR1") {
    lines.push({
      quantity: 1,
      catalogNumber: "",
      description: `${sel.kva} kVA local isolation transformer`,
    });
  }
  for (const amp of RPP_BREAKER_AMPS) {
    const count = sel.breakerCounts[amp];
    if (count > 0) {
      lines.push({
        quantity: count,
        catalogNumber: "",
        description: `${amp} A branch circuit breaker`,
      });
    }
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
              RPP_PROTOCOL_OPTIONS.find((option) => option.value === sel.protocol)?.label
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

export type RppExportFile = {
  product: "EMRPP";
  version: 1;
  model: string;
  selections: RppSelections;
};

export function buildRppExport(sel: RppSelections): RppExportFile {
  return { product: "EMRPP", version: 1, model: buildRppModelNumber(sel), selections: sel };
}

function oneOf<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function intIn(value: unknown, min: number, max: number, fallback: number) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < min || num > max) return fallback;
  return num;
}

export function parseRppExport(payload: unknown): RppSelections | null {
  if (!payload || typeof payload !== "object") return null;
  const file = payload as Partial<RppExportFile>;
  if (file.product !== "EMRPP" || !file.selections || typeof file.selections !== "object") {
    return null;
  }
  const sel = file.selections as Partial<RppSelections>;
  const defaults = DEFAULT_RPP_SELECTIONS;
  const counts = (sel.breakerCounts ?? {}) as Partial<Record<RppBreakerAmp, number>>;
  return {
    kva: oneOf(sel.kva, [50, 75, 100, 125, 150, 175, 200, 225, 250] as const, defaults.kva),
    disconnect: oneOf(sel.disconnect, ["ND", "MD"] as const, defaults.disconnect),
    inputVoltage: oneOf(sel.inputVoltage, ["415/240", "208/120"] as const, defaults.inputVoltage),
    outputVoltage: oneOf(sel.outputVoltage, ["415/240", "208/120"] as const, defaults.outputVoltage),
    deadfront: typeof sel.deadfront === "boolean" ? sel.deadfront : defaults.deadfront,
    transformer: oneOf(sel.transformer, ["TR0", "TR1"] as const, defaults.transformer),
    breakerCounts: Object.fromEntries(
      RPP_BREAKER_AMPS.map((amp) => [amp, intIn(counts[amp], 0, 24, 0)]),
    ) as Record<RppBreakerAmp, number>,
    monitoring: oneOf(sel.monitoring, ["PM0", "PM1", "PM2"] as const, defaults.monitoring),
    protocol: oneOf(sel.protocol, ["MOD", "BAC", "SNMP"] as const, defaults.protocol),
    sccr: oneOf(sel.sccr, [10, 25, 65] as const, defaults.sccr),
    surge: oneOf(sel.surge, ["SP0", "SP200"] as const, defaults.surge),
  };
}
