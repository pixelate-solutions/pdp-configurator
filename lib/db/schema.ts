import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

const money = (name: string) => numeric(name, { precision: 12, scale: 2, mode: "number" });
const decimal = (name: string) =>
  numeric(name, { precision: 10, scale: 3, mode: "number" });

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  role: text("role").notNull().default("sales"),
  ...timestamps,
});

export const panelboardFrames = pgTable("panelboard_frames", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  catalogNumber: text("catalog_number").notNull().unique(),
  panelType: text("panel_type").notNull(),
  heightInches: integer("height_inches").notNull(),
  enclosure: text("enclosure").notNull(),
  systemVoltage: text("system_voltage").notNull(),
  irRating: text("ir_rating").notNull(),
  mainBusAmps: integer("main_bus_amps").notNull(),
  busMaterial: text("bus_material").notNull(),
  feed: text("feed").notNull(),
  mounting: text("mounting").notNull(),
  seLabel: boolean("se_label").notNull().default(false),
  seriesRated: boolean("series_rated").notNull().default(false),
  conduitArea: text("conduit_area").notNull(),
  baseCost: money("base_cost").notNull().default(0),
  baseSellPrice: money("base_sell_price").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const frameMainBreakers = pgTable("frame_main_breakers", {
  id: uuid("id").defaultRandom().primaryKey(),
  frameId: uuid("frame_id")
    .notNull()
    .references(() => panelboardFrames.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  family: text("family").notNull(),
  catalogNumber: text("catalog_number").notNull(),
  amps: integer("amps").notNull(),
  poles: integer("poles").notNull(),
  interruptRating: text("interrupt_rating").notNull(),
  description: text("description").notNull(),
  lugDescription: text("lug_description").notNull(),
  lugCatalogNumber: text("lug_catalog_number").notNull(),
  cost: money("cost").notNull().default(0),
  sellPrice: money("sell_price").notNull().default(0),
  ...timestamps,
});

export const panelboardSlots = pgTable(
  "panelboard_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    frameId: uuid("frame_id")
      .notNull()
      .references(() => panelboardFrames.id, { onDelete: "cascade" }),
    slotKey: text("slot_key").notNull(),
    displayOrder: integer("display_order").notNull(),
    label: text("label").notNull(),
    circuitNumbers: text("circuit_numbers").notNull(),
    uniqueId: integer("unique_id").notNull(),
    slotType: text("slot_type").notNull(),
    breakerFamily: text("breaker_family").notNull(),
    defaultAmps: integer("default_amps"),
    poles: integer("poles").notNull(),
    interruptRating: text("interrupt_rating").notNull(),
    lugSize: text("lug_size").notNull(),
    x: decimal("x").notNull(),
    y: decimal("y").notNull(),
    width: decimal("width").notNull(),
    height: decimal("height").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => ({
    frameSlotKeyIdx: uniqueIndex("panelboard_slots_frame_slot_key_idx").on(
      table.frameId,
      table.slotKey,
    ),
  }),
);

export const breakerOptions = pgTable("breaker_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  family: text("family").notNull(),
  type: text("type").notNull(),
  amps: integer("amps").notNull(),
  poles: integer("poles").notNull(),
  interruptRating: text("interrupt_rating").notNull(),
  catalogNumber: text("catalog_number").notNull(),
  description: text("description").notNull(),
  lugSize: text("lug_size").notNull(),
  cost: money("cost").notNull().default(0),
  sellPrice: money("sell_price").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const coverPlates = pgTable("cover_plates", {
  id: uuid("id").defaultRandom().primaryKey(),
  slotType: text("slot_type").notNull(),
  catalogNumber: text("catalog_number").notNull(),
  description: text("description").notNull(),
  cost: money("cost").notNull().default(0),
  sellPrice: money("sell_price").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const accessories = pgTable("accessories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  catalogNumber: text("catalog_number").notNull(),
  description: text("description").notNull(),
  cost: money("cost").notNull().default(0),
  sellPrice: money("sell_price").notNull().default(0),
  isRequired: boolean("is_required").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const frameAccessories = pgTable("frame_accessories", {
  id: uuid("id").defaultRandom().primaryKey(),
  frameId: uuid("frame_id")
    .notNull()
    .references(() => panelboardFrames.id, { onDelete: "cascade" }),
  accessoryId: uuid("accessory_id")
    .notNull()
    .references(() => accessories.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  ruleType: text("rule_type").notNull().default("required"),
});

export const adminSettings = pgTable("admin_settings", {
  id: text("id").primaryKey(),
  defaultMargin: numeric("default_margin", {
    precision: 5,
    scale: 4,
    mode: "number",
  }).notNull().default(0.34),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const configurations = pgTable("configurations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  frameId: uuid("frame_id")
    .notNull()
    .references(() => panelboardFrames.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  customerName: text("customer_name").notNull(),
  projectName: text("project_name").notNull(),
  notes: text("notes").notNull().default(""),
  subtotal: money("subtotal").notNull().default(0),
  margin: numeric("margin", { precision: 5, scale: 4, mode: "number" }).notNull().default(0),
  totalSellPrice: money("total_sell_price").notNull().default(0),
  ...timestamps,
});

export const configurationItems = pgTable("configuration_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  configurationId: uuid("configuration_id")
    .notNull()
    .references(() => configurations.id, { onDelete: "cascade" }),
  slotId: uuid("slot_id").references(() => panelboardSlots.id, { onDelete: "set null" }),
  breakerOptionId: uuid("breaker_option_id").references(() => breakerOptions.id, {
    onDelete: "set null",
  }),
  coverPlateId: uuid("cover_plate_id").references(() => coverPlates.id, {
    onDelete: "set null",
  }),
  itemType: text("item_type").notNull(),
  quantity: integer("quantity").notNull(),
  catalogNumber: text("catalog_number").notNull(),
  description: text("description").notNull(),
  unitCost: money("unit_cost").notNull().default(0),
  unitSellPrice: money("unit_sell_price").notNull().default(0),
  extendedSellPrice: money("extended_sell_price").notNull().default(0),
});
