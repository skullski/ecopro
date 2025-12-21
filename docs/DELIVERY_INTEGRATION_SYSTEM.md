# Delivery Integration System Documentation

## Overview

The EcoPro delivery integration system enables store owners to seamlessly integrate with Algerian courier services (Yalidine Express, Algérie Poste, Mars Express, Tiba, and more) to manage order fulfillment and tracking.

## Architecture

### Database Schema

**Tables:**
- `delivery_companies` - Available courier services
- `delivery_integrations` - Client-specific API credentials per courier
- `delivery_labels` - Generated shipping labels
- `delivery_events` - Webhook events from couriers (pickup, transit, delivery)
- `delivery_errors` - Error logging and debugging

**Modified Tables:**
- `store_orders` - Added: `delivery_company_id`, `tracking_number`, `delivery_status`, `shipping_label_url`, `cod_amount`, `courier_response`

### Backend Services

#### Courier Services (`/server/services/couriers/`)

Each courier implements the `CourierService` interface:

```typescript
interface CourierService {
  createShipment(shipment, apiKey): Promise<CourierShipmentResponse>;
  getStatus(trackingNumber, apiKey): Promise<CourierStatusResponse>;
  verifyWebhook(payload, signature, secret): boolean;
  parseWebhookPayload(payload): WebhookEvent;
}
```

**Implemented Couriers:**
- `YalidineService` - Yalidine Express
- `AlgeriePosteService` - Algérie Poste
- `MarsExpressService` - Mars Express

**Adding New Couriers:**
1. Create a new file: `/server/services/couriers/[courier-name].ts`
2. Implement the `CourierService` interface
3. Register in `delivery.ts`: `registerCourierService('Company Name', ServiceClass)`

#### Delivery Service (`/server/services/delivery.ts`)

Main business logic:
- `assignDeliveryCompany()` - Assign courier to order
- `generateLabel()` - Create shipment, get tracking number
- `getDeliveryStatus()` - Fetch tracking info
- `handleWebhook()` - Process courier webhooks

### API Endpoints

#### Delivery Management

```
GET  /api/delivery/companies
     Get list of available delivery companies

POST /api/delivery/integrations
     Configure API credentials for a courier
     Body: { delivery_company_id, api_key, api_secret, webhook_secret }

POST /api/delivery/orders/:id/assign
     Assign delivery company to an order
     Body: { delivery_company_id, cod_amount? }

POST /api/delivery/orders/:id/generate-label
     Generate shipping label
     Returns: { tracking_number, label_url }

GET  /api/delivery/orders/:id/tracking
     Get delivery status and events
     Returns: { status, tracking_number, events[] }

POST /api/webhooks/delivery/:company
     Receive webhook from courier (public)
```

### Frontend Components

#### OrderFulfillment Component
```tsx
<OrderFulfillment 
  order={order}
  onDeliveryAssigned={() => refetch()}
/>
```

**Features:**
- Select delivery company from dropdown
- Enter COD (cash on delivery) amount if supported
- Generate shipping label
- Download label as PDF
- Display current delivery status

#### DeliveryTracking Component
```tsx
<DeliveryTracking 
  orderId={orderId}
  autoRefresh={true}
  refreshInterval={30000}
/>
```

**Features:**
- Display current delivery status
- Show timeline of events (pickup, transit, delivery)
- Auto-refresh from webhook updates
- Support for location and time tracking

## Setup & Configuration

### 1. Database Migration

Run the migration to create all delivery tables:
```bash
# The migration runs automatically on server startup
# File: /server/migrations/20251221_delivery_integration_system.sql
```

### 2. Environment Variables

```env
# Encryption key for API credentials
ENCRYPTION_KEY=your-secret-encryption-key

# Courier API URLs and keys (optional, can be configured per client)
YALIDINE_API_KEY=your-yalidine-key
ALGERIE_POSTE_API_KEY=your-poste-key
MARS_EXPRESS_API_KEY=your-mars-key
```

### 3. Configure Courier Integration

Store owner configures their courier credentials:

```typescript
// Frontend
const response = await fetch('/api/delivery/integrations', {
  method: 'POST',
  body: JSON.stringify({
    delivery_company_id: 1,  // Yalidine
    api_key: 'user-api-key',
    webhook_secret: 'webhook-secret'
  })
});
```

## Order Flow

### 1. Order Created
```
Customer places order → Order saved in store_orders → delivery_status = 'pending'
```

### 2. Assign Delivery Company
```
Store owner selects courier → API: POST /api/delivery/orders/:id/assign
→ delivery_company_id set → delivery_status = 'assigned'
```

### 3. Generate Label
```
Store owner clicks "Generate Label" → API: POST /api/delivery/orders/:id/generate-label
→ Call courier API → Get tracking_number + label_url
→ Save to delivery_labels → Update store_orders
→ delivery_status = 'in_transit'
```

### 4. Print & Ship
```
Store owner downloads label → Prints and attaches to parcel → Ships with courier
```

### 5. Track Delivery
```
Courier updates status → POST /api/webhooks/delivery/:company
→ DeliveryService.handleWebhook() processes webhook
→ Save to delivery_events → Update store_orders.delivery_status
→ Frontend auto-refreshes tracking display
```

## Security

### Encryption
- API keys encrypted in database using AES-256-GCM
- `encryptData()` and `decryptData()` in `/server/utils/encryption.ts`

### Webhook Verification
- Each courier implements `verifyWebhook(payload, signature, secret)`
- HMAC-SHA256 signature validation
- Unverified webhooks are still processed but flagged as unverified

### Authentication
- All delivery routes require authentication via Bearer token
- Clients can only access their own orders and integrations
- Admin can view all deliveries for monitoring

### Error Logging
- All errors logged to `delivery_errors` table
- Request IDs for traceability
- Detailed error context saved

## Example Usage

### Backend - Assign Delivery

```typescript
import { DeliveryService } from '../services/delivery';

const result = await DeliveryService.assignDeliveryCompany(
  orderId: 123,
  clientId: 456,
  companyId: 1,  // Yalidine
  codAmount: 5000
);

if (result.success) {
  // Order now has delivery company assigned
}
```

### Backend - Generate Label

```typescript
const result = await DeliveryService.generateLabel(
  orderId: 123,
  clientId: 456,
  companyId: 1
);

if (result.success) {
  console.log('Tracking:', result.tracking_number);
  console.log('Label URL:', result.label_url);
  // Send label URL to store owner
}
```

### Frontend - Use Components

```tsx
import { OrderFulfillment } from '@/components/delivery/OrderFulfillment';
import { DeliveryTracking } from '@/components/delivery/DeliveryTracking';

function OrderDetailsPage({ order }) {
  return (
    <div className="space-y-6">
      {/* Fulfillment */}
      <OrderFulfillment 
        order={order}
        onDeliveryAssigned={() => window.location.reload()}
      />

      {/* Tracking */}
      {order.delivery_status && (
        <DeliveryTracking orderId={order.id} />
      )}
    </div>
  );
}
```

## Webhook Integration

### Register Webhook URL with Courier

Each courier needs to be configured to POST updates to:
```
https://your-domain/api/webhooks/delivery/[courier-name]
```

**Examples:**
- `https://your-domain/api/webhooks/delivery/yalidine-express`
- `https://your-domain/api/webhooks/delivery/algerie-poste`

### Webhook Payload Example (from courier)

```json
{
  "event_type": "delivered",
  "tracking_number": "TRK123456",
  "status": "delivered",
  "timestamp": "2025-12-21T15:30:00Z",
  "location": "Algiers",
  "description": "Package delivered successfully",
  "signature": "hmac-sha256-signature"
}
```

### Response (from your API)

```json
{ "success": true }
```

## Supported Couriers

| Courier | Supports COD | Supports Tracking | Supports Labels |
|---------|-------------|------------------|-----------------|
| Yalidine Express | ✅ | ✅ | ✅ |
| Algérie Poste | ✅ | ✅ | ❌ |
| Mars Express | ✅ | ✅ | ✅ |
| Tiba | ❌ | ✅ | ✅ |
| Zrara Express | ✅ | ✅ | ✅ |
| Speed DZ | ✅ | ✅ | ✅ |
| Khadamaty | ✅ | ✅ | ❌ |
| Eddelivery DZ | ✅ | ✅ | ✅ |
| Poste Express | ✅ | ✅ | ✅ |
| Rapidex | ✅ | ✅ | ✅ |
| Procolis | ❌ | ✅ | ✅ |
| ECF Express | ✅ | ✅ | ✅ |
| BaridiMob | ✅ | ✅ | ✅ |
| ZR Express | ✅ | ✅ | ✅ |

## Testing

### Unit Tests

Test courier services:
```bash
npm test -- services/couriers/yalidine.test.ts
```

### Integration Tests

Test full order → delivery flow:
```bash
npm test -- integration/delivery.test.ts
```

## Monitoring & Debugging

### View Delivery Events
```sql
SELECT * FROM delivery_events WHERE order_id = 123;
```

### View Errors
```sql
SELECT * FROM delivery_errors WHERE request_id = 'REQ-xxx';
```

### Check Courier Status
```sql
SELECT * FROM delivery_companies WHERE is_active = true;
```

## Future Enhancements

1. **Batch Operations** - Generate labels for multiple orders
2. **Return Management** - Handle return shipments
3. **Rate Comparison** - Compare prices between couriers
4. **Scheduled Pickups** - Request courier pickup at specific time
5. **Multi-leg Shipping** - Domestic → Regional → Final destination
6. **Customs Management** - Handle international shipments (future)

## Support

For issues or questions:
1. Check logs in `delivery_errors` table
2. Verify courier credentials are correct
3. Test webhook signature verification
4. Contact courier support for API issues
