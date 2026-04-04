import { Router, type IRouter } from "express";
import { eq, and, sql, desc } from "drizzle-orm";
import { db, appointmentsTable, tokensTable, clinicsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { requireActiveSubscription, checkClinicSubscription } from "../middlewares/subscription";
import type { appointmentStatusEnum } from "@workspace/db";

type AppointmentStatus = typeof appointmentStatusEnum.enumValues[number];

const router: IRouter = Router();

async function generateTokenNumber(clinicId: number, date: string): Promise<number> {
  const existing = await db.select({ tokenNumber: tokensTable.tokenNumber })
    .from(tokensTable)
    .where(and(eq(tokensTable.clinicId, clinicId), eq(tokensTable.tokenDate, date)))
    .orderBy(sql`${tokensTable.tokenNumber} desc`)
    .limit(1);

  return existing.length > 0 ? (existing[0].tokenNumber + 1) : 1;
}

router.post("/appointments/book", async (req, res): Promise<void> => {
  const { clinicId, patientName, patientPhone, patientEmail, appointmentDate, timeSlot, reason } = req.body;

  if (!clinicId || !patientName || !patientPhone || !appointmentDate || !timeSlot) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [clinic] = await db.select().from(clinicsTable).where(eq(clinicsTable.id, clinicId));
  if (!clinic) {
    res.status(404).json({ error: "Clinic not found" });
    return;
  }

  if (clinic.isSuspended) {
    res.status(403).json({ error: "Clinic is currently suspended" });
    return;
  }

  const hasActiveSub = await checkClinicSubscription(clinicId);
  if (!hasActiveSub) {
    res.status(403).json({ error: "This clinic's subscription has expired. Please contact the clinic directly." });
    return;
  }

  const [appointment] = await db.insert(appointmentsTable).values({
    clinicId,
    patientName,
    patientPhone,
    patientEmail: patientEmail ?? null,
    appointmentDate,
    timeSlot,
    reason: reason ?? null,
    status: "waiting",
  }).returning();

  const tokenNumber = await generateTokenNumber(clinicId, appointmentDate);

  const [token] = await db.insert(tokensTable).values({
    clinicId,
    appointmentId: appointment.id,
    tokenNumber,
    tokenDate: appointmentDate,
    status: "waiting",
  }).returning();

  res.status(201).json({
    appointment,
    token,
    message: `Your token number is ${tokenNumber}. Please arrive on time.`,
  });
});

router.get("/appointments", requireAuth, async (req, res): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.user.role !== "super_admin" && req.user.clinicId == null) {
    res.status(403).json({ error: "No clinic associated with your account" });
    return;
  }

  const { date, status, patientName } = req.query;

  const conditions = [];

  if (req.user.role !== "super_admin") {
    conditions.push(eq(appointmentsTable.clinicId, req.user.clinicId!));
  }

  if (date && typeof date === "string") {
    conditions.push(eq(appointmentsTable.appointmentDate, date));
  }

  if (status && typeof status === "string") {
    const validStatuses: AppointmentStatus[] = ["waiting", "in_progress", "completed", "cancelled", "rescheduled", "no_show"];
    if (validStatuses.includes(status as AppointmentStatus)) {
      conditions.push(eq(appointmentsTable.status, status as AppointmentStatus));
    }
  }

  const appointments = conditions.length > 0
    ? await db.select().from(appointmentsTable).where(and(...conditions)).orderBy(appointmentsTable.appointmentDate, appointmentsTable.createdAt)
    : await db.select().from(appointmentsTable).orderBy(appointmentsTable.appointmentDate, appointmentsTable.createdAt);

  const result = await Promise.all(appointments.map(async (a) => {
    const [token] = await db.select().from(tokensTable).where(eq(tokensTable.appointmentId, a.id)).limit(1);
    return { ...a, token: token ?? null };
  }));

  const filtered = patientName && typeof patientName === "string"
    ? result.filter(a => a.patientName.toLowerCase().includes(patientName.toLowerCase()))
    : result;

  res.json(filtered);
});

router.get("/appointments/:appointmentId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.appointmentId) ? req.params.appointmentId[0] : req.params.appointmentId;
  const appointmentId = parseInt(raw, 10);

  const [appointment] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, appointmentId));

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  if (req.user?.role !== "super_admin" && req.user?.clinicId !== appointment.clinicId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const [token] = await db.select().from(tokensTable).where(eq(tokensTable.appointmentId, appointmentId)).limit(1);

  res.json({ ...appointment, token: token ?? null });
});

router.patch("/appointments/:appointmentId", requireAuth, requireActiveSubscription, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.appointmentId) ? req.params.appointmentId[0] : req.params.appointmentId;
  const appointmentId = parseInt(raw, 10);

  const [existing] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, appointmentId));

  if (!existing) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  if (req.user?.role !== "super_admin" && req.user?.clinicId !== existing.clinicId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const { status, rescheduledDate, rescheduledTimeSlot, notes } = req.body;

  const validStatuses: AppointmentStatus[] = ["waiting", "in_progress", "completed", "cancelled", "rescheduled", "no_show"];
  const updateStatus: AppointmentStatus | undefined = (status && validStatuses.includes(status)) ? (status as AppointmentStatus) : undefined;

  const [updated] = await db.update(appointmentsTable)
    .set({
      ...(updateStatus !== undefined ? { status: updateStatus } : {}),
      ...(rescheduledDate !== undefined ? { rescheduledDate } : {}),
      ...(rescheduledTimeSlot !== undefined ? { rescheduledTimeSlot } : {}),
      ...(notes !== undefined ? { notes } : {}),
    })
    .where(eq(appointmentsTable.id, appointmentId))
    .returning();

  if (updateStatus === "rescheduled" && rescheduledDate) {
    await db.update(tokensTable)
      .set({ status: "skipped" })
      .where(eq(tokensTable.appointmentId, appointmentId));
  }

  const [token] = await db.select().from(tokensTable).where(eq(tokensTable.appointmentId, appointmentId)).limit(1);

  res.json({ ...updated, token: token ?? null });
});

export default router;
