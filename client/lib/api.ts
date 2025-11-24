import type { Vendor, Product } from "@shared/types";

const API_URL = "/api";

// Vendors
export async function fetchVendors(): Promise<Vendor[]> {
  const res = await fetch(`${API_URL}/vendors`);
  return res.json();
}

export async function fetchVendorById(id: string): Promise<Vendor> {
  const res = await fetch(`${API_URL}/vendors/${id}`);
  return res.json();
}

export async function fetchVendorBySlug(slug: string): Promise<Vendor> {
  const res = await fetch(`${API_URL}/vendors/slug/${slug}`);
  return res.json();
}

export async function createVendor(vendor: Vendor): Promise<Vendor> {
  const res = await fetch(`${API_URL}/vendors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vendor),
  });
  return res.json();
}

export async function updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
  const res = await fetch(`${API_URL}/vendors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

// Products
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`);
  return res.json();
}

export async function fetchVendorProducts(vendorId: string): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products/vendor/${vendorId}`);
  return res.json();
}

export async function createProduct(product: Product): Promise<Product> {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return res.json();
}
// Public marketplace actions removed. The following functions are intentionally disabled.
export async function createPublicProduct(): Promise<never> {
  throw new Error('createPublicProduct is removed. Marketplace feature disabled.');
}

// Upload an image as base64 JSON body
export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_URL}/products/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function deletePublicProduct(productId: string, ownerKey: string): Promise<any> {
  const res = await fetch(`${API_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerKey }),
  });
  return res.json();
}

export async function getProductsByOwnerKey(): Promise<never> {
  throw new Error('getProductsByOwnerKey is removed.');
}

export async function getProductsByOwnerEmail(): Promise<never> {
  throw new Error('getProductsByOwnerEmail is removed.');
}

export async function claimProduct(): Promise<never> {
  throw new Error('claimProduct is removed.');
}

export async function claimProductsByEmail(): Promise<never> {
  throw new Error('claimProductsByEmail is removed.');
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });
}
