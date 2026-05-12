"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getPricingAccess } from "@/lib/auth";
import { buildBom } from "@/lib/bom";
import { getConfiguratorData } from "@/lib/db/queries";
import { getDb } from "@/lib/db/client";
import { sendPricingRequestEmail } from "@/lib/pricing-request-email";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  adminSettings,
  accessories,
  breakerOptions,
  configurationItems,
  configurations,
  coverPlates,
  panelboardFrames,
  panelboardSlots,
  users,
} from "@/lib/db/schema";

const saveConfigurationSchema = z.object({
  frameId: z.string().uuid(),
  name: z.string().min(1),
  customerName: z.string().min(1),
  projectName: z.string().min(1),
  notes: z.string().optional().default(""),
  selections: z.record(z.string().uuid(), z.string().uuid().nullable()),
});

const requestPricingSchema = z.object({
  frameId: z.string().uuid(),
  selections: z.record(z.string().uuid(), z.string().uuid().nullable()),
});

export async function saveConfigurationAction(input: unknown) {
  const parsed = saveConfigurationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Review the required quote fields." };
  }

  const db = getDb();
  if (!db) {
    return {
      ok: false,
      message: "Add DATABASE_URL and run npm run db:push && npm run db:seed to enable saving.",
    };
  }

  if (!isClerkConfigured()) {
    return {
      ok: false,
      message: "Configure Clerk keys before saving authenticated quotes.",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "Sign in with Clerk before saving quotes." };
  }

  const data = await getConfiguratorData(parsed.data.frameId);
  const bom = buildBom(data, parsed.data.selections);

  const [savedConfiguration] = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ clerkUserId: userId, role: "sales" })
      .onConflictDoUpdate({
        target: users.clerkUserId,
        set: { updatedAt: new Date() },
      })
      .returning();

    const [configuration] = await tx
      .insert(configurations)
      .values({
        userId: user.id,
        frameId: parsed.data.frameId,
        name: parsed.data.name,
        customerName: parsed.data.customerName,
        projectName: parsed.data.projectName,
        notes: parsed.data.notes,
        subtotal: bom.subtotal,
        margin: bom.margin,
        totalSellPrice: bom.totalSellPrice,
      })
      .returning();

    await tx.insert(configurationItems).values(
      bom.lines.map((line) => ({
        configurationId: configuration.id,
        slotId: line.slotId,
        breakerOptionId: line.breakerOptionId,
        coverPlateId: line.coverPlateId,
        itemType: line.itemType,
        quantity: line.quantity,
        catalogNumber: line.catalogNumber,
        description: line.description,
        unitCost: line.unitCost,
        unitSellPrice: line.unitSellPrice,
        extendedSellPrice: line.extendedSellPrice,
      })),
    );

    return [configuration];
  });

  revalidatePath("/admin/configurations");
  return {
    ok: true,
    id: savedConfiguration.id,
    message: "Configuration saved.",
  };
}

export async function requestPricingAction(input: unknown) {
  const parsed = requestPricingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Review the configuration before requesting pricing." };
  }

  if (!isClerkConfigured()) {
    return {
      ok: false,
      message: "Configure Clerk keys before requesting pricing.",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "Create an account or sign in before requesting pricing." };
  }

  const pricingAccess = await getPricingAccess();
  if (!pricingAccess.signedIn) {
    return { ok: false, message: "Create an account or sign in before requesting pricing." };
  }

  const db = getDb();
  const data = await getConfiguratorData(parsed.data.frameId);
  const bom = buildBom(data, parsed.data.selections);
  const email = pricingAccess.email ?? "Unknown email";
  let savedConfigurationId: string | null = null;

  if (db) {
    try {
      const [savedConfiguration] = await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({ clerkUserId: userId, role: "customer" })
          .onConflictDoUpdate({
            target: users.clerkUserId,
            set: { updatedAt: new Date() },
          })
          .returning();

        const [configuration] = await tx
          .insert(configurations)
          .values({
            userId: user.id,
            frameId: parsed.data.frameId,
            name: `Pricing request - ${data.selectedFrame.catalogNumber}`,
            customerName: email,
            projectName: "Online pricing request",
            notes: `Pricing requested by ${email}.`,
            subtotal: bom.subtotal,
            margin: bom.margin,
            totalSellPrice: bom.totalSellPrice,
          })
          .returning();

        await tx.insert(configurationItems).values(
          bom.lines.map((line) => ({
            configurationId: configuration.id,
            slotId: line.slotId,
            breakerOptionId: line.breakerOptionId,
            coverPlateId: line.coverPlateId,
            itemType: line.itemType,
            quantity: line.quantity,
            catalogNumber: line.catalogNumber,
            description: line.description,
            unitCost: line.unitCost,
            unitSellPrice: line.unitSellPrice,
            extendedSellPrice: line.extendedSellPrice,
          })),
        );

        return [configuration];
      });

      savedConfigurationId = savedConfiguration.id;
      revalidatePath("/admin/configurations");
    } catch (error) {
      console.warn("Unable to store pricing request; sending email only.", error);
    }
  }

  const emailResult = await sendPricingRequestEmail({
    data,
    bom,
    requesterEmail: email,
    configurationId: savedConfigurationId,
  });

  return {
    ok: emailResult.ok,
    id: savedConfigurationId,
    message: emailResult.message,
  };
}

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
