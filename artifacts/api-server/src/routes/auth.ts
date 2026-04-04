import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, usersTable, clinicsTable } from "@workspace/db";
import { requireAuth, type JwtPayload } from "../middlewares/auth";

const router: IRouter = Router();

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.floor(Math.random() * 1000);
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

function signToken(payload: { userId: number; email: string; role: string; clinicId: number | null }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "30d" });
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
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
  };
}

router.post("/auth/admin-register", async (req, res): Promise<void> => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { name, email, phone, password, secretKey } = req.body;

  const ADMIN_SECRET = process.env.ADMIN_REGISTER_SECRET;
  if (!ADMIN_SECRET) {
    res.status(503).json({ error: "Admin registration is not configured on this server" });
    return;
  }

  if (!name || !email || !phone || !password || !secretKey) {
    res.status(400).json({ error: "All fields including secret key are required" });
    return;
  }

  if (secretKey !== ADMIN_SECRET) {
    res.status(403).json({ error: "Invalid admin secret key" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    phone,
    passwordHash,
    role: "super_admin",
    clinicId: null,
  }).returning();

  req.log.info({ userId: user.id }, "New super_admin registered");

  const token = signToken({ userId: user.id, email: user.email, role: user.role, clinicId: user.clinicId });
  res.status(201).json({ token, user: formatUser(user) });
});

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

  req.log.info({ userId: user.id }, "New doctor registered");

  const token = signToken({ userId: user.id, email: user.email, role: user.role, clinicId: user.clinicId });
  res.status(201).json({ token, user: formatUser(user) });
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

  if (user.isActive !== "active") {
    res.status(403).json({ error: "Your account has been deactivated. Please contact support." });
    return;
  }

  await db.update(usersTable).set({ lastLoginAt: new Date() }).where(eq(usersTable.id, user.id));

  const token = signToken({ userId: user.id, email: user.email, role: user.role, clinicId: user.clinicId });
  res.json({ token, user: formatUser(user) });
});

router.post("/auth/refresh", requireAuth, async (req, res): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if (user.isActive !== "active") {
    res.status(403).json({ error: "Account deactivated" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role, clinicId: user.clinicId });
  res.json({ token, user: formatUser(user) });
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

  if (user.isActive !== "active") {
    res.status(403).json({ error: "Account deactivated" });
    return;
  }

  res.json(formatUser(user));
});

export default router;
