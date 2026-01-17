// Column Mapper Component

import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, AlertCircle } from 'lucide-react';

type ImportType = 'orders' | 'customers' | 'products';

interface ColumnMapperProps {
  importType: ImportType;
  sheetColumns: string[];
  onMappingComplete: (mapping: Record<string, string>) => void;
}

// Define required fields for each import type
const REQUIRED_FIELDS: Record<ImportType, string[]> = {
  orders: ['customer_name', 'customer_email', 'total_price'],
  customers: ['name', 'email'],
  products: ['name', 'price'],
};

export function ColumnMapper({
  importType,
  sheetColumns,
  onMappingComplete,
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const requiredFields = REQUIRED_FIELDS[importType] || [];

  const updateMapping = (ecoProField: string, sheetColumn: string) => {
    setMapping((prev) => ({
      ...prev,
      [ecoProField]: sheetColumn || undefined,
    }));
  };

  const validateMapping = (): boolean => {
    const newErrors: string[] = [];

    // Check all required fields are mapped
    for (const field of requiredFields) {
      if (!mapping[field]) {
        newErrors.push(`"${field}" is required but not mapped`);
      }
    }

    // Check for duplicate mappings
    const usedColumns = Object.values(mapping).filter(Boolean);
    const duplicates = usedColumns.filter(
      (col, idx) => usedColumns.indexOf(col) !== idx
    );
    if (duplicates.length > 0) {
      newErrors.push(`Column "${duplicates[0]}" is mapped multiple times`);
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleComplete = () => {
    if (validateMapping()) {
      onMappingComplete(mapping);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Map Columns ({importType})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Match your spreadsheet columns to Sahla4Eco fields
        </p>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              {errors.map((err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {requiredFields.map((field) => (
          <MappingRow
            key={field}
            ecoProField={field}
            isRequired={true}
            sheetColumns={sheetColumns}
            selectedColumn={mapping[field]}
            onChange={(col) => updateMapping(field, col)}
          />
        ))}

        {/* Optional fields based on import type */}
        {importType === 'orders' && (
          <>
            <MappingRow
              ecoProField="order_id"
              isRequired={false}
              sheetColumns={sheetColumns}
              selectedColumn={mapping.order_id}
              onChange={(col) => updateMapping('order_id', col)}
            />
            <MappingRow
              ecoProField="quantity"
              isRequired={false}
              sheetColumns={sheetColumns}
              selectedColumn={mapping.quantity}
              onChange={(col) => updateMapping('quantity', col)}
            />
          </>
        )}

        {importType === 'customers' && (
          <>
            <MappingRow
              ecoProField="phone"
              isRequired={false}
              sheetColumns={sheetColumns}
              selectedColumn={mapping.phone}
              onChange={(col) => updateMapping('phone', col)}
            />
            <MappingRow
              ecoProField="address"
              isRequired={false}
              sheetColumns={sheetColumns}
              selectedColumn={mapping.address}
              onChange={(col) => updateMapping('address', col)}
            />
          </>
        )}

        {importType === 'products' && (
          <>
            <MappingRow
              ecoProField="description"
              isRequired={false}
              sheetColumns={sheetColumns}
              selectedColumn={mapping.description}
              onChange={(col) => updateMapping('description', col)}
            />
            <MappingRow
              ecoProField="sku"
              isRequired={false}
              sheetColumns={sheetColumns}
              selectedColumn={mapping.sku}
              onChange={(col) => updateMapping('sku', col)}
            />
            <MappingRow
              ecoProField="stock"
              isRequired={false}
              sheetColumns={sheetColumns}
              selectedColumn={mapping.stock}
              onChange={(col) => updateMapping('stock', col)}
            />
          </>
        )}
      </div>

      <button
        onClick={handleComplete}
        disabled={errors.length > 0}
        className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Continue to Import
      </button>
    </div>
  );
}

interface MappingRowProps {
  ecoProField: string;
  isRequired: boolean;
  sheetColumns: string[];
  selectedColumn?: string;
  onChange: (column: string) => void;
}

function MappingRow({
  ecoProField,
  isRequired,
  sheetColumns,
  selectedColumn,
  onChange,
}: MappingRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {ecoProField}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-left text-sm flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-gray-700 truncate">
              {selectedColumn || 'Select column...'}
            </span>
            <ChevronDown className={`w-4 h-4 flex-shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 max-h-48 overflow-y-auto">
              {selectedColumn && (
                <button
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b text-gray-500 italic"
                >
                  — Clear selection —
                </button>
              )}
              {sheetColumns.map((col) => (
                <button
                  key={col}
                  onClick={() => {
                    onChange(col);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b last:border-b-0 ${
                    selectedColumn === col ? 'bg-blue-50 font-semibold' : ''
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isRequired && (
        <div className="text-xs font-semibold text-red-600 uppercase tracking-wide pt-6">
          Required
        </div>
      )}
    </div>
  );
}
