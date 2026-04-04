import { pgTable, text, serial, timestamp, integer, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clinicsTable } from "./clinics";

export const userRoleEnum = pgEnum("user_role", ["super_admin", "doctor", "patient"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("patient"),
  clinicId: integer("clinic_id").references(() => clinicsTable.id),
  specialization: text("specialization"),
  qualification: text("qualification"),
  experience: text("experience"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  isActive: text("is_active").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("users_clinic_id_idx").on(table.clinicId),
  index("users_role_idx").on(table.role),
  index("users_clinic_role_idx").on(table.clinicId, table.role),
]);

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
