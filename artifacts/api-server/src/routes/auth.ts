import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, usersTable, clinicsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.floor(Math.random() * 1000);
}

function signToken(payload: { userId: number; email: string; role: string; clinicId: number | null }): string {
  const secret = process.env.JWT_SECRET ?? "changeme-jwt-secret";
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, phone, password, clinicName, clinicAddress, clinicCity } = req.body;

  if (!name || !email || !phone || !password || !clinicName) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const slug = generateSlug(clinicName);

  const [clinic] = await db.insert(clinicsTable).values({
    name: clinicName,
    slug,
    ownerName: name,
    phone,
    email,
    address: clinicAddress ?? null,
    city: clinicCity ?? null,
  }).returning();

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    phone,
    passwordHash,
    role: "doctor",
    clinicId: clinic.id,
  }).returning();

  const token = signToken({ userId: user.id, email: user.email, role: user.role, clinicId: user.clinicId });

  req.log.info({ userId: user.id }, "New doctor registered");

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      clinicId: user.clinicId,
      specialization: user.specialization,
      qualification: user.qualification,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role, clinicId: user.clinicId });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      clinicId: user.clinicId,
      specialization: user.specialization,
      qualification: user.qualification,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.userId));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    clinicId: user.clinicId,
    specialization: user.specialization,
    qualification: user.qualification,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  });
});

export default router;
