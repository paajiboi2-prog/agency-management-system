import { Router } from "express";
import { db } from "@workspace/db";
import { proformaInvoicesTable, clientsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

let proformaInvoiceCounter = 1000;

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: proformaInvoicesTable.id,
        number: proformaInvoicesTable.number,
        clientId: proformaInvoicesTable.clientId,
        clientName: clientsTable.companyName,
        status: proformaInvoicesTable.status,
        invoiceDate: proformaInvoicesTable.invoiceDate,
        dueDate: proformaInvoicesTable.dueDate,
        companyGstin: proformaInvoicesTable.companyGstin,
        clientGstin: proformaInvoicesTable.clientGstin,
        billingAddress: proformaInvoicesTable.billingAddress,
        shippingAddress: proformaInvoicesTable.shippingAddress,
        subtotal: proformaInvoicesTable.subtotal,
        taxAmount: proformaInvoicesTable.taxAmount,
        total: proformaInvoicesTable.total,
        notes: proformaInvoicesTable.notes,
        termsAndConditions: proformaInvoicesTable.termsAndConditions,
        bankDetails: proformaInvoicesTable.bankDetails,
        lineItems: proformaInvoicesTable.lineItems,
        createdAt: proformaInvoicesTable.createdAt,
      })
      .from(proformaInvoicesTable)
      .leftJoin(clientsTable, eq(proformaInvoicesTable.clientId, clientsTable.id));
    return res.json(rows);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/", async (req, res) => {
  try {
    proformaInvoiceCounter++;
    const body = { ...req.body };
    if (!body.clientId) delete body.clientId;
    body.number = `PINV-${proformaInvoiceCounter}`;
    const [row] = await db.insert(proformaInvoicesTable).values(body).returning();
    return res.status(201).json(row);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [row] = await db
      .select({
        id: proformaInvoicesTable.id,
        number: proformaInvoicesTable.number,
        clientId: proformaInvoicesTable.clientId,
        clientName: clientsTable.companyName,
        status: proformaInvoicesTable.status,
        invoiceDate: proformaInvoicesTable.invoiceDate,
        dueDate: proformaInvoicesTable.dueDate,
        companyGstin: proformaInvoicesTable.companyGstin,
        clientGstin: proformaInvoicesTable.clientGstin,
        billingAddress: proformaInvoicesTable.billingAddress,
        shippingAddress: proformaInvoicesTable.shippingAddress,
        subtotal: proformaInvoicesTable.subtotal,
        taxAmount: proformaInvoicesTable.taxAmount,
        total: proformaInvoicesTable.total,
        notes: proformaInvoicesTable.notes,
        termsAndConditions: proformaInvoicesTable.termsAndConditions,
        bankDetails: proformaInvoicesTable.bankDetails,
        lineItems: proformaInvoicesTable.lineItems,
        createdAt: proformaInvoicesTable.createdAt,
      })
      .from(proformaInvoicesTable)
      .leftJoin(clientsTable, eq(proformaInvoicesTable.clientId, clientsTable.id))
      .where(eq(proformaInvoicesTable.id, req.params.id));
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
    const [row] = await db.update(proformaInvoicesTable).set(body).where(eq(proformaInvoicesTable.id, req.params.id)).returning();
    return res.json(row);
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(proformaInvoicesTable).where(eq(proformaInvoicesTable.id, req.params.id));
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
