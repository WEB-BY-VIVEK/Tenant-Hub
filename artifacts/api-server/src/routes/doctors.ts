import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/clinics/:clinicId/doctors", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.clinicId) ? req.params.clinicId[0] : req.params.clinicId;
  const clinicId = parseInt(raw, 10);

  if (req.user?.role !== "super_admin" && req.user?.clinicId !== clinicId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const doctors = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    phone: usersTable.phone,
    specialization: usersTable.specialization,
    qualification: usersTable.qualification,
    experience: usersTable.experience,
    bio: usersTable.bio,
    avatarUrl: usersTable.avatarUrl,
    clinicId: usersTable.clinicId,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(and(eq(usersTable.clinicId, clinicId), eq(usersTable.role, "doctor")));

  res.json(doctors);
});

router.post("/clinics/:clinicId/doctors", requireAuth, requireRole("super_admin", "doctor"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.clinicId) ? req.params.clinicId[0] : req.params.clinicId;
  const clinicId = parseInt(raw, 10);

  if (req.user?.role !== "super_admin" && req.user?.clinicId !== clinicId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const { name, email, phone, password, specialization, qualification, experience, bio } = req.body;

  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [doctor] = await db.insert(usersTable).values({
    name,
    email,
    phone,
    passwordHash,
    role: "doctor",
    clinicId,
    specialization,
    qualification,
    experience,
    bio,
  }).returning({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    phone: usersTable.phone,
    specialization: usersTable.specialization,
    qualification: usersTable.qualification,
    experience: usersTable.experience,
    bio: usersTable.bio,
    avatarUrl: usersTable.avatarUrl,
    clinicId: usersTable.clinicId,
    createdAt: usersTable.createdAt,
  });

  res.status(201).json(doctor);
});

router.get("/clinics/:clinicId/doctors/:doctorId", requireAuth, async (req, res): Promise<void> => {
  const rawClinic = Array.isArray(req.params.clinicId) ? req.params.clinicId[0] : req.params.clinicId;
  const rawDoctor = Array.isArray(req.params.doctorId) ? req.params.doctorId[0] : req.params.doctorId;
  const clinicId = parseInt(rawClinic, 10);
  const doctorId = parseInt(rawDoctor, 10);

  if (req.user?.role !== "super_admin" && req.user?.clinicId !== clinicId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const [doctor] = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    phone: usersTable.phone,
    specialization: usersTable.specialization,
    qualification: usersTable.qualification,
    experience: usersTable.experience,
    bio: usersTable.bio,
    avatarUrl: usersTable.avatarUrl,
    clinicId: usersTable.clinicId,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(and(eq(usersTable.id, doctorId), eq(usersTable.clinicId, clinicId), eq(usersTable.role, "doctor")));

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(doctor);
});

router.patch("/clinics/:clinicId/doctors/:doctorId", requireAuth, async (req, res): Promise<void> => {
  const rawClinic = Array.isArray(req.params.clinicId) ? req.params.clinicId[0] : req.params.clinicId;
  const rawDoctor = Array.isArray(req.params.doctorId) ? req.params.doctorId[0] : req.params.doctorId;
  const clinicId = parseInt(rawClinic, 10);
  const doctorId = parseInt(rawDoctor, 10);

  if (req.user?.role !== "super_admin" && req.user?.clinicId !== clinicId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const { name, phone, specialization, qualification, experience, bio, avatarUrl } = req.body;

  const [doctor] = await db.update(usersTable)
    .set({ name, phone, specialization, qualification, experience, bio, avatarUrl })
    .where(and(eq(usersTable.id, doctorId), eq(usersTable.clinicId, clinicId)))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: usersTable.phone,
      specialization: usersTable.specialization,
      qualification: usersTable.qualification,
      experience: usersTable.experience,
      bio: usersTable.bio,
      avatarUrl: usersTable.avatarUrl,
      clinicId: usersTable.clinicId,
      createdAt: usersTable.createdAt,
    });

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(doctor);
});

export default router;
