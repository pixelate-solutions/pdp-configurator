import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  adminSettings,
  accessories,
  breakerOptions,
  configurationItems,
  configurations,
  coverPlates,
  frameAccessories,
  frameMainBreakers,
  panelboardFrames,
  panelboardSlots,
} from "@/lib/db/schema";
import type {
  ConfiguratorData,
  PanelSlot,
  SlotSelection,
} from "@/lib/configurator-types";
import {
  OBSOLETE_600_SLOT_KEYS,
  SEEDED_FRAME_ID,
  SEEDED_FRAME_600_ID,
  allSeededFrameAccessories,
  allSeededSlots,
  seededAccessories,
  seededBreakerOptions,
  seededCoverPlates,
  seededFrame,
  seededFrames,
  seededMainBreaker,
  seededMainBreakers,
} from "@/lib/seed-data";
import { createDefaultSelections } from "@/lib/bom";
import { DEFAULT_ADMIN_MARGIN, sellPriceFromCost } from "@/lib/pricing";

export type SavedConfigurationImportOption = {
  id: string;
  name: string;
  customerName: string;
  projectName: string;
  createdAt: string;
};

function isMissingDatabaseError(error: unknown) {
  const cause = error instanceof Error ? error.cause : undefined;
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    cause.code === "3D000"
  );
}

function logSeedFallback(context: string, error: unknown) {
  if (isMissingDatabaseError(error)) {
    console.warn(`${context}: local database is unavailable; using seeded data.`);
    return;
  }

  console.error(`${context}:`, error);
}

async function getPricingMargin() {
  const db = getDb();
  if (!db) return DEFAULT_ADMIN_MARGIN;

  try {
    const [settings] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.id, "default"))
      .limit(1);
    return settings?.defaultMargin ?? DEFAULT_ADMIN_MARGIN;
  } catch {
    return DEFAULT_ADMIN_MARGIN;
  }
}

function applyMargin(data: ConfiguratorData, margin: number): ConfiguratorData {
  return {
    ...data,
    frames: data.frames.map((frame) => ({
      ...frame,
      baseSellPrice: sellPriceFromCost(frame.baseCost, margin),
    })),
    selectedFrame: {
      ...data.selectedFrame,
      baseSellPrice: sellPriceFromCost(data.selectedFrame.baseCost, margin),
    },
    mainBreaker: {
      ...data.mainBreaker,
      sellPrice: sellPriceFromCost(data.mainBreaker.cost, margin),
    },
    breakerOptions: data.breakerOptions.map((breaker) => ({
      ...breaker,
      sellPrice: sellPriceFromCost(breaker.cost, margin),
    })),
    coverPlates: data.coverPlates.map((plate) => ({
      ...plate,
      sellPrice: sellPriceFromCost(plate.cost, margin),
    })),
    accessories: data.accessories.map((accessory) => ({
      ...accessory,
      sellPrice: sellPriceFromCost(accessory.cost, margin),
    })),
  };
}

const obsolete600SlotKeys = new Set<string>(OBSOLETE_600_SLOT_KEYS);

function withoutExtra600Row(slots: PanelSlot[]) {
  return slots.filter(
    (slot) =>
      slot.frameId !== SEEDED_FRAME_600_ID ||
      !obsolete600SlotKeys.has(slot.slotKey),
  );
}

export async function getConfiguratorData(frameId?: string): Promise<ConfiguratorData> {
  const db = getDb();
  const margin = await getPricingMargin();
  if (!db) return applyMargin(getFallbackConfiguratorData(frameId), margin);

  try {
    const frames = await db
      .select()
      .from(panelboardFrames)
      .where(eq(panelboardFrames.isActive, true))
      .orderBy(asc(panelboardFrames.heightInches), asc(panelboardFrames.name));

    const selectedFrame =
      frames.find((frame) => frame.id === frameId) ?? frames[0] ?? seededFrame;

    const [mainBreaker] = await db
      .select()
      .from(frameMainBreakers)
      .where(eq(frameMainBreakers.frameId, selectedFrame.id))
      .limit(1);

    const [slots, breakers, plates, linkedAccessories, allAccessories] =
      await Promise.all([
        db
          .select()
          .from(panelboardSlots)
          .where(eq(panelboardSlots.frameId, selectedFrame.id))
          .orderBy(asc(panelboardSlots.displayOrder)),
        db
          .select()
          .from(breakerOptions)
          .where(eq(breakerOptions.isActive, true))
          .orderBy(asc(breakerOptions.family), asc(breakerOptions.amps)),
        db
          .select()
          .from(coverPlates)
          .where(eq(coverPlates.isActive, true))
          .orderBy(asc(coverPlates.slotType)),
        db
          .select()
          .from(frameAccessories)
          .where(eq(frameAccessories.frameId, selectedFrame.id)),
        db
          .select()
          .from(accessories)
          .where(eq(accessories.isActive, true))
          .orderBy(asc(accessories.name)),
      ]);

    return applyMargin({
      frames,
      selectedFrame,
      mainBreaker: mainBreaker ?? seededMainBreaker,
      slots: withoutExtra600Row(slots),
      breakerOptions: breakers,
      coverPlates: plates,
      accessories: allAccessories,
      frameAccessories: linkedAccessories,
    }, margin);
  } catch (error) {
    logSeedFallback("Falling back to seeded configurator data", error);
    return applyMargin(getFallbackConfiguratorData(frameId), margin);
  }
}

export function getFallbackConfiguratorData(frameId?: string): ConfiguratorData {
  const selectedFrame =
    seededFrames.find((frame) => frame.id === frameId) ??
    seededFrames.find((frame) => frame.id === SEEDED_FRAME_ID) ??
    seededFrame;

  return {
    frames: seededFrames,
    selectedFrame,
    mainBreaker:
      seededMainBreakers.find((breaker) => breaker.frameId === selectedFrame.id) ??
      seededMainBreaker,
    slots: withoutExtra600Row(
      allSeededSlots.filter((slot) => slot.frameId === selectedFrame.id),
    ),
    breakerOptions: seededBreakerOptions,
    coverPlates: seededCoverPlates,
    accessories: seededAccessories,
    frameAccessories: allSeededFrameAccessories.filter(
      (item) => item.frameId === selectedFrame.id,
    ),
  };
}

export async function getSavedConfiguration(id: string) {
  const db = getDb();
  if (!db) return null;

  try {
    const [configuration] = await db
      .select()
      .from(configurations)
      .where(eq(configurations.id, id))
      .limit(1);

    if (!configuration) return null;

    const data = await getConfiguratorData(configuration.frameId);
    const items = await db
      .select()
      .from(configurationItems)
      .where(eq(configurationItems.configurationId, configuration.id));
    const selections: SlotSelection = createDefaultSelections(data);

    for (const item of items) {
      if (item.slotId && item.breakerOptionId) {
        selections[item.slotId] = item.breakerOptionId;
      }
    }

    return { configuration, data, selections, items };
  } catch (error) {
    logSeedFallback("Unable to load saved configuration", error);
    return null;
  }
}

export async function getSavedConfigurationImportOptions(): Promise<
  SavedConfigurationImportOption[]
> {
  const db = getDb();
  if (!db) return [];

  try {
    const savedConfigurations = await db
      .select({
        id: configurations.id,
        name: configurations.name,
        customerName: configurations.customerName,
        projectName: configurations.projectName,
        createdAt: configurations.createdAt,
      })
      .from(configurations)
      .orderBy(desc(configurations.createdAt));

    return savedConfigurations.map((configuration) => ({
      ...configuration,
      createdAt: configuration.createdAt.toISOString(),
    }));
  } catch (error) {
    logSeedFallback("Unable to load saved configurations", error);
    return [];
  }
}

function getFallbackAdminCatalog(defaultMargin: number) {
  return {
    frames: seededFrames.map((frame) => ({
      ...frame,
      baseSellPrice: sellPriceFromCost(frame.baseCost, defaultMargin),
    })),
    slots: withoutExtra600Row(allSeededSlots),
    breakerOptions: seededBreakerOptions.map((breaker) => ({
      ...breaker,
      sellPrice: sellPriceFromCost(breaker.cost, defaultMargin),
    })),
    coverPlates: seededCoverPlates.map((plate) => ({
      ...plate,
      sellPrice: sellPriceFromCost(plate.cost, defaultMargin),
    })),
    accessories: seededAccessories.map((accessory) => ({
      ...accessory,
      sellPrice: sellPriceFromCost(accessory.cost, defaultMargin),
    })),
    configurations: [],
    defaultMargin,
  };
}

export async function getAdminCatalog() {
  const db = getDb();
  const defaultMargin = await getPricingMargin();
  if (!db) return getFallbackAdminCatalog(defaultMargin);

  try {
    const [frames, slots, breakers, plates, allAccessories, savedConfigurations] =
      await Promise.all([
        db.select().from(panelboardFrames).orderBy(asc(panelboardFrames.name)),
        db.select().from(panelboardSlots).orderBy(asc(panelboardSlots.displayOrder)),
        db.select().from(breakerOptions).orderBy(asc(breakerOptions.family), asc(breakerOptions.amps)),
        db.select().from(coverPlates).orderBy(asc(coverPlates.slotType)),
        db.select().from(accessories).orderBy(asc(accessories.name)),
        db.select().from(configurations).orderBy(asc(configurations.createdAt)),
      ]);

    return {
      frames: frames.map((frame) => ({
        ...frame,
        baseSellPrice: sellPriceFromCost(frame.baseCost, defaultMargin),
      })),
      slots: withoutExtra600Row(slots),
      breakerOptions: breakers.map((breaker) => ({
        ...breaker,
        sellPrice: sellPriceFromCost(breaker.cost, defaultMargin),
      })),
      coverPlates: plates.map((plate) => ({
        ...plate,
        sellPrice: sellPriceFromCost(plate.cost, defaultMargin),
      })),
      accessories: allAccessories.map((accessory) => ({
        ...accessory,
        sellPrice: sellPriceFromCost(accessory.cost, defaultMargin),
      })),
      configurations: savedConfigurations,
      defaultMargin,
    };
  } catch (error) {
    logSeedFallback("Falling back to seeded admin catalog", error);
    return getFallbackAdminCatalog(defaultMargin);
  }
}
