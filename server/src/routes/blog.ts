import { Router, Request, Response } from "express";
import { nanoid } from "nanoid";
import slugify from "slugify";
import { readDB, writeDB } from "../db";
import { requireAdmin, isAdmin } from "../auth";

const router = Router();

// GET / - list posts (public gets published only, admin=true gets all)
router.get("/", (req: Request, res: Response) => {
  const db = readDB();
  const admin = req.query.admin === "true" && isAdmin(req);
  const posts = (db.blog || [])
    .filter((p) => admin || p.isPublished)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  res.json(posts);
});

// GET /:slug - single post by slug
router.get("/:slug", (req: Request, res: Response) => {
  const db = readDB();
  const admin = isAdmin(req);
  const post = db.blog.find((p) => p.slug === req.params.slug);
  if (!post || (!post.isPublished && !admin)) {
    return res.status(404).json({ error: "Post not found." });
  }
  res.json(post);
});

// POST / - create post (admin only)
router.post("/", requireAdmin, (req: Request, res: Response) => {
  const { title, excerpt, content, coverImage, isPublished } = req.body;
  if (!title || typeof title !== "string" || title.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "Title is required (min 2 characters)." });
  }

  const db = readDB();
  const now = new Date().toISOString();
  let slug = slugify(title, { lower: true, strict: true });

  // Ensure slug uniqueness
  const existing = db.blog.find((p) => p.slug === slug);
  if (existing) {
    slug = `${slug}-${nanoid(4)}`;
  }

  const post = {
    id: nanoid(10),
    title: title.trim(),
    slug,
    excerpt: (excerpt || "").trim(),
    content: (content || "").trim(),
    coverImage: coverImage || "",
    isPublished: typeof isPublished === "boolean" ? isPublished : false,
    createdAt: now,
    updatedAt: now,
  };

  db.blog.push(post);
  writeDB(db);
  res.status(201).json(post);
});

// PUT /:id - update post (admin only)
router.put("/:id", requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.blog.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Post not found." });
  }

  const post = db.blog[idx];
  const { title, excerpt, content, coverImage, isPublished } = req.body;

  if (title !== undefined) {
    post.title = (title || "").trim();
    const newSlug = slugify(post.title, { lower: true, strict: true });
    // Only update slug if title changed and new slug doesn't collide
    if (newSlug !== post.slug) {
      const collision = db.blog.find(
        (p) => p.slug === newSlug && p.id !== post.id
      );
      post.slug = collision ? `${newSlug}-${nanoid(4)}` : newSlug;
    }
  }
  if (excerpt !== undefined) post.excerpt = (excerpt || "").trim();
  if (content !== undefined) post.content = (content || "").trim();
  if (coverImage !== undefined) post.coverImage = coverImage || "";
  if (typeof isPublished === "boolean") post.isPublished = isPublished;
  post.updatedAt = new Date().toISOString();

  db.blog[idx] = post;
  writeDB(db);
  res.json(post);
});

// DELETE /:id - delete post (admin only)
router.delete("/:id", requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.blog.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Post not found." });
  }
  db.blog.splice(idx, 1);
  writeDB(db);
  res.json({ ok: true });
});

export default router;
