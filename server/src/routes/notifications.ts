import { Router, Request, Response } from "express";
import { readDB } from "../db";
import { requireAdmin } from "../auth";

const router = Router();

router.get("/low-stock", requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const items = db.products.filter(
    (p) => p.inventoryStatus === "low_stock" || p.inventoryStatus === "out_of_stock"
  );
  res.json(items);
});

export default router;
