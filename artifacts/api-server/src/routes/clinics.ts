import { Router, type IRouter } from "express";
import { eq, sql, and, desc } from "drizzle-orm";
import { db, clinicsTable, usersTable, appointmentsTable, subscriptionsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/clinics/public", async (req, res): Promise<void> => {
  const clinics = await db.select({
    id: clinicsTable.id,
    name: clinicsTable.name,
    city: clinicsTable.city,
    address: clinicsTable.address,
  }).from(clinicsTable).where(eq(clinicsTable.isSuspended, false)).orderBy(clinicsTable.createdAt);
  res.json(clinics);
});

router.get("/clinics", requireAuth, requireRole("super_admin"), async (req, res): Promise<void> => {
  const clinics = await db.select().from(clinicsTable).orderBy(clinicsTable.createdAt);
  res.json(clinics);
});

router.post("/clinics", requireAuth, requireRole("super_admin"), async (req, res): Promise<void> => {
  const { name, slug, ownerName, phone, email, address, city, state, pincode, whatsappNumber, googleMapsUrl } = req.body;

  if (!name || !slug || !ownerName || !phone || !email) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [clinic] = await db.insert(clinicsTable).values({
    name, slug, ownerName, phone, email, address, city, state, pincode, whatsappNumber, googleMapsUrl,
  }).returning();

  res.status(201).json(clinic);
});

router.get("/clinics/:clinicId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.clinicId) ? req.params.clinicId[0] : req.params.clinicId;
  const clinicId = parseInt(raw, 10);

  const [clinic] = await db.select().from(clinicsTable).where(eq(clinicsTable.id, clinicId));
  if (!clinic) {
    res.status(404).json({ error: "Clinic not found" });
    return;
  }

  if (req.user?.role !== "super_admin" && req.user?.clinicId !== clinicId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const subs = await db.select().from(subscriptionsTable)
    .where(eq(subscriptionsTable.clinicId, clinicId))
    .orderBy(desc(subscriptionsTable.createdAt))
    .limit(1);
  const sub = subs[0];
  const now = new Date();
  const isActive = sub ? (sub.status === "active" && (!sub.endDate || new Date(sub.endDate) > now)) : false;
  const daysRemaining = sub?.endDate
    ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const [doctorCount] = await db.select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .where(and(eq(usersTable.clinicId, clinicId), eq(usersTable.role, "doctor")));

  const [patientCount] = await db.select({ count: sql<number>`count(distinct ${appointmentsTable.patientPhone})` })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.clinicId, clinicId));

  res.json({
    ...clinic,
    subscription: sub ? { isActive, subscription: sub, daysRemaining, expiresAt: sub.endDate } : null,
    totalDoctors: Number(doctorCount?.count ?? 0),
    totalPatients: Number(patientCount?.count ?? 0),
  });
});

router.patch("/clinics/:clinicId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.clinicId) ? req.params.clinicId[0] : req.params.clinicId;
  const clinicId = parseInt(raw, 10);

  if (req.user?.role !== "super_admin" && req.user?.clinicId !== clinicId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const { name, ownerName, phone, address, city, state, pincode, logoUrl, whatsappNumber, googleMapsUrl } = req.body;

  const [clinic] = await db.update(clinicsTable)
    .set({ name, ownerName, phone, address, city, state, pincode, logoUrl, whatsappNumber, googleMapsUrl })
    .where(eq(clinicsTable.id, clinicId))
    .returning();

  if (!clinic) {
    res.status(404).json({ error: "Clinic not found" });
    return;
  }

  res.json(clinic);
});

router.post("/clinics/:clinicId/suspend", requireAuth, requireRole("super_admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.clinicId) ? req.params.clinicId[0] : req.params.clinicId;
  const clinicId = parseInt(raw, 10);
  const { suspend } = req.body;

  const [clinic] = await db.update(clinicsTable)
    .set({ isSuspended: !!suspend })
    .where(eq(clinicsTable.id, clinicId))
    .returning();

  if (!clinic) {
    res.status(404).json({ error: "Clinic not found" });
    return;
  }

  res.json(clinic);
});

export default router;
