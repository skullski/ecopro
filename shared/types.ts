// Core application types (marketplace/store types removed)

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  featured?: boolean;
  inStock?: boolean;
  createdAt?: number;
  published?: boolean;
  quantity?: number;
  status?: string;
  updatedAt?: number;
}
