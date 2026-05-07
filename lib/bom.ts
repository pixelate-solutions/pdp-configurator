import type {
  BomLine,
  BomSummary,
  ConfiguratorData,
  SlotSelection,
} from "@/lib/configurator-types";

function addOrMerge(lines: BomLine[], next: BomLine) {
  const existing = lines.find(
    (line) =>
      line.itemType === next.itemType &&
      line.catalogNumber === next.catalogNumber &&
      line.unitSellPrice === next.unitSellPrice,
  );

  if (!existing || next.itemType === "breaker") {
    lines.push(next);
    return;
  }

  existing.quantity += next.quantity;
  existing.extendedSellPrice = existing.quantity * existing.unitSellPrice;
}

export function buildBom(
  data: ConfiguratorData,
  selections: SlotSelection,
): BomSummary {
  const lines: BomLine[] = [];
  const frame = data.selectedFrame;

  addOrMerge(lines, {
    id: `frame:${frame.id}`,
    itemType: "frame",
    catalogNumber: frame.catalogNumber,
    description: `${frame.panelType} ${frame.heightInches}" panelboard frame, ${frame.mainBusAmps}A bus`,
    quantity: 1,
    unitCost: frame.baseCost,
    unitSellPrice: frame.baseSellPrice,
    extendedSellPrice: frame.baseSellPrice,
  });

  addOrMerge(lines, {
    id: `main:${data.mainBreaker.id}`,
    itemType: "main_breaker",
    catalogNumber: data.mainBreaker.catalogNumber,
    description: `${data.mainBreaker.label} ${data.mainBreaker.description}`,
    quantity: 1,
    unitCost: data.mainBreaker.cost,
    unitSellPrice: data.mainBreaker.sellPrice,
    extendedSellPrice: data.mainBreaker.sellPrice,
  });

  for (const frameAccessory of data.frameAccessories) {
    const accessory = data.accessories.find(
      (item) => item.id === frameAccessory.accessoryId,
    );
    if (!accessory || !accessory.isActive) continue;

    addOrMerge(lines, {
      id: `accessory:${accessory.id}`,
      itemType: "accessory",
      catalogNumber: accessory.catalogNumber,
      description: accessory.description,
      quantity: frameAccessory.quantity,
      unitCost: accessory.cost,
      unitSellPrice: accessory.sellPrice,
      extendedSellPrice: accessory.sellPrice * frameAccessory.quantity,
    });
  }

  let emptySlotCount = 0;
  let filledSlotCount = 0;

  for (const slot of data.slots) {
    const selectedBreakerId = selections[slot.id] ?? null;
    const selectedBreaker = selectedBreakerId
      ? data.breakerOptions.find((option) => option.id === selectedBreakerId)
      : null;
    const isValidBreaker =
      selectedBreaker &&
      selectedBreaker.isActive &&
      selectedBreaker.family === slot.breakerFamily &&
      selectedBreaker.poles === slot.poles;

    if (isValidBreaker) {
      filledSlotCount += 1;
      addOrMerge(lines, {
        id: `breaker:${slot.id}:${selectedBreaker.id}`,
        itemType: "breaker",
        slotId: slot.id,
        breakerOptionId: selectedBreaker.id,
        catalogNumber: selectedBreaker.catalogNumber,
        description: `${slot.label} circuits ${slot.circuitNumbers}: ${selectedBreaker.description}`,
        quantity: 1,
        unitCost: selectedBreaker.cost,
        unitSellPrice: selectedBreaker.sellPrice,
        extendedSellPrice: selectedBreaker.sellPrice,
      });
      continue;
    }

    emptySlotCount += 1;
    const coverPlate = data.coverPlates.find(
      (plate) => plate.isActive && plate.slotType === slot.slotType,
    );

    if (coverPlate) {
      addOrMerge(lines, {
        id: `cover:${coverPlate.id}`,
        itemType: "cover_plate",
        slotId: slot.id,
        coverPlateId: coverPlate.id,
        catalogNumber: coverPlate.catalogNumber,
        description: coverPlate.description,
        quantity: 1,
        unitCost: coverPlate.cost,
        unitSellPrice: coverPlate.sellPrice,
        extendedSellPrice: coverPlate.sellPrice,
      });
    }
  }

  const totalCost = lines.reduce(
    (sum, line) => sum + line.unitCost * line.quantity,
    0,
  );
  const totalSellPrice = lines.reduce(
    (sum, line) => sum + line.extendedSellPrice,
    0,
  );
  const margin =
    totalSellPrice > 0 ? (totalSellPrice - totalCost) / totalSellPrice : 0;

  return {
    lines,
    subtotal: totalSellPrice,
    totalSellPrice,
    totalCost,
    margin,
    emptySlotCount,
    filledSlotCount,
  };
}

export function getAllowedBreakers(data: ConfiguratorData, slotId: string) {
  const slot = data.slots.find((item) => item.id === slotId);
  if (!slot) return [];

  return data.breakerOptions
    .filter(
      (option) =>
        option.isActive &&
        option.family === slot.breakerFamily &&
        option.poles === slot.poles,
    )
    .sort((a, b) => a.amps - b.amps);
}

export function validateSelection(
  data: ConfiguratorData,
  slotId: string,
  breakerOptionId: string | null,
) {
  if (!breakerOptionId) return { valid: true, message: "" };
  const allowed = getAllowedBreakers(data, slotId);
  const match = allowed.find((option) => option.id === breakerOptionId);
  if (match) return { valid: true, message: "" };

  const slot = data.slots.find((item) => item.id === slotId);
  return {
    valid: false,
    message: slot
      ? `${slot.label} accepts ${slot.breakerFamily} options only.`
      : "Select a valid slot first.",
  };
}

export function createDefaultSelections(data: ConfiguratorData): SlotSelection {
  return Object.fromEntries(data.slots.map((slot) => [slot.id, null]));
}
