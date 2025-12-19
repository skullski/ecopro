/**
 * Checkout utility functions
 * Handles product data persistence via database instead of localStorage
 */

export interface CheckoutSessionResponse {
  success: boolean;
  sessionId: string;
}

export interface ProductCheckoutData {
  id: number;
  title: string;
  price: number;
  images?: string[];
  [key: string]: any;
}

/**
 * Save product to checkout session in database
 * @param product - Product data to save
 * @param storeSlug - Store slug for context
 * @returns Session ID for later retrieval
 */
export async function saveProductCheckoutSession(
  product: ProductCheckoutData,
  storeSlug?: string
): Promise<string> {
  try {
    const response = await fetch('/api/checkout/save-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product.id,
        product_data: product,
        store_slug: storeSlug
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save product checkout session');
    }

    const data: CheckoutSessionResponse = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error('Error saving product checkout session:', error);
    // Fallback to localStorage if database fails
    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    return `local-${product.id}`;
  }
}

/**
 * Retrieve product from checkout session
 * @param sessionId - Session ID to retrieve
 * @returns Product data if found
 */
export async function getProductCheckoutSession(
  sessionId: string
): Promise<ProductCheckoutData | null> {
  try {
    // Check if it's a fallback localStorage session
    if (sessionId.startsWith('local-')) {
      const productId = sessionId.replace('local-', '');
      const cached = localStorage.getItem(`product_${productId}`);
      return cached ? JSON.parse(cached) : null;
    }

    const response = await fetch(`/api/checkout/get-product/${sessionId}`);
    
    if (!response.ok) {
      // Try fallback: if database session is expired, check localStorage
      if (response.status === 404) {
        // Extract product ID if possible and try localStorage
        const cached = localStorage.getItem(`product_${sessionId}`);
        return cached ? JSON.parse(cached) : null;
      }
      throw new Error('Failed to retrieve product checkout session');
    }

    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error retrieving product checkout session:', error);
    // Fallback: try localStorage
    return null;
  }
}

/**
 * Navigate to product detail with checkout session
 * @param productId - Product ID to navigate to
 * @param product - Product data to save
 * @param navigate - Navigation function
 * @param storeSlug - Store slug
 */
export async function navigateToProduct(
  productId: number | string,
  product: ProductCheckoutData,
  navigate: (path: string) => void,
  storeSlug?: string
): Promise<void> {
  try {
    const sessionId = await saveProductCheckoutSession(product, storeSlug);
    // Pass session ID as URL parameter for retrieval
    navigate(`/product/${productId}?session=${encodeURIComponent(sessionId)}`);
  } catch (error) {
    console.error('Error navigating to product:', error);
    navigate(`/product/${productId}`);
  }
}

/**
 * Navigate to checkout with product checkout session
 * @param productId - Product ID to checkout
 * @param product - Product data to save
 * @param navigate - Navigation function
 * @param storeSlug - Store slug
 */
export async function navigateToCheckout(
  productId: number | string,
  product: ProductCheckoutData,
  navigate: (path: string) => void,
  storeSlug?: string
): Promise<void> {
  try {
    const sessionId = await saveProductCheckoutSession(product, storeSlug);
    // Pass session ID as URL parameter for retrieval
    navigate(`/checkout/${productId}?session=${encodeURIComponent(sessionId)}`);
  } catch (error) {
    console.error('Error navigating to checkout:', error);
    navigate(`/checkout/${productId}`);
  }
}
