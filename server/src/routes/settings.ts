import { Router } from "express";
import { readDB, writeDB } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

router.get("/", (_req, res) => {
  const db = readDB();
  res.json(db.settings);
});

router.put("/", requireAdmin, (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json(db.settings);
});

export default router;
