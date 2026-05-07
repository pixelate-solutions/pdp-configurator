import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import {
  accessories,
  breakerOptions,
  coverPlates,
  frameAccessories,
  frameMainBreakers,
  panelboardFrames,
  panelboardSlots,
} from "../lib/db/schema";
import {
  SEEDED_FRAME_ID,
  seededAccessories,
  seededBreakerOptions,
  seededCoverPlates,
  seededFrame,
  seededFrameAccessories,
  seededMainBreaker,
  seededSlots,
} from "../lib/seed-data";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for npm run db:seed");
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(sql);

async function main() {
  await db
    .insert(panelboardFrames)
    .values(seededFrame)
    .onConflictDoUpdate({
      target: panelboardFrames.id,
      set: { ...seededFrame, updatedAt: new Date() },
    });

  await db
    .insert(frameMainBreakers)
    .values(seededMainBreaker)
    .onConflictDoUpdate({
      target: frameMainBreakers.id,
      set: { ...seededMainBreaker, updatedAt: new Date() },
    });

  for (const slot of seededSlots) {
    await db
      .insert(panelboardSlots)
      .values(slot)
      .onConflictDoUpdate({
        target: panelboardSlots.id,
        set: { ...slot, updatedAt: new Date() },
      });
  }

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

  await db
    .delete(frameAccessories)
    .where(eq(frameAccessories.frameId, SEEDED_FRAME_ID));
  await db.insert(frameAccessories).values(seededFrameAccessories);

  console.log("Seeded Siemens P5 90-inch panelboard frame.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
