// Google Sheets integration types
import { z } from 'zod';

// Google OAuth Types
export interface GoogleTokens {
  id: number;
  client_id: number;
  access_token_encrypted: string;
  refresh_token_encrypted?: string;
  expires_at?: Date;
  scopes: string;
  created_at: Date;
  updated_at: Date;
}

export interface GoogleAuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

// Import Mapping Types
export interface ImportMapping {
  id: number;
  client_id: number;
  mapping_name: string;
  import_type: 'orders' | 'customers' | 'products';
  spreadsheet_id: string;
  sheet_name: string;
  data_range?: string;
  column_mapping: Record<string, string>; // {ecopro_field: sheet_column}
  sample_row?: Record<string, any>;
  is_active: boolean;
  import_count: number;
  last_used_at?: Date;
  created_at: Date;
}

// Import Job Types
export interface ImportJob {
  id: number;
  client_id: number;
  mapping_id?: number;
  import_type: string;
  spreadsheet_id: string;
  sheet_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  total_rows: number;
  successful_imports: number;
  failed_rows: number;
  error_details?: Record<string, string>;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
}

// Sheet Data Types
export interface SheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: SheetInfo[];
}

export interface SheetInfo {
  sheetId: number;
  title: string;
  index: number;
  gridProperties: {
    rowCount: number;
    columnCount: number;
  };
}

// ================== Validation Schemas ==================

// Google OAuth Configuration
export const GoogleOAuthConfigSchema = z.object({
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  redirect_uri: z.string().url(),
});

// OAuth Connect Request
export const GoogleConnectSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

// Import Mapping Configuration
export const ImportMappingSchema = z.object({
  mapping_name: z.string().min(1).max(255),
  import_type: z.enum(['orders', 'customers', 'products']),
  spreadsheet_id: z.string(),
  sheet_name: z.string(),
  data_range: z.string().optional(),
  column_mapping: z.record(z.string(), z.string()),
  header_row_index: z.number().default(1),
});

export type ImportMappingInput = z.infer<typeof ImportMappingSchema>;

// Import Request
export const ImportRequestSchema = z.object({
  mapping_id: z.number().int().positive().optional(),
  import_type: z.enum(['orders', 'customers', 'products']),
  spreadsheet_id: z.string(),
  sheet_name: z.string(),
  data_range: z.string().optional(),
  column_mapping: z.record(z.string(), z.string()),
  sample_data: z.array(z.record(z.any())).optional(),
});

export type ImportRequest = z.infer<typeof ImportRequestSchema>;

// ================== Field Mapping Schemas ==================

// Order Import Schema
export const OrderImportSchema = z.object({
  order_id: z.string().optional(),
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().min(1),
  customer_address: z.string().min(1),
  product_title: z.string().min(1),
  product_description: z.string().optional(),
  quantity: z.coerce.number().int().positive().default(1),
  total_price: z.coerce.number().positive(),
  order_status: z.string().default('pending'),
  created_at: z.coerce.date().optional(),
});

export type OrderImportData = z.infer<typeof OrderImportSchema>;

// Customer Import Schema
export const CustomerImportSchema = z.object({
  customer_id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerImportData = z.infer<typeof CustomerImportSchema>;

// Product Import Schema
export const ProductImportSchema = z.object({
  product_id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().positive(),
  original_price: z.coerce.number().positive().optional(),
  stock_quantity: z.coerce.number().int().nonnegative().default(0),
  sku: z.string().optional(),
  status: z.string().default('active'),
});

export type ProductImportData = z.infer<typeof ProductImportSchema>;

// Google Sheets API Response Types
export interface SheetsAPIResponse {
  spreadsheetId: string;
  properties: {
    title: string;
    locale: string;
  };
  sheets: Array<{
    properties: SheetInfo;
  }>;
}

export interface ValuesResponse {
  spreadsheetId: string;
  range: string;
  majorDimension: string;
  values: Array<Array<string | number | boolean>>;
}
