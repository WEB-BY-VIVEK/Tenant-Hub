import { Router, type IRouter } from "express";
import crypto from "crypto";
import { eq, desc, and } from "drizzle-orm";
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

async function activateSubscription(
  clinicId: number,
  plan: SubscriptionPlan,
  amountInr: number,
  paymentId: number
) {
  const now = new Date();
  const months = PLAN_MONTHS[plan];

  const [existingActive] = await db
    .select()
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.clinicId, clinicId), eq(subscriptionsTable.status, "active")))
    .orderBy(desc(subscriptionsTable.endDate))
    .limit(1);

  const baseDate = existingActive?.endDate && existingActive.endDate > now
    ? new Date(existingActive.endDate)
    : now;

  const endDate = new Date(baseDate);
  endDate.setMonth(endDate.getMonth() + months);

  const [subscription] = await db.insert(subscriptionsTable).values({
    clinicId,
    plan,
    status: "active",
    startDate: now,
    endDate,
    amount: amountInr,
  }).returning();

  await db.update(paymentsTable)
    .set({ subscriptionId: subscription.id, status: "success" })
    .where(eq(paymentsTable.id, paymentId));

  const [invoice] = await db.insert(invoicesTable).values({
    invoiceNumber: generateInvoiceNumber(),
    clinicId,
    paymentId,
    subscriptionId: subscription.id,
    amount: amountInr,
    currency: "INR",
    description: `${plan} subscription recharge`,
    issuedAt: now,
  }).returning();

  return { subscription, invoice };
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

  const clinicId = req.user.clinicId;
  const amountPaise = PLAN_AMOUNTS_PAISE[typedPlan];
  const amountInr = PLAN_AMOUNTS_INR[typedPlan];

  try {
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${clinicId}_${Date.now()}`,
      notes: {
        clinic_id: String(clinicId),
        plan: typedPlan,
      },
    });

    const [pendingPayment] = await db.insert(paymentsTable).values({
      clinicId,
      razorpayOrderId: order.id,
      amount: amountInr,
      currency: "INR",
      status: "pending",
      description: `${typedPlan} subscription`,
    }).returning();

    res.json({
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      plan: typedPlan,
      keyId,
      internalPaymentId: pendingPayment.id,
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

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, internalPaymentId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !internalPaymentId) {
    res.status(400).json({ error: "Missing required payment verification fields: razorpayOrderId, razorpayPaymentId, razorpaySignature, internalPaymentId" });
    return;
  }

  const clinicId = req.user.clinicId;

  const [pendingRow] = await db
    .select()
    .from(paymentsTable)
    .where(and(eq(paymentsTable.id, internalPaymentId), eq(paymentsTable.clinicId, clinicId)))
    .limit(1);

  if (!pendingRow) {
    res.status(404).json({ error: "Payment order not found" });
    return;
  }

  if (pendingRow.razorpayOrderId !== razorpayOrderId) {
    res.status(400).json({ error: "Order ID mismatch" });
    return;
  }

  if (pendingRow.status === "success") {
    const [existingInvoice] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.paymentId, pendingRow.id))
      .limit(1);
    res.json({ success: true, payment: pendingRow, invoice: existingInvoice });
    return;
  }

  const [existingByPaymentId] = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.razorpayPaymentId, razorpayPaymentId))
    .limit(1);

  if (existingByPaymentId && existingByPaymentId.id !== pendingRow.id && existingByPaymentId.status === "success") {
    res.status(409).json({ error: "This payment has already been processed" });
    return;
  }

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

  const description = pendingRow.description ?? "monthly subscription";
  const rawPlan = description.split(" ")[0].toLowerCase();
  const typedPlan: SubscriptionPlan = VALID_PLANS.includes(rawPlan as SubscriptionPlan)
    ? (rawPlan as SubscriptionPlan)
    : "monthly";

  await db.update(paymentsTable)
    .set({ razorpayPaymentId, razorpaySignature })
    .where(eq(paymentsTable.id, pendingRow.id));

  const { subscription, invoice } = await activateSubscription(clinicId, typedPlan, pendingRow.amount, pendingRow.id);

  const [finalPayment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, pendingRow.id)).limit(1);

  res.json({ success: true, payment: finalPayment, subscription, invoice });
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
    const payloadSection = payload?.payload as Record<string, unknown> | undefined;
    const paymentSection = payloadSection?.payment as Record<string, unknown> | undefined;
    const entity = paymentSection?.entity as Record<string, unknown> | undefined;
    const razorpayPaymentId = entity?.id as string | undefined;
    const failureReason = entity?.error_description as string | undefined;
    if (razorpayPaymentId) {
      await db.update(paymentsTable)
        .set({ status: "failed", failureReason: failureReason ?? null })
        .where(eq(paymentsTable.razorpayPaymentId, razorpayPaymentId));
    }
  }

  if (event === "payment.captured") {
    const payloadSection2 = payload?.payload as Record<string, unknown> | undefined;
    const paymentSection2 = payloadSection2?.payment as Record<string, unknown> | undefined;
    const entity = paymentSection2?.entity as Record<string, unknown> | undefined;
    const razorpayPaymentId = entity?.id as string | undefined;
    const razorpayOrderId = entity?.order_id as string | undefined;
    const notes = entity?.notes as Record<string, unknown> | undefined;

    if (razorpayPaymentId && razorpayOrderId) {
      const rawPlan = (notes?.plan ?? "monthly") as string;
      const plan: SubscriptionPlan = VALID_PLANS.includes(rawPlan as SubscriptionPlan)
        ? (rawPlan as SubscriptionPlan)
        : "monthly";

      const [byPaymentId] = await db
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.razorpayPaymentId, razorpayPaymentId))
        .limit(1);

      if (byPaymentId?.status === "success") {
        res.json({ status: "ok" });
        return;
      }

      const [byOrderId] = await db
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.razorpayOrderId, razorpayOrderId))
        .limit(1);

      if (byOrderId) {
        if (byOrderId.status === "success") {
          res.json({ status: "ok" });
          return;
        }
        const clinicId = byOrderId.clinicId;
        const amountInr = byOrderId.amount;

        await db.update(paymentsTable)
          .set({ razorpayPaymentId })
          .where(eq(paymentsTable.id, byOrderId.id));

        await activateSubscription(clinicId, plan, amountInr, byOrderId.id);
      } else {
        const rawClinicId = notes?.clinic_id ? parseInt(String(notes.clinic_id)) : null;
        const amountPaise = entity?.amount as number | undefined;
        const amountInr = amountPaise ? Math.round(amountPaise / 100) : 0;

        if (rawClinicId && amountInr > 0) {
          const [newPayment] = await db.insert(paymentsTable).values({
            clinicId: rawClinicId,
            razorpayOrderId,
            razorpayPaymentId,
            amount: amountInr,
            currency: "INR",
            status: "pending",
          }).returning();

          await activateSubscription(rawClinicId, plan, amountInr, newPayment.id);
        } else {
          logger.warn({ event, razorpayOrderId }, "payment.captured: missing clinic_id/plan in notes, skipping");
        }
      }
    }
  }

  if (event === "refund.created") {
    const payloadSection3 = payload?.payload as Record<string, unknown> | undefined;
    const refundSection = payloadSection3?.refund as Record<string, unknown> | undefined;
    const entity = refundSection?.entity as Record<string, unknown> | undefined;
    const razorpayPaymentId = entity?.payment_id as string | undefined;
    if (razorpayPaymentId) {
      await db.update(paymentsTable)
        .set({ status: "refunded" })
        .where(eq(paymentsTable.razorpayPaymentId, razorpayPaymentId));
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
