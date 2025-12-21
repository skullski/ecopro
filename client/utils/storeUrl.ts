/**
 * Store URL utilities for generating dynamic store URLs based on store name
 */

/**
 * Convert store name to URL-friendly format
 * Preserves case and alphanumeric characters, removes spaces
 * Example: "My Fashion Store" -> "MyFashionStore"
 */
export function storeNameToSlug(storeName: string): string {
  return storeName
    .trim()
    .replace(/\s+/g, '')           // Remove all spaces
    .replace(/[^a-zA-Z0-9]/g, '')  // Remove non-alphanumeric (keep case)
    || 'store';                    // Default if empty
}

/**
 * Generate store URL from store name
 * Example: "My Fashion Store" -> "MyFashionStore-ecopro.com" (for public) or "/store/MyFashionStore" (for app)
 */
export function generateStoreUrl(storeName: string, isPublic: boolean = false): string {
  const cleanName = storeNameToSlug(storeName);
  
  if (isPublic) {
    return `${cleanName}-ecopro.com`;
  }
  
  return `/store/${cleanName}`;
}

/**
 * Get full store URL for sharing/display
 */
export function getFullStoreUrl(storeName: string): string {
  const slug = storeNameToSlug(storeName);
  return `${window.location.origin}/store/${slug}`;
}

/**
 * Check if a given URL matches a store name
 */
export function isStoreUrl(urlOrSlug: string, storeName: string): boolean {
  const expectedSlug = storeNameToSlug(storeName);
  const givenSlug = storeNameToSlug(urlOrSlug);
  return givenSlug === expectedSlug;
}
