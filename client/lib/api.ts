import type { Product } from "@shared/types";

const API_URL = "/api";

// Vendor APIs removed (selling/store feature deprecated)
export async function fetchVendors(): Promise<never> {
  throw new Error('Vendors API removed');
}

export async function fetchVendorById(_id: string): Promise<never> {
  throw new Error('Vendors API removed');
}

export async function fetchVendorBySlug(_slug: string): Promise<never> {
  throw new Error('Vendors API removed');
}

export async function createVendor(): Promise<never> {
  throw new Error('Vendor creation removed');
}

export async function updateVendor(): Promise<never> {
  throw new Error('Vendor update removed');
}

// Products
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`);
  return res.json();
}

export async function fetchVendorProducts(_vendorId: string): Promise<Product[]> {
  throw new Error('Vendor products API removed');
}

export async function createProduct(product: Product): Promise<Product> {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return res.json();
}
// Public listing actions removed. The following functions are intentionally disabled.
export async function createPublicProduct(): Promise<never> {
  throw new Error('createPublicProduct is removed. Public listing feature disabled.');
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

export const CURRENT_USER_ID = localStorage.getItem("demo_user_id") || "u_buyer";

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": CURRENT_USER_ID,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || res.statusText);
  }
  return res.json();
}
