export type ID = string;

export interface Address {
  id: ID;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface User {
  id: ID;
  name: string;
  email?: string;
  addresses: Address[];
  defaultAddressId?: ID;
}

export interface Product {
  id: ID;
  title: string;
  description: string;
  price: number; // cents
  sellerId: ID;
  likes: Set<ID>;
  createdAt: number;
  imageUrl?: string;
}

export interface Review {
  id: ID;
  productId: ID;
  userId: ID;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: number;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELED";

export interface Order {
  id: ID;
  productId: ID;
  buyerId: ID;
  sellerId: ID;
  shippingAddress: Address;
  status: OrderStatus;
  createdAt: number;
}

export interface Conversation {
  id: ID;
  productId: ID;
  buyerId: ID;
  sellerId: ID;
  createdAt: number;
  lastMessageAt?: number;
}

export interface ChatMessage {
  id: ID;
  conversationId: ID;
  productId: ID;
  fromUserId: ID;
  toUserId: ID;
  body: string;
  createdAt: number;
}

export interface Paginated<T> {
  items: T[];
  nextCursor?: string;
}

export interface ApiError {
  error: string;
}
