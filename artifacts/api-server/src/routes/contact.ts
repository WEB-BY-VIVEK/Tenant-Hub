import { Router, type IRouter } from "express";
import { db, contactInquiriesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/contact", async (req, res): Promise<void> => {
  const { name, phone, email, message } = req.body;

  if (!name || !phone || !message) {
    res.status(400).json({ error: "Name, phone, and message are required." });
    return;
  }

  const [inquiry] = await db.insert(contactInquiriesTable).values({
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : null,
    message: String(message).trim(),
    status: "new",
  }).returning();

  res.status(201).json({ success: true, id: inquiry.id });
});

router.get("/admin/inquiries", requireAuth, async (req, res): Promise<void> => {
  if (req.user?.role !== "super_admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  const inquiries = await db.select().from(contactInquiriesTable).orderBy(desc(contactInquiriesTable.createdAt));
  res.json(inquiries);
});

router.patch("/admin/inquiries/:id/status", requireAuth, async (req, res): Promise<void> => {
  if (req.user?.role !== "super_admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  const id = Number(req.params.id);
  const { status } = req.body;

  if (!["new", "contacted", "closed"].includes(status)) {
    res.status(400).json({ error: "Status must be new, contacted, or closed" });
    return;
  }

  const [updated] = await db.update(contactInquiriesTable)
    .set({ status })
    .where(eq(contactInquiriesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }

  res.json(updated);
});

export default router;
