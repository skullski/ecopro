import { RequestHandler } from "express";
import type { Vendor, MarketplaceProduct } from "@shared/types";

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
export const getProducts: RequestHandler = (_req, res) => {
  res.json(products);
};

// Get products by vendor
export const getVendorProducts: RequestHandler = (req, res) => {
  const { vendorId } = req.params;
  const vendorProducts = products.filter(p => p.vendorId === vendorId);
  res.json(vendorProducts);
};

// Create product
export const createProduct: RequestHandler = (req, res) => {
  const product: MarketplaceProduct = req.body;
  products.push(product);
  res.status(201).json(product);
};

// Update product
export const updateProduct: RequestHandler = (req, res) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
};

// Delete product
export const deleteProduct: RequestHandler = (req, res) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  products.splice(index, 1);
  res.status(204).send();
};
