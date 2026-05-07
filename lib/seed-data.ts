import type {
  Accessory,
  BreakerOption,
  CoverPlate,
  Frame,
  FrameAccessory,
  MainBreaker,
  PanelSlot,
} from "@/lib/configurator-types";

export const SEEDED_FRAME_ID = "00000000-0000-4000-8000-000000000001";

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
  baseCost: 7850,
  baseSellPrice: 11250,
  isActive: true,
};

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
  cost: 2875,
  sellPrice: 4185,
};

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

export const seededSlots: PanelSlot[] = [
  ...smallSlotRows.map(([slotKey, label, circuitNumbers, uniqueId, x, y], index) => ({
    id: seededId(100 + index + 1),
    frameId: SEEDED_FRAME_ID,
    slotKey,
    displayOrder: index + 1,
    label,
    circuitNumbers,
    uniqueId,
    slotType: "small-3va41",
    breakerFamily: "3VA41",
    defaultAmps: 20,
    poles: 3,
    interruptRating: "65,000 AIC",
    lugSize: "(1)#14-#8 CU/AL",
    x,
    y,
    width: 40,
    height: 8,
    isActive: true,
  })),
  ...largeSlotRows.map(([slotKey, label, circuitNumbers, uniqueId], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    return {
      id: seededId(200 + index + 1),
      frameId: SEEDED_FRAME_ID,
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
      y: 46 + row * 6.1,
      width: 40,
      height: 5.4,
      isActive: true,
    };
  }),
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
    cost: 245,
    sellPrice: 365,
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
    cost: 255,
    sellPrice: 385,
    isActive: true,
  },
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
    cost: 620 + index * 95,
    sellPrice: 920 + index * 150,
    isActive: true,
  })),
];

export const seededCoverPlates: CoverPlate[] = [
  {
    id: "00000000-0000-4000-8000-000000005001",
    slotType: "small-3va41",
    catalogNumber: "P5-CP-3VA41-PROV",
    description: "Cover plate for empty 3VA41 provision slot",
    cost: 18,
    sellPrice: 32,
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000005002",
    slotType: "large-3va52",
    catalogNumber: "P5-CP-3VA52-PROV",
    description: "Cover plate for empty 3VA52 provision slot",
    cost: 32,
    sellPrice: 58,
    isActive: true,
  },
];

export const seededAccessories: Accessory[] = [
  ["Std Stl/Al Gnd Connector", "P5-GND-STAL", "Standard steel/aluminum ground connector", 25, 45],
  ["Card Holder - Std Plastic Sleeve", "P5-CARD-SLEEVE", "Standard plastic circuit card holder sleeve", 12, 24],
  ["Al/Cu Branch Connector", "P5-BRANCH-ALCU", "Aluminum/copper branch connector", 40, 72],
  ["Certification - UL", "UL-CERT-P5", "UL certification label and documentation", 55, 95],
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
