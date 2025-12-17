import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

interface StockBadgeProps {
  quantity: number;
  lowStockThreshold?: number;
  className?: string;
}

/**
 * Stock Badge Component
 * Shows product stock status with visual indicators
 */
export function StockBadge({
  quantity,
  lowStockThreshold = 5,
  className = '',
}: StockBadgeProps) {
  if (quantity <= 0) {
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 ${className}`}>
        <X className="w-3 h-3" />
        <span>Out of Stock</span>
      </div>
    );
  }

  if (quantity <= lowStockThreshold) {
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 ${className}`}>
        <AlertCircle className="w-3 h-3" />
        <span>Only {quantity} left</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 ${className}`}>
      <Check className="w-3 h-3" />
      <span>In Stock</span>
    </div>
  );
}

interface InventoryStatsProps {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

/**
 * Inventory Stats Display
 * Shows overview of stock health
 */
export function InventoryStats({
  totalProducts,
  inStockCount,
  lowStockCount,
  outOfStockCount,
}: InventoryStatsProps) {
  const stockPercentage = Math.round((inStockCount / totalProducts) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
        <div className="text-2xl font-bold text-green-700">{inStockCount}</div>
        <div className="text-xs text-green-600 mt-1">In Stock</div>
        <div className="text-xs text-green-500 mt-2">{stockPercentage}%</div>
      </div>

      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
        <div className="text-2xl font-bold text-amber-700">{lowStockCount}</div>
        <div className="text-xs text-amber-600 mt-1">Low Stock</div>
      </div>

      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="text-2xl font-bold text-red-700">{outOfStockCount}</div>
        <div className="text-xs text-red-600 mt-1">Out of Stock</div>
      </div>

      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="text-2xl font-bold text-blue-700">{totalProducts}</div>
        <div className="text-xs text-blue-600 mt-1">Total Products</div>
      </div>
    </div>
  );
}

interface OutOfStockNoticeProps {
  variant?: 'banner' | 'inline';
  className?: string;
}

/**
 * Out of Stock Notice
 * Displays when product is unavailable
 */
export function OutOfStockNotice({
  variant = 'inline',
  className = '',
}: OutOfStockNoticeProps) {
  if (variant === 'banner') {
    return (
      <div className={`p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 ${className}`}>
        <div className="flex-shrink-0">
          <X className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">Out of Stock</h3>
          <p className="text-sm text-red-700 mt-1">
            This item is currently unavailable. Please check back later or contact us for more information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium text-center ${className}`}>
      Out of Stock - Not available for purchase
    </div>
  );
}

interface LowStockWarningProps {
  quantity: number;
  className?: string;
}

/**
 * Low Stock Warning
 * Encourages quick purchase
 */
export function LowStockWarning({
  quantity,
  className = '',
}: LowStockWarningProps) {
  return (
    <div className={`p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 ${className}`}>
      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <span className="text-sm text-amber-700 font-medium">
        Only {quantity} {quantity === 1 ? 'item' : 'items'} left - order soon!
      </span>
    </div>
  );
}
