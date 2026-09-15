import "dotenv/config";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import slugify from "slugify";
import { DBShape, Product, Category } from "./types";

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

// Placeholder photography — swap these for the boutique's real photos later.
// picsum.photos gives consistent, non-distorted portrait placeholders keyed
// by a seed string so the same product always shows the same images.
function img(seed: string, w = 900, h = 1125) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

const now = new Date().toISOString();

const categoryDefs: { name: string; description: string }[] = [
  { name: "Banarasi Silk", description: "Rich zari-woven silk sarees from Varanasi's looms." },
  { name: "Kanjivaram Silk", description: "Temple-border silk sarees from Tamil Nadu." },
  { name: "Organza", description: "Sheer, lightweight sarees with a delicate drape." },
  { name: "Chiffon", description: "Fluid, flowing sarees perfect for evening wear." },
  { name: "Georgette", description: "Textured, easy-drape sarees for everyday elegance." },
  { name: "Cotton Handloom", description: "Breathable handwoven cotton for daily wear." },
  { name: "Linen", description: "Crisp, modern linen sarees with a relaxed drape." },
  { name: "Wedding Edit", description: "Statement pieces for bridal and wedding occasions." },
  { name: "Festive Wear", description: "Vibrant sarees for festivals and celebrations." },
  { name: "Daily Wear", description: "Comfortable, easy-care sarees for everyday." },
];

const categories: Category[] = categoryDefs.map((c, i) => ({
  id: nanoid(10),
  name: c.name,
  slug: slugify(c.name, { lower: true }),
  image: img(`cat-${i}-${c.name}`, 800, 1000),
  description: c.description,
  order: i,
  createdAt: now,
}));

function cat(name: string) {
  const c = categories.find((c) => c.name === name);
  if (!c) throw new Error("category not found: " + name);
  return c.id;
}

interface ProductSeed {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  fabric: string;
  color: string;
  pattern: string;
  occasion: string;
  sareeLength: string;
  blouseLength: string;
  description: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  daysAgo: number;
}

const productSeeds: ProductSeed[] = [
  {
    name: "Banarasi Floral Silk Saree",
    category: "Banarasi Silk",
    price: 6499,
    originalPrice: 7999,
    fabric: "Pure Silk",
    color: "Wine Red",
    pattern: "Floral",
    occasion: "Wedding, Festive",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A rich wine-red Banarasi silk saree with intricate floral zari weaving throughout the body and a densely worked pallu. A timeless choice for weddings and festive occasions.",
    isFeatured: true,
    isBestseller: true,
    daysAgo: 40,
  },
  {
    name: "Kanjivaram Temple Border Saree",
    category: "Kanjivaram Silk",
    price: 8999,
    fabric: "Kanjivaram Silk",
    color: "Mustard Yellow",
    pattern: "Temple Border",
    occasion: "Wedding",
    sareeLength: "6 meters",
    blouseLength: "0.8 meters",
    description:
      "Handwoven Kanjivaram silk in a warm mustard tone with a classic temple border and contrasting maroon pallu — a bridal-edit staple.",
    isFeatured: true,
    daysAgo: 55,
  },
  {
    name: "Soft Organza Rose Saree",
    category: "Organza",
    price: 3499,
    originalPrice: 4200,
    fabric: "Organza",
    color: "Dusty Rose",
    pattern: "Sequin Border",
    occasion: "Party Wear",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A featherlight dusty-rose organza saree finished with a delicate sequin border, designed to catch the light as you move.",
    isNewArrival: true,
    isFeatured: true,
    daysAgo: 3,
  },
  {
    name: "Handloom Cotton Saree",
    category: "Cotton Handloom",
    price: 1899,
    fabric: "Pure Cotton",
    color: "Indigo Blue",
    pattern: "Ikat",
    occasion: "Daily Wear",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A breathable handloom cotton saree in a classic ikat weave — soft, durable, and effortless for everyday wear.",
    daysAgo: 70,
  },
  {
    name: "Festive Kanjivaram Silk Saree",
    category: "Kanjivaram Silk",
    price: 9499,
    originalPrice: 10999,
    fabric: "Kanjivaram Silk",
    color: "Emerald Green",
    pattern: "Zari Motifs",
    occasion: "Festive, Wedding",
    sareeLength: "6 meters",
    blouseLength: "0.9 meters",
    description:
      "Deep emerald Kanjivaram silk with all-over gold zari motifs and a woven temple pallu, built for grand occasions.",
    isBestseller: true,
    daysAgo: 20,
  },
  {
    name: "Chiffon Pearl Saree",
    category: "Chiffon",
    price: 2799,
    fabric: "Chiffon",
    color: "Champagne",
    pattern: "Pearl Embellished",
    occasion: "Party Wear",
    sareeLength: "5.5 meters",
    blouseLength: "0.7 meters",
    description:
      "A fluid champagne chiffon saree with subtle pearl embellishments along the border for understated evening glamour.",
    isNewArrival: true,
    daysAgo: 5,
  },
  {
    name: "Linen Printed Saree",
    category: "Linen",
    price: 2399,
    fabric: "Pure Linen",
    color: "Sage Green",
    pattern: "Block Print",
    occasion: "Daily Wear, Office",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A crisp sage-green linen saree with hand block-printed motifs — modern, breathable, and easy to carry through the day.",
    daysAgo: 90,
  },
  {
    name: "Georgette Ombre Saree",
    category: "Georgette",
    price: 3199,
    originalPrice: 3799,
    fabric: "Georgette",
    color: "Coral to Peach Ombre",
    pattern: "Ombre",
    occasion: "Party Wear, Festive",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A coral-to-peach ombre georgette saree with a flattering drape, finished with delicate gota border work.",
    isFeatured: true,
    daysAgo: 12,
  },
  {
    name: "Banarasi Katan Silk Saree",
    category: "Banarasi Silk",
    price: 7299,
    fabric: "Katan Silk",
    color: "Royal Blue",
    pattern: "Paisley",
    occasion: "Wedding, Festive",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A royal blue Katan silk Banarasi saree with a traditional paisley weave and a richly worked gold pallu.",
    isBestseller: true,
    daysAgo: 30,
  },
  {
    name: "Cotton Ikat Handloom Saree",
    category: "Cotton Handloom",
    price: 2099,
    fabric: "Pure Cotton",
    color: "Maroon & Off-White",
    pattern: "Ikat",
    occasion: "Daily Wear",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A handwoven maroon and off-white ikat cotton saree — sturdy, textured, and made for daily comfort.",
    daysAgo: 60,
  },
  {
    name: "Organza Butterfly Saree",
    category: "Organza",
    price: 3999,
    fabric: "Organza",
    color: "Powder Blue",
    pattern: "Butterfly Motif",
    occasion: "Party Wear",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A powder-blue organza saree with delicate butterfly motifs scattered across the body — light, playful, and elegant.",
    isNewArrival: true,
    daysAgo: 2,
    isAvailable: false,
  },
  {
    name: "Festive Georgette Zari Saree",
    category: "Festive Wear",
    price: 4599,
    fabric: "Georgette",
    color: "Deep Purple",
    pattern: "Zari Border",
    occasion: "Festive",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A deep purple georgette saree with a wide gold zari border, striking the balance between festive and easy to wear.",
    daysAgo: 15,
  },
  {
    name: "Linen Silk Blend Saree",
    category: "Linen",
    price: 2999,
    originalPrice: 3499,
    fabric: "Linen Silk Blend",
    color: "Warm Beige",
    pattern: "Solid with Zari Border",
    occasion: "Office, Daily Wear",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A warm beige linen-silk blend saree with a fine zari border — polished enough for the office, comfortable enough for all day.",
    daysAgo: 8,
    isNewArrival: true,
  },
  {
    name: "Bridal Kanjivaram Silk Saree",
    category: "Wedding Edit",
    price: 15999,
    originalPrice: 18999,
    fabric: "Kanjivaram Silk",
    color: "Bridal Red",
    pattern: "Temple & Peacock Motif",
    occasion: "Wedding",
    sareeLength: "6.3 meters",
    blouseLength: "0.9 meters",
    description:
      "A statement bridal-red Kanjivaram silk saree with peacock motifs and a heavily worked temple border pallu — the centerpiece of a bridal trousseau.",
    isFeatured: true,
    isBestseller: true,
    daysAgo: 100,
  },
  {
    name: "Chiffon Floral Print Saree",
    category: "Chiffon",
    price: 2199,
    fabric: "Chiffon",
    color: "Lavender",
    pattern: "Floral Print",
    occasion: "Daily Wear, Party Wear",
    sareeLength: "5.5 meters",
    blouseLength: "0.7 meters",
    description:
      "A soft lavender chiffon saree with an all-over floral print — light, breezy, and versatile from day to evening.",
    daysAgo: 45,
  },
  {
    name: "Cotton Silk Daily Wear Saree",
    category: "Daily Wear",
    price: 1699,
    fabric: "Cotton Silk",
    color: "Teal",
    pattern: "Checks",
    occasion: "Daily Wear",
    sareeLength: "5.5 meters",
    blouseLength: "0.8 meters",
    description:
      "A teal cotton-silk saree in a simple checked weave — comfortable, low-maintenance, and easy to style for daily errands or work.",
    daysAgo: 75,
  },
];

const products: Product[] = productSeeds.map((p, i) => {
  const created = new Date(
    Date.now() - p.daysAgo * 24 * 60 * 60 * 1000
  ).toISOString();
  const slug = slugify(p.name, { lower: true });
  const images = [
    { id: nanoid(8), url: img(`p${i}-main`), label: "Front" },
    { id: nanoid(8), url: img(`p${i}-detail`), label: "Detail" },
    { id: nanoid(8), url: img(`p${i}-border`), label: "Border" },
    { id: nanoid(8), url: img(`p${i}-drape`), label: "Draped Look" },
  ];
  return {
    id: nanoid(10),
    name: p.name,
    slug,
    sku: `SAR-${String(1000 + i)}`,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    categoryId: cat(p.category),
    fabric: p.fabric,
    color: p.color,
    pattern: p.pattern,
    occasion: p.occasion,
    sareeLength: p.sareeLength,
    blouseLength: p.blouseLength,
    images,
    videoUrl: "",
    isAvailable: p.isAvailable ?? true,
    isFeatured: p.isFeatured ?? false,
    isNewArrival: p.isNewArrival ?? false,
    isBestseller: p.isBestseller ?? false,
    isPublished: true,
    inventoryStatus: "in_stock",
    tags: [],
    views: Math.floor(Math.random() * 200) + 5,
    whatsappClicks: Math.floor(Math.random() * 30),
    createdAt: created,
    updatedAt: created,
  };
});

const db: DBShape = {
  products,
  categories,
  settings: {
    businessName: "SATYAM SHIVAM SUNDARAM (3S) Saree",
    logo: "/logo.png",
    description:
      "A home-based saree boutique bringing handpicked silks, cottons and festive weaves to your doorstep, with personal attention for every customer.",
    whatsappNumber: "919999999999",
    phone: "+91 99999 99999",
    email: "hello@3ssaree.com",
    instagram: "https://instagram.com/3ssaree",
    facebook: "",
    address: "",
    city: "Delhi, India",
    businessHours: "Mon–Sat, 10:00 AM – 7:00 PM",
    aboutText:
      "What started as a personal love for sarees has grown into 3S Saree — a small boutique run from home, where every piece is chosen by hand and every customer is treated like family. We believe a saree is never just fabric; it carries craftsmanship, care and a story worth passing on.",
    yearsOfExperience: "5+ years",
    heroImage: img("hero-main", 1600, 2000),
    heroHeading: "Discover Elegance",
    heroSubheading: "Handpicked Sarees for Every Occasion",
    heroTagline: "Tradition, woven beautifully for the modern woman.",
    footerText:
      "Handpicked sarees, personal service, and the warmth of a home-run boutique.",
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

console.log(`Seeded ${products.length} products across ${categories.length} categories.`);
console.log("Admin login -> email: admin@3ssaree.com | password: Boutique@123");
