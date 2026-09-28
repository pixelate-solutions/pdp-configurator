import type {
  Accessory,
  BreakerOption,
  CoverPlate,
  Frame,
  FrameAccessory,
  MainBreaker,
  PanelSlot,
} from "@/lib/configurator-types";
import { DEFAULT_ADMIN_MARGIN, sellPriceFromCost } from "@/lib/pricing";

export const SEEDED_FRAME_ID = "00000000-0000-4000-8000-000000000001";
export const SEEDED_FRAME_400_ID = "00000000-0000-4000-8000-000000000040";
export const SEEDED_FRAME_600_ID = "00000000-0000-4000-8000-000000000060";
export const OBSOLETE_600_SLOT_KEYS = ["L17", "L18"] as const;

const seededId = (number: number) =>
  `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`;

export const seededFrame: Frame = {
  id: SEEDED_FRAME_ID,
  name: "Fori 90 in Siemens P5 800A",
  catalogNumber: "P5E90VO800ETS",
  panelType: "Siemens P5",
  heightInches: 90,
  enclosure: "1 Indoor",
  systemVoltage: "480Y/277 3Ø 4W Wye AC",
  irRating: "65KAIC",
  mainBusAmps: 800,
  busMaterial: "Silver Plated Copper",
  feed: "Top",
  mounting: "Surface",
  seLabel: false,
  seriesRated: false,
  conduitArea: "30.000 x 10.75",
  baseCost: 9029.89,
  baseSellPrice: sellPriceFromCost(9029.89, DEFAULT_ADMIN_MARGIN),
  isActive: true,
};

export const seeded400Frame: Frame = {
  ...seededFrame,
  id: SEEDED_FRAME_400_ID,
  name: "Siemens P5 90 in 400A",
  catalogNumber: "P5E90VF400ETS",
  mainBusAmps: 400,
  baseCost: 6933.71,
  baseSellPrice: sellPriceFromCost(6933.71, DEFAULT_ADMIN_MARGIN),
};

export const seeded600Frame: Frame = {
  ...seededFrame,
  id: SEEDED_FRAME_600_ID,
  name: "Siemens P5 90 in 600A",
  catalogNumber: "P5E90VK600ETS",
  mainBusAmps: 600,
  baseCost: 8442.27,
  baseSellPrice: sellPriceFromCost(8442.27, DEFAULT_ADMIN_MARGIN),
};

export const seededFrames: Frame[] = [seeded400Frame, seeded600Frame, seededFrame];

export const seededMainBreaker: MainBreaker = {
  id: "00000000-0000-4000-8000-000000000101",
  frameId: SEEDED_FRAME_ID,
  label: "MAIN",
  family: "3VA55-HMAS",
  catalogNumber: "3VA55806EC320AA0",
  amps: 800,
  poles: 3,
  interruptRating: "65,000 AIC",
  description: "800A / 3P Siemens 3VA55-HMAS main breaker",
  lugDescription: "3VA Mechanical (2)4/0-600Kcmil Cu/Al Lug",
  lugCatalogNumber: "3VA95730JB23",
  cost: 0,
  sellPrice: 0,
};

export const seeded400MainBreaker: MainBreaker = {
  ...seededMainBreaker,
  id: "00000000-0000-4000-8000-000000000140",
  frameId: SEEDED_FRAME_400_ID,
  family: "3VA53-HJAS",
  catalogNumber: "3VA53406EC310AA0",
  amps: 400,
  description: "400A / 3P Siemens 3VA53-HJAS main breaker included with frame",
  lugDescription: "3VA Mechanical (2)2/0-250Kcmil Cu/Al Lug",
  lugCatalogNumber: "3VA94730JJ23",
};

export const seeded600MainBreaker: MainBreaker = {
  ...seededMainBreaker,
  id: "00000000-0000-4000-8000-000000000160",
  frameId: SEEDED_FRAME_600_ID,
  family: "3VA54-HLAS",
  catalogNumber: "3VA54606EC310AA0",
  amps: 600,
  description: "600A / 3P Siemens 3VA54-HLAS main breaker included with frame",
  lugDescription: "3VA Mechanical (2)2/0-500Kcmil Cu/Al Lug",
  lugCatalogNumber: "3VA94730JJ23",
};

export const seededMainBreakers: MainBreaker[] = [
  seeded400MainBreaker,
  seeded600MainBreaker,
  seededMainBreaker,
];

const smallSlotRows = [
  ["S01", "A1", "1/3/5", 297, 8, 25],
  ["S02", "A2", "2/4/6", 298, 52, 25],
  ["S03", "A3", "7/9/11", 300, 8, 34],
  ["S04", "A4", "8/10/12", 301, 52, 34],
] as const;

const largeSlotRows = [
  ["L01", "B1", "13/15/17", 303],
  ["L02", "B2", "14/16/18", 304],
  ["L03", "B3", "19/21/23", 306],
  ["L04", "B4", "20/22/24", 307],
  ["L05", "B5", "25/27/29", 309],
  ["L06", "B6", "26/28/30", 310],
  ["L07", "B7", "31/33/35", 312],
  ["L08", "B8", "32/34/36", 313],
  ["L09", "B9", "37/39/41", 315],
  ["L10", "B10", "38/40/42", 316],
  ["L11", "B11", "43/45/47", 318],
  ["L12", "B12", "44/46/48", 319],
  ["L13", "B13", "49/51/53", 321],
  ["L14", "B14", "50/52/54", 322],
  ["L15", "B15", "55/57/59", 324],
  ["L16", "B16", "56/58/60", 325],
] as const;

function makeSlots(
  frameId: string,
  baseId: number,
  uniqueIds: { small: number[]; large: readonly (readonly [string, string, string, number])[] },
) {
  return [
    ...smallSlotRows.map(([slotKey, label, circuitNumbers], index) => ({
      id: seededId(baseId + 100 + index + 1),
      frameId,
      slotKey,
      displayOrder: index + 1,
      label,
      circuitNumbers,
      uniqueId: uniqueIds.small[index],
      slotType: "small-3va41",
      breakerFamily: "3VA41",
      defaultAmps: 20,
      poles: 3,
      interruptRating: "65,000 AIC",
      lugSize: "(1)#14-#8 CU/AL",
      x: index % 2 === 0 ? 8 : 52,
      y: index < 2 ? 25 : 34,
      width: 40,
      height: 8,
      isActive: true,
    })),
    ...uniqueIds.large.map(([slotKey, label, circuitNumbers, uniqueId], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      return {
        id: seededId(baseId + 200 + index + 1),
        frameId,
        slotKey,
        displayOrder: index + 5,
        label,
        circuitNumbers,
        uniqueId,
        slotType: "large-3va52",
        breakerFamily: "3VA52",
        defaultAmps: 200,
        poles: 3,
        interruptRating: "65,000 AIC",
        lugSize: "(1)#6 AWG - 350 KCMIL CU/AL",
        x: col === 0 ? 8 : 52,
        y: 46 + row * 5.3,
        width: 40,
        height: 4.8,
        isActive: true,
      };
    }),
  ] satisfies PanelSlot[];
}

export const seeded400Slots = makeSlots(SEEDED_FRAME_400_ID, 4000, {
  small: [373, 374, 376, 377],
  large: largeSlotRows.map((row, index) => [row[0], row[1], row[2], 379 + index * 3] as const),
});

export const seeded600Slots = makeSlots(SEEDED_FRAME_600_ID, 6000, {
  small: [278, 279, 281, 282],
  large: largeSlotRows,
});

export const seededSlots: PanelSlot[] = makeSlots(SEEDED_FRAME_ID, 0, {
  small: [297, 298, 300, 301],
  large: largeSlotRows,
});

export const allSeededSlots: PanelSlot[] = [
  ...seeded400Slots,
  ...seeded600Slots,
  ...seededSlots,
];

export const seededBreakerOptions: BreakerOption[] = [
  {
    id: "00000000-0000-4000-8000-000000003020",
    family: "3VA41",
    type: "VLG-PROV",
    amps: 20,
    poles: 3,
    interruptRating: "65,000 AIC",
    catalogNumber: "3VA4120-HEAB-PROV",
    description: "20A / 3P Siemens 3VA41 provision breaker kit",
    lugSize: "(1)#14-#8 CU/AL",
    cost: 162.58,
    sellPrice: sellPriceFromCost(162.58, DEFAULT_ADMIN_MARGIN),
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000003030",
    family: "3VA41",
    type: "VLG-PROV",
    amps: 30,
    poles: 3,
    interruptRating: "65,000 AIC",
    catalogNumber: "3VA4130-HEAB-PROV",
    description: "30A / 3P Siemens 3VA41 provision breaker kit",
    lugSize: "(1)#14-#8 CU/AL",
    cost: 162.58,
    sellPrice: sellPriceFromCost(162.58, DEFAULT_ADMIN_MARGIN),
    isActive: true,
  },
  ...[100, 125].map((amps) => ({
    id: `00000000-0000-4000-8000-00000000${3000 + amps}`,
    family: "3VA41",
    type: "VLG-PROV",
    amps,
    poles: 3,
    interruptRating: "65,000 AIC",
    catalogNumber: `3VA41${amps}-HEAB-PROV`,
    description: `${amps}A / 3P Siemens 3VA41 provision breaker kit`,
    lugSize: "(1)#14-1/0 AWG CU/AL",
    cost: 162.58,
    sellPrice: sellPriceFromCost(162.58, DEFAULT_ADMIN_MARGIN),
    isActive: true,
  })),
  ...[45, 60, 100, 150, 200].map((amps, index) => ({
    id: seededId(400 + index + 1),
    family: "3VA52",
    type: "3VA526X-PROV",
    amps,
    poles: 3,
    interruptRating: "65,000 AIC",
    catalogNumber:
      amps === 200 ? "3VA52200-HFAS-PROV" : `3VA52${amps}-HFAS-PROV`,
    description: `${amps}A / 3P Siemens 3VA52 provision breaker kit`,
    lugSize: "(1)#6 AWG - 350 KCMIL CU/AL",
    cost: [463.87, 355.66, 400, 438, 476.36][index],
    sellPrice: sellPriceFromCost([463.87, 355.66, 400, 438, 476.36][index], DEFAULT_ADMIN_MARGIN),
    isActive: true,
  })),
];

export const seededCoverPlates: CoverPlate[] = [
  {
    id: "00000000-0000-4000-8000-000000005001",
    slotType: "small-3va41",
    catalogNumber: "P5-CP-3VA41-PROV",
    description: "Cover plate for empty 3VA41 provision slot",
    cost: 0,
    sellPrice: 0,
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000005002",
    slotType: "large-3va52",
    catalogNumber: "P5-CP-3VA52-PROV",
    description: "Cover plate for empty 3VA52 provision slot",
    cost: 0,
    sellPrice: 0,
    isActive: true,
  },
];

export const seededAccessories: Accessory[] = [
  ["Std Stl/Al Gnd Connector", "P5-GND-STAL", "Standard steel/aluminum ground connector", 0, 0],
  ["Card Holder - Std Plastic Sleeve", "P5-CARD-SLEEVE", "Standard plastic circuit card holder sleeve", 0, 0],
  ["Al/Cu Branch Connector", "P5-BRANCH-ALCU", "Aluminum/copper branch connector", 0, 0],
  ["Certification - UL", "UL-CERT-P5", "UL certification label and documentation", 0, 0],
].map(([name, catalogNumber, description, cost, sellPrice], index) => ({
  id: `00000000-0000-4000-8000-00000000600${index + 1}`,
  name: String(name),
  catalogNumber: String(catalogNumber),
  description: String(description),
  cost: Number(cost),
  sellPrice: Number(sellPrice),
  isRequired: true,
  isActive: true,
}));

export const seededFrameAccessories: FrameAccessory[] = seededAccessories.map(
  (accessory, index) => ({
    id: `00000000-0000-4000-8000-00000000700${index + 1}`,
    frameId: SEEDED_FRAME_ID,
    accessoryId: accessory.id,
    quantity: 1,
    ruleType: "required",
  }),
);

export const allSeededFrameAccessories: FrameAccessory[] = seededFrames.flatMap(
  (frame, frameIndex) =>
    seededAccessories.map((accessory, index) => ({
      id: seededId(7000 + frameIndex * 10 + index + 1),
      frameId: frame.id,
      accessoryId: accessory.id,
      quantity: 1,
      ruleType: "required",
    })),
);
