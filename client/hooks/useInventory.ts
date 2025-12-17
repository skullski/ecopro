/**
 * Inventory Management Hook
 * Handles stock tracking, low stock alerts, and out-of-stock logic
 */

import { useMemo } from 'react';

export interface StockStatus {
  isInStock: boolean;
  isLowStock: boolean;
  quantity: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  statusLabel: string;
  statusColor: 'green' | 'amber' | 'red';
}

interface UseInventoryOptions {
  lowStockThreshold?: number;
}

/**
 * Hook: Get stock status for a product
 * @param quantity - Current stock quantity
 * @param options - Configuration options
 * @returns Stock status object with labels and colors
 */
export function useStockStatus(
  quantity: number = 0,
  options: UseInventoryOptions = {}
): StockStatus {
  const { lowStockThreshold = 5 } = options;

  return useMemo(() => {
    const isInStock = quantity > 0;
    const isLowStock = quantity > 0 && quantity <= lowStockThreshold;

    if (quantity <= 0) {
      return {
        isInStock: false,
        isLowStock: false,
        quantity: 0,
        status: 'out-of-stock',
        statusLabel: 'Out of Stock',
        statusColor: 'red',
      };
    }

    if (isLowStock) {
      return {
        isInStock: true,
        isLowStock: true,
        quantity,
        status: 'low-stock',
        statusLabel: `Only ${quantity} left`,
        statusColor: 'amber',
      };
    }

    return {
      isInStock: true,
      isLowStock: false,
      quantity,
      status: 'in-stock',
      statusLabel: `${quantity} in stock`,
      statusColor: 'green',
    };
  }, [quantity, lowStockThreshold]);
}

/**
 * Hook: Filter products by stock status
 * @param products - Array of products to filter
 * @param showOutOfStock - Include out-of-stock items
 * @returns Filtered products array
 */
export function useInventoryFilter(
  products: Array<{ stock_quantity?: number }>,
  showOutOfStock: boolean = false
) {
  return useMemo(() => {
    if (showOutOfStock) return products;
    return products.filter((p) => (p.stock_quantity ?? 0) > 0);
  }, [products, showOutOfStock]);
}

/**
 * Hook: Get stock statistics for a product collection
 * @param products - Array of products
 * @returns Statistics about inventory
 */
export function useInventoryStats(products: Array<{ stock_quantity?: number }>) {
  return useMemo(() => {
    const totalProducts = products.length;
    const inStockCount = products.filter((p) => (p.stock_quantity ?? 0) > 0).length;
    const outOfStockCount = totalProducts - inStockCount;
    const lowStockCount = products.filter(
      (p) => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5
    ).length;
    const totalUnits = products.reduce((sum, p) => sum + (p.stock_quantity ?? 0), 0);

    return {
      totalProducts,
      inStockCount,
      outOfStockCount,
      lowStockCount,
      totalUnits,
      stockPercentage: Math.round((inStockCount / totalProducts) * 100),
      lowStockPercentage: Math.round((lowStockCount / inStockCount) * 100 || 0),
    };
  }, [products]);
}

/**
 * Hook: Handle "Add to Cart" with stock validation
 * @param stock - Product stock quantity
 * @returns Functions for cart management
 */
export function useStockCartValidation(stock: number = 0) {
  const canAddToCart = stock > 0;
  const message = stock <= 0 ? 'This item is out of stock' : `${stock} available`;

  return {
    canAddToCart,
    message,
    maxQuantity: stock,
  };
}
