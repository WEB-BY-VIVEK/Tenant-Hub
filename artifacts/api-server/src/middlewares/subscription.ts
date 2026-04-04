import { Request, Response, NextFunction } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db, subscriptionsTable } from "@workspace/db";

export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated with your account" });
    return;
  }

  const now = new Date();
  const [activeSub] = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.clinicId, req.user.clinicId),
        eq(subscriptionsTable.status, "active"),
        gt(subscriptionsTable.endDate, now)
      )
    )
    .limit(1);

  if (!activeSub) {
    res.status(402).json({ error: "Active subscription required. Please recharge your account.", code: "SUBSCRIPTION_EXPIRED" });
    return;
  }

  next();
}
