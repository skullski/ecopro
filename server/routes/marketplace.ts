import { Router } from "express";

// Marketplace removed — keep a minimal router returning 410 for safety
const router = Router();

router.use((req, res) => {
  res.status(410).json({ error: "Marketplace feature has been removed" });
});

export default router;
