import { RequestHandler } from "express";
import type { Vendor, MarketplaceProduct } from "@shared/types";
// generate owner keys using timestamp + random
function generateKey() {
  return `key_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
}

// Define route parameter types
interface VendorIdParams {
  id: string;
}

interface VendorSlugParams { slug: string; }

interface ProductIdParams { id: string; }

interface VendorProductsParams { vendorId: string; }

// In-memory storage (replace with database later)
// In-memory vendors fallback; prefer file persistence
let vendors: Vendor[] = [];
let products: MarketplaceProduct[] = [];

// Get all vendors
export const getVendors: RequestHandler = async (_req, res) => {
  try {
    const { readVendors } = await import("../utils/vendorsDb");
    const persisted = await readVendors();
    // Merge in-memory fallback if no persisted data
    if (persisted.length > 0) {
      res.json(persisted);
    } else {
      res.json(vendors);
    }
  } catch (err) {
    res.json(vendors);
  }
};

// Get vendor by ID
export const getVendorById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { readVendors } = await import("../utils/vendorsDb");
  const persisted = await readVendors();
  const vendor = persisted.find(v => v.id === id) || vendors.find(v => v.id === id);
  if (!vendor) {
    return res.status(404).json({ error: "Vendor not found" });
  }
  res.json(vendor);
};

// Get vendor by slug
export const getVendorBySlug: RequestHandler = async (req, res) => {
  const { slug } = req.params;
  const { readVendors } = await import("../utils/vendorsDb");
  const persisted = await readVendors();
  const vendor = persisted.find(v => v.storeSlug === slug) || vendors.find(v => v.storeSlug === slug);
  if (!vendor) {
    return res.status(404).json({ error: "Vendor not found" });
  }
  res.json(vendor);
};

// Create vendor
export const createVendor: RequestHandler = async (req, res) => {
  const vendor: Vendor = req.body;

  // Simple honeypot check to prevent bot signups
  if (req.body.honeypot) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const { findVendorByEmail, findVendorBySlug, createVendor: createVendorDb } = await import("../utils/vendorsDb");
  const byEmail = await findVendorByEmail(vendor.email);
  if (byEmail) {
    return res.status(409).json({ error: "Vendor email already exists" });
  }
  const bySlug = await findVendorBySlug(vendor.storeSlug);
  if (bySlug) {
    return res.status(409).json({ error: "Store slug already exists" });
  }

  const saved = await createVendorDb(vendor);
  res.status(201).json(saved);
};

// Update vendor
export const updateVendor: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { updateVendor: updateVendorDb, readVendors } = await import("../utils/vendorsDb");
  const persisted = await readVendors();
  const index = persisted.findIndex(v => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Vendor not found" });
  }
  const updated = await updateVendorDb(id, req.body as Partial<Vendor>);
  res.json(updated);
};

// Get all products
export const getProducts: RequestHandler = async (_req, res) => {
  try {
    const { readProducts } = await import("../utils/productsDb");
    const persisted = await readProducts();
    res.json(persisted.length ? persisted : products);
  } catch (err) {
    res.json(products);
  }
};

// Get products by vendor
export const getVendorProducts: RequestHandler = (req, res) => {
  const { vendorId } = req.params;
  (async () => {
    const { readProducts } = await import('../utils/productsDb');
    const list = await readProducts();
    const vendorProducts = list.filter(p => p.vendorId === vendorId);
    res.json(vendorProducts);
  })();
};

// Create product
export const createProduct: RequestHandler = async (req, res) => {
  const product: MarketplaceProduct = req.body;

  // server-side defaults for vendor-created products
  if (!product.id) product.id = `prod_${Date.now()}`;
  if (!product.createdAt) product.createdAt = Date.now();
  if (!product.updatedAt) product.updatedAt = Date.now();
  if (!product.status) product.status = 'active';
  if (typeof product.quantity !== 'number') product.quantity = 1;

  const { createProduct: createProductDb, findProductById } = await import("../utils/productsDb");
  // If request is authenticated vendor, attach vendorId and default to exported
  if (req.user && req.user.role === "vendor") {
    // Map authenticated user to a vendor record so vendorId matches vendor DB id
    try {
      const { findVendorByEmail } = await import("../utils/vendorsDb");
      const vendorRecord = await findVendorByEmail(req.user.email);
      if (vendorRecord) {
        product.vendorId = vendorRecord.id;
      } else {
        product.vendorId = req.user.userId;
      }
    } catch (err) {
      console.warn("Could not determine vendor record for user: ", err);
    }
    // Default visibility: export vendor products to marketplace unless explicitly false
    product.isExportedToMarketplace = product.isExportedToMarketplace ?? true;
  }
  const existing = await findProductById(product.id);
  if (existing) return res.status(409).json({ error: "Product already exists" });

  const saved = await createProductDb(product);
  res.status(201).json(saved);
};

// Public product creation - anonymous seller
export const createPublicProduct: RequestHandler = async (req, res) => {
  try {
    const product = req.body as MarketplaceProduct;
    if (!product.id) product.id = `prod_${Date.now()}`;
  product.createdAt = Date.now();
    product.updatedAt = Date.now();
    product.ownerKey = generateKey();
    // Honor email if provided by anonymous seller
    if (req.body.ownerEmail) {
      product.ownerEmail = req.body.ownerEmail;
    }
  product.vendorId = product.vendorId || "";
  // defaults so public products are visible in marketplace
  if (!product.status) product.status = "active";
  if (typeof product.quantity !== "number") product.quantity = 1;
  if (product.isExportedToMarketplace === undefined) product.isExportedToMarketplace = true;
  product.views = product.views || 0;
  product.favorites = product.favorites || 0;

    const { createProduct: createProductDb } = await import("../utils/productsDb");
    const saved = await createProductDb(product);
    res.status(201).json({ product: saved, ownerKey: product.ownerKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create public product" });
  }
};

// List products owned by ownerKey
export const getProductsByOwnerKey: RequestHandler = async (req, res) => {
  const { ownerKey } = req.params;
  const { findProductsByOwnerKey } = await import("../utils/productsDb");
  const list = await findProductsByOwnerKey(ownerKey);
  res.json(list);
};

// List products by owner email (public) — useful for anonymous sellers to see their items
export const getProductsByOwnerEmail: RequestHandler = async (req, res) => {
  const { ownerEmail } = req.params;
  const { readProducts } = await import("../utils/productsDb");
  const products = await readProducts();
  const list = products.filter((p) => p.ownerEmail && p.ownerEmail.toLowerCase() === ownerEmail.toLowerCase());
  res.json(list);
};

// Claim product: authenticated vendor can attach vendorId to product using ownerKey
export const claimProduct: RequestHandler = async (req, res) => {
  const { ownerKey, productId } = req.body;
  // must be authenticated vendor
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "vendor" && req.user.role !== "admin") return res.status(403).json({ error: "Vendor access required" });

  const { findProductById, updateProduct } = await import("../utils/productsDb");
  const product = await findProductById(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (product.ownerKey !== ownerKey) return res.status(403).json({ error: "Invalid owner key" });

  // Map user to vendor id
  const { findVendorByEmail } = await import('../utils/vendorsDb');
  const vendorRec = await findVendorByEmail(req.user.email);
  const vendorId = vendorRec ? vendorRec.id : req.user.userId;
  const updated = await updateProduct(productId, { vendorId, ownerKey: undefined, ownerEmail: undefined });
  res.json({ message: "Product claimed", product: updated });
};

// Claim all products where the ownerEmail matches the vendor's email
export const claimProductsByEmail: RequestHandler = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') return res.status(403).json({ error: 'Vendor access required' });

  const vendorEmail = req.user.email.toLowerCase();
  const { readProducts, updateProduct } = await import('../utils/productsDb');
  const products = await readProducts();

  const toClaim = products.filter(p => p.ownerEmail && p.ownerEmail.toLowerCase() === vendorEmail);
  const updated: any[] = [];
  for (const p of toClaim) {
  const vendorRec = await (await import('../utils/vendorsDb')).findVendorByEmail(req.user.email);
  const vendorId = vendorRec ? vendorRec.id : req.user.userId;
  const u = await updateProduct(p.id, { vendorId, ownerKey: undefined, ownerEmail: undefined });
    if (u) updated.push(u);
  }

  res.json({ message: 'Claimed products', products: updated });
};

// Update product
export const updateProduct: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { findProductById, updateProduct: updateProductDb } = await import('../utils/productsDb');

  const existing = await findProductById(id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  // If vendor, ensure they own the product
  if (req.user && req.user.role === 'vendor') {
    const { findVendorByEmail } = await import('../utils/vendorsDb');
    const vendor = await findVendorByEmail(req.user.email);
    const checkId = vendor ? vendor.id : req.user.userId;
    if (existing.vendorId !== checkId) return res.status(403).json({ error: 'Not allowed' });
  }

  const updated = await updateProductDb(id, req.body);
  if (!updated) return res.status(500).json({ error: 'Failed to update' });
  res.json(updated);
};

// Delete product
export const deleteProduct: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { deleteProduct } = await import("../utils/productsDb");
  const ownerKey = req.body && req.body.ownerKey;

  // If the request comes from an authenticated vendor, check role
  if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
    // allow vendor with vendorId matching product
    const product = await (await import("../utils/productsDb")).findProductById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (req.user.role === 'vendor') {
      const { findVendorByEmail } = await import('../utils/vendorsDb');
      const vendor = await findVendorByEmail(req.user.email);
      const checkId = vendor ? vendor.id : req.user.userId;
      if (product.vendorId !== checkId) {
        return res.status(403).json({ error: 'Not allowed' });
      }
    }
    
    await deleteProduct(id);
    return res.status(204).send();
  }

  // Otherwise require ownerKey for anonymous sellers
  if (!ownerKey) return res.status(401).json({ error: 'Missing ownerKey' });
  const product = await (await import("../utils/productsDb")).findProductById(id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.ownerKey !== ownerKey) return res.status(403).json({ error: 'Invalid ownerKey' });
  await deleteProduct(id);
  res.status(204).send();
};
