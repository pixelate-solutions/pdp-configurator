import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { and, eq, inArray } from "drizzle-orm";
import {
  accessories,
  adminSettings,
  breakerOptions,
  coverPlates,
  frameAccessories,
  frameMainBreakers,
  panelboardFrames,
  panelboardSlots,
} from "../lib/db/schema";
import { DEFAULT_ADMIN_MARGIN } from "../lib/pricing";
import {
  OBSOLETE_600_SLOT_KEYS,
  SEEDED_FRAME_600_ID,
  allSeededFrameAccessories,
  allSeededSlots,
  seededAccessories,
  seededBreakerOptions,
  seededCoverPlates,
  seededFrames,
  seededMainBreakers,
} from "../lib/seed-data";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for npm run db:seed");
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(sql);

async function main() {
  await db
    .insert(adminSettings)
    .values({ id: "default", defaultMargin: DEFAULT_ADMIN_MARGIN })
    .onConflictDoUpdate({
      target: adminSettings.id,
      set: { defaultMargin: DEFAULT_ADMIN_MARGIN, updatedAt: new Date() },
    });

  for (const frame of seededFrames) {
    await db
      .insert(panelboardFrames)
      .values(frame)
      .onConflictDoUpdate({
        target: panelboardFrames.id,
        set: { ...frame, updatedAt: new Date() },
      });
  }

  for (const mainBreaker of seededMainBreakers) {
    await db
      .insert(frameMainBreakers)
      .values(mainBreaker)
      .onConflictDoUpdate({
        target: frameMainBreakers.id,
        set: { ...mainBreaker, updatedAt: new Date() },
      });
  }

  for (const slot of allSeededSlots) {
    await db
      .insert(panelboardSlots)
      .values(slot)
      .onConflictDoUpdate({
        target: panelboardSlots.id,
        set: { ...slot, updatedAt: new Date() },
      });
  }

  await db
    .delete(panelboardSlots)
    .where(
      and(
        eq(panelboardSlots.frameId, SEEDED_FRAME_600_ID),
        inArray(panelboardSlots.slotKey, [...OBSOLETE_600_SLOT_KEYS]),
      ),
    );

  for (const breaker of seededBreakerOptions) {
    await db
      .insert(breakerOptions)
      .values(breaker)
      .onConflictDoUpdate({
        target: breakerOptions.id,
        set: { ...breaker, updatedAt: new Date() },
      });
  }

  for (const plate of seededCoverPlates) {
    await db
      .insert(coverPlates)
      .values(plate)
      .onConflictDoUpdate({
        target: coverPlates.id,
        set: { ...plate, updatedAt: new Date() },
      });
  }

  for (const accessory of seededAccessories) {
    await db
      .insert(accessories)
      .values(accessory)
      .onConflictDoUpdate({
        target: accessories.id,
        set: { ...accessory, updatedAt: new Date() },
      });
  }

  for (const frame of seededFrames) {
    await db
      .delete(frameAccessories)
      .where(eq(frameAccessories.frameId, frame.id));
  }
  await db.insert(frameAccessories).values(allSeededFrameAccessories);

  console.log("Seeded Siemens P5 400A, 600A, and 800A panelboard frames.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
