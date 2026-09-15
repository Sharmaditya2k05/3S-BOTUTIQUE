import { Router } from "express";
import bcrypt from "bcryptjs";
import { readDB } from "../db";
import { signAdminToken, requireAdmin, COOKIE_NAME } from "../auth";

const router = Router();

const isProd = process.env.NODE_ENV === "production";

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const db = readDB();
  const admin = db.admins.find(
    (a) => a.email.toLowerCase() === String(email).toLowerCase()
  );
  if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }
  const token = signAdminToken({
    id: admin.id,
    email: admin.email,
    name: admin.name,
  });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ id: admin.id, email: admin.email, name: admin.name });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json((req as any).admin);
});

export default router;
