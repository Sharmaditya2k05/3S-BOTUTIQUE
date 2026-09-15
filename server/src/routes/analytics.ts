import { Router } from "express";
import { readDB } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

router.get("/", requireAdmin, (_req, res) => {
  const db = readDB();

  const topViewed = db.products
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((p) => ({ id: p.id, name: p.name, views: p.views, whatsappClicks: p.whatsappClicks }));

  const topEnquired = db.products
    .slice()
    .sort((a, b) => b.whatsappClicks - a.whatsappClicks)
    .slice(0, 5)
    .map((p) => ({ id: p.id, name: p.name, whatsappClicks: p.whatsappClicks, views: p.views }));

  const categoryCounts: Record<string, number> = {};
  db.products.forEach((p) => {
    categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] || 0) + 1;
  });
  const popularCategories = Object.entries(categoryCounts)
    .map(([categoryId, count]) => {
      const cat = db.categories.find((c) => c.id === categoryId);
      return { categoryId, name: cat?.name || "Unknown", count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const totalViews = db.products.reduce((s, p) => s + p.views, 0);
  const totalWhatsappClicks = db.products.reduce((s, p) => s + p.whatsappClicks, 0);
  const conversionRate =
    totalViews > 0 ? Math.round((totalWhatsappClicks / totalViews) * 1000) / 10 : 0;

  const recentSearches = db.events
    .filter((e) => e.type === "search")
    .slice(-10)
    .reverse()
    .map((e) => e.query);

  res.json({
    totalViews,
    totalWhatsappClicks,
    conversionRate,
    topViewed,
    topEnquired,
    popularCategories,
    recentSearches,
  });
});

// GET /api/analytics/top-products - top 10 most-viewed products
router.get("/top-products", requireAdmin, (_req, res) => {
  const db = readDB();
  const topProducts = db.products
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      views: p.views,
      whatsappClicks: p.whatsappClicks,
      price: p.price,
      image: p.images[0]?.url || "",
    }));
  res.json(topProducts);
});

// GET /api/analytics/top-enquiries - top 10 products by whatsappClicks
router.get("/top-enquiries", requireAdmin, (_req, res) => {
  const db = readDB();
  const topEnquiries = db.products
    .slice()
    .sort((a, b) => b.whatsappClicks - a.whatsappClicks)
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      whatsappClicks: p.whatsappClicks,
      views: p.views,
      price: p.price,
      image: p.images[0]?.url || "",
    }));
  res.json(topEnquiries);
});

// GET /api/analytics/search-terms - popular search terms aggregated
router.get("/search-terms", requireAdmin, (_req, res) => {
  const db = readDB();
  const termCounts: Record<string, number> = {};
  db.events
    .filter((e) => e.type === "search" && e.query)
    .forEach((e) => {
      const q = (e.query as string).toLowerCase().trim();
      if (q) {
        termCounts[q] = (termCounts[q] || 0) + 1;
      }
    });
  const searchTerms = Object.entries(termCounts)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  res.json(searchTerms);
});

// GET /api/analytics/overview - summary stats
router.get("/overview", requireAdmin, (_req, res) => {
  const db = readDB();
  const totalProducts = db.products.length;
  const totalViews = db.products.reduce((s, p) => s + p.views, 0);
  const totalWhatsappClicks = db.products.reduce((s, p) => s + p.whatsappClicks, 0);
  const totalEvents = db.events.length;

  const eventsByType: Record<string, number> = {};
  db.events.forEach((e) => {
    eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
  });

  res.json({
    totalProducts,
    totalViews,
    totalWhatsappClicks,
    totalEvents,
    eventsByType,
  });
});

router.get("/whatsapp-log", requireAdmin, (_req, res) => {
  const db = readDB();

  const whatsappEvents = db.events
    .filter((e) => e.type === "whatsapp_click")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 100)
    .map((e) => {
      const product = e.productId ? db.products.find((p) => p.id === e.productId) : null;
      return {
        id: e.id,
        productId: e.productId || null,
        productName: product?.name || "Unknown",
        productSlug: product?.slug || "",
        productImage: product?.images?.[0]?.url || "",
        createdAt: e.createdAt,
      };
    });

  res.json(whatsappEvents);
});

export default router;
