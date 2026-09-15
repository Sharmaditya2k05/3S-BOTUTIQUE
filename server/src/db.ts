import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { DBShape } from "./types";

// This file simulates a database using a single JSON file on disk.
//
// WHY: for a small home-based boutique, running a full Postgres instance is
// unnecessary operational overhead. This module exposes the exact same shape
// of data that the Prisma models described in the project README use, so
// swapping this for a real Prisma + Postgres client later only means
// rewriting the functions in this file (readDB/writeDB) — nothing else in
// the app needs to change since routes only ever import { readDB, writeDB }.

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

function ensureDB(): void {
  if (!fs.existsSync(DB_PATH)) {
    console.log("db.json not found — auto-initializing empty database...");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const email = process.env.ADMIN_EMAIL || "admin@3ssaree.com";
    const pw = process.env.ADMIN_PASSWORD || "Boutique@123";
    const name = process.env.ADMIN_NAME || "Boutique Admin";
    const now = new Date().toISOString();
    const cats = [
      "Banarasi Silk", "Kanjivaram Silk", "Organza", "Chiffon",
      "Georgette", "Cotton Handloom", "Linen", "Wedding Edit",
      "Festive Wear", "Daily Wear",
    ];

    const db: DBShape = {
      products: [],
      categories: cats.map((n, i) => ({
        id: `cat-${i + 1}`,
        name: n,
        slug: n.toLowerCase().replace(/\s+/g, "-"),
        image: "",
        description: "",
        order: i,
        createdAt: now,
      })),
      settings: {
        businessName: "3S Saree — Satyam Shivam Sundaram",
        logo: "/logo.png",
        description: "",
        whatsappNumber: "",
        phone: "",
        email: "",
        instagram: "",
        facebook: "",
        address: "",
        city: "",
        businessHours: "",
        aboutText: "",
        yearsOfExperience: "",
        heroImage: "",
        heroHeading: "Discover Elegance",
        heroSubheading: "Handpicked Sarees for Every Occasion",
        heroTagline: "Tradition, woven beautifully for the modern woman.",
        footerText: "Handpicked sarees, personal service, and the warmth of a home-run boutique.",
        ownerImage: "",
        ownerName: "",
        announcementText: "",
        announcementLink: "",
        announcementColor: "#5f1526",
        announcementEnabled: false,
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        googleAnalyticsId: "",
        lowStockThreshold: 0,
        adminNotificationEmail: "",
        googleBusinessUrl: "",
        homepageSections: [
          { id: "hero", type: "hero", enabled: true, order: 0 },
          { id: "why-us", type: "why-us", enabled: true, order: 1 },
          { id: "categories", type: "categories", enabled: true, order: 2 },
          { id: "featured", type: "featured", enabled: true, order: 3 },
          { id: "new-arrivals", type: "new-arrivals", enabled: true, order: 4 },
          { id: "our-story", type: "our-story", enabled: true, order: 5 },
          { id: "testimonials", type: "testimonials", enabled: true, order: 6 },
          { id: "cta", type: "cta", enabled: true, order: 7 },
        ],
      },
      events: [],
      admins: [{
        id: "admin1",
        email,
        passwordHash: bcrypt.hashSync(pw, 10),
        name,
      }],
      reviews: [],
      testimonials: [],
      customers: [],
      coupons: [],
      blog: [],
      whatsappTemplates: [],
    };

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    console.log(`Database initialized. Admin: ${email}`);
  }
}

export function readDB(): DBShape {
  ensureDB();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DBShape;
}

export function writeDB(data: DBShape): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}
