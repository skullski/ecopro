/**
 * JWT Payload shared type
 */
export interface JWTPayload {
  id: string; // user id
  userId?: string; // alias for compatibility
  email: string;
  role: "user" | "admin" | "seller";
  user_type: "admin" | "client" | "seller";
  // Add other JWT payload properties as needed
}
/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Product interface for marketplace
 */
export interface Product {
  id: number;
  seller_id: number;
  seller_name?: string;
  seller_email?: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string | null;
  images: string[];
  stock: number;
  status: 'active' | 'inactive' | 'sold';
  condition: 'new' | 'used' | 'refurbished';
  location: string | null;
  shipping_available: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

/**
 * Order interface for marketplace purchases
 */
export interface Order {
  id: number;
  product_id: number;
  buyer_id: number | null;
  seller_id: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  shipping_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}
