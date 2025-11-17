import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { Vendor } from "@shared/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VENDORS_PATH = path.join(__dirname, "../../data/vendors.json");

async function ensureDataDir() {
  const dir = path.dirname(VENDORS_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function readVendors(): Promise<Vendor[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(VENDORS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function writeVendors(vendors: Vendor[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(VENDORS_PATH, JSON.stringify(vendors, null, 2), "utf-8");
}

export async function findVendorByEmail(email: string): Promise<Vendor | null> {
  const vendors = await readVendors();
  return vendors.find((v) => v.email === email) || null;
}

export async function findVendorBySlug(slug: string): Promise<Vendor | null> {
  const vendors = await readVendors();
  return vendors.find((v) => v.storeSlug === slug) || null;
}

export async function createVendor(vendor: Omit<Vendor, "id" | "joinedAt">): Promise<Vendor> {
  const vendors = await readVendors();
  const newVendor: Vendor = {
    ...vendor,
    id: `vendor_${Date.now()}`,
    joinedAt: Date.now(),
  } as Vendor;
  vendors.push(newVendor);
  await writeVendors(vendors);
  return newVendor;
}

export async function updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
  const vendors = await readVendors();
  const index = vendors.findIndex((v) => v.id === id);
  if (index === -1) return null;
  vendors[index] = { ...vendors[index], ...updates };
  await writeVendors(vendors);
  return vendors[index];
}
