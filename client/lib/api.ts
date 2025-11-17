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

// Create a public (anonymous) product and receive ownerKey
export async function createPublicProduct(product: Partial<MarketplaceProduct>): Promise<{ product: MarketplaceProduct; ownerKey: string; }> {
  const res = await fetch(`${API_URL}/products/public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return res.json();
}

// Upload an image as base64 JSON body
export async function uploadImage(file: File): Promise<{ url: string }> {
  // read file as dataURL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('failed reading file'));
    reader.readAsDataURL(file);
  });

  const res = await fetch(`${API_URL}/products/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, data: dataUrl }),
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

export async function getProductsByOwnerKey(ownerKey: string): Promise<MarketplaceProduct[]> {
  const res = await fetch(`${API_URL}/products/owner/${ownerKey}`);
  return res.json();
}

export async function getProductsByOwnerEmail(ownerEmail: string): Promise<MarketplaceProduct[]> {
  const res = await fetch(`${API_URL}/products/owner-email/${encodeURIComponent(ownerEmail)}`);
  return res.json();
}

export async function claimProduct(productId: string, ownerKey: string): Promise<any> {
  const res = await fetch(`${API_URL}/products/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, ownerKey })
  });
  return res.json();
}

export async function claimProductsByEmail(): Promise<any> {
  const res = await fetch(`${API_URL}/products/claim-by-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
