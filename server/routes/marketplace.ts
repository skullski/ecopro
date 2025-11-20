import { Router } from "express";
import { requireAuth } from "./auth";
import { v4 as uuidv4 } from "uuid";
import { getUserFromRequest } from "../utils/auth";
import {
  createMarketplaceListing,
  getMarketplaceListings,
  getMarketplaceListingsByUser,
  updateMarketplaceListing,
  deleteMarketplaceListing
} from "../utils/marketplaceDb";

const router = Router();

// Get all marketplace listings (public)
router.get("/", async (_req, res) => {
  const listings = await getMarketplaceListings();
  res.json(listings);
});

// Get listings for current seller
router.get("/mine", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const listings = await getMarketplaceListingsByUser(user.userId);
  res.json(listings);
});

// Create new listing (seller only)
router.post("/", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const { title, description, price, category, images, location } = req.body;
  if (!title || !description || !price || !category) return res.status(400).json({ error: "Missing fields" });
  const listing = await createMarketplaceListing({
    userId: user.userId,
    title,
    description,
    price,
    category,
    images: images || [],
    location: location || "",
  });
  res.status(201).json(listing);
});

// Update listing (seller only)
router.put("/:id", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const { id } = req.params;
  // Only allow update if user owns the listing
  const listings = await getMarketplaceListingsByUser(user.userId);
  const listing = listings.find(l => l.id == id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  const updated = await updateMarketplaceListing(id, req.body);
  res.json(updated);
});

// Delete listing (seller only)
router.delete("/:id", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const { id } = req.params;
  const listings = await getMarketplaceListingsByUser(user.userId);
  const listing = listings.find(l => l.id == id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  await deleteMarketplaceListing(id);
  res.json({ success: true });
});

export default router;
