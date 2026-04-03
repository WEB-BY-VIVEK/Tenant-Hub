import { pgTable, text, serial, timestamp, integer, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clinicsTable } from "./clinics";
import { subscriptionsTable } from "./subscriptions";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "success",
  "failed",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "upi",
  "card",
  "netbanking",
  "wallet",
  "razorpay",
  "other",
]);

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinicsTable.id),
  subscriptionId: integer("subscription_id").references(() => subscriptionsTable.id),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  method: paymentMethodEnum("method"),
  description: text("description"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("payments_clinic_id_idx").on(table.clinicId),
  index("payments_clinic_status_idx").on(table.clinicId, table.status),
  index("payments_razorpay_order_idx").on(table.razorpayOrderId),
  index("payments_razorpay_payment_idx").on(table.razorpayPaymentId),
  index("payments_created_at_idx").on(table.createdAt),
]);

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
