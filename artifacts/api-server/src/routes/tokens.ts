import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, tokensTable, appointmentsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/tokens/queue", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated" });
    return;
  }

  const clinicId = req.user.clinicId;
  const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);

  const tokens = await db.select().from(tokensTable)
    .where(and(eq(tokensTable.clinicId, clinicId), eq(tokensTable.tokenDate, date)))
    .orderBy(tokensTable.tokenNumber);

  const result = await Promise.all(tokens.map(async (t) => {
    const [appointment] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, t.appointmentId)).limit(1);
    return { ...t, appointment: appointment ?? null };
  }));

  res.json(result);
});

router.patch("/tokens/:tokenId/status", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.tokenId) ? req.params.tokenId[0] : req.params.tokenId;
  const tokenId = parseInt(raw, 10);

  const [existing] = await db.select().from(tokensTable).where(eq(tokensTable.id, tokenId));

  if (!existing) {
    res.status(404).json({ error: "Token not found" });
    return;
  }

  if (req.user?.role !== "super_admin" && req.user?.clinicId !== existing.clinicId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const { status } = req.body;
  const now = new Date();

  const updateData: Record<string, any> = { status };
  if (status === "called") updateData.calledAt = now;
  if (status === "completed") updateData.completedAt = now;

  const [updated] = await db.update(tokensTable)
    .set(updateData)
    .where(eq(tokensTable.id, tokenId))
    .returning();

  if (status === "completed" || status === "skipped") {
    const apptStatus = status === "completed" ? "completed" : "no_show";
    await db.update(appointmentsTable)
      .set({ status: apptStatus })
      .where(eq(appointmentsTable.id, existing.appointmentId));
  }

  res.json(updated);
});

export default router;
