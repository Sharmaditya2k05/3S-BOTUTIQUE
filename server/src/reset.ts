import "dotenv/config";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import slugify from "slugify";
import { DBShape, Category } from "./types";

const DB_PATH = path.join(__dirname, "..", "data", "db.json");
const now = new Date().toISOString();

// A sensible starter taxonomy for a saree boutique — kept because it's
// genuinely useful, not because it's "demo" content. No demo images: the
// admin uploads real category photos from /admin/categories. Feel free to
// rename, delete, or add to these from the admin dashboard at any time.
const STARTER_CATEGORIES = [
  "Banarasi Silk",
  "Kanjivaram Silk",
  "Organza",
  "Chiffon",
  "Georgette",
  "Cotton Handloom",
  "Linen",
  "Wedding Edit",
  "Festive Wear",
  "Daily Wear",
];

const categories: Category[] = STARTER_CATEGORIES.map((name, i) => ({
  id: nanoid(10),
  name,
  slug: slugify(name, { lower: true }),
  image: "",
  description: "",
  order: i,
  createdAt: now,
}));

const db: DBShape = {
  products: [],
  categories,
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
  admins: [
    {
      id: nanoid(10),
      email: "admin@3ssaree.com",
      passwordHash: bcrypt.hashSync("Boutique@123", 10),
      name: "Boutique Admin",
    },
  ],
  reviews: [],
  testimonials: [],
  customers: [],
  coupons: [],
  blog: [],
  whatsappTemplates: [],
};

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");

// Clear any demo/test images that were uploaded through the admin panel too.
const uploadsDir = path.join(__dirname, "..", "uploads");
if (fs.existsSync(uploadsDir)) {
  for (const file of fs.readdirSync(uploadsDir)) {
    if (file !== ".gitkeep") fs.unlinkSync(path.join(uploadsDir, file));
  }
}

console.log("Reset complete — catalog is empty and ready for real data.");
console.log(`Created ${categories.length} starter categories (no products, no demo photos).`);
console.log("IMPORTANT: go to Admin > Settings and set your real WhatsApp number, phone,");
console.log("email, address and hero photo before sharing the site with customers.");
console.log("Admin login -> email: admin@3ssaree.com | password: Boutique@123");
console.log("Change this password before going live.");
