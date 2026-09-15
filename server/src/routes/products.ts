import { Router } from "express";
import { nanoid } from "nanoid";
import slugify from "slugify";
import { readDB, writeDB } from "../db";
import { requireAdmin } from "../auth";
import { Product } from "../types";

const router = Router();

function publicView(p: Product) {
  return p;
}

// GET /api/products - list with filters, search, sort (published only unless admin)
router.get("/", (req, res) => {
  const db = readDB();
  const {
    category, // category slug
    minPrice,
    maxPrice,
    color,
    fabric,
    occasion,
    featured,
    newArrival,
    bestseller,
    available,
    search,
    sort,
    admin,
  } = req.query;

  let list = db.products.slice();

  if (admin !== "true") {
    list = list.filter((p) => p.isPublished);
  }

  if (category) {
    const cat = db.categories.find((c) => c.slug === category);
    if (cat) list = list.filter((p) => p.categoryId === cat.id);
    else list = [];
  }
  if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
  if (color)
    list = list.filter((p) =>
      p.color.toLowerCase().includes(String(color).toLowerCase())
    );
  if (fabric)
    list = list.filter((p) =>
      p.fabric.toLowerCase().includes(String(fabric).toLowerCase())
    );
  if (occasion)
    list = list.filter((p) =>
      p.occasion.toLowerCase().includes(String(occasion).toLowerCase())
    );
  if (featured === "true") list = list.filter((p) => p.isFeatured);
  if (newArrival === "true") list = list.filter((p) => p.isNewArrival);
  if (bestseller === "true") list = list.filter((p) => p.isBestseller);
  if (available === "true") list = list.filter((p) => p.isAvailable);

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((p) => {
      const cat = db.categories.find((c) => c.id === p.categoryId);
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.occasion.toLowerCase().includes(q) ||
        (cat && cat.name.toLowerCase().includes(q))
      );
    });
  }

  // sort
  if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "newest") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(list.map(publicView));
});

// GET /api/products/:slug
router.get("/:slug", (req, res) => {
  const db = readDB();
  const product = db.products.find((p) => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: "Saree not found." });
  if (!product.isPublished && !req.query.admin) {
    return res.status(404).json({ error: "Saree not found." });
  }

  // track a view (only for real customer views, not admin preview)
  if (!req.query.admin) {
    product.views += 1;
    db.events.push({
      id: nanoid(10),
      type: "product_view",
      productId: product.id,
      createdAt: new Date().toISOString(),
    });
    writeDB(db);
  }

  const related = db.products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.categoryId === product.categoryId &&
        p.isPublished
    )
    .slice(0, 4);

  res.json({ product, related });
});

// POST /api/products (admin)
router.post("/", requireAdmin, (req, res) => {
  const db = readDB();
  const body = req.body || {};
  if (!body.name || !body.price || !body.categoryId) {
    return res
      .status(400)
      .json({ error: "Name, price and category are required." });
  }

  let baseSlug = slugify(body.name, { lower: true });
  let slug = baseSlug;
  let n = 1;
  while (db.products.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${++n}`;
  }

  const now = new Date().toISOString();
  const product: Product = {
    id: nanoid(10),
    name: body.name,
    slug,
    sku: body.sku || `SAR-${Math.floor(1000 + Math.random() * 9000)}`,
    description: body.description || "",
    price: Number(body.price),
    originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
    categoryId: body.categoryId,
    fabric: body.fabric || "",
    color: body.color || "",
    pattern: body.pattern || "",
    occasion: body.occasion || "",
    sareeLength: body.sareeLength || "",
    blouseLength: body.blouseLength || "",
    images: body.images || [],
    videoUrl: body.videoUrl || "",
    isAvailable: body.isAvailable ?? true,
    isFeatured: body.isFeatured ?? false,
    isNewArrival: body.isNewArrival ?? false,
    isBestseller: body.isBestseller ?? false,
    isPublished: body.isPublished ?? true,
    inventoryStatus: body.inventoryStatus || "in_stock",
    tags: body.tags || [],
    views: 0,
    whatsappClicks: 0,
    createdAt: now,
    updatedAt: now,
  };
  db.products.unshift(product);
  writeDB(db);
  res.status(201).json(product);
});

// PUT /api/products/:id (admin)
router.put("/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Saree not found." });

  const body = req.body || {};
  const existing = db.products[idx];

  let slug = existing.slug;
  if (body.name && body.name !== existing.name) {
    let baseSlug = slugify(body.name, { lower: true });
    slug = baseSlug;
    let n = 1;
    while (
      db.products.some((p) => p.slug === slug && p.id !== existing.id)
    ) {
      slug = `${baseSlug}-${++n}`;
    }
  }

  const updated: Product = {
    ...existing,
    ...body,
    id: existing.id,
    slug,
    price: body.price !== undefined ? Number(body.price) : existing.price,
    originalPrice:
      body.originalPrice !== undefined
        ? body.originalPrice
          ? Number(body.originalPrice)
          : null
        : existing.originalPrice,
    updatedAt: new Date().toISOString(),
  };
  db.products[idx] = updated;
  writeDB(db);
  res.json(updated);
});

// DELETE /api/products/:id (admin)
router.delete("/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Saree not found." });
  db.products.splice(idx, 1);
  writeDB(db);
  res.json({ success: true });
});

// POST /api/products/bulk-action (admin)
router.post("/bulk-action", requireAdmin, (req, res) => {
  const { ids, action } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0 || !action) {
    return res.status(400).json({ error: "ids (array) and action are required." });
  }
  const validActions = ["publish", "unpublish", "feature", "unfeature", "delete"];
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(", ")}` });
  }

  const db = readDB();
  let affected = 0;

  if (action === "delete") {
    const before = db.products.length;
    db.products = db.products.filter((p) => !ids.includes(p.id));
    affected = before - db.products.length;
  } else {
    db.products.forEach((p) => {
      if (ids.includes(p.id)) {
        affected++;
        if (action === "publish") p.isPublished = true;
        else if (action === "unpublish") p.isPublished = false;
        else if (action === "feature") p.isFeatured = true;
        else if (action === "unfeature") p.isFeatured = false;
        p.updatedAt = new Date().toISOString();
      }
    });
  }

  writeDB(db);
  res.json({ success: true, affected });
});

// POST /api/products/:id/whatsapp-click - analytics
router.post("/:id/whatsapp-click", (req, res) => {
  const db = readDB();
  const product = db.products.find((p) => p.id === req.params.id);
  if (product) {
    product.whatsappClicks += 1;
    db.events.push({
      id: nanoid(10),
      type: "whatsapp_click",
      productId: product.id,
      createdAt: new Date().toISOString(),
    });
    writeDB(db);
  }
  res.json({ success: true });
});

// POST /api/products/:id/share - analytics
router.post("/:id/share", (req, res) => {
  const db = readDB();
  const product = db.products.find((p) => p.id === req.params.id);
  if (product) {
    db.events.push({
      id: nanoid(10),
      type: "product_share",
      productId: product.id,
      createdAt: new Date().toISOString(),
    });
    writeDB(db);
  }
  res.json({ success: true });
});

export default router;
