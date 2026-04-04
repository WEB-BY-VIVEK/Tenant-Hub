import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { logger } from "../lib/logger";

export interface JwtPayload {
  userId: number;
  email: string;
  role: "super_admin" | "doctor" | "patient";
  clinicId: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function getJwtSecret(): string | null {
  return process.env.JWT_SECRET ?? null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = getJwtSecret();
  if (!secret) {
    logger.warn("JWT_SECRET is not configured — all authenticated requests will be rejected");
    res.status(503).json({ error: "Authentication service not configured. Set JWT_SECRET." });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.substring(7);

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, secret) as JwtPayload;
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  db.select({ isActive: usersTable.isActive })
    .from(usersTable)
    .where(eq(usersTable.id, payload.userId))
    .then(([user]) => {
      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }
      if (user.isActive !== "active") {
        res.status(403).json({ error: "Account deactivated" });
        return;
      }
      req.user = payload;
      next();
    })
    .catch((err) => {
      logger.error({ err }, "requireAuth: DB lookup failed");
      res.status(500).json({ error: "Internal server error" });
    });
}

export function requireRole(...roles: JwtPayload["role"][]): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
