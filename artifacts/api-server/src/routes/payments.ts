import { Router, type IRouter } from "express";
import crypto from "crypto";
import { eq, desc } from "drizzle-orm";
import { db, paymentsTable, subscriptionsTable, invoicesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 99900,
  quarterly: 249900,
  yearly: 999900,
};

const PLAN_MONTHS: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `INV-${year}${month}-${rand}`;
}

router.post("/payments/create-order", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated" });
    return;
  }

  const { plan } = req.body;
  if (!plan || !PLAN_AMOUNTS[plan]) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_SECRET;

  if (!keyId || !keySecret) {
    res.status(500).json({ error: "Payment gateway not configured" });
    return;
  }

  try {
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: PLAN_AMOUNTS[plan],
      currency: "INR",
      receipt: `rcpt_${req.user.clinicId}_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: PLAN_AMOUNTS[plan],
      currency: "INR",
      plan,
      keyId,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create Razorpay order");
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

router.post("/payments/verify", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated" });
    return;
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = req.body;
  const keySecret = process.env.RAZORPAY_SECRET ?? "";

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    res.status(400).json({ error: "Invalid payment signature" });
    return;
  }

  const clinicId = req.user.clinicId;
  const amount = (PLAN_AMOUNTS[plan] ?? 99900) / 100;
  const months = PLAN_MONTHS[plan] ?? 1;

  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + months);

  const [subscription] = await db.insert(subscriptionsTable).values({
    clinicId,
    plan: plan as any,
    status: "active",
    startDate: now,
    endDate,
    amount,
  }).returning();

  const [payment] = await db.insert(paymentsTable).values({
    clinicId,
    subscriptionId: subscription.id,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amount,
    currency: "INR",
    status: "success",
  }).returning();

  const [invoice] = await db.insert(invoicesTable).values({
    invoiceNumber: generateInvoiceNumber(),
    clinicId,
    paymentId: payment.id,
    subscriptionId: subscription.id,
    amount,
    currency: "INR",
    description: `${plan} subscription recharge`,
    issuedAt: now,
  }).returning();

  res.json({ success: true, payment, subscription, invoice });
});

router.post("/payments/webhook", async (req, res): Promise<void> => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers["x-razorpay-signature"] as string;
    const body = JSON.stringify(req.body);
    const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
    if (signature !== expected) {
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }
  }

  const event = req.body.event;
  logger.info({ event }, "Razorpay webhook received");

  if (event === "payment.failed") {
    const paymentId = req.body.payload?.payment?.entity?.id;
    if (paymentId) {
      await db.update(paymentsTable)
        .set({ status: "failed" })
        .where(eq(paymentsTable.razorpayPaymentId, paymentId));
    }
  }

  res.json({ status: "ok" });
});

router.get("/payments/history", requireAuth, async (req, res): Promise<void> => {
  if (!req.user?.clinicId) {
    res.status(403).json({ error: "No clinic associated" });
    return;
  }

  const payments = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.clinicId, req.user.clinicId))
    .orderBy(desc(paymentsTable.createdAt));

  res.json(payments);
});

export default router;
