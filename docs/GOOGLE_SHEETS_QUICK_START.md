# Google Sheets Integration - Quick Start Guide

## For Store Owners

### 1. Connect Your Google Account

1. Navigate to **Settings → Data Import → Google Sheets**
2. Click **"Connect Google Account"**
3. You'll be redirected to Google's login page
4. Review the permissions and click **"Allow"**
5. You'll be redirected back to EcoPro - connection confirmed!

### 2. Prepare Your Google Sheet

Create a Google Sheet with your data in a structured format:

**For Orders:**
| Order ID | Customer Name | Email | Quantity | Total Price |
|----------|---------------|-------|----------|-------------|
| ORD-001  | John Doe      | john@example.com | 2 | 49.99 |
| ORD-002  | Jane Smith    | jane@example.com | 1 | 29.99 |

**For Customers:**
| Name | Email | Phone | Address |
|------|-------|-------|---------|
| John Doe | john@example.com | +213123456789 | 123 Main St |
| Jane Smith | jane@example.com | +213987654321 | 456 Oak Ave |

**For Products:**
| Name | Price | Description | SKU | Stock |
|------|-------|-------------|-----|-------|
| Premium Widget | 29.99 | High-quality widget | WID-001 | 100 |
| Basic Tool | 19.99 | Essential tool | TOO-001 | 50 |

### 3. Start the Import

1. Click **"New Import"**
2. Select the import type (Orders / Customers / Products)
3. Enter your Google Sheet ID (found in the URL: `docs.google.com/spreadsheets/d/YOUR_ID_HERE/`)
4. Select the sheet tab and range
5. Review the data preview
6. Map your columns to EcoPro fields:
   - Required fields must be mapped (marked with *)
   - Optional fields can be left unmapped
7. Click **"Import"**

### 4. Review Results

After import completes:
- ✅ **Success Count**: How many rows were imported
- ❌ **Error Count**: How many rows failed
- 📊 **Success Rate**: Percentage of successful imports
- 🔍 **Error Details**: Click "View Errors" to see specific problems

## Column Mapping Reference

### Required Fields

| Import Type | Required Fields |
|-------------|-----------------|
| Orders | `customer_name`, `customer_email`, `total_price` |
| Customers | `name`, `email` |
| Products | `name`, `price` |

### Optional Fields

| Import Type | Optional Fields |
|-------------|-----------------|
| Orders | `order_id`, `quantity` |
| Customers | `phone`, `address` |
| Products | `description`, `sku`, `stock` |

## Tips for Successful Imports

### Data Quality
- ✅ Use clear, consistent column names
- ✅ Ensure email addresses are valid (format: user@domain.com)
- ✅ Remove empty rows at the beginning
- ✅ Use consistent number formats (no currency symbols for prices)
- ❌ Avoid special characters in required fields

### Spreadsheet Setup
- ✅ Put headers in the first row
- ✅ Use consistent data types in each column
- ✅ Remove extra columns you don't need
- ✅ Keep sheet names simple (no special characters)
- ❌ Don't merge cells in data rows

### Column Values
- ✅ Emails: `john@example.com`
- ✅ Numbers: `29.99` or `100` (no currency symbols)
- ✅ Quantities: `1`, `2`, `5` etc.
- ❌ Emails: `John Doe <john@example.com>` (invalid format)
- ❌ Prices: `$29.99` or `29,99` (use periods for decimals)

## Common Error Messages

### "Invalid email format in row 3"
**Fix**: Check the email column in row 3. Must be valid format like `user@domain.com`

### "Missing required field: customer_name"
**Fix**: Ensure all required columns are mapped. Map the column containing names to `customer_name`

### "Column mapped multiple times"
**Fix**: Each spreadsheet column can only map to one EcoPro field. Don't map the same column twice

### "No data found in sheet"
**Fix**: 
- Verify the sheet name is correct
- Check that data starts from row 2 (row 1 should be headers)
- Make sure the spreadsheet is shared with the Google account

## Troubleshooting

### Connection Won't Work
1. Make sure you're logged into the correct Google account
2. Check that Google Sheets API is enabled in Google Cloud Console
3. Try disconnecting and reconnecting your account
4. Check browser console for error messages

### Import Fails Silently
1. Look at the error summary - there may be specific row errors
2. Try importing a smaller sample first
3. Check column mapping is correct
4. Verify data format (no extra spaces, proper types)

### Some Rows Fail, Some Succeed
1. This is normal - check the error details for failing rows
2. Fix those rows and try importing again
3. Or delete failed rows from the sheet and re-import

## Re-importing Data

You can import from the same sheet multiple times:
- Each import creates a new import job
- Failed rows from a previous import can be fixed and re-imported
- Check import history to see all previous imports

## Import History

View all your past imports:
1. Go to **Settings → Data Import → History**
2. See all imports with:
   - Date and time of import
   - Import type and sheet
   - Success/failure count
   - Click to view detailed logs

## Security & Privacy

✅ **Your Data is Safe**
- All connections use secure OAuth 2.0 authentication
- Your Google credentials are never stored - only secure tokens
- Data is read-only (we only read, never modify your sheets)
- Tokens are encrypted in our database
- You can disconnect at any time

## Need Help?

- 📧 Email support: support@ecopro.com
- 💬 Live chat: Available in Settings
- 📖 Full documentation: See GOOGLE_SHEETS_INTEGRATION.md

## What's Next?

After importing, your data will be:
- ✅ Integrated into your EcoPro store
- ✅ Available in your dashboard
- ✅ Used for order management and inventory
- ✅ Synced with your delivery system

Start selling with your imported products and customer data!
