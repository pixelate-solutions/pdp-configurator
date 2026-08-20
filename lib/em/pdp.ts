import type { EmBomLine, Option, SpecRow } from "@/lib/em/types";

export type PdpFamily = "weld" | "control";
export type PdpCert = "A" | "C" | "E";
export type PdpLanguage = "1" | "2" | "3" | "4" | "5" | "6" | "7";
export type PdpVoltage = "A" | "B" | "C" | "D";
export type WeldFrame = 200 | 400 | 600;
export type ControlFrame = 60 | 100 | 200 | 400;
export type WeldBranchAmp = "0" | "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type PdpKnockout = "T" | "B" | "N";

export const PDP_CERT_OPTIONS: Option<PdpCert>[] = [
  { value: "A", label: "UL508A" },
  { value: "C", label: "cUL508A" },
  { value: "E", label: "CE" },
];

export const PDP_LANGUAGE_OPTIONS: Option<PdpLanguage>[] = [
  { value: "1", label: "English" },
  { value: "2", label: "Spanish" },
  { value: "3", label: "German" },
  { value: "4", label: "French" },
  { value: "5", label: "Portuguese" },
  { value: "6", label: "Russian" },
  { value: "7", label: "Romanian" },
];

export const PDP_VOLTAGE_OPTIONS: Option<PdpVoltage>[] = [
  { value: "A", label: "480 VAC" },
  { value: "B", label: "415 VAC" },
  { value: "C", label: "400 VAC" },
  { value: "D", label: "380 VAC" },
];

export const PDP_VOLTAGE_LABELS: Record<PdpVoltage, string> = {
  A: "480 VAC",
  B: "415 VAC",
  C: "400 VAC",
  D: "380 VAC",
};

export const WELD_BRANCH_AMP_VALUES: Record<Exclude<WeldBranchAmp, "0">, number> = {
  A: 50,
  B: 60,
  C: 80,
  D: 100,
  E: 125,
  F: 150,
  G: 175,
};

// ---------------------------------------------------------------------------
// Weld PDP
// ---------------------------------------------------------------------------

export type WeldSelections = {
  frame: WeldFrame;
  cert: PdpCert;
  language: PdpLanguage;
  voltage: PdpVoltage;
  size1Amp: WeldBranchAmp;
  size1Qty: number;
  size2Amp: WeldBranchAmp;
  size2Qty: number;
  size3Amp: WeldBranchAmp;
  size3Qty: number;
  knockout: Exclude<PdpKnockout, "N">;
};

export const WELD_FRAME_OPTIONS: Option<WeldFrame>[] = [
  { value: 200, label: "200 A" },
  { value: 400, label: "400 A" },
  { value: 600, label: "600 A" },
];

export const DEFAULT_WELD_SELECTIONS: WeldSelections = {
  frame: 400,
  cert: "A",
  language: "1",
  voltage: "A",
  size1Amp: "D",
  size1Qty: 16,
  size2Amp: "0",
  size2Qty: 0,
  size3Amp: "0",
  size3Qty: 0,
  knockout: "T",
};

export function weldMaxBreakers(frame: WeldFrame) {
  return frame === 200 ? 8 : 16;
}

export function weldSizeGroups(frame: WeldFrame) {
  if (frame === 200) {
    return [
      { key: "size1" as const, amps: ["A", "B", "C", "D"] as WeldBranchAmp[], counts: range(0, 8) },
      { key: "size2" as const, amps: ["A", "B", "C", "D", "E"] as WeldBranchAmp[], counts: range(0, 4) },
    ];
  }
  return [
    { key: "size1" as const, amps: ["A", "B", "C", "D"] as WeldBranchAmp[], counts: [0, ...range(4, 16)] },
    { key: "size2" as const, amps: ["A", "B", "C", "D", "E"] as WeldBranchAmp[], counts: [0, ...range(4, 16)] },
    { key: "size3" as const, amps: ["A", "B", "C", "D", "E", "F", "G"] as WeldBranchAmp[], counts: range(0, 4) },
  ];
}

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

export function weldTotalBreakers(sel: WeldSelections) {
  return sel.size1Qty + sel.size2Qty + sel.size3Qty;
}

export function weldWarnings(sel: WeldSelections): string[] {
  const warnings: string[] = [];
  const max = weldMaxBreakers(sel.frame);
  const total = weldTotalBreakers(sel);
  if (total > max) {
    warnings.push(`Maximum ${max} branch breakers on the ${sel.frame} A frame (currently ${total}).`);
  }
  if (total === 0) {
    warnings.push("Add at least one branch breaker.");
  }
  return warnings;
}

export function buildWeldModelNumber(sel: WeldSelections) {
  const mainCode = sel.frame === 200 ? "2" : sel.frame === 400 ? "4" : "6";
  const qty = (value: number) => String(value).padStart(2, "0");
  let model =
    `PDPWB${sel.cert}${sel.language}${sel.voltage}${mainCode}` +
    `${sel.size1Qty > 0 ? sel.size1Amp : "0"}${qty(sel.size1Qty)}` +
    `${sel.size2Qty > 0 ? sel.size2Amp : "0"}${qty(sel.size2Qty)}`;
  if (sel.frame !== 200) {
    model += `${sel.size3Qty > 0 ? sel.size3Amp : "0"}${qty(sel.size3Qty)}`;
  }
  return `${model}${sel.knockout}000`;
}

export function buildWeldSpecs(sel: WeldSelections): SpecRow[] {
  return [
    ["Incoming voltage", PDP_VOLTAGE_LABELS[sel.voltage]],
    ["Main breaker", `${sel.frame} A Siemens 3VA6`],
    ["Busbar system", "Siemens 8US FASTBUS, 30×10 mm copper, 3-pole"],
    ["Branch breakers", "Siemens 3VA5, 65 kA, 3-pole"],
    ["Branch circuit", "3P4W drop: (3) phase + (1) PE, cord-grip exit"],
    ["SCCR", "65 kA"],
    ["Certification", PDP_CERT_OPTIONS.find((option) => option.value === sel.cert)?.label ?? ""],
    ["Enclosure", "Rittal TS 8, NEMA-12, RAL7035, floor mount with plinth"],
    ["Branch feed entry", sel.knockout === "T" ? "Top knockouts" : "Bottom knockouts"],
  ];
}

export function buildWeldBom(sel: WeldSelections): EmBomLine[] {
  const lines: EmBomLine[] = [
    {
      quantity: 1,
      catalogNumber: buildWeldModelNumber(sel),
      description: `Weld PDP, ${sel.frame} A main, ${PDP_VOLTAGE_LABELS[sel.voltage]}`,
    },
    {
      quantity: 1,
      catalogNumber: sel.frame === 400 ? "3VA63406HL310AA0" : "",
      description: `Siemens 3VA6 main breaker, ${sel.frame} A, 65 kA, with Max-Flex door handle`,
    },
    {
      quantity: 3,
      catalogNumber: "8WC5134",
      description: "Siemens FASTBUS copper busbar 30×10 mm",
    },
    {
      quantity: 1,
      catalogNumber: "8US12134AH04",
      description: "Main breaker busbar adapter",
    },
  ];

  const groups: [WeldBranchAmp, number][] = [
    [sel.size1Amp, sel.size1Qty],
    [sel.size2Amp, sel.size2Qty],
    [sel.size3Amp, sel.size3Qty],
  ];
  for (const [amp, count] of groups) {
    if (count > 0 && amp !== "0") {
      const amps = WELD_BRANCH_AMP_VALUES[amp];
      lines.push({
        quantity: count,
        catalogNumber: amps === 100 ? "3VA51106ED310AA0" : "",
        description: `Siemens 3VA5 branch breaker, ${amps} A, 3-pole, 65 kA, with busbar adapter and lug kit`,
      });
    }
  }

  const empty = weldMaxBreakers(sel.frame) - weldTotalBreakers(sel);
  if (empty > 0) {
    lines.push({
      quantity: empty,
      catalogNumber: "8US19222EB00",
      description: "Busbar blank cover (unused position)",
    });
  }

  lines.push({
    quantity: 1,
    catalogNumber: sel.frame === 200 ? "" : "TS9951.136",
    description: "Rittal TS 8 enclosure, NEMA-12, RAL7035, with plinth and lockable disconnect",
  });
  return lines;
}

// ---------------------------------------------------------------------------
// Control PDP
// ---------------------------------------------------------------------------

export type ControlSelections = {
  frame: ControlFrame;
  cert: PdpCert;
  language: PdpLanguage;
  voltage: PdpVoltage;
  branch30Qty: number;
  largeCode: string;
  isoTransformer: boolean;
  e2Code: string;
  dcCode: string;
  knockout: PdpKnockout;
};

export const CONTROL_FRAME_OPTIONS: Option<ControlFrame>[] = [
  { value: 60, label: "60 A" },
  { value: 100, label: "100 A" },
  { value: 200, label: "200 A" },
  { value: 400, label: "400 A" },
];

export type LargeBreakerOption = {
  code: string;
  label: string;
  slots: number;
};

type ControlFrameConfig = {
  mainCode: string;
  positions: number;
  branch30Counts: number[];
  largeOptions: LargeBreakerOption[];
  isoKva: number;
  e2Codes: string[];
  dcCodes: string[];
};

function large(code: string, breakers: [number, number][]): LargeBreakerOption {
  const label = breakers.map(([count, amps]) => `(${count}) ${amps} A`).join(" + ");
  const slots = breakers.reduce((sum, [count, amps]) => sum + count * (amps >= 150 ? 2 : 1), 0);
  return { code, label, slots };
}

const LARGE_200: LargeBreakerOption[] = [
  { code: "0", label: "None", slots: 0 },
  large("6", [[1, 50]]),
  large("7", [[2, 50]]),
  large("8", [[3, 50]]),
  large("1", [[1, 60]]),
  large("2", [[2, 60]]),
  large("9", [[3, 60]]),
  large("3", [[1, 100]]),
  large("4", [[2, 100]]),
  large("5", [[1, 60], [1, 100]]),
  large("A", [[1, 125]]),
  large("B", [[1, 150]]),
];

export const CONTROL_FRAME_CONFIG: Record<ControlFrame, ControlFrameConfig> = {
  60: {
    mainCode: "0",
    positions: 4,
    branch30Counts: range(2, 4),
    largeOptions: [{ code: "0", label: "None", slots: 0 }, large("1", [[1, 40]])],
    isoKva: 27,
    e2Codes: ["000", "05X", "05A", "05B", "05C"],
    dcCodes: ["000", "02X", "02A", "02B"],
  },
  100: {
    mainCode: "1",
    positions: 8,
    branch30Counts: range(4, 8),
    largeOptions: [
      { code: "0", label: "None", slots: 0 },
      large("6", [[1, 50]]),
      large("7", [[2, 50]]),
      large("1", [[1, 60]]),
      large("2", [[2, 60]]),
    ],
    isoKva: 51,
    e2Codes: ["000", "05X", "05A", "05B", "05C", "07X", "07A", "07B", "07C", "07D", "07E"],
    dcCodes: ["000", "02X", "02A", "02B", "04X", "04A", "04B"],
  },
  200: {
    mainCode: "2",
    positions: 16,
    branch30Counts: range(4, 16),
    largeOptions: LARGE_200,
    isoKva: 118,
    e2Codes: ["000", "05X", "05A", "05B", "05C", "10X", "10A", "10B", "10C", "10D", "10E"],
    dcCodes: [],
  },
  400: {
    mainCode: "4",
    positions: 24,
    branch30Counts: range(4, 24),
    largeOptions: [...LARGE_200, large("C", [[1, 175]])],
    isoKva: 220,
    e2Codes: ["000", "10X", "10A", "10B", "10C", "10D", "10E", "15X", "15A", "15B", "15C", "15D", "15E", "15F", "15G"],
    dcCodes: [],
  },
};

export const E2_CODE_LABELS: Record<string, string> = {
  "000": "None",
  "05X": "5 kVA — (4) 10 A",
  "05A": "5 kVA — (3) 10 A + (1) 15 A",
  "05B": "5 kVA — (3) 10 A + (1) 20 A",
  "05C": "5 kVA — (2) 10 A + (1) 30 A + (1) 40 A",
  "07X": "7.5 kVA — (6) 10 A",
  "07A": "7.5 kVA — (4) 10 A + (2) 15 A",
  "07B": "7.5 kVA — (4) 10 A + (1) 15 A + (1) 20 A",
  "07C": "7.5 kVA — (4) 10 A + (1) 30 A",
  "07D": "7.5 kVA — (4) 10 A + (2) 20 A",
  "07E": "7.5 kVA — (4) 10 A + (1) 30 A + (1) 40 A",
  "10X": "10 kVA — (8) 10 A",
  "10A": "10 kVA — (6) 10 A + (2) 15 A",
  "10B": "10 kVA — (6) 10 A + (1) 15 A + (1) 20 A",
  "10C": "10 kVA — (6) 10 A + (1) 30 A",
  "10D": "10 kVA — (6) 10 A + (2) 20 A",
  "10E": "10 kVA — (6) 10 A + (1) 30 A + (1) 40 A",
  "15X": "15 kVA — (12) 10 A",
  "15A": "15 kVA — (10) 10 A + (2) 15 A",
  "15B": "15 kVA — (8) 10 A + (2) 15 A + (2) 20 A",
  "15C": "15 kVA — (8) 10 A + (1) 15 A + (2) 30 A",
  "15D": "15 kVA — (8) 10 A + (1) 20 A + (2) 30 A",
  "15E": "15 kVA — (8) 10 A + (3) 30 A",
  "15F": "15 kVA — (8) 10 A + (3) 20 A",
  "15G": "15 kVA — (8) 10 A + (1) 30 A + (1) 40 A",
};

export const DC_CODE_LABELS: Record<string, string> = {
  "000": "None",
  "02X": "20 A supply — (4) 3–10 A breakers",
  "02A": "20 A supply — (4) 3–10 A + (1) 15 A",
  "02B": "20 A supply — (4) 3–10 A + (2) 15 A",
  "04X": "40 A supply — (4) 3–10 A breakers",
  "04A": "40 A supply — (4) 3–10 A + (1) 15 A",
  "04B": "40 A supply — (4) 3–10 A + (2) 15 A",
};

export const CONTROL_KNOCKOUT_OPTIONS: Option<PdpKnockout>[] = [
  { value: "T", label: "Top" },
  { value: "B", label: "Bottom" },
  { value: "N", label: "Top, 5-pin conversion" },
];

export const WELD_KNOCKOUT_OPTIONS: Option<"T" | "B">[] = [
  { value: "T", label: "Top" },
  { value: "B", label: "Bottom" },
];

export const DEFAULT_CONTROL_SELECTIONS: ControlSelections = {
  frame: 200,
  cert: "A",
  language: "1",
  voltage: "A",
  branch30Qty: 12,
  largeCode: "0",
  isoTransformer: false,
  e2Code: "000",
  dcCode: "000",
  knockout: "T",
};

export function controlLargeOption(sel: ControlSelections) {
  return (
    CONTROL_FRAME_CONFIG[sel.frame].largeOptions.find((option) => option.code === sel.largeCode) ?? {
      code: "0",
      label: "None",
      slots: 0,
    }
  );
}

export function controlWarnings(sel: ControlSelections): string[] {
  const config = CONTROL_FRAME_CONFIG[sel.frame];
  const warnings: string[] = [];
  const used = sel.branch30Qty + controlLargeOption(sel).slots;
  if (used > config.positions) {
    warnings.push(
      `Only ${config.positions} busbar positions on the ${sel.frame} A frame — larger breakers displace 30 A breakers (150 A and up use 2 positions).`,
    );
  }
  if (sel.dcCode !== "000") {
    const needsE2 = sel.dcCode.startsWith("02") ? "5 kVA" : "7.5 kVA";
    const hasMatch = sel.dcCode.startsWith("02")
      ? sel.e2Code.startsWith("05")
      : sel.e2Code.startsWith("07");
    if (!hasMatch) {
      warnings.push(`The 24 VDC option requires the ${needsE2} control transformer.`);
    }
  }
  return warnings;
}

export function buildControlModelNumber(sel: ControlSelections) {
  const config = CONTROL_FRAME_CONFIG[sel.frame];
  const dcSegment = config.dcCodes.length > 0 ? sel.dcCode : "";
  return (
    `PDPC${sel.cert}${sel.language}${sel.voltage}${config.mainCode}` +
    `${String(sel.branch30Qty).padStart(2, "0")}${sel.largeCode}` +
    `${sel.isoTransformer ? "Y" : "N"}${sel.e2Code}${sel.knockout}${dcSegment}`
  );
}

export function buildControlSpecs(sel: ControlSelections): SpecRow[] {
  const config = CONTROL_FRAME_CONFIG[sel.frame];
  return [
    ["Incoming voltage", PDP_VOLTAGE_LABELS[sel.voltage]],
    ["Main breaker", `${sel.frame} A Siemens 3VA`],
    ["Busbar system", "Siemens 8US FASTBUS, 3-pole"],
    ["30 A branch breakers", `${sel.branch30Qty} × 30 A, 3-phase`],
    ["Larger branch breakers", controlLargeOption(sel).label],
    [
      "Isolation transformer",
      sel.isoTransformer ? `${config.isoKva} kVA included` : "None",
    ],
    ["Control transformer (1-phase)", E2_CODE_LABELS[sel.e2Code] ?? "None"],
    ...(config.dcCodes.length > 0
      ? [["24 VDC power", DC_CODE_LABELS[sel.dcCode] ?? "None"] as SpecRow]
      : []),
    ["Certification", PDP_CERT_OPTIONS.find((option) => option.value === sel.cert)?.label ?? ""],
    ["Enclosure", "NEMA-12, RAL7035, wall mount"],
    [
      "Branch feed entry",
      CONTROL_KNOCKOUT_OPTIONS.find((option) => option.value === sel.knockout)?.label ?? "",
    ],
  ];
}

export function buildControlBom(sel: ControlSelections): EmBomLine[] {
  const config = CONTROL_FRAME_CONFIG[sel.frame];
  const lines: EmBomLine[] = [
    {
      quantity: 1,
      catalogNumber: buildControlModelNumber(sel),
      description: `Control PDP, ${sel.frame} A main, ${PDP_VOLTAGE_LABELS[sel.voltage]}`,
    },
    {
      quantity: 1,
      catalogNumber: "",
      description: `Siemens 3VA main breaker, ${sel.frame} A, 3-pole`,
    },
    {
      quantity: sel.branch30Qty,
      catalogNumber: "",
      description: "Siemens 3VA 30 A branch breaker, 3-pole, with busbar adapter",
    },
  ];

  const largeOption = controlLargeOption(sel);
  if (largeOption.slots > 0) {
    lines.push({
      quantity: 1,
      catalogNumber: "",
      description: `Larger branch breaker group: ${largeOption.label}`,
    });
  }
  if (sel.isoTransformer) {
    lines.push({
      quantity: 1,
      catalogNumber: "",
      description: `${config.isoKva} kVA isolation transformer`,
    });
  }
  if (sel.e2Code !== "000") {
    lines.push({
      quantity: 1,
      catalogNumber: "",
      description: `Control transformer, ${E2_CODE_LABELS[sel.e2Code]} single-phase breakers`,
    });
  }
  if (config.dcCodes.length > 0 && sel.dcCode !== "000") {
    lines.push({
      quantity: 1,
      catalogNumber: "",
      description: `24 VDC power supply, ${DC_CODE_LABELS[sel.dcCode]}`,
    });
  }

  const empty = config.positions - sel.branch30Qty - largeOption.slots;
  if (empty > 0) {
    lines.push({
      quantity: empty,
      catalogNumber: "8US19222EB00",
      description: "Busbar blank cover (unused position)",
    });
  }
  lines.push({
    quantity: 1,
    catalogNumber: "",
    description: "NEMA-12 wall-mount enclosure, RAL7035, with lockable disconnect",
  });
  return lines;
}

// ---------------------------------------------------------------------------
// Export / import
// ---------------------------------------------------------------------------

export type PdpExportFile = {
  product: "PDP";
  version: 1;
  family: PdpFamily;
  model: string;
  selections: WeldSelections | ControlSelections;
};

export function buildPdpExport(
  family: PdpFamily,
  sel: WeldSelections | ControlSelections,
): PdpExportFile {
  const model =
    family === "weld"
      ? buildWeldModelNumber(sel as WeldSelections)
      : buildControlModelNumber(sel as ControlSelections);
  return { product: "PDP", version: 1, family, model, selections: sel };
}

function oneOf<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function intIn(value: unknown, min: number, max: number, fallback: number) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < min || num > max) return fallback;
  return num;
}

const CERTS = ["A", "C", "E"] as const;
const LANGS = ["1", "2", "3", "4", "5", "6", "7"] as const;
const VOLTS = ["A", "B", "C", "D"] as const;

export function parsePdpExport(
  payload: unknown,
): { family: "weld"; selections: WeldSelections } | { family: "control"; selections: ControlSelections } | null {
  if (!payload || typeof payload !== "object") return null;
  const file = payload as Partial<PdpExportFile>;
  if (file.product !== "PDP" || !file.selections || typeof file.selections !== "object") {
    return null;
  }

  if (file.family === "weld") {
    const sel = file.selections as Partial<WeldSelections>;
    const defaults = DEFAULT_WELD_SELECTIONS;
    const frame = oneOf(sel.frame, [200, 400, 600] as const, defaults.frame);
    const amps: readonly WeldBranchAmp[] = ["0", "A", "B", "C", "D", "E", "F", "G"];
    return {
      family: "weld",
      selections: {
        frame,
        cert: oneOf(sel.cert, CERTS, defaults.cert),
        language: oneOf(sel.language, LANGS, defaults.language),
        voltage: oneOf(sel.voltage, VOLTS, defaults.voltage),
        size1Amp: oneOf(sel.size1Amp, amps, defaults.size1Amp),
        size1Qty: intIn(sel.size1Qty, 0, 16, 0),
        size2Amp: oneOf(sel.size2Amp, amps, defaults.size2Amp),
        size2Qty: intIn(sel.size2Qty, 0, 16, 0),
        size3Amp: oneOf(sel.size3Amp, amps, defaults.size3Amp),
        size3Qty: intIn(sel.size3Qty, 0, 4, 0),
        knockout: oneOf(sel.knockout, ["T", "B"] as const, defaults.knockout),
      },
    };
  }

  if (file.family === "control") {
    const sel = file.selections as Partial<ControlSelections>;
    const defaults = DEFAULT_CONTROL_SELECTIONS;
    const frame = oneOf(sel.frame, [60, 100, 200, 400] as const, defaults.frame);
    const config = CONTROL_FRAME_CONFIG[frame];
    return {
      family: "control",
      selections: {
        frame,
        cert: oneOf(sel.cert, CERTS, defaults.cert),
        language: oneOf(sel.language, LANGS, defaults.language),
        voltage: oneOf(sel.voltage, VOLTS, defaults.voltage),
        branch30Qty: intIn(
          sel.branch30Qty,
          config.branch30Counts[0],
          config.branch30Counts[config.branch30Counts.length - 1],
          config.branch30Counts[0],
        ),
        largeCode: oneOf(
          sel.largeCode,
          config.largeOptions.map((option) => option.code),
          "0",
        ),
        isoTransformer: typeof sel.isoTransformer === "boolean" ? sel.isoTransformer : false,
        e2Code: oneOf(sel.e2Code, config.e2Codes, "000"),
        dcCode: config.dcCodes.length > 0 ? oneOf(sel.dcCode, config.dcCodes, "000") : "000",
        knockout: oneOf(sel.knockout, ["T", "B", "N"] as const, defaults.knockout),
      },
    };
  }

  return null;
}
