import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { requireAdmin } from "../auth";

const router = Router();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${nanoid(12)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP or AVIF images are allowed."));
    }
    cb(null, true);
  },
});

router.post(
  "/images",
  requireAdmin,
  upload.array("images", 12),
  (req, res) => {
    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length) {
      return res.status(400).json({ error: "No images were uploaded." });
    }
    const images = files.map((f) => ({
      id: nanoid(8),
      url: `/uploads/${f.filename}`,
      label: "",
    }));
    res.status(201).json({ images });
  }
);

router.use((err: any, _req: any, res: any, _next: any) => {
  if (err) {
    return res.status(400).json({ error: err.message || "Upload failed." });
  }
});

export default router;
