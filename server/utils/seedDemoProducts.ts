// Script to seed 20 random products for marketplace demo
import { createProduct } from "./productsDb";
import { randomUUID } from "crypto";

const categories = [
  "Cars", "Electronics", "Fashion", "Home", "Sports",
  "Accessories", "Real Estate", "Jobs", "Others"
];
const locations = [
  "Algiers", "Oran", "Constantine", "Annaba", "Blida",
  "Setif", "Batna", "Tlemcen", "Bejaia", "Ghardaia"
];
const images = [
  "/demo/product1.jpg", "/demo/product2.jpg", "/demo/product3.jpg", "/demo/product4.jpg", "/demo/product5.jpg"
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedProducts() {
  for (let i = 1; i <= 20; i++) {
    await createProduct({
      id: randomUUID(),
      vendorId: "demo-vendor",
      title: `Demo Product ${i}`,
      description: `This is a demo product #${i} for marketplace testing.`,
      price: Math.floor(Math.random() * 10000) + 100,
      category: randomItem(categories),
      images: [randomItem(images)],
      published: true,
      ownerKey: "demo-owner",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      condition: "new",
      quantity: 1,
      status: "active",
    });
  }
  console.log("Seeded 20 demo products.");
}

seedProducts().then(() => process.exit(0));
