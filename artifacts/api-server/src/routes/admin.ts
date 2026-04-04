import { Router, type IRouter } from "express";
import { eq, sql, desc, and, gte, lte } from "drizzle-orm";
import { db, clinicsTable, usersTable, appointmentsTable, subscriptionsTable, paymentsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/clinics", requireAuth, requireRole("super_admin"), async (req, res): Promise<void> => {
  const clinics = await db.select().from(clinicsTable).orderBy(clinicsTable.createdAt);

  const result = await Promise.all(clinics.map(async (clinic) => {
    const subs = await db.select().from(subscriptionsTable)
      .where(eq(subscriptionsTable.clinicId, clinic.id))
      .orderBy(desc(subscriptionsTable.createdAt))
      .limit(1);

    const sub = subs[0];
    const now = new Date();
    const isActive = sub ? (sub.status === "active" && (!sub.endDate || new Date(sub.endDate) > now)) : false;
    const daysRemaining = sub?.endDate
      ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    const doctorCount = await db.select({ count: sql<number>`count(*)` })
      .from(usersTable)
      .where(and(eq(usersTable.clinicId, clinic.id), eq(usersTable.role, "doctor")));

    const patientCount = await db.select({ count: sql<number>`count(distinct ${appointmentsTable.patientPhone})` })
      .from(appointmentsTable)
      .where(eq(appointmentsTable.clinicId, clinic.id));

    return {
      ...clinic,
      subscription: sub ? {
        isActive,
        subscription: sub,
        daysRemaining,
        expiresAt: sub.endDate,
      } : null,
      totalDoctors: Number(doctorCount[0]?.count ?? 0),
      totalPatients: Number(patientCount[0]?.count ?? 0),
    };
  }));

  res.json(result);
});

router.get("/admin/stats", requireAuth, requireRole("super_admin"), async (req, res): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalClinicsRow] = await db.select({ count: sql<number>`count(*)` }).from(clinicsTable);
  const [suspendedRow] = await db.select({ count: sql<number>`count(*)` }).from(clinicsTable).where(eq(clinicsTable.isSuspended, true));
  const [totalDoctorsRow] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "doctor"));
  const [totalPatientsRow] = await db.select({ count: sql<number>`count(distinct ${appointmentsTable.patientPhone})` }).from(appointmentsTable);
  const [totalRevenueRow] = await db.select({ total: sql<number>`coalesce(sum(${paymentsTable.amount}), 0)` }).from(paymentsTable).where(eq(paymentsTable.status, "success"));
  const [monthlyRevenueRow] = await db.select({ total: sql<number>`coalesce(sum(${paymentsTable.amount}), 0)` })
    .from(paymentsTable)
    .where(and(eq(paymentsTable.status, "success"), gte(paymentsTable.createdAt, startOfMonth)));

  const allSubs = await db.select().from(subscriptionsTable);
  const activeSubs = allSubs.filter(s => s.status === "active" && (!s.endDate || new Date(s.endDate) > now));
  const expiredSubs = allSubs.filter(s => s.status === "expired" || (s.status === "active" && s.endDate && new Date(s.endDate) <= now));

  res.json({
    totalClinics: Number(totalClinicsRow?.count ?? 0),
    activeClinics: activeSubs.length,
    expiredClinics: expiredSubs.length,
    suspendedClinics: Number(suspendedRow?.count ?? 0),
    totalDoctors: Number(totalDoctorsRow?.count ?? 0),
    totalPatients: Number(totalPatientsRow?.count ?? 0),
    totalRevenue: Number(totalRevenueRow?.total ?? 0),
    monthlyRevenue: Number(monthlyRevenueRow?.total ?? 0),
  });
});

router.get("/admin/revenue", requireAuth, requireRole("super_admin"), async (req, res): Promise<void> => {
  const months = parseInt((req.query.months as string) ?? "6", 10);
  const result: Array<{ month: string; revenue: number; subscriptions: number }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    const [revenueRow] = await db.select({ total: sql<number>`coalesce(sum(${paymentsTable.amount}), 0)` })
      .from(paymentsTable)
      .where(and(eq(paymentsTable.status, "success"), gte(paymentsTable.createdAt, start), lte(paymentsTable.createdAt, end)));

    const [subCount] = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptionsTable)
      .where(and(gte(subscriptionsTable.createdAt, start), lte(subscriptionsTable.createdAt, end)));

    result.push({
      month: `${year}-${String(month + 1).padStart(2, "0")}`,
      revenue: Number(revenueRow?.total ?? 0),
      subscriptions: Number(subCount?.count ?? 0),
    });
  }

  res.json(result);
});

router.get("/admin/admin-users", requireAuth, requireRole("super_admin"), async (req, res): Promise<void> => {
  const admins = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    phone: usersTable.phone,
    role: usersTable.role,
    isActive: usersTable.isActive,
    lastLoginAt: usersTable.lastLoginAt,
    createdAt: usersTable.createdAt,
  }).from(usersTable)
    .where(eq(usersTable.role, "super_admin"))
    .orderBy(desc(usersTable.createdAt));

  const now = new Date();
  const result = admins.map((admin) => {
    const lastLogin = admin.lastLoginAt ? new Date(admin.lastLoginAt) : null;
    const minutesSinceLogin = lastLogin ? (now.getTime() - lastLogin.getTime()) / (1000 * 60) : null;
    const isOnline = minutesSinceLogin !== null && minutesSinceLogin <= 15;
    return { ...admin, isOnline };
  });

  res.json(result);
});

router.patch("/admin/admin-users/:id/toggle-status", requireAuth, requireRole("super_admin"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  if (req.user?.userId === id) {
    res.status(400).json({ error: "Cannot deactivate your own account" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  const newStatus = existing.isActive === "active" ? "inactive" : "active";
  await db.update(usersTable).set({ isActive: newStatus }).where(eq(usersTable.id, id));

  res.json({ success: true, isActive: newStatus });
});

export default router;
