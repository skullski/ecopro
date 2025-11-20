
import { Router } from "express";
import { requireAuth } from "./auth";
import { v4 as uuidv4 } from "uuid";
import { uploadImage } from "../utils/uploads.js";
import { getUserFromRequest } from "../utils/auth";
import { getItems, createItem, updateItem, deleteItem, getItemById, getItemsByUserId } from "../utils/productsDb";

const router = Router();

// Get items for the current authenticated user (seller's own listings)
router.get("/mine", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const items = await getItemsByUserId(user.vendorId);
  res.json(items);
});

// Get all items (marketplace feed)
router.get("/", async (req, res) => {
  const items = await getItems();
  res.json(items);
});

// Get single item
router.get("/:id", async (req, res) => {
  const item = await getItemById(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

// Create new item (auth required, any logged-in user can add)
router.post("/", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const { title, description, price, category, images } = req.body;
  if (!title || !description || !price || !category) return res.status(400).json({ error: "Missing fields" });
  // No vendor restriction: any authenticated user can add items
  const item = await createItem({
    id: uuidv4(),
    title,
    description,
    price,
    category,
    images: images || [],
    vendorId: user.vendorId,
    createdAt: Date.now(),
  });
  res.status(201).json(item);
});

// Update item (auth required, only owner)
router.put("/:id", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const item = await getItemById(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  if (item.vendorId !== user.vendorId) return res.status(403).json({ error: "Forbidden" });
  const updated = await updateItem(req.params.id, req.body);
  res.json(updated);
});

// Delete item (auth required, only owner)
router.delete("/:id", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const item = await getItemById(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  if (item.vendorId !== user.vendorId) return res.status(403).json({ error: "Forbidden" });
  await deleteItem(req.params.id);
  res.json({ success: true });
});

// Image upload endpoint (auth required)
// Note: req.file is set by multer, but not typed in Express.Request by default
router.post("/upload", requireAuth, uploadImage, (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const file = (req as any).file;
  res.json({ url: file?.path });
});

export default router;
