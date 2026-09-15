import { Router } from "express";
import { nanoid } from "nanoid";
import slugify from "slugify";
import { readDB, writeDB } from "../db";
import { requireAdmin } from "../auth";
import { nanoid as _n } from "nanoid";
import { Category } from "../types";

const router = Router();

router.get("/", (req, res) => {
  const db = readDB();
  const categories = db.categories.slice().sort((a, b) => a.order - b.order);
  if (req.query.withCounts === "true") {
    const withCounts = categories.map((c) => ({
      ...c,
      productCount: db.products.filter(
        (p) => p.categoryId === c.id && p.isPublished
      ).length,
    }));
    return res.json(withCounts);
  }
  res.json(categories);
});

router.post("/", requireAdmin, (req, res) => {
  const db = readDB();
  const body = req.body || {};
  if (!body.name) return res.status(400).json({ error: "Category name is required." });

  let baseSlug = slugify(body.name, { lower: true });
  let slug = baseSlug;
  let n = 1;
  while (db.categories.some((c) => c.slug === slug)) slug = `${baseSlug}-${++n}`;

  const category: Category = {
    id: nanoid(10),
    name: body.name,
    slug,
    image: body.image || "",
    description: body.description || "",
    order: db.categories.length,
    createdAt: new Date().toISOString(),
  };
  db.categories.push(category);
  writeDB(db);
  res.status(201).json(category);
});

router.put("/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const idx = db.categories.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Category not found." });
  const body = req.body || {};
  db.categories[idx] = { ...db.categories[idx], ...body, id: db.categories[idx].id };
  writeDB(db);
  res.json(db.categories[idx]);
});

router.put("/reorder/all", requireAdmin, (req, res) => {
  const db = readDB();
  const { orderedIds } = req.body as { orderedIds: string[] };
  orderedIds.forEach((id, i) => {
    const c = db.categories.find((c) => c.id === id);
    if (c) c.order = i;
  });
  writeDB(db);
  res.json({ success: true });
});

router.delete("/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const inUse = db.products.some((p) => p.categoryId === req.params.id);
  if (inUse) {
    return res.status(400).json({
      error: "This category has sarees in it. Move or delete them first.",
    });
  }
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

export default router;
