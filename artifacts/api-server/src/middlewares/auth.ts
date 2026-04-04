import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
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

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
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
