import { Router } from "express";
import { db } from "@workspace/db";
import { purchaseOrdersTable, clientsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

let purchaseOrderCounter = 1000;

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: purchaseOrdersTable.id,
        number: purchaseOrdersTable.number,
        clientId: purchaseOrdersTable.clientId,
        clientName: clientsTable.companyName,
        status: purchaseOrdersTable.status,
        orderDate: purchaseOrdersTable.orderDate,
        deliveryDate: purchaseOrdersTable.deliveryDate,
        companyGstin: purchaseOrdersTable.companyGstin,
        vendorGstin: purchaseOrdersTable.vendorGstin,
        billingAddress: purchaseOrdersTable.billingAddress,
        shippingAddress: purchaseOrdersTable.shippingAddress,
        subtotal: purchaseOrdersTable.subtotal,
        taxAmount: purchaseOrdersTable.taxAmount,
        total: purchaseOrdersTable.total,
        notes: purchaseOrdersTable.notes,
        termsAndConditions: purchaseOrdersTable.termsAndConditions,
        lineItems: purchaseOrdersTable.lineItems,
        createdAt: purchaseOrdersTable.createdAt,
      })
      .from(purchaseOrdersTable)
      .leftJoin(clientsTable, eq(purchaseOrdersTable.clientId, clientsTable.id));
    return res.json(rows);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/", async (req, res) => {
  try {
    purchaseOrderCounter++;
    const body = { ...req.body };
    if (!body.clientId) delete body.clientId;
    body.number = `PO-${purchaseOrderCounter}`;
    const [row] = await db.insert(purchaseOrdersTable).values(body).returning();
    return res.status(201).json(row);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [row] = await db
      .select({
        id: purchaseOrdersTable.id,
        number: purchaseOrdersTable.number,
        clientId: purchaseOrdersTable.clientId,
        clientName: clientsTable.companyName,
        status: purchaseOrdersTable.status,
        orderDate: purchaseOrdersTable.orderDate,
        deliveryDate: purchaseOrdersTable.deliveryDate,
        companyGstin: purchaseOrdersTable.companyGstin,
        vendorGstin: purchaseOrdersTable.vendorGstin,
        billingAddress: purchaseOrdersTable.billingAddress,
        shippingAddress: purchaseOrdersTable.shippingAddress,
        subtotal: purchaseOrdersTable.subtotal,
        taxAmount: purchaseOrdersTable.taxAmount,
        total: purchaseOrdersTable.total,
        notes: purchaseOrdersTable.notes,
        termsAndConditions: purchaseOrdersTable.termsAndConditions,
        lineItems: purchaseOrdersTable.lineItems,
        createdAt: purchaseOrdersTable.createdAt,
      })
      .from(purchaseOrdersTable)
      .leftJoin(clientsTable, eq(purchaseOrdersTable.clientId, clientsTable.id))
      .where(eq(purchaseOrdersTable.id, req.params.id));
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(row);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.clientId === "") body.clientId = null;
    const [row] = await db.update(purchaseOrdersTable).set(body).where(eq(purchaseOrdersTable.id, req.params.id)).returning();
    return res.json(row);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, req.params.id));
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
