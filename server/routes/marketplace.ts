import { Router, Request } from "express";
import { jsonError } from '../utils/httpHelpers';
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
import multer, { Multer } from "multer";
import { Readable } from "stream";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Extend the Express Request interface to include the Multer file property
interface MulterRequest extends Request {
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    stream: Readable;
    buffer: Buffer;
  };
}

// Get all marketplace listings (public)
router.get("/", async (_req, res) => {
  try {
    const listings = await getMarketplaceListings();
    res.json(listings);
  } catch (err) {
    return jsonError(res, 500, 'Failed to list marketplace listings');
  }
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
  if (!title || !description || !price || !category) return jsonError(res, 400, "Missing fields");
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
  if (!listing) return jsonError(res, 404, "Listing not found");
  const updated = await updateMarketplaceListing(id, req.body);
  res.json(updated);
});

// Delete listing (seller only)
router.delete("/:id", requireAuth, async (req, res) => {
  const user = getUserFromRequest(req);
  const { id } = req.params;
  const listings = await getMarketplaceListingsByUser(user.userId);
  const listing = listings.find(l => l.id == id);
  if (!listing) return jsonError(res, 404, "Listing not found");
  await deleteMarketplaceListing(id);
  res.json({ success: true });
});

// Create new listing with image upload (seller only)
router.post("/items", requireAuth, upload.single("image"), async (req, res) => {
  const user = getUserFromRequest(req);
  const { title, description, price, category, location } = req.body;
  const image = (req as MulterRequest).file;

  if (!title || !description || !price || !category || !location || !image) {
    return jsonError(res, 400, "All fields are required.");
  }

  const listing = await createMarketplaceListing({
    userId: user.userId,
    title,
    description,
    price: parseFloat(price),
    category,
    images: [image.path],
    location,
  });

  res.status(201).json(listing);
});

export default router;
