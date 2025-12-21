# Google Sheets Integration System - Documentation

## Overview

The Google Sheets Integration system allows EcoPro store owners to securely import their existing data (orders, customers, products) from Google Sheets into their EcoPro database using Google's OAuth 2.0 authentication.

## Architecture

### Components

#### Backend Services

1. **Google Sheets Service** (`/server/services/google-sheets.ts`)
   - OAuth token management with encryption
   - Sheet listing and metadata retrieval
   - Data reading and validation
   - Row-to-object mapping with Zod validation

2. **API Routes** (`/server/routes/google-sheets.ts`)
   - OAuth authentication endpoints
   - Sheet browsing and preview
   - Column mapping management
   - Import job management
   - Import history and logging

#### Database Schema

1. **google_tokens** - Secure storage for OAuth credentials
   - Encrypted access and refresh tokens
   - Token expiration tracking
   - Status and lifecycle management

2. **import_mappings** - Reusable column mapping configurations
   - Support for orders, customers, products
   - JSONB column mapping storage
   - Mapping versioning and history

3. **import_jobs** - Import job tracking and history
   - Job status and progress
   - Error tracking and detailed error logs
   - Import statistics

4. **import_logs** - Detailed audit trail per imported row
   - Row-level success/failure tracking
   - Mapped data storage for debugging
   - Error messages per row

#### Frontend Components

1. **GoogleConnect** - OAuth flow management
   - Connect/disconnect buttons
   - Connection status display
   - Token expiration information

2. **SheetSelector** - Spreadsheet and sheet selection
   - Dropdown list of available sheets
   - Sheet metadata loading
   - Range generation

3. **ColumnMapper** - Column mapping interface
   - Drag-and-drop or dropdown mapping
   - Field validation
   - Required field tracking
   - Duplicate detection

4. **ImportResults** - Progress and results display
   - Import statistics and success rate
   - Error logs with row details
   - Export options

5. **GoogleSheetsImporter** - Main orchestration component
   - Multi-step wizard UI
   - State management
   - Error handling and recovery

## Data Flow

### 1. OAuth Connection

```
User clicks "Connect Google Account"
    ↓
Frontend requests OAuth URL from /api/google/auth-url
    ↓
Google Sheets Service generates authorization URL with scopes
    ↓
User redirects to Google OAuth consent screen
    ↓
User grants permissions
    ↓
Google redirects back with authorization code
    ↓
Frontend exchanges code at /api/google/connect
    ↓
Backend exchanges code for access/refresh tokens
    ↓
Tokens encrypted and stored in database
    ↓
Connection established ✓
```

### 2. Import Process

```
User selects import type (orders/customers/products)
    ↓
User enters Google Sheets Spreadsheet ID
    ↓
Frontend fetches available sheets via /api/google/sheets/{id}
    ↓
User selects sheet and range
    ↓
Frontend previews data via /api/google/preview
    ↓
User maps sheet columns to EcoPro fields
    ↓
Mappings validated for required fields
    ↓
Frontend initiates import via /api/google/import
    ↓
Backend reads data from Google Sheets
    ↓
Rows parsed and validated against Zod schemas
    ↓
Valid rows inserted into database
    ↓
Errors logged for failed rows
    ↓
Import job recorded with results
    ↓
Frontend displays results with success rate ✓
```

## API Endpoints

### Authentication Endpoints

#### GET /api/google/auth-url
Get OAuth authorization URL for user consent

**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### POST /api/google/connect
Exchange authorization code for tokens

**Request:**
```json
{
  "code": "4/0AX4XfWh...",
  "state": "abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google account connected successfully"
}
```

#### GET /api/google/status
Check connection status and token expiration

**Response:**
```json
{
  "connected": true,
  "expiresAt": "2024-12-25T10:30:00Z",
  "lastUpdated": "2024-12-21T15:45:00Z"
}
```

#### POST /api/google/disconnect
Disconnect Google account and revoke tokens

**Response:**
```json
{
  "success": true,
  "message": "Google account disconnected"
}
```

### Sheet Management Endpoints

#### GET /api/google/sheets/:spreadsheetId
List sheets in a spreadsheet

**Response:**
```json
{
  "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIaWGqVXC1k7A",
  "title": "My Store Data",
  "sheets": [
    {
      "sheetId": 0,
      "title": "Orders",
      "index": 0,
      "gridProperties": {
        "rowCount": 1000,
        "columnCount": 10
      }
    }
  ]
}
```

#### POST /api/google/preview
Preview data from a sheet range

**Request:**
```json
{
  "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIaWGqVXC1k7A",
  "range": "'Orders'!A:Z",
  "limit": 10
}
```

**Response:**
```json
{
  "total": 500,
  "headers": ["Order ID", "Customer Name", "Email", "Total"],
  "preview": [
    {
      "Order ID": "ORD-001",
      "Customer Name": "John Doe",
      "Email": "john@example.com",
      "Total": "25.99"
    }
  ]
}
```

### Mapping Endpoints

#### POST /api/google/mappings
Save a column mapping configuration

**Request:**
```json
{
  "mapping_name": "Orders from Airtable",
  "import_type": "orders",
  "column_mapping": {
    "customer_name": "Customer Name",
    "customer_email": "Email",
    "total_price": "Total Amount",
    "quantity": "Qty"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mapping saved successfully",
  "mapping_name": "Orders from Airtable"
}
```

#### GET /api/google/mappings
List saved mappings for the client

**Query Parameters:**
- `importType` (optional): Filter by 'orders', 'customers', or 'products'

**Response:**
```json
[
  {
    "mapping_name": "Orders from Airtable",
    "import_type": "orders",
    "column_mapping": {...},
    "created_at": "2024-12-21T10:00:00Z",
    "updated_at": "2024-12-21T15:00:00Z"
  }
]
```

### Import Endpoints

#### POST /api/google/import
Start an import job

**Request:**
```json
{
  "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIaWGqVXC1k7A",
  "range": "'Orders'!A:Z",
  "import_type": "orders",
  "column_mapping": {
    "customer_name": "Customer Name",
    "customer_email": "Email",
    "total_price": "Total"
  }
}
```

**Response:**
```json
{
  "success": true,
  "jobId": 42,
  "totalRows": 500,
  "successfulImports": 498,
  "failedRows": 2,
  "errors": {
    "3": "Invalid email format in row 3",
    "7": "Missing required field: customer_name"
  }
}
```

#### GET /api/google/imports
Get import history

**Query Parameters:**
- `limit` (default: 20): Number of results
- `offset` (default: 0): Pagination offset
- `importType` (optional): Filter by type

**Response:**
```json
{
  "imports": [
    {
      "id": 42,
      "import_type": "orders",
      "total_rows": 500,
      "successful_imports": 498,
      "failed_rows": 2,
      "status": "completed",
      "created_at": "2024-12-21T15:00:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

#### GET /api/google/imports/:jobId
Get detailed import job results

**Response:**
```json
{
  "id": 42,
  "import_type": "orders",
  "total_rows": 500,
  "successful_imports": 498,
  "failed_rows": 2,
  "status": "completed",
  "error_details": [...],
  "created_at": "2024-12-21T15:00:00Z",
  "logs": [
    {
      "row_number": 1,
      "status": "success",
      "mapped_data": {"customer_name": "John", ...}
    },
    {
      "row_number": 3,
      "status": "error",
      "error_message": "Invalid email format"
    }
  ]
}
```

## Data Models

### Supported Import Types

#### Orders Import
```typescript
{
  order_id?: string;           // Optional: unique identifier
  customer_name: string;       // Required
  customer_email: string;      // Required: valid email
  quantity?: number;           // Optional: defaults to 1
  total_price: number;         // Required: positive number
}
```

#### Customers Import
```typescript
{
  name: string;                // Required
  email: string;               // Required: valid email
  phone?: string;              // Optional
  address?: string;            // Optional
}
```

#### Products Import
```typescript
{
  name: string;                // Required
  price: number;               // Required: positive number
  description?: string;        // Optional
  sku?: string;                // Optional
  stock?: number;              // Optional
}
```

## Security Features

### 1. OAuth 2.0 Integration
- Industry-standard OAuth 2.0 flow
- Scope: `https://www.googleapis.com/auth/spreadsheets.readonly` (read-only)
- User consent required
- No direct access to user credentials

### 2. Token Encryption
- Access tokens encrypted with AES-256-GCM
- Refresh tokens stored securely
- Automatic token refresh when expired
- One-time connection per client

### 3. Data Validation
- Zod schema validation for all import types
- Type coercion (strings to numbers, dates, etc.)
- Required field validation
- Email format validation
- Row-level error handling and logging

### 4. Rate Limiting
- Implicit rate limiting via Google API quotas
- Job tracking prevents duplicate imports
- Connection status verification

### 5. Audit Trail
- Complete import history with timestamps
- Row-level success/failure logging
- Error messages stored for debugging
- Client-specific data isolation

## Usage Example

### Frontend Implementation

```tsx
import { GoogleSheetsImporter } from '@/components/google-sheets';

export function ImportPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Import Your Data</h1>
      <GoogleSheetsImporter />
    </div>
  );
}
```

### Step-by-Step User Flow

1. **Connect**: User clicks "Connect Google Account" and grants OAuth permission
2. **Setup**: User enters Spreadsheet ID and selects import type
3. **Select**: User chooses which sheet to import from
4. **Preview**: System shows preview of first few rows
5. **Map**: User maps spreadsheet columns to EcoPro fields
6. **Import**: System imports and validates all rows
7. **Results**: User sees success/failure summary with details

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "No tokens found" | Google account not connected | User needs to connect Google account |
| "Token expired" | Access token expired | Auto-refresh attempted, retry if fails |
| "Failed to list sheets" | Invalid spreadsheet ID | Verify spreadsheet ID is correct |
| "Invalid email format in row 3" | Email validation failed | Check email format in row 3 |
| "Missing required field: customer_name" | Required field not mapped | Map all required fields |
| "Column mapped multiple times" | Duplicate column mapping | Each column can only map to one field |

### Error Codes

- `400`: Invalid request (missing fields, validation errors)
- `401`: Unauthorized (not authenticated)
- `404`: Resource not found (spreadsheet, sheet, job)
- `500`: Server error (Google API error, database error)

## Performance Considerations

### Optimization

1. **Batch Processing**: Rows processed in batches for large imports
2. **Connection Pooling**: PostgreSQL connection pooling reduces overhead
3. **Token Caching**: Tokens cached in memory until expiration
4. **Index Optimization**: Indexes on frequently queried columns:
   - `google_tokens(client_id)`
   - `import_jobs(client_id, created_at)`
   - `import_logs(import_job_id, status)`

### Limits

- Maximum spreadsheet size: Limited by Google Sheets API quota
- Maximum import rows per job: Tested with 10,000+ rows
- Token refresh: Automatic every 55 minutes
- Concurrent imports: One import per client at a time

## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect Google account"
- Check internet connection
- Verify Google account access
- Clear browser cookies and try again
- Check browser console for detailed error

**Problem**: "Token expired after import"
- System should automatically refresh
- If persists, disconnect and reconnect
- Check server logs for refresh errors

### Import Issues

**Problem**: "No data found in sheet"
- Verify sheet name is correct
- Check range includes data
- Ensure sheet is accessible to connected Google account
- Try different range (e.g., 'Sheet1'!A:Z)

**Problem**: "Many rows failing validation"
- Review error messages in results
- Check column mapping is correct
- Verify data format matches expected type
- Look for special characters or encoding issues

## Future Enhancements

1. **Batch Operations**: Background job queue for large imports
2. **Scheduled Imports**: Recurring imports on a schedule
3. **Data Transformation**: Custom transformation scripts
4. **Duplicate Detection**: Prevent duplicate imports
5. **Rollback**: Undo failed or incorrect imports
6. **Export**: Export data back to Google Sheets
7. **Multi-sheet**: Import multiple sheets in one job
8. **Progress Streaming**: WebSocket updates for long-running imports

## Admin Dashboard Integration

The Google Sheets importer can be integrated into the admin dashboard:

```tsx
// In admin dashboard
import { GoogleSheetsImporter } from '@/components/google-sheets';

export function AdminPanel() {
  return (
    <div className="space-y-8">
      <h1>Admin Dashboard</h1>
      
      {/* Data Import Section */}
      <section>
        <h2>Data Management</h2>
        <GoogleSheetsImporter />
      </section>
    </div>
  );
}
```

## API Keys and Configuration

Required environment variables for Google Sheets integration:

```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

Set up in Google Cloud Console:
1. Create OAuth 2.0 credentials (Web application type)
2. Add authorized redirect URIs
3. Copy Client ID and Secret
4. Set environment variables

## References

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [googleapis npm Package](https://github.com/googleapis/google-api-nodejs-client)
- [Zod Validation Library](https://zod.dev/)
