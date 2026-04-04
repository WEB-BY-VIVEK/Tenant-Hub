import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, and, gt } from "drizzle-orm";
import { db, usersTable, clinicsTable, otpVerificationsTable } from "@workspace/db";
import { requireAuth, type JwtPayload } from "../middlewares/auth";
import { Resend } from "resend";

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
  const { name, email, phone, password, secretKey } = req.body;

  const ADMIN_SECRET = process.env.ADMIN_REGISTER_SECRET;
  if (!ADMIN_SECRET) {
    res.status(503).json({ error: "Admin registration is not enabled on this server." });
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

  res.json(formatUser(user));
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "Clinic Digital Growth <noreply@vivekdigital.in>",
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px;">
          <h2 style="color:#1e40af;margin-bottom:8px;">Password Reset Code</h2>
          <p style="color:#475569;margin-bottom:24px;">Use the code below to reset your Clinic Digital Growth account password. This code expires in <strong>10 minutes</strong>.</p>
          <div style="background:#fff;border:2px solid #e2e8f0;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">
            <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#1e40af;">${otp}</span>
          </div>
          <p style="color:#94a3b8;font-size:13px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
  } else {
    console.log(`[OTP EMAIL - DEV MODE] To: ${email} | OTP: ${otp}`);
  }
}

router.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.json({ message: "If that email exists, an OTP has been sent." });
    return;
  }
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db.insert(otpVerificationsTable).values({ email, otp, expiresAt });
  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error("OTP email error:", err);
  }
  res.json({ message: "OTP sent successfully." });
});

router.post("/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: "Email and OTP are required." });
    return;
  }
  const now = new Date();
  const [record] = await db
    .select()
    .from(otpVerificationsTable)
    .where(
      and(
        eq(otpVerificationsTable.email, email),
        eq(otpVerificationsTable.otp, otp),
        eq(otpVerificationsTable.used, false),
        gt(otpVerificationsTable.expiresAt, now)
      )
    )
    .orderBy(otpVerificationsTable.createdAt)
    .limit(1);
  if (!record) {
    res.status(400).json({ error: "Invalid or expired OTP. Please request a new one." });
    return;
  }
  res.json({ message: "OTP verified." });
});

router.post("/auth/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    res.status(400).json({ error: "Email, OTP and new password are required." });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." });
    return;
  }
  const now = new Date();
  const [record] = await db
    .select()
    .from(otpVerificationsTable)
    .where(
      and(
        eq(otpVerificationsTable.email, email),
        eq(otpVerificationsTable.otp, otp),
        eq(otpVerificationsTable.used, false),
        gt(otpVerificationsTable.expiresAt, now)
      )
    )
    .orderBy(otpVerificationsTable.createdAt)
    .limit(1);
  if (!record) {
    res.status(400).json({ error: "OTP expired or already used. Please restart the process." });
    return;
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable).set({ passwordHash: hashed }).where(eq(usersTable.email, email));
  await db.update(otpVerificationsTable).set({ used: true }).where(eq(otpVerificationsTable.id, record.id));
  res.json({ message: "Password reset successfully." });
});

router.post("/auth/google-signin", async (req, res) => {
  const { accessToken, email: googleEmail, name: googleName } = req.body;
  if (!accessToken || !googleEmail) {
    res.status(400).json({ error: "Access token and email are required." });
    return;
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(503).json({ error: "Google sign-in is not configured on this server." });
    return;
  }
  try {
    const verifyRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey,
      },
    });
    if (!verifyRes.ok) {
      res.status(401).json({ error: "Invalid Google token." });
      return;
    }
    const supabaseUser = await verifyRes.json();
    const verifiedEmail = supabaseUser.email;
    if (!verifiedEmail) {
      res.status(400).json({ error: "Could not retrieve email from Google." });
      return;
    }
    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, verifiedEmail));
    if (!user) {
      const randomPwdHash = await bcrypt.hash(Math.random().toString(36), 10);
      const [newUser] = await db.insert(usersTable).values({
        email: verifiedEmail,
        passwordHash: randomPwdHash,
        name: googleName || verifiedEmail.split("@")[0],
        phone: supabaseUser.phone || "google-oauth",
        role: "doctor",
      }).returning();
      user = newUser;
    }
    if (user.isActive !== "active") {
      res.status(403).json({ error: "Your account has been deactivated. Please contact support." });
      return;
    }
    const token = signToken({ userId: user.id, email: user.email, role: user.role, clinicId: user.clinicId });
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error("Google signin error:", err);
    res.status(500).json({ error: "Google sign-in failed." });
  }
});

export default router;
