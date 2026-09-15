import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import settingsRoutes from "./routes/settings";
import uploadRoutes from "./routes/upload";
import analyticsRoutes from "./routes/analytics";
import reviewRoutes from "./routes/reviews";
import testimonialRoutes from "./routes/testimonials";
import customerRoutes from "./routes/customers";
import backupRoutes from "./routes/backup";
import couponRoutes from "./routes/coupons";
import blogRoutes from "./routes/blog";
import whatsappTemplateRoutes from "./routes/whatsapp-templates";
import notificationRoutes from "./routes/notifications";
import chatRoutes from "./routes/chat";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/whatsapp-templates", whatsappTemplateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const clientDir = path.join(__dirname, "..", "public");
if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
      return res.sendFile(path.join(clientDir, "index.html"));
    }
    next();
  });
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

app.listen(PORT, () => {
  console.log(`3S Saree API running on http://localhost:${PORT}`);
});
