import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { readDB, writeDB } from "../db";
import {
  CUSTOMER_COOKIE,
  signCustomerToken,
  requireCustomer,
  requireAdmin,
} from "../auth";

const router = Router();

// Admin: list all customers (strips passwordHash)
router.get("/", requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const customers = db.customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    city: c.city,
    wishlistCount: c.wishlist.length,
    createdAt: c.createdAt,
  }));
  res.json(customers);
});

router.post("/register", (req: Request, res: Response) => {
  const { name, email, phone, city, password } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Name is required (min 2 characters)." });
  }
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "A valid email is required." });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const db = readDB();
  const existing = db.customers.find(
    (c) => c.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const customer = {
    id: nanoid(10),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: (phone || "").trim(),
    city: (city || "").trim(),
    passwordHash: bcrypt.hashSync(password, 10),
    wishlist: [],
    createdAt: new Date().toISOString(),
  };

  db.customers.push(customer);
  writeDB(db);

  const token = signCustomerToken({
    id: customer.id,
    email: customer.email,
    name: customer.name,
  });

  res.cookie(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(201).json({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
  });
});

router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = readDB();
  const customer = db.customers.find(
    (c) => c.email.toLowerCase() === email.toLowerCase()
  );
  if (!customer || !bcrypt.compareSync(password, customer.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signCustomerToken({
    id: customer.id,
    email: customer.email,
    name: customer.name,
  });

  res.cookie(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
  });

  res.json({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
  });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(CUSTOMER_COOKIE);
  res.json({ ok: true });
});

router.get("/me", requireCustomer, (req: Request, res: Response) => {
  const db = readDB();
  const customer = db.customers.find((c) => c.id === (req as any).customer.id);
  if (!customer) {
    res.clearCookie(CUSTOMER_COOKIE);
    return res.status(401).json({ error: "Account not found." });
  }
  res.json({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
    wishlist: customer.wishlist,
    createdAt: customer.createdAt,
  });
});

router.put("/me", requireCustomer, (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.customers.findIndex((c) => c.id === (req as any).customer.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Account not found." });
  }
  const { name, phone, city } = req.body;
  if (name && typeof name === "string" && name.trim().length >= 2) {
    db.customers[idx].name = name.trim();
  }
  if (phone !== undefined) db.customers[idx].phone = (phone || "").trim();
  if (city !== undefined) db.customers[idx].city = (city || "").trim();
  writeDB(db);

  res.json({
    id: db.customers[idx].id,
    name: db.customers[idx].name,
    email: db.customers[idx].email,
    phone: db.customers[idx].phone,
    city: db.customers[idx].city,
  });
});

router.get("/wishlist", requireCustomer, (req: Request, res: Response) => {
  const db = readDB();
  const customer = db.customers.find((c) => c.id === (req as any).customer.id);
  if (!customer) return res.status(404).json({ error: "Account not found." });

  const products = db.products.filter((p) => customer.wishlist.includes(p.id));
  res.json(products);
});

router.post("/wishlist/:productId", requireCustomer, (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.customers.findIndex((c) => c.id === (req as any).customer.id);
  if (idx === -1) return res.status(404).json({ error: "Account not found." });

  const productId = req.params.productId as string;
  if (!db.products.find((p) => p.id === productId)) {
    return res.status(404).json({ error: "Product not found." });
  }

  if (!db.customers[idx].wishlist.includes(productId)) {
    db.customers[idx].wishlist.push(productId);
    writeDB(db);
  }
  res.json({ ok: true, wishlist: db.customers[idx].wishlist });
});

router.delete("/wishlist/:productId", requireCustomer, (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.customers.findIndex((c) => c.id === (req as any).customer.id);
  if (idx === -1) return res.status(404).json({ error: "Account not found." });

  db.customers[idx].wishlist = db.customers[idx].wishlist.filter(
    (id: string) => id !== req.params.productId
  );
  writeDB(db);
  res.json({ ok: true, wishlist: db.customers[idx].wishlist });
});

router.get("/my-reviews", requireCustomer, (req: Request, res: Response) => {
  const db = readDB();
  const customer = db.customers.find((c) => c.id === (req as any).customer.id);
  if (!customer) return res.status(404).json({ error: "Account not found." });

  const reviews = db.reviews
    .filter((r) => r.name.toLowerCase() === customer.name.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const withProducts = reviews.map((r) => {
    const product = db.products.find((p) => p.id === r.productId);
    return { ...r, productName: product?.name || "Unknown", productSlug: product?.slug || "" };
  });

  res.json(withProducts);
});

export default router;
