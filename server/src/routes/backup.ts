import { Router } from "express";
import { readDB, writeDB } from "../db";
import { requireAdmin } from "../auth";
import { DBShape } from "../types";

const router = Router();

router.get("/export", requireAdmin, (_req, res) => {
  const db = readDB();
  res.setHeader("Content-Disposition", `attachment; filename="3s-backup-${new Date().toISOString().slice(0, 10)}.json"`);
  res.setHeader("Content-Type", "application/json");
  res.json(db);
});

router.post("/import", requireAdmin, (req, res) => {
  const data = req.body as any;

  // Validate required top-level keys
  const requiredKeys: (keyof DBShape)[] = [
    "products",
    "categories",
    "settings",
    "events",
    "admins",
    "reviews",
    "testimonials",
    "customers",
    "coupons",
  ];

  for (const key of requiredKeys) {
    if (!(key in data)) {
      return res.status(400).json({ error: `Invalid backup file: missing "${key}" key.` });
    }
  }

  if (!Array.isArray(data.products) || !Array.isArray(data.categories) || !Array.isArray(data.admins)) {
    return res.status(400).json({ error: "Invalid backup file: products, categories, and admins must be arrays." });
  }

  if (typeof data.settings !== "object" || data.settings === null) {
    return res.status(400).json({ error: "Invalid backup file: settings must be an object." });
  }

  writeDB(data as DBShape);
  res.json({ success: true, message: "Backup imported successfully." });
});

export default router;
