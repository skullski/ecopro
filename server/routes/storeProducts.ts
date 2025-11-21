import { Router } from "express";
import { requireAuth } from "./auth";
import { v4 as uuidv4 } from "uuid";
import { getUserFromRequest } from "../utils/auth";
import {
  createStoreProduct,
  getStoreProductsByUser,
  getStoreProductsByStore,
  updateStoreProduct,
  deleteStoreProduct
} from "../utils/storeProductsDb";

const router = Router();

// Get all products for a store (seller dashboard, private by default)
router.get("/store/:storeId", requireAuth, async (req, res) => {
  const { storeId } = req.params;
  const products = await getStoreProductsByStore(storeId);
  res.json(products);
});

// Get all products for current seller (private dashboard)
router.get("/mine", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const products = await getStoreProductsByUser(user.userId);
  res.json(products);
});

// Create new product (seller dashboard)
router.post("/", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const { storeId, title, description, price, category, images, condition, quantity, featured, status } = req.body;
  if (!storeId || !title || !description || !price || !category) return res.status(400).json({ error: "Missing fields" });
  const product = await createStoreProduct({
    storeId,
    userId: user.userId,
    title,
    description,
    price,
    category,
    images: images || [],
    condition: condition || 'new',
    quantity: quantity || 1,
    featured: !!featured,
    status: status || 'active',
  });
  res.status(201).json(product);
});

// Update product (seller dashboard)
router.put("/:id", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const { id } = req.params;
  const products = await getStoreProductsByUser(user.userId);
  const product = products.find(p => p.id == id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const updated = await updateStoreProduct(id, req.body);
  res.json(updated);
});

// Delete product (seller dashboard)
router.delete("/:id", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const { id } = req.params;
  const products = await getStoreProductsByUser(user.userId);
  const product = products.find(p => p.id == id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  await deleteStoreProduct(id);
  res.json({ success: true });
});

export default router;
