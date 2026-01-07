// ZR Express Courier Service (Official API)
// API documentation: https://docs.zrexpress.app/reference
// Base URL: https://api.zrexpress.app/api/v1
// Note: This is the official ZR Express API, different from the Procolis-based zr-express.ts

import { CourierService } from '../courier-service';
import { CourierShipmentResponse, CourierStatusResponse, ShipmentInput } from '../../types/delivery';
import crypto from 'crypto';

interface ZRExpressParcelResponse {
  id: string;
  trackingNumber?: string;
}

interface ZRExpressTerritory {
  id: string;
  code: number;
  name: string;
  postalCode: string;
  level: string; // 'wilaya' or 'commune'
  parentId: string | null;
}

// Cache for territory lookups
let territoriesCache: ZRExpressTerritory[] | null = null;
let territoriesCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export class ZRExpressOfficialService implements CourierService {
  private readonly apiUrl = 'https://api.zrexpress.app/api/v1';

  private async readApiResponse(response: Response): Promise<{ json: any | null; text: string; contentType: string }> {
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    const looksJson = contentType.includes('application/json') || /^[\s\r\n]*[\[{]/.test(text);
    if (!looksJson) {
      return { json: null, text, contentType };
    }

    try {
      return { json: JSON.parse(text), text, contentType };
    } catch {
      return { json: null, text, contentType };
    }
  }

  /**
   * Fetch territories (wilayas and communes) from ZR Express
   * tenantId comes from apiSecret parameter
   */
  private async fetchTerritories(apiKey: string, tenantId: string): Promise<ZRExpressTerritory[]> {
    const now = Date.now();
    if (territoriesCache && (now - territoriesCacheTime) < CACHE_TTL) {
      return territoriesCache;
    }

    try {
      const response = await fetch(`${this.apiUrl}/territories/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Api-Key': apiKey,
          'X-Tenant': tenantId,
        },
        body: JSON.stringify({
          pageNumber: 1,
          pageSize: 5000,
          orderBy: ['code asc'],
        }),
      });

      const { json } = await this.readApiResponse(response);
      if (json?.items) {
        territoriesCache = json.items;
        territoriesCacheTime = now;
        return json.items;
      }
      return [];
    } catch (error) {
      console.error('[ZRExpress] Failed to fetch territories:', error);
      return [];
    }
  }

  /**
   * Find territory IDs for a wilaya/commune combination
   */
  private async findTerritoryIds(
    wilayaName: string,
    communeName: string,
    apiKey: string,
    tenantId: string
  ): Promise<{ cityTerritoryId: string | null; districtTerritoryId: string | null }> {
    const territories = await this.fetchTerritories(apiKey, tenantId);
    
    // Find wilaya (level = 'wilaya')
    const wilaya = territories.find(t => 
      t.level === 'wilaya' && 
      t.name.toLowerCase().includes(wilayaName.toLowerCase())
    );
    
    if (!wilaya) {
      console.warn(`[ZRExpress] Wilaya not found: ${wilayaName}`);
      return { cityTerritoryId: null, districtTerritoryId: null };
    }

    // Find commune under this wilaya (level = 'commune', parentId = wilaya.id)
    const commune = territories.find(t =>
      t.level === 'commune' &&
      t.parentId === wilaya.id &&
      t.name.toLowerCase().includes(communeName.toLowerCase())
    );

    return {
      cityTerritoryId: wilaya.id,
      districtTerritoryId: commune?.id || null,
    };
  }

  /**
   * ZR Express uses X-Api-Key and X-Tenant headers
   * apiKey = API key
   * apiSecret = Tenant ID
   */
  async createShipment(
    shipment: ShipmentInput,
    apiKey: string,
    tenantId?: string
  ): Promise<CourierShipmentResponse> {
    try {
      if (!tenantId) {
        return {
          success: false,
          tracking_number: '',
          error: 'Tenant ID (apiSecret) is required for ZR Express',
        };
      }

      // Get territory IDs for wilaya/commune
      const { cityTerritoryId, districtTerritoryId } = await this.findTerritoryIds(
        shipment.wilaya || 'Alger',
        shipment.commune || 'Alger Centre',
        apiKey,
        tenantId
      );

      if (!cityTerritoryId || !districtTerritoryId) {
        return {
          success: false,
          tracking_number: '',
          error: `Could not find territory IDs for ${shipment.wilaya}/${shipment.commune}. Please verify wilaya and commune names.`,
        };
      }

      // Generate a random customer ID (UUID format)
      const customerId = crypto.randomUUID();

      // Parse phone number to international format
      let phone = shipment.customer_phone || '';
      if (phone.startsWith('0')) {
        phone = '+213' + phone.slice(1);
      } else if (!phone.startsWith('+')) {
        phone = '+213' + phone;
      }

      const payload = {
        customer: {
          customerId,
          name: shipment.customer_name || 'Customer',
          phone: {
            number1: phone,
            number2: '',
          },
        },
        deliveryAddress: {
          street: shipment.delivery_address || '',
          city: shipment.wilaya || 'Alger',
          district: shipment.commune || 'Alger Centre',
          postalCode: '',
          country: 'algeria',
          cityTerritoryId,
          districtTerritoryId,
        },
        orderedProducts: [
          {
            productName: shipment.product_description || 'Products',
            unitPrice: shipment.cod_amount || 0,
            quantity: 1,
            length: 20,
            width: 15,
            height: 10,
            weight: shipment.weight || 1,
            stockType: 'none', // No stock management
          },
        ],
        amount: shipment.cod_amount || 0,
        description: shipment.product_description || `Order ${shipment.reference_id}`,
        deliveryType: 'home',
        ExternalId: shipment.reference_id || `ORD-${Date.now()}`,
      };

      const response = await fetch(`${this.apiUrl}/parcels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Api-Key': apiKey,
          'X-Tenant': tenantId,
        },
        body: JSON.stringify(payload),
      });

      const { json, text, contentType } = await this.readApiResponse(response);
      const data = json ?? {};

      if (!response.ok) {
        const snippet = text.slice(0, 400);
        console.error('[ZRExpress] Create parcel error:', {
          status: response.status,
          contentType,
          bodySnippet: snippet,
          data,
        });
        
        // Parse validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((e: any) => e.description || e.code).join('; ');
          return {
            success: false,
            tracking_number: '',
            error: errorMessages || data.detail || `API Error ${response.status}`,
          };
        }
        
        return {
          success: false,
          tracking_number: '',
          error: data.detail || data.message || data.error || `API Error ${response.status}`,
        };
      }

      if (!json) {
        return {
          success: false,
          tracking_number: '',
          error: `API returned non-JSON success response (${contentType || 'unknown'}): ${text.slice(0, 200)}`,
        };
      }

      // Response contains parcel ID - we need to get the tracking number separately
      // The ID returned is the parcel UUID
      const parcelId = json.id;

      if (!parcelId) {
        console.error('[ZRExpress] No parcel ID in response:', json);
        return {
          success: false,
          tracking_number: '',
          error: 'No parcel ID returned',
        };
      }

      // For ZR Express, the parcel ID is used as tracking reference initially
      // The actual tracking number is generated when the parcel state is updated
      return {
        success: true,
        tracking_number: parcelId, // Use parcel ID as tracking until state update provides trackingNumber
        reference_id: shipment.reference_id,
      };
    } catch (error: any) {
      console.error('[ZRExpress] createShipment exception:', error);
      return {
        success: false,
        tracking_number: '',
        error: error.message || 'Parcel creation failed',
      };
    }
  }

  async getStatus(
    trackingNumber: string,
    apiKey: string,
    tenantId?: string
  ): Promise<CourierStatusResponse> {
    try {
      if (!tenantId) {
        return {
          tracking_number: trackingNumber,
          status: 'unknown',
          error: 'Tenant ID (apiSecret) is required for ZR Express',
        };
      }

      // ZR Express uses parcel search to find status
      // We search by tracking number or external ID
      const response = await fetch(`${this.apiUrl}/parcels/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Api-Key': apiKey,
          'X-Tenant': tenantId,
        },
        body: JSON.stringify({
          pageNumber: 1,
          pageSize: 1,
          advancedSearch: {
            fields: ['trackingNumber', 'externalId'],
            keyword: trackingNumber,
          },
        }),
      });

      const { json, text, contentType } = await this.readApiResponse(response);
      const data = json ?? {};

      if (!response.ok) {
        return {
          tracking_number: trackingNumber,
          status: 'unknown',
          error: data.detail || data.message || `Failed to fetch status: HTTP ${response.status}`,
        };
      }

      if (!json || !json.items || json.items.length === 0) {
        return {
          tracking_number: trackingNumber,
          status: 'unknown',
          error: 'Parcel not found',
        };
      }

      const parcel = json.items[0];

      return {
        tracking_number: parcel.trackingNumber || trackingNumber,
        status: this.mapStatus(parcel.state?.name || 'unknown'),
        last_update: parcel.updatedAt,
        location: parcel.deliveryAddress?.city,
        events: [], // Would need separate state-history call
      };
    } catch (error: any) {
      return {
        tracking_number: trackingNumber,
        status: 'unknown',
        error: error.message || 'Status fetch failed',
      };
    }
  }

  async cancelShipment(
    trackingNumber: string,
    apiKey: string,
    tenantId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!tenantId) {
        return {
          success: false,
          error: 'Tenant ID (apiSecret) is required for ZR Express',
        };
      }

      // ZR Express cancellation is done by updating parcel state to cancelled state ID
      // This requires knowing the cancelled state ID from their workflow
      // For now, return not supported - would need state IDs
      return {
        success: false,
        error: 'Cancel via API requires cancelled state ID - please cancel through ZR Express dashboard',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Cancel request failed',
      };
    }
  }

  /**
   * ZR Express uses Svix for webhooks with signing secret verification
   * Simplified verification - for production consider using svix npm package
   */
  verifyWebhook(payload: any, signature: string, secret: string): boolean {
    try {
      // Svix sends signatures in format: v1,<base64-signature>
      // The signature is HMAC-SHA256 of timestamp.payload
      if (!signature || !secret) return false;
      
      // For Svix webhooks, you would parse the svix-signature header
      // and verify against the signing secret. Simplified implementation:
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(JSON.stringify(payload)).digest('base64');
      return signature.includes(digest);
    } catch {
      return false;
    }
  }

  parseWebhookPayload(payload: any) {
    // ZR Express webhook event types:
    // - parcel.state.updated
    // - parcel.state.situation.created
    // - parcel.isReturn.updated
    
    const data = payload.data || payload;
    
    return {
      tracking_number: data.trackingNumber || data.tracking_number,
      event_type: payload.type || 'parcel.state.updated',
      status: this.mapStatus(data.state?.name || data.newStateName || 'unknown'),
      timestamp: payload.timestamp || data.updatedAt,
      location: data.wilaya || data.location,
      description: data.state?.name || data.newStateName || payload.type,
    };
  }

  private mapStatus(zrStatus: string): string {
    const statusLower = (zrStatus || '').toLowerCase();
    
    const statusMap: Record<string, string> = {
      // French status names
      'nouveau': 'pending',
      'en_attente': 'pending',
      'pret_a_expedier': 'pending',
      'ramasse': 'picked_up',
      'en_transit': 'in_transit',
      'au_hub': 'in_transit',
      'en_livraison': 'out_for_delivery',
      'livre': 'delivered',
      'retourne': 'returned',
      'annule': 'cancelled',
      'echec': 'failed',
      // English status names
      'new': 'pending',
      'pending': 'pending',
      'ready_to_ship': 'pending',
      'picked_up': 'picked_up',
      'in_transit': 'in_transit',
      'at_hub': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'on_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'returned': 'returned',
      'cancelled': 'cancelled',
      'failed': 'failed',
    };

    return statusMap[statusLower] || statusMap[zrStatus] || 'pending';
  }
}
