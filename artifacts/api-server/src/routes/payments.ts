import { Router, type IRouter } from "express";
import crypto from "crypto";
import { eq, desc, and, gt } from "drizzle-orm";
import { db, paymentsTable, subscriptionsTable, invoicesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";
import type { subscriptionPlanEnum } from "@workspace/db";

type SubscriptionPlan = typeof subscriptionPlanEnum.enumValues[number];

const router: IRouter = Router();

const PLAN_AMOUNTS_PAISE: Record<SubscriptionPlan, number> = {
  monthly: 99900,
  quarterly: 249900,
  yearly: 999900,
};

const PLAN_AMOUNTS_INR: Record<SubscriptionPlan, number> = {
  monthly: 999,
  quarterly: 2499,
  yearly: 9999,
};

const PLAN_MONTHS: Record<SubscriptionPlan, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

const VALID_PLANS: SubscriptionPlan[] = ["monthly", "quarterly", "yearly"];

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `INV-${year}${month}-${rand}`;
}

router.post("/payments/create-order", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated with your account" });
    return;
  }

  const { plan } = req.body;
  if (!plan || !VALID_PLANS.includes(plan)) {
    res.status(400).json({ error: "Invalid plan. Must be monthly, quarterly, or yearly" });
    return;
  }

  const typedPlan: SubscriptionPlan = plan as SubscriptionPlan;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_SECRET;

  if (!keyId || !keySecret) {
    res.status(503).json({ error: "Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET." });
    return;
  }

  try {
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: PLAN_AMOUNTS_PAISE[typedPlan],
      currency: "INR",
      receipt: `rcpt_${req.user.clinicId}_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: PLAN_AMOUNTS_PAISE[typedPlan],
      currency: "INR",
      plan: typedPlan,
      keyId,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create Razorpay order");
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

router.post("/payments/verify", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated with your account" });
    return;
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !plan) {
    res.status(400).json({ error: "Missing required payment verification fields" });
    return;
  }

  if (!VALID_PLANS.includes(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  const typedPlan: SubscriptionPlan = plan as SubscriptionPlan;
  const keySecret = process.env.RAZORPAY_SECRET;
  if (!keySecret) {
    res.status(503).json({ error: "Payment gateway not configured. Set RAZORPAY_SECRET." });
    return;
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    res.status(400).json({ error: "Invalid payment signature" });
    return;
  }

  const clinicId = req.user.clinicId;
  const amountInr = PLAN_AMOUNTS_INR[typedPlan];
  const months = PLAN_MONTHS[typedPlan];

  const now = new Date();

  const [existingActive] = await db
    .select()
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.clinicId, clinicId), eq(subscriptionsTable.status, "active")))
    .orderBy(desc(subscriptionsTable.endDate))
    .limit(1);

  const baseDate = existingActive && existingActive.endDate && existingActive.endDate > now
    ? new Date(existingActive.endDate)
    : now;

  const endDate = new Date(baseDate);
  endDate.setMonth(endDate.getMonth() + months);

  const [subscription] = await db.insert(subscriptionsTable).values({
    clinicId,
    plan: typedPlan,
    status: "active",
    startDate: now,
    endDate,
    amount: amountInr,
  }).returning();

  const [payment] = await db.insert(paymentsTable).values({
    clinicId,
    subscriptionId: subscription.id,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amount: amountInr,
    currency: "INR",
    status: "success",
  }).returning();

  const [invoice] = await db.insert(invoicesTable).values({
    invoiceNumber: generateInvoiceNumber(),
    clinicId,
    paymentId: payment.id,
    subscriptionId: subscription.id,
    amount: amountInr,
    currency: "INR",
    description: `${typedPlan} subscription recharge`,
    issuedAt: now,
  }).returning();

  res.json({ success: true, payment, subscription, invoice });
});

router.post("/payments/webhook", async (req, res): Promise<void> => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  if (!webhookSecret && !isDev) {
    res.status(503).json({ error: "Webhook secret not configured" });
    return;
  }

  const rawBody = req.body as Buffer;

  if (webhookSecret) {
    const signature = req.headers["x-razorpay-signature"] as string;
    const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (signature !== expected) {
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody.toString()) as Record<string, unknown>;
  } catch {
    res.status(400).json({ error: "Invalid JSON payload" });
    return;
  }

  const event = payload?.event as string | undefined;
  logger.info({ event }, "Razorpay webhook received");

  if (event === "payment.failed") {
    const paymentId = (payload?.payload as Record<string, unknown>)?.payment?.entity?.id as string | undefined;
    if (paymentId) {
      await db.update(paymentsTable)
        .set({ status: "failed" })
        .where(eq(paymentsTable.razorpayPaymentId, paymentId));
    }
  }

  if (event === "payment.captured") {
    const entity = (payload?.payload as Record<string, unknown>)?.payment?.entity as Record<string, unknown> | undefined;
    const paymentId = entity?.id as string | undefined;
    const orderId = entity?.order_id as string | undefined;
    if (paymentId && orderId) {
      const [existingPayment] = await db
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.razorpayPaymentId, paymentId))
        .limit(1);

      if (existingPayment) {
        if (existingPayment.status === "pending") {
          await db.update(paymentsTable)
            .set({ status: "success" })
            .where(eq(paymentsTable.razorpayPaymentId, paymentId));

          if (existingPayment.subscriptionId) {
            await db.update(subscriptionsTable)
              .set({ status: "active" })
              .where(eq(subscriptionsTable.id, existingPayment.subscriptionId));
          }
        }
      } else {
        const clinicIdFromPayment = entity?.notes?.clinic_id
          ? parseInt(String(entity.notes.clinic_id))
          : null;
        const amountPaise = entity?.amount as number | undefined;
        const amountInr = amountPaise ? Math.round(amountPaise / 100) : 0;

        if (clinicIdFromPayment && amountInr > 0) {
          const now = new Date();
          const [newPayment] = await db.insert(paymentsTable).values({
            clinicId: clinicIdFromPayment,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            amount: amountInr,
            currency: "INR",
            status: "success",
          }).returning();

          const [existingActive] = await db
            .select()
            .from(subscriptionsTable)
            .where(and(eq(subscriptionsTable.clinicId, clinicIdFromPayment), eq(subscriptionsTable.status, "active")))
            .orderBy(desc(subscriptionsTable.endDate))
            .limit(1);

          const baseDate = existingActive?.endDate && existingActive.endDate > now
            ? new Date(existingActive.endDate)
            : now;
          const endDate = new Date(baseDate);
          endDate.setMonth(endDate.getMonth() + 1);

          const [sub] = await db.insert(subscriptionsTable).values({
            clinicId: clinicIdFromPayment,
            plan: "monthly",
            status: "active",
            startDate: now,
            endDate,
            amount: amountInr,
          }).returning();

          await db.insert(invoicesTable).values({
            invoiceNumber: generateInvoiceNumber(),
            clinicId: clinicIdFromPayment,
            paymentId: newPayment.id,
            subscriptionId: sub.id,
            amount: amountInr,
            currency: "INR",
            description: "subscription recharge (webhook)",
            issuedAt: now,
          });
        }
      }
    }
  }

  if (event === "refund.created") {
    const paymentId = (payload?.payload as Record<string, unknown>)?.refund?.entity?.payment_id as string | undefined;
    if (paymentId) {
      await db.update(paymentsTable)
        .set({ status: "refunded" })
        .where(eq(paymentsTable.razorpayPaymentId, paymentId));
    }
  }

  res.json({ status: "ok" });
});

router.get("/payments/history", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated with your account" });
    return;
  }

  const payments = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.clinicId, req.user.clinicId))
    .orderBy(desc(paymentsTable.createdAt));

  res.json(payments);
});

export default router;
