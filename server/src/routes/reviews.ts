import { Router, Request, Response } from "express";
import { nanoid } from "nanoid";
import multer from "multer";
import path from "path";
import fs from "fs";
import { readDB, writeDB } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const reviewUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `review-${nanoid(12)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, or WEBP images are allowed."));
    }
    cb(null, true);
  },
});

// Public endpoint for customers to upload review photos
router.post("/upload", reviewUpload.array("images", 5), (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) {
    return res.status(400).json({ error: "No images were uploaded." });
  }
  const urls = files.map((f) => `/uploads/${f.filename}`);
  res.status(201).json({ urls });
});

router.get("/:productId", (req: Request, res: Response) => {
  const db = readDB();
  const reviews = db.reviews
    .filter((r) => r.productId === req.params.productId && r.approved)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = reviews.length;
  const avg =
    total > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
      : 0;
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  res.json({ reviews, total, averageRating: avg, breakdown });
});

router.post("/:productId", (req: Request, res: Response) => {
  const { name, rating, comment, images: rawImages } = req.body;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Name is required (min 2 characters)." });
  }
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }
  if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
    return res.status(400).json({ error: "Comment is required (min 5 characters)." });
  }
  if (comment.trim().length > 1000) {
    return res.status(400).json({ error: "Comment is too long (max 1000 characters)." });
  }

  const db = readDB();
  const product = db.products.find((p) => p.id === req.params.productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  const images = Array.isArray(rawImages)
    ? rawImages.filter((u: unknown) => typeof u === "string").slice(0, 5)
    : [];

  const review = {
    id: nanoid(),
    productId: req.params.productId as string,
    name: name.trim(),
    rating: Math.round(rating),
    comment: comment.trim(),
    images,
    approved: true,
    createdAt: new Date().toISOString(),
  };

  db.reviews.push(review);
  writeDB(db);
  res.status(201).json(review);
});

router.get("/", requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const reviews = db.reviews
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => {
      const product = db.products.find((p) => p.id === r.productId);
      return { ...r, productName: product?.name || "Deleted product", productSlug: product?.slug || "" };
    });
  res.json(reviews);
});

router.put("/:reviewId", requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const review = db.reviews.find((r) => r.id === req.params.reviewId);
  if (!review) return res.status(404).json({ error: "Review not found." });
  if (typeof req.body.approved === "boolean") review.approved = req.body.approved;
  writeDB(db);
  res.json(review);
});

router.delete("/:reviewId", requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.reviews.findIndex((r) => r.id === req.params.reviewId);
  if (idx === -1) {
    return res.status(404).json({ error: "Review not found." });
  }
  db.reviews.splice(idx, 1);
  writeDB(db);
  res.json({ ok: true });
});

export default router;
