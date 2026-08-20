"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  adminSettings,
  accessories,
  breakerOptions,
  coverPlates,
  panelboardFrames,
  panelboardSlots,
} from "@/lib/db/schema";

const moneyField = z.coerce.number().min(0);

export async function upsertFrameAction(formData: FormData) {
  const db = getDb();
  if (!db) return;

  const id = String(formData.get("id") ?? "");
  const values = {
    name: String(formData.get("name") ?? ""),
    catalogNumber: String(formData.get("catalogNumber") ?? ""),
    panelType: String(formData.get("panelType") ?? ""),
    heightInches: Number(formData.get("heightInches") ?? 0),
    enclosure: String(formData.get("enclosure") ?? ""),
    systemVoltage: String(formData.get("systemVoltage") ?? ""),
    irRating: String(formData.get("irRating") ?? ""),
    mainBusAmps: Number(formData.get("mainBusAmps") ?? 0),
    busMaterial: String(formData.get("busMaterial") ?? ""),
    feed: String(formData.get("feed") ?? ""),
    mounting: String(formData.get("mounting") ?? ""),
    conduitArea: String(formData.get("conduitArea") ?? ""),
    baseCost: moneyField.parse(formData.get("baseCost") ?? 0),
    baseSellPrice: moneyField.parse(formData.get("baseSellPrice") ?? 0),
    seLabel: formData.get("seLabel") === "on",
    seriesRated: formData.get("seriesRated") === "on",
    isActive: formData.get("isActive") === "on",
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(panelboardFrames).set(values).where(eq(panelboardFrames.id, id));
  } else {
    await db.insert(panelboardFrames).values(values);
  }

  revalidatePath("/admin/frames");
}

export async function upsertBreakerAction(formData: FormData) {
  const db = getDb();
  if (!db) return;

  const id = String(formData.get("id") ?? "");
  const values = {
    family: String(formData.get("family") ?? ""),
    type: String(formData.get("type") ?? ""),
    amps: Number(formData.get("amps") ?? 0),
    poles: Number(formData.get("poles") ?? 3),
    interruptRating: String(formData.get("interruptRating") ?? ""),
    catalogNumber: String(formData.get("catalogNumber") ?? ""),
    description: String(formData.get("description") ?? ""),
    lugSize: String(formData.get("lugSize") ?? ""),
    cost: moneyField.parse(formData.get("cost") ?? 0),
    sellPrice: moneyField.parse(formData.get("sellPrice") ?? 0),
    isActive: formData.get("isActive") === "on",
    updatedAt: new Date(),
  };

  if (id) await db.update(breakerOptions).set(values).where(eq(breakerOptions.id, id));
  else await db.insert(breakerOptions).values(values);

  revalidatePath("/admin/breakers");
}

export async function upsertAccessoryAction(formData: FormData) {
  const db = getDb();
  if (!db) return;

  const id = String(formData.get("id") ?? "");
  const values = {
    name: String(formData.get("name") ?? ""),
    catalogNumber: String(formData.get("catalogNumber") ?? ""),
    description: String(formData.get("description") ?? ""),
    cost: moneyField.parse(formData.get("cost") ?? 0),
    sellPrice: moneyField.parse(formData.get("sellPrice") ?? 0),
    isRequired: formData.get("isRequired") === "on",
    isActive: formData.get("isActive") === "on",
    updatedAt: new Date(),
  };

  if (id) await db.update(accessories).set(values).where(eq(accessories.id, id));
  else await db.insert(accessories).values(values);

  revalidatePath("/admin/accessories");
}

export async function upsertCoverPlateAction(formData: FormData) {
  const db = getDb();
  if (!db) return;

  const id = String(formData.get("id") ?? "");
  const values = {
    slotType: String(formData.get("slotType") ?? ""),
    catalogNumber: String(formData.get("catalogNumber") ?? ""),
    description: String(formData.get("description") ?? ""),
    cost: moneyField.parse(formData.get("cost") ?? 0),
    sellPrice: moneyField.parse(formData.get("sellPrice") ?? 0),
    isActive: formData.get("isActive") === "on",
    updatedAt: new Date(),
  };

  if (id) await db.update(coverPlates).set(values).where(eq(coverPlates.id, id));
  else await db.insert(coverPlates).values(values);

  revalidatePath("/admin/cover-plates");
}

export async function upsertSlotAction(formData: FormData) {
  const db = getDb();
  if (!db) return;

  const id = String(formData.get("id") ?? "");
  const values = {
    frameId: String(formData.get("frameId") ?? ""),
    slotKey: String(formData.get("slotKey") ?? ""),
    displayOrder: Number(formData.get("displayOrder") ?? 0),
    label: String(formData.get("label") ?? ""),
    circuitNumbers: String(formData.get("circuitNumbers") ?? ""),
    uniqueId: Number(formData.get("uniqueId") ?? 0),
    slotType: String(formData.get("slotType") ?? ""),
    breakerFamily: String(formData.get("breakerFamily") ?? ""),
    defaultAmps: Number(formData.get("defaultAmps") ?? 0),
    poles: Number(formData.get("poles") ?? 3),
    interruptRating: String(formData.get("interruptRating") ?? ""),
    lugSize: String(formData.get("lugSize") ?? ""),
    x: Number(formData.get("x") ?? 0),
    y: Number(formData.get("y") ?? 0),
    width: Number(formData.get("width") ?? 0),
    height: Number(formData.get("height") ?? 0),
    isActive: formData.get("isActive") === "on",
    updatedAt: new Date(),
  };

  if (id) await db.update(panelboardSlots).set(values).where(eq(panelboardSlots.id, id));
  else await db.insert(panelboardSlots).values(values);

  revalidatePath("/admin/frames");
}

export async function deleteFrameAction(formData: FormData) {
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id") ?? "");
  if (id) await db.delete(panelboardFrames).where(eq(panelboardFrames.id, id));
  revalidatePath("/admin/frames");
}

export async function deleteBreakerAction(formData: FormData) {
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id") ?? "");
  if (id) await db.delete(breakerOptions).where(eq(breakerOptions.id, id));
  revalidatePath("/admin/breakers");
}

export async function deleteAccessoryAction(formData: FormData) {
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id") ?? "");
  if (id) await db.delete(accessories).where(eq(accessories.id, id));
  revalidatePath("/admin/accessories");
}

export async function deleteCoverPlateAction(formData: FormData) {
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id") ?? "");
  if (id) await db.delete(coverPlates).where(eq(coverPlates.id, id));
  revalidatePath("/admin/cover-plates");
}

export async function deleteSlotAction(formData: FormData) {
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id") ?? "");
  if (id) await db.delete(panelboardSlots).where(eq(panelboardSlots.id, id));
  revalidatePath("/admin/frames");
}

export async function updateDefaultMarginAction(formData: FormData) {
  const db = getDb();
  if (!db) return;
  const percentValue = Number(formData.get("defaultMargin") ?? 34);
  const defaultMargin = Math.max(0, Math.min(0.99, percentValue / 100));

  await db
    .insert(adminSettings)
    .values({ id: "default", defaultMargin, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: adminSettings.id,
      set: { defaultMargin, updatedAt: new Date() },
    });

  revalidatePath("/admin");
  revalidatePath("/configurator");
}
