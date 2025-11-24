// Script to seed demo products, categories, and banners for a full-featured marketplace
import { createProduct } from './productsDb';
import { v4 as uuidv4 } from 'uuid';

const categories = [
  { name: 'Automobiles', icon: 'car' },
  { name: 'Electronics', icon: 'smartphone' },
  { name: 'Fashion', icon: 'tshirt' },
  { name: 'Home', icon: 'home' },
  { name: 'Sports', icon: 'football' },
  { name: 'Toys', icon: 'gamepad' },
  { name: 'Real Estate', icon: 'building' },
  { name: 'Services', icon: 'briefcase' },
  { name: 'Jobs', icon: 'user' },
  { name: 'Others', icon: 'grid' },
];

const demoProducts = [
  // Automobiles
  {
    title: 'Volkswagen Passat 2023',
    description: 'New Volkswagen Passat, full options, 0km.',
    price: 32000,
    category: 'Automobiles',
    imageUrl: '/demo/auto1.jpg',
  },
  {
    title: 'Fiat 500X 2023',
    description: 'Fiat 500X, automatic, panoramic roof.',
    price: 21000,
    category: 'Automobiles',
    imageUrl: '/demo/auto2.jpg',
  },
  {
    title: 'Peugeot 3008 2021 GT',
    description: 'Peugeot 3008 GT Line, diesel, low mileage.',
    price: 25000,
    category: 'Automobiles',
    imageUrl: '/demo/auto3.jpg',
  },
  // Electronics
  {
    title: 'iPhone 15 Pro Max',
    description: 'Brand new iPhone 15 Pro Max, 256GB, all colors.',
    price: 1400,
    category: 'Electronics',
    imageUrl: '/demo/iphone15.jpg',
  },
  {
    title: 'Samsung QLED TV 65"',
    description: 'Samsung 65-inch QLED 4K Smart TV, 2024 model.',
    price: 900,
    category: 'Electronics',
    imageUrl: '/demo/tv.jpg',
  },
  // Fashion
  {
    title: 'Nike Air Max 2024',
    description: 'Latest Nike Air Max, all sizes available.',
    price: 120,
    category: 'Fashion',
    imageUrl: '/demo/nike.jpg',
  },
  {
    title: 'Adidas Originals Hoodie',
    description: 'Adidas Originals, unisex, multiple colors.',
    price: 60,
    category: 'Fashion',
    imageUrl: '/demo/adidas.jpg',
  },
  // Home
  {
    title: 'Modern Sofa Set',
    description: '3-piece modern sofa set, grey, new.',
    price: 700,
    category: 'Home',
    imageUrl: '/demo/sofa.jpg',
  },
  // Sports
  {
    title: 'Mountain Bike 2024',
    description: 'Aluminum frame, 21-speed, disc brakes.',
    price: 350,
    category: 'Sports',
    imageUrl: '/demo/bike.jpg',
  },
  // Toys
  {
    title: 'LEGO City Set',
    description: 'LEGO City, 800+ pieces, new in box.',
    price: 80,
    category: 'Toys',
    imageUrl: '/demo/lego.jpg',
  },
  // Real Estate
  {
    title: '2BR Apartment Downtown',
    description: 'Furnished, 2 bedrooms, city center, 5th floor.',
    price: 120000,
    category: 'Real Estate',
    imageUrl: '/demo/apartment.jpg',
  },
  // Services
  {
    title: 'Car Detailing Service',
    description: 'Full car detailing, interior & exterior.',
    price: 50,
    category: 'Services',
    imageUrl: '/demo/detailing.jpg',
  },
  // Jobs
  {
    title: 'Web Developer (Remote)',
    description: 'Hiring full-stack web developer, remote, full-time.',
    price: 0,
    category: 'Jobs',
    imageUrl: '/demo/job.jpg',
  },
];

async function seed() {
  for (const product of demoProducts) {
    await createProduct({
      id: uuidv4(),
      ...product,
      vendorId: 'demo-vendor',
      createdAt: Date.now(),
    });
  }
  // Optionally, log categories to a DB or file if needed
  console.log('Seeded demo products and categories.');
}

seed();
