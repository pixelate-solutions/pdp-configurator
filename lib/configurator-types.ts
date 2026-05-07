export type Role = "admin" | "sales";

export type Frame = {
  id: string;
  name: string;
  catalogNumber: string;
  panelType: string;
  heightInches: number;
  enclosure: string;
  systemVoltage: string;
  irRating: string;
  mainBusAmps: number;
  busMaterial: string;
  feed: string;
  mounting: string;
  seLabel: boolean;
  seriesRated: boolean;
  conduitArea: string;
  baseCost: number;
  baseSellPrice: number;
  isActive: boolean;
};

export type MainBreaker = {
  id: string;
  frameId: string;
  label: string;
  family: string;
  catalogNumber: string;
  amps: number;
  poles: number;
  interruptRating: string;
  description: string;
  lugDescription: string;
  lugCatalogNumber: string;
  cost: number;
  sellPrice: number;
};

export type PanelSlot = {
  id: string;
  frameId: string;
  slotKey: string;
  displayOrder: number;
  label: string;
  circuitNumbers: string;
  uniqueId: number;
  slotType: string;
  breakerFamily: string;
  defaultAmps: number | null;
  poles: number;
  interruptRating: string;
  lugSize: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
};

export type BreakerOption = {
  id: string;
  family: string;
  type: string;
  amps: number;
  poles: number;
  interruptRating: string;
  catalogNumber: string;
  description: string;
  lugSize: string;
  cost: number;
  sellPrice: number;
  isActive: boolean;
};

export type CoverPlate = {
  id: string;
  slotType: string;
  catalogNumber: string;
  description: string;
  cost: number;
  sellPrice: number;
  isActive: boolean;
};

export type Accessory = {
  id: string;
  name: string;
  catalogNumber: string;
  description: string;
  cost: number;
  sellPrice: number;
  isRequired: boolean;
  isActive: boolean;
};

export type FrameAccessory = {
  id: string;
  frameId: string;
  accessoryId: string;
  quantity: number;
  ruleType: string;
};

export type ConfiguratorData = {
  frames: Frame[];
  selectedFrame: Frame;
  mainBreaker: MainBreaker;
  slots: PanelSlot[];
  breakerOptions: BreakerOption[];
  coverPlates: CoverPlate[];
  accessories: Accessory[];
  frameAccessories: FrameAccessory[];
};

export type SlotSelection = Record<string, string | null>;

export type BomItemType =
  | "frame"
  | "main_breaker"
  | "accessory"
  | "breaker"
  | "cover_plate";

export type BomLine = {
  id: string;
  itemType: BomItemType;
  slotId?: string;
  breakerOptionId?: string | null;
  coverPlateId?: string | null;
  catalogNumber: string;
  description: string;
  quantity: number;
  unitCost: number;
  unitSellPrice: number;
  extendedSellPrice: number;
};

export type BomSummary = {
  lines: BomLine[];
  subtotal: number;
  totalSellPrice: number;
  totalCost: number;
  margin: number;
  emptySlotCount: number;
  filledSlotCount: number;
};
