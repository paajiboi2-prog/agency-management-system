import { pgTable, text, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clientsTable } from "./clients";

export const deliveryChallansTable = pgTable("delivery_challans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  number: text("number"),
  clientId: text("client_id").references(() => clientsTable.id, { onDelete: "set null" }),
  status: text("status").default("DRAFT"),
  challanDate: text("challan_date"),
  companyGstin: text("company_gstin"),
  clientGstin: text("client_gstin"),
  shippingAddress: text("shipping_address"),
  vehicleNumber: text("vehicle_number"),
  dispatchMode: text("dispatch_mode"),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  lineItems: json("line_items").$type<Array<{ description: string; hsnSac?: string; qty: number }>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeliveryChallanSchema = createInsertSchema(deliveryChallansTable).omit({ id: true, createdAt: true });
export type InsertDeliveryChallan = z.infer<typeof insertDeliveryChallanSchema>;
export type DeliveryChallan = typeof deliveryChallansTable.$inferSelect;
