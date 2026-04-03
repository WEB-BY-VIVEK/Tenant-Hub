import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, invoicesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/invoices", requireAuth, async (req, res): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.user.role !== "super_admin" && req.user.clinicId == null) {
    res.status(403).json({ error: "No clinic associated with your account" });
    return;
  }

  const clinicId = req.user.clinicId;
  if (clinicId == null) {
    res.status(400).json({ error: "No clinic specified" });
    return;
  }

  const invoices = await db.select().from(invoicesTable)
    .where(eq(invoicesTable.clinicId, clinicId))
    .orderBy(desc(invoicesTable.createdAt));

  res.json(invoices);
});

router.get("/invoices/:invoiceId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.invoiceId) ? req.params.invoiceId[0] : req.params.invoiceId;
  const invoiceId = parseInt(raw, 10);

  const [invoice] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, invoiceId));

  if (!invoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  if (req.user?.role !== "super_admin" && req.user?.clinicId !== invoice.clinicId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json(invoice);
});

export default router;
