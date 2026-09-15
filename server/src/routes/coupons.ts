import { Router, Request, Response } from "express";
import { nanoid } from "nanoid";
import { readDB, writeDB } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

// List all coupons (admin only)
router.get("/", requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const coupons = (db.coupons || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(coupons);
});

// Create coupon (admin only)
router.post("/", requireAdmin, (req: Request, res: Response) => {
  const { code, discountType, discountValue, minOrderValue, maxUses, expiresAt } = req.body;

  if (!code || typeof code !== "string" || code.trim().length < 2) {
    return res.status(400).json({ error: "Coupon code is required (min 2 characters)." });
  }
  if (!discountType || !["percentage", "flat"].includes(discountType)) {
    return res.status(400).json({ error: "Discount type must be 'percentage' or 'flat'." });
  }
  if (typeof discountValue !== "number" || discountValue <= 0) {
    return res.status(400).json({ error: "Discount value must be a positive number." });
  }

  const db = readDB();
  if (!db.coupons) db.coupons = [];

  const existing = db.coupons.find(
    (c) => c.code.toLowerCase() === code.trim().toUpperCase().toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: "A coupon with this code already exists." });
  }

  const coupon = {
    id: nanoid(10),
    code: code.trim().toUpperCase(),
    discountType: discountType as "percentage" | "flat",
    discountValue,
    minOrderValue: minOrderValue || 0,
    maxUses: maxUses || 0,
    usedCount: 0,
    isActive: true,
    expiresAt: expiresAt || "",
    createdAt: new Date().toISOString(),
  };

  db.coupons.push(coupon);
  writeDB(db);
  res.status(201).json(coupon);
});

// Update coupon (admin only)
router.put("/:id", requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  if (!db.coupons) db.coupons = [];
  const coupon = db.coupons.find((c) => c.id === req.params.id);
  if (!coupon) return res.status(404).json({ error: "Coupon not found." });

  const { code, discountType, discountValue, minOrderValue, maxUses, isActive, expiresAt } =
    req.body;

  if (code !== undefined) {
    const normalized = code.trim().toUpperCase();
    const dup = db.coupons.find(
      (c) => c.id !== coupon.id && c.code.toLowerCase() === normalized.toLowerCase()
    );
    if (dup) return res.status(400).json({ error: "A coupon with this code already exists." });
    coupon.code = normalized;
  }
  if (discountType !== undefined) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = discountValue;
  if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;
  if (maxUses !== undefined) coupon.maxUses = maxUses;
  if (typeof isActive === "boolean") coupon.isActive = isActive;
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt;

  writeDB(db);
  res.json(coupon);
});

// Delete coupon (admin only)
router.delete("/:id", requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  if (!db.coupons) db.coupons = [];
  const idx = db.coupons.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Coupon not found." });
  db.coupons.splice(idx, 1);
  writeDB(db);
  res.json({ ok: true });
});

// Validate a coupon code (public)
router.post("/validate", (req: Request, res: Response) => {
  const { code, orderTotal } = req.body;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Coupon code is required." });
  }

  const db = readDB();
  if (!db.coupons) db.coupons = [];
  const coupon = db.coupons.find(
    (c) => c.code.toLowerCase() === code.trim().toLowerCase()
  );

  if (!coupon) {
    return res.status(404).json({ error: "Invalid coupon code." });
  }
  if (!coupon.isActive) {
    return res.status(400).json({ error: "This coupon is no longer active." });
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return res.status(400).json({ error: "This coupon has expired." });
  }
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ error: "This coupon has reached its maximum usage limit." });
  }
  if (typeof orderTotal === "number" && orderTotal < coupon.minOrderValue) {
    return res.status(400).json({
      error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.`,
    });
  }

  const discount =
    coupon.discountType === "percentage"
      ? Math.round(((orderTotal || 0) * coupon.discountValue) / 100)
      : coupon.discountValue;

  res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount,
  });
});

export default router;
