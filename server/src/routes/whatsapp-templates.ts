import { Router, Request, Response } from "express";
import { nanoid } from "nanoid";
import { readDB, writeDB } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

// List all templates (admin only)
router.get("/", requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const templates = (db.whatsappTemplates || []).sort((a, b) => a.order - b.order);
  res.json(templates);
});

// Create template (admin only)
router.post("/", requireAdmin, (req: Request, res: Response) => {
  const { title, message } = req.body;

  if (!title || typeof title !== "string" || title.trim().length < 1) {
    return res.status(400).json({ error: "Title is required." });
  }
  if (!message || typeof message !== "string" || message.trim().length < 1) {
    return res.status(400).json({ error: "Message is required." });
  }

  const db = readDB();
  if (!db.whatsappTemplates) db.whatsappTemplates = [];

  const maxOrder = db.whatsappTemplates.reduce((max, t) => Math.max(max, t.order), -1);

  const template = {
    id: nanoid(10),
    title: title.trim(),
    message: message.trim(),
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };

  db.whatsappTemplates.push(template);
  writeDB(db);
  res.status(201).json(template);
});

// Update template (admin only)
router.put("/:id", requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  if (!db.whatsappTemplates) db.whatsappTemplates = [];
  const template = db.whatsappTemplates.find((t) => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: "Template not found." });

  const { title, message, order } = req.body;

  if (title !== undefined) template.title = title.trim();
  if (message !== undefined) template.message = message.trim();
  if (typeof order === "number") template.order = order;

  writeDB(db);
  res.json(template);
});

// Delete template (admin only)
router.delete("/:id", requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  if (!db.whatsappTemplates) db.whatsappTemplates = [];
  const idx = db.whatsappTemplates.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Template not found." });
  db.whatsappTemplates.splice(idx, 1);
  writeDB(db);
  res.json({ ok: true });
});

export default router;
