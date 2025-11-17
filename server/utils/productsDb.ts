import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { MarketplaceProduct } from '@shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_PATH = path.join(__dirname, '../../data/products.json');

async function ensureDataDir() {
  const dir = path.dirname(PRODUCTS_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function readProducts(): Promise<MarketplaceProduct[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(PRODUCTS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function writeProducts(products: MarketplaceProduct[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf-8');
}

export async function findProductById(id: string): Promise<MarketplaceProduct | null> {
  const products = await readProducts();
  return products.find((p) => p.id === id) || null;
}

export async function findProductsByOwnerKey(ownerKey: string): Promise<MarketplaceProduct[]> {
  const products = await readProducts();
  return products.filter((p) => p.ownerKey === ownerKey);
}

export async function createProduct(product: MarketplaceProduct): Promise<MarketplaceProduct> {
  const products = await readProducts();
  products.push(product);
  await writeProducts(products);
  return product;
}

export async function updateProduct(id: string, updates: Partial<MarketplaceProduct>): Promise<MarketplaceProduct | null> {
  const products = await readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates };
  await writeProducts(products);
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await readProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  await writeProducts(filtered);
  return true;
}
