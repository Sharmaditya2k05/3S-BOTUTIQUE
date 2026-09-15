import { Router, Request, Response } from "express";
import { nanoid } from "nanoid";
import { readDB, writeDB } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const db = readDB();
  const testimonials = db.testimonials
    .filter((t) => t.isVisible)
    .sort((a, b) => a.order - b.order);
  res.json(testimonials);
});

router.get("/all", requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const testimonials = [...db.testimonials].sort((a, b) => a.order - b.order);
  res.json(testimonials);
});

router.post("/", requireAdmin, (req: Request, res: Response) => {
  const { name, city, rating, comment } = req.body;
  if (!name || !comment) {
    return res.status(400).json({ error: "Name and comment are required." });
  }

  const db = readDB();
  const testimonial = {
    id: nanoid(),
    name: String(name).trim(),
    city: String(city || "").trim(),
    rating: Math.min(5, Math.max(1, Math.round(Number(rating) || 5))),
    comment: String(comment).trim(),
    isVisible: true,
    order: db.testimonials.length,
    createdAt: new Date().toISOString(),
  };

  db.testimonials.push(testimonial);
  writeDB(db);
  res.status(201).json(testimonial);
});

router.put("/:id", requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const testimonial = db.testimonials.find((t) => t.id === req.params.id);
  if (!testimonial) {
    return res.status(404).json({ error: "Testimonial not found." });
  }

  const allowed = ["name", "city", "rating", "comment", "isVisible", "order"] as const;
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      (testimonial as any)[key] = req.body[key];
    }
  }

  writeDB(db);
  res.json(testimonial);
});

router.delete("/:id", requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.testimonials.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Testimonial not found." });
  }
  db.testimonials.splice(idx, 1);
  writeDB(db);
  res.json({ ok: true });
});

export default router;
