import React, { useState } from 'react';
import { Search, ChevronDown, X, Filter } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

/**
 * Search Bar Component
 * Text input for product search
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search products...',
  onClear,
  className = '',
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface CategoryFilterProps {
  categories: string[];
  selected: string[];
  onChange: (categories: string[]) => void;
  className?: string;
}

/**
 * Category Filter Component
 * Select one or multiple categories
 */
export function CategoryFilter({
  categories,
  selected,
  onChange,
  className = '',
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category: string) => {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">
            {selected.length > 0 ? `${selected.length} selected` : 'All Categories'}
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="p-2">
            {categories.length > 0 ? (
              <>
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="rounded"
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No categories available</div>
            )}
            {selected.length > 0 && (
              <button
                onClick={clearAll}
                className="w-full px-3 py-2 text-xs text-center text-blue-600 hover:bg-blue-50 rounded mt-1 border-t"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  globalMin: number;
  globalMax: number;
  className?: string;
}

/**
 * Price Range Filter Component
 * Select min and max price
 */
export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  globalMin,
  globalMax,
  className = '',
}: PriceRangeFilterProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">Price Range</label>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Min (DZD)</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => onMinChange(Number(e.target.value))}
            min={globalMin}
            max={maxPrice}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Max (DZD)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            min={minPrice}
            max={globalMax}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={String(globalMax)}
          />
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Price range: {globalMin.toLocaleString()} - {globalMax.toLocaleString()} DZD
      </div>
    </div>
  );
}

interface SortSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

/**
 * Sort Selector Component
 */
export function SortSelector({
  value,
  onChange,
  options = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ],
  className = '',
}: SortSelectorProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface FilterSummaryProps {
  summary: string;
  filterCount: number;
  onClearAll?: () => void;
  className?: string;
}

/**
 * Filter Summary Component
 * Shows active filters and allows clearing
 */
export function FilterSummary({
  summary,
  filterCount,
  onClearAll,
  className = '',
}: FilterSummaryProps) {
  if (filterCount === 0) return null;

  return (
    <div className={`flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="text-sm">
        <span className="font-medium text-blue-900">Filters:</span>
        <span className="text-blue-700 ml-2">{summary}</span>
      </div>
      {onClearAll && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      )}
    </div>
  );
}

interface InStockOnlyToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/**
 * In Stock Only Toggle
 */
export function InStockOnlyToggle({
  checked,
  onChange,
  className = '',
}: InStockOnlyToggleProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded w-4 h-4"
      />
      <span className="text-sm font-medium text-gray-700">In Stock Only</span>
    </label>
  );
}
