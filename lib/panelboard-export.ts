import type { ConfiguratorData, SlotSelection } from "@/lib/configurator-types";

export type PanelboardExportFile = {
  product: "siemens-panelboard";
  version: 1;
  frame: {
    id: string;
    catalogNumber: string;
    name: string;
  };
  selections: Record<
    string,
    { catalogNumber: string; family: string; amps: number } | null
  >;
};

export const PANELBOARD_IMPORT_STORAGE_KEY = "em-panelboard-import";

export function buildPanelboardExport(
  data: ConfiguratorData,
  selections: SlotSelection,
): PanelboardExportFile {
  const bySlotKey: PanelboardExportFile["selections"] = {};
  for (const slot of data.slots) {
    const breakerId = selections[slot.id] ?? null;
    const breaker = breakerId
      ? data.breakerOptions.find((option) => option.id === breakerId)
      : null;
    bySlotKey[slot.slotKey] = breaker
      ? { catalogNumber: breaker.catalogNumber, family: breaker.family, amps: breaker.amps }
      : null;
  }
  return {
    product: "siemens-panelboard",
    version: 1,
    frame: {
      id: data.selectedFrame.id,
      catalogNumber: data.selectedFrame.catalogNumber,
      name: data.selectedFrame.name,
    },
    selections: bySlotKey,
  };
}

export function parsePanelboardExport(payload: unknown): PanelboardExportFile | null {
  if (!payload || typeof payload !== "object") return null;
  const file = payload as Partial<PanelboardExportFile>;
  if (
    file.product !== "siemens-panelboard" ||
    !file.frame ||
    typeof file.frame !== "object" ||
    !file.selections ||
    typeof file.selections !== "object"
  ) {
    return null;
  }
  return file as PanelboardExportFile;
}

export function findImportFrame(data: ConfiguratorData, file: PanelboardExportFile) {
  return (
    data.frames.find((frame) => frame.id === file.frame.id) ??
    data.frames.find((frame) => frame.catalogNumber === file.frame.catalogNumber) ??
    null
  );
}

export function mapImportSelections(
  data: ConfiguratorData,
  file: PanelboardExportFile,
): SlotSelection {
  const selections: SlotSelection = {};
  for (const slot of data.slots) {
    const saved = file.selections[slot.slotKey];
    if (!saved) {
      selections[slot.id] = null;
      continue;
    }
    const breaker =
      data.breakerOptions.find(
        (option) => option.isActive && option.catalogNumber === saved.catalogNumber,
      ) ??
      data.breakerOptions.find(
        (option) =>
          option.isActive &&
          option.family === saved.family &&
          option.amps === saved.amps &&
          option.poles === slot.poles,
      ) ??
      null;
    selections[slot.id] =
      breaker && breaker.family === slot.breakerFamily ? breaker.id : null;
  }
  return selections;
}
