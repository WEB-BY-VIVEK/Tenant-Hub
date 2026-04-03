import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, subscriptionsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import type { subscriptionPlanEnum } from "@workspace/db";

type SubscriptionPlan = typeof subscriptionPlanEnum.enumValues[number];

const router: IRouter = Router();

function planDurationMonths(plan: SubscriptionPlan): number {
  if (plan === "quarterly") return 3;
  if (plan === "yearly") return 12;
  return 1;
}

function planAmount(plan: SubscriptionPlan): number {
  if (plan === "quarterly") return 2499;
  if (plan === "yearly") return 9999;
  return 999;
}

router.get("/subscriptions/current", requireAuth, async (req, res): Promise<void> => {
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

  const subs = await db.select().from(subscriptionsTable)
    .where(eq(subscriptionsTable.clinicId, clinicId))
    .orderBy(desc(subscriptionsTable.createdAt))
    .limit(1);

  const sub = subs[0];

  if (!sub) {
    res.status(404).json({ error: "No subscription found" });
    return;
  }

  const now = new Date();
  const isActive = sub.status === "active" && (!sub.endDate || new Date(sub.endDate) > now);
  const daysRemaining = sub.endDate
    ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  res.json({
    isActive,
    subscription: sub,
    daysRemaining,
    expiresAt: sub.endDate,
  });
});

router.get("/subscriptions/history", requireAuth, async (req, res): Promise<void> => {
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

  const subs = await db.select().from(subscriptionsTable)
    .where(eq(subscriptionsTable.clinicId, clinicId))
    .orderBy(desc(subscriptionsTable.createdAt));

  res.json(subs);
});

router.post("/subscriptions/:clinicId/upgrade", requireAuth, requireRole("super_admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.clinicId) ? req.params.clinicId[0] : req.params.clinicId;
  const clinicId = parseInt(raw, 10);

  const { plan } = req.body;
  const validPlans: SubscriptionPlan[] = ["monthly", "quarterly", "yearly"];
  if (!plan || !validPlans.includes(plan)) {
    res.status(400).json({ error: "Plan must be one of: monthly, quarterly, yearly" });
    return;
  }

  const typedPlan: SubscriptionPlan = plan as SubscriptionPlan;
  const months = planDurationMonths(typedPlan);
  const amount = planAmount(typedPlan);
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + months);

  const [sub] = await db.insert(subscriptionsTable).values({
    clinicId,
    plan: typedPlan,
    status: "active",
    startDate: now,
    endDate,
    amount,
    notes: "Admin upgrade",
  }).returning();

  res.json(sub);
});

export default router;
