import { Router, type IRouter } from "express";
import { eq, and, sql, gte, desc } from "drizzle-orm";
import { db, appointmentsTable, tokensTable, subscriptionsTable, clinicsTable, paymentsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/today", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated with your account" });
    return;
  }

  const clinicId = req.user.clinicId;
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const todayAppts = await db.select().from(appointmentsTable)
    .where(and(eq(appointmentsTable.clinicId, clinicId), eq(appointmentsTable.appointmentDate, today)));

  const completed = todayAppts.filter(a => a.status === "completed").length;
  const waiting = todayAppts.filter(a => a.status === "waiting" || a.status === "in_progress").length;

  const [totalPatientsRow] = await db.select({ count: sql<number>`count(distinct ${appointmentsTable.patientPhone})` })
    .from(appointmentsTable).where(eq(appointmentsTable.clinicId, clinicId));

  const todayTokens = await db.select().from(tokensTable)
    .where(and(eq(tokensTable.clinicId, clinicId), eq(tokensTable.tokenDate, today)))
    .orderBy(tokensTable.tokenNumber);

  const calledToken = todayTokens.find(t => t.status === "called");
  const nextToken = todayTokens.find(t => t.status === "waiting");

  const subs = await db.select().from(subscriptionsTable)
    .where(eq(subscriptionsTable.clinicId, clinicId))
    .orderBy(desc(subscriptionsTable.createdAt))
    .limit(1);

  const sub = subs[0];
  const isActive = sub ? (sub.status === "active" && (!sub.endDate || new Date(sub.endDate) > now)) : false;
  const daysRemaining = sub?.endDate
    ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  res.json({
    totalAppointmentsToday: todayAppts.length,
    completedToday: completed,
    waitingToday: waiting,
    currentToken: calledToken?.tokenNumber ?? null,
    nextToken: nextToken?.tokenNumber ?? null,
    totalPatientsAllTime: Number(totalPatientsRow?.count ?? 0),
    subscriptionStatus: {
      isActive,
      subscription: sub ?? null,
      daysRemaining,
      expiresAt: sub?.endDate ?? null,
    },
  });
});

router.get("/dashboard/queue-summary", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated with your account" });
    return;
  }

  const clinicId = req.user.clinicId;
  const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);

  const tokens = await db.select().from(tokensTable)
    .where(and(eq(tokensTable.clinicId, clinicId), eq(tokensTable.tokenDate, date)))
    .orderBy(tokensTable.tokenNumber);

  const waiting = tokens.filter(t => t.status === "waiting").length;
  const called = tokens.filter(t => t.status === "called").length;
  const completed = tokens.filter(t => t.status === "completed").length;
  const skipped = tokens.filter(t => t.status === "skipped").length;

  const calledToken = tokens.find(t => t.status === "called");
  const estimatedWaitMinutes = waiting > 0 ? waiting * 10 : null;

  res.json({
    date,
    totalTokens: tokens.length,
    waitingCount: waiting,
    calledCount: called,
    completedCount: completed,
    skippedCount: skipped,
    currentToken: calledToken?.tokenNumber ?? null,
    estimatedWaitMinutes,
  });
});

router.get("/dashboard/weekly-stats", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated with your account" });
    return;
  }

  const clinicId = req.user.clinicId;
  const result: Array<{ date: string; appointments: number; completed: number; cancelled: number }> = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const dayAppts = await db.select().from(appointmentsTable)
      .where(and(eq(appointmentsTable.clinicId, clinicId), eq(appointmentsTable.appointmentDate, dateStr)));

    result.push({
      date: dateStr,
      appointments: dayAppts.length,
      completed: dayAppts.filter(a => a.status === "completed").length,
      cancelled: dayAppts.filter(a => a.status === "cancelled").length,
    });
  }

  res.json(result);
});

router.get("/dashboard/patient-stats", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated with your account" });
    return;
  }

  const clinicId = req.user.clinicId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const [totalRow] = await db.select({ count: sql<number>`count(distinct ${appointmentsTable.patientPhone})` })
    .from(appointmentsTable).where(eq(appointmentsTable.clinicId, clinicId));

  const monthAppts = await db.select({ phone: appointmentsTable.patientPhone })
    .from(appointmentsTable)
    .where(and(eq(appointmentsTable.clinicId, clinicId), gte(appointmentsTable.createdAt, startOfMonth)));

  const weekAppts = await db.select({ phone: appointmentsTable.patientPhone })
    .from(appointmentsTable)
    .where(and(eq(appointmentsTable.clinicId, clinicId), gte(appointmentsTable.createdAt, startOfWeek)));

  const monthPhones = new Set(monthAppts.map(a => a.phone));
  const weekPhones = new Set(weekAppts.map(a => a.phone));

  const allAppts = await db.select({ phone: appointmentsTable.patientPhone, count: sql<number>`count(*)` })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.clinicId, clinicId))
    .groupBy(appointmentsTable.patientPhone);

  const repeatCount = allAppts.filter(r => Number(r.count) > 1).length;

  res.json({
    totalPatients: Number(totalRow?.count ?? 0),
    newThisMonth: monthPhones.size,
    newThisWeek: weekPhones.size,
    repeatPatients: repeatCount,
  });
});

// Admin-only: requires super_admin role
router.get("/dashboard/subscription-health", requireAuth, requireRole("super_admin"), async (req, res): Promise<void> => {
  const now = new Date();
  const oneWeekAhead = new Date(now);
  oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);

  const allSubs = await db.select().from(subscriptionsTable).orderBy(desc(subscriptionsTable.createdAt));

  const seen = new Set<number>();
  const latestSubs: typeof allSubs = [];
  for (const s of allSubs) {
    if (!seen.has(s.clinicId)) {
      seen.add(s.clinicId);
      latestSubs.push(s);
    }
  }

  const active = latestSubs.filter(s => s.status === "active" && (!s.endDate || new Date(s.endDate) > now));
  const expired = latestSubs.filter(s => s.status === "expired" || (s.status === "active" && s.endDate && new Date(s.endDate) <= now));
  const expiringThisWeek = active.filter(s => s.endDate && new Date(s.endDate) <= oneWeekAhead);

  const clinics = await db.select().from(clinicsTable).limit(5);
  const topClinics = await Promise.all(clinics.map(async (c) => {
    const [row] = await db.select({ count: sql<number>`count(distinct ${appointmentsTable.patientPhone})` })
      .from(appointmentsTable).where(eq(appointmentsTable.clinicId, c.id));
    const sub = latestSubs.find(s => s.clinicId === c.id);
    return {
      clinicId: c.id,
      clinicName: c.name,
      totalPatients: Number(row?.count ?? 0),
      plan: sub?.plan ?? null,
    };
  }));

  const totalRate = latestSubs.length > 0 ? active.length / latestSubs.length : 0;

  res.json({
    totalActive: active.length,
    totalExpired: expired.length,
    expiringThisWeek: expiringThisWeek.length,
    activeRate: Math.round(totalRate * 100) / 100,
    topClinics: topClinics.sort((a, b) => b.totalPatients - a.totalPatients),
  });
});

export default router;
