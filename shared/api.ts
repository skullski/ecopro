/**
 * JWT Payload shared type
 */
export interface JWTPayload {
  id: string; // user id
  userId?: string; // alias for compatibility
  email: string;
  role: "user" | "admin" | "seller" | "root";
  user_type: "admin" | "client" | "seller" | "root";
  // Staff authentication (completely separate from owner authentication)
  isStaff?: boolean;
  staffId?: number; // Only present if staff member
  clientId?: number; // Only present if staff member (which client they work for)
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
