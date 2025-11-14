import { RequestHandler } from "express";
import type { Vendor, MarketplaceProduct } from "@shared/types";

// In-memory storage (replace with database later)
let vendors: Vendor[] = [];
let products: MarketplaceProduct[] = [];

// Get all vendors
export const getVendors: RequestHandler = (_req, res) => {
  res.json(vendors);
};

// Get vendor by ID
export const getVendorById: RequestHandler = (req, res) => {
  const vendor = vendors.find(v => v.id === req.params.id);
  if (!vendor) {
    return res.status(404).json({ error: "Vendor not found" });
  }
  res.json(vendor);
};

// Get vendor by slug
export const getVendorBySlug: RequestHandler = (req, res) => {
  const vendor = vendors.find(v => v.storeSlug === req.params.slug);
  if (!vendor) {
    return res.status(404).json({ error: "Vendor not found" });
  }
  res.json(vendor);
};

// Create vendor
export const createVendor: RequestHandler = (req, res) => {
  const vendor: Vendor = req.body;
  vendors.push(vendor);
  res.status(201).json(vendor);
};

// Update vendor
export const updateVendor: RequestHandler = (req, res) => {
  const index = vendors.findIndex(v => v.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Vendor not found" });
  }
  vendors[index] = { ...vendors[index], ...req.body };
  res.json(vendors[index]);
};

// Get all products
export const getProducts: RequestHandler = (_req, res) => {
  res.json(products);
};

// Get products by vendor
export const getVendorProducts: RequestHandler = (req, res) => {
  const vendorProducts = products.filter(p => p.vendorId === req.params.vendorId);
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
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
};

// Delete product
export const deleteProduct: RequestHandler = (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  products.splice(index, 1);
  res.status(204).send();
};
