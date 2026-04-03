import { pgTable, text, serial, timestamp, integer, date, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clinicsTable } from "./clinics";
import { appointmentsTable } from "./appointments";

export const tokenStatusEnum = pgEnum("token_status", [
  "waiting",
  "called",
  "completed",
  "skipped",
]);

export const tokensTable = pgTable("tokens", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinicsTable.id),
  appointmentId: integer("appointment_id").notNull().references(() => appointmentsTable.id),
  tokenNumber: integer("token_number").notNull(),
  tokenDate: date("token_date").notNull(),
  status: tokenStatusEnum("status").notNull().default("waiting"),
  calledAt: timestamp("called_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("tokens_clinic_date_idx").on(table.clinicId, table.tokenDate),
  index("tokens_clinic_date_status_idx").on(table.clinicId, table.tokenDate, table.status),
  index("tokens_appointment_id_idx").on(table.appointmentId),
]);

export const insertTokenSchema = createInsertSchema(tokensTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokensTable.$inferSelect;
