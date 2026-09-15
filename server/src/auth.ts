import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export const COOKIE_NAME = "3s_admin_token";

export interface AdminTokenPayload {
  id: string;
  email: string;
  name: string;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    (req as any).admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

export function isAdmin(req: Request): boolean {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export const CUSTOMER_COOKIE = "3s_customer_token";

export interface CustomerTokenPayload {
  id: string;
  email: string;
  name: string;
}

export function signCustomerToken(payload: CustomerTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function requireCustomer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.[CUSTOMER_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as CustomerTokenPayload;
    (req as any).customer = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

export function optionalCustomer(req: Request): CustomerTokenPayload | null {
  const token = req.cookies?.[CUSTOMER_COOKIE];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as CustomerTokenPayload;
  } catch {
    return null;
  }
}

export { JWT_SECRET };
