import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
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
import type { ConfiguratorData, SlotSelection } from "@/lib/configurator-types";
import {
  SEEDED_FRAME_ID,
  seededAccessories,
  seededBreakerOptions,
  seededCoverPlates,
  seededFrame,
  seededFrameAccessories,
  seededMainBreaker,
  seededSlots,
} from "@/lib/seed-data";
import { createDefaultSelections } from "@/lib/bom";

export async function getConfiguratorData(frameId?: string): Promise<ConfiguratorData> {
  const db = getDb();
  if (!db) return getFallbackConfiguratorData(frameId);

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

    return {
      frames,
      selectedFrame,
      mainBreaker: mainBreaker ?? seededMainBreaker,
      slots,
      breakerOptions: breakers,
      coverPlates: plates,
      accessories: allAccessories,
      frameAccessories: linkedAccessories,
    };
  } catch (error) {
    console.error("Falling back to seeded configurator data:", error);
    return getFallbackConfiguratorData(frameId);
  }
}

export function getFallbackConfiguratorData(frameId?: string): ConfiguratorData {
  return {
    frames: [seededFrame],
    selectedFrame: frameId && frameId !== SEEDED_FRAME_ID ? seededFrame : seededFrame,
    mainBreaker: seededMainBreaker,
    slots: seededSlots,
    breakerOptions: seededBreakerOptions,
    coverPlates: seededCoverPlates,
    accessories: seededAccessories,
    frameAccessories: seededFrameAccessories,
  };
}

export async function getSavedConfiguration(id: string) {
  const db = getDb();
  if (!db) return null;

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
}

export async function getAdminCatalog() {
  const db = getDb();
  if (!db) {
    return {
      frames: [seededFrame],
      slots: seededSlots,
      breakerOptions: seededBreakerOptions,
      coverPlates: seededCoverPlates,
      accessories: seededAccessories,
      configurations: [],
    };
  }

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
    frames,
    slots,
    breakerOptions: breakers,
    coverPlates: plates,
    accessories: allAccessories,
    configurations: savedConfigurations,
  };
}
