import { Router, type IRouter } from "express";
import { db, inquiriesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/inquiries", async (req, res): Promise<void> => {
  const { name, phone, email, message } = req.body;
  if (!name || !phone || !email || !message) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  try {
    const [inquiry] = await db.insert(inquiriesTable).values({ name, phone, email, message }).returning();
    res.status(201).json(inquiry);
  } catch (err) {
    req.log.error({ err }, "Failed to save inquiry");
    res.status(500).json({ error: "Failed to save inquiry" });
  }
});

router.get("/admin/inquiries", requireAuth, async (req, res): Promise<void> => {
  if (req.user?.role !== "super_admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const inquiries = await db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt));
  res.json(inquiries);
});

router.patch("/admin/inquiries/:id/status", requireAuth, async (req, res): Promise<void> => {
  if (req.user?.role !== "super_admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { id } = req.params;
  const { status } = req.body;
  if (!["new", "in_progress", "resolved"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const [updated] = await db.update(inquiriesTable).set({ status }).where(eq(inquiriesTable.id, Number(id))).returning();
  res.json(updated);
});

export default router;
