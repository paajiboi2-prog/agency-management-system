import { Router } from "express";
import { db } from "@workspace/db";
import { deliveryChallansTable, clientsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

let deliveryChallanCounter = 1000;

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: deliveryChallansTable.id,
        number: deliveryChallansTable.number,
        clientId: deliveryChallansTable.clientId,
        clientName: clientsTable.companyName,
        status: deliveryChallansTable.status,
        challanDate: deliveryChallansTable.challanDate,
        companyGstin: deliveryChallansTable.companyGstin,
        clientGstin: deliveryChallansTable.clientGstin,
        shippingAddress: deliveryChallansTable.shippingAddress,
        vehicleNumber: deliveryChallansTable.vehicleNumber,
        dispatchMode: deliveryChallansTable.dispatchMode,
        notes: deliveryChallansTable.notes,
        termsAndConditions: deliveryChallansTable.termsAndConditions,
        lineItems: deliveryChallansTable.lineItems,
        createdAt: deliveryChallansTable.createdAt,
      })
      .from(deliveryChallansTable)
      .leftJoin(clientsTable, eq(deliveryChallansTable.clientId, clientsTable.id));
    return res.json(rows);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/", async (req, res) => {
  try {
    deliveryChallanCounter++;
    const body = { ...req.body };
    if (!body.clientId) delete body.clientId;
    body.number = `DC-${deliveryChallanCounter}`;
    const [row] = await db.insert(deliveryChallansTable).values(body).returning();
    return res.status(201).json(row);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [row] = await db
      .select({
        id: deliveryChallansTable.id,
        number: deliveryChallansTable.number,
        clientId: deliveryChallansTable.clientId,
        clientName: clientsTable.companyName,
        status: deliveryChallansTable.status,
        challanDate: deliveryChallansTable.challanDate,
        companyGstin: deliveryChallansTable.companyGstin,
        clientGstin: deliveryChallansTable.clientGstin,
        shippingAddress: deliveryChallansTable.shippingAddress,
        vehicleNumber: deliveryChallansTable.vehicleNumber,
        dispatchMode: deliveryChallansTable.dispatchMode,
        notes: deliveryChallansTable.notes,
        termsAndConditions: deliveryChallansTable.termsAndConditions,
        lineItems: deliveryChallansTable.lineItems,
        createdAt: deliveryChallansTable.createdAt,
      })
      .from(deliveryChallansTable)
      .leftJoin(clientsTable, eq(deliveryChallansTable.clientId, clientsTable.id))
      .where(eq(deliveryChallansTable.id, req.params.id));
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
    const [row] = await db.update(deliveryChallansTable).set(body).where(eq(deliveryChallansTable.id, req.params.id)).returning();
    return res.json(row);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(deliveryChallansTable).where(eq(deliveryChallansTable.id, req.params.id));
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
