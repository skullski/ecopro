import type { Vendor, MarketplaceProduct } from "@shared/types";

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
export async function fetchProducts(): Promise<MarketplaceProduct[]> {
  const res = await fetch(`${API_URL}/products`);
  return res.json();
}

export async function fetchVendorProducts(vendorId: string): Promise<MarketplaceProduct[]> {
  const res = await fetch(`${API_URL}/products/vendor/${vendorId}`);
  return res.json();
}

export async function createProduct(product: MarketplaceProduct): Promise<MarketplaceProduct> {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return res.json();
}

export async function updateProduct(id: string, updates: Partial<MarketplaceProduct>): Promise<MarketplaceProduct> {
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
