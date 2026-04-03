import { pgTable, text, serial, timestamp, integer, pgEnum, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clinicsTable } from "./clinics";
import { usersTable } from "./users";

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "waiting",
  "in_progress",
  "completed",
  "cancelled",
  "rescheduled",
  "no_show",
]);

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinicsTable.id),
  doctorId: integer("doctor_id").references(() => usersTable.id),
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone").notNull(),
  patientEmail: text("patient_email"),
  appointmentDate: date("appointment_date").notNull(),
  timeSlot: text("time_slot").notNull(),
  reason: text("reason"),
  notes: text("notes"),
  status: appointmentStatusEnum("status").notNull().default("waiting"),
  rescheduledDate: date("rescheduled_date"),
  rescheduledTimeSlot: text("rescheduled_time_slot"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("appointments_clinic_date_idx").on(table.clinicId, table.appointmentDate),
  index("appointments_clinic_status_idx").on(table.clinicId, table.status),
  index("appointments_patient_phone_idx").on(table.patientPhone),
  index("appointments_created_at_idx").on(table.createdAt),
]);

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
