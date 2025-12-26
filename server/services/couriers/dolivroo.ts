// Dolivroo Aggregator Service
// Unified API for multiple Algerian delivery providers
// Single integration for: Yalidine, Ecotrack, and more
// Website: https://dolivroo.com

import { CourierService } from '../courier-service';
import { CourierShipmentResponse, CourierStatusResponse, ShipmentInput } from '../../types/delivery';
import crypto from 'crypto';

interface DolivrooParcelResponse {
  id: string;
  tracking_number: string;
  reference: string;
  provider: string; // Which underlying provider is used
  status: string;
  status_label: string;
  recipient: {
    name: string;
    phone: string;
    address: string;
    wilaya: string;
    commune: string;
  };
  parcel: {
    description: string;
    cod_amount: number;
    shipping_fee: number;
    weight: number;
  };
  label_url?: string;
  created_at: string;
  updated_at: string;
  events: Array<{
    status: string;
    timestamp: string;
    location?: string;
    description?: string;
  }>;
}

interface DolivrooRateResponse {
  provider: string;
  provider_name: string;
  home_fee: number;
  desk_fee: number;
  estimated_days: number;
  features: string[];
}

export class DolivrooService implements CourierService {
  private readonly apiUrl = 'https://api.dolivroo.com/v1';

  /**
   * Create a parcel through Dolivroo
   * Dolivroo automatically selects the best provider or you can specify one
   */
  async createShipment(
    shipment: ShipmentInput,
    apiKey: string,
    secretKey?: string
  ): Promise<CourierShipmentResponse> {
    try {
      const payload = {
        reference: shipment.reference_id || `ORD-${Date.now()}`,
        provider: shipment.provider || 'auto', // auto, yalidine, ecotrack, etc.
        recipient: {
          name: shipment.customer_name || 'Customer',
          phone: shipment.customer_phone || '',
          address: shipment.delivery_address || '',
          wilaya: shipment.wilaya || 'Alger',
          commune: shipment.commune || 'Alger Centre',
        },
        parcel: {
          description: shipment.product_description || 'Products',
          cod_amount: shipment.cod_amount || 0,
          weight: shipment.weight || 1,
          is_fragile: false,
          allow_open: true,
        },
        options: {
          is_stopdesk: shipment.is_stopdesk || false,
          insurance: false,
        },
      };

      const response = await fetch(`${this.apiUrl}/parcels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          'X-SECRET-KEY': secretKey || '',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[Dolivroo] Create parcel error:', data);
        return {
          success: false,
          tracking_number: '',
          error: data.message || data.error || `API Error ${response.status}`,
        };
      }

      const parcel: DolivrooParcelResponse = data;

      return {
        success: true,
        tracking_number: parcel.tracking_number,
        label_url: parcel.label_url,
        reference_id: parcel.reference,
      };
    } catch (error: any) {
      console.error('[Dolivroo] createShipment exception:', error);
      return {
        success: false,
        tracking_number: '',
        error: error.message || 'Parcel creation failed',
      };
    }
  }

  /**
   * Get parcel status from Dolivroo
   * Works regardless of underlying provider
   */
  async getStatus(
    trackingNumber: string,
    apiKey: string,
    secretKey?: string
  ): Promise<CourierStatusResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/parcels/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          'X-SECRET-KEY': secretKey || '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          tracking_number: trackingNumber,
          status: 'unknown',
          error: data.message || 'Failed to fetch status',
        };
      }

      const parcel: DolivrooParcelResponse = data;

      return {
        tracking_number: trackingNumber,
        status: this.mapStatus(parcel.status),
        last_update: parcel.updated_at,
        location: parcel.recipient.wilaya,
        events: parcel.events.map(e => ({
          type: e.status,
          timestamp: e.timestamp,
          location: e.location,
          description: e.description,
        })),
      };
    } catch (error: any) {
      return {
        tracking_number: trackingNumber,
        status: 'unknown',
        error: error.message || 'Status fetch failed',
      };
    }
  }

  /**
   * Get shipping rates from multiple providers
   * Compare prices before creating shipment
   */
  async getRates(
    fromWilaya: string,
    toWilaya: string,
    toCommune: string,
    weight: number,
    apiKey: string,
    secretKey?: string
  ): Promise<DolivrooRateResponse[]> {
    try {
      const params = new URLSearchParams({
        from_wilaya: fromWilaya,
        to_wilaya: toWilaya,
        to_commune: toCommune,
        weight: weight.toString(),
      });

      const response = await fetch(`${this.apiUrl}/rates?${params}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          'X-SECRET-KEY': secretKey || '',
        },
      });

      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  /**
   * Get available providers with their features
   */
  async getProviders(apiKey: string, secretKey?: string): Promise<Array<{
    id: string;
    name: string;
    features: string[];
    active: boolean;
  }>> {
    try {
      const response = await fetch(`${this.apiUrl}/providers`, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          'X-SECRET-KEY': secretKey || '',
        },
      });

      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  verifyWebhook(payload: any, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(JSON.stringify(payload)).digest('hex');
    return digest === signature;
  }

  parseWebhookPayload(payload: any) {
    return {
      tracking_number: payload.tracking_number,
      event_type: this.mapStatus(payload.status),
      status: payload.status,
      timestamp: payload.updated_at || payload.timestamp,
      location: payload.recipient?.wilaya || payload.location,
      description: payload.status_label || payload.description,
    };
  }

  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'confirmed': 'pending',
      'picked_up': 'in_transit',
      'in_transit': 'in_transit',
      'at_hub': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'failed': 'failed',
      'returned': 'returned',
      'cancelled': 'cancelled',
    };
    return statusMap[status] || 'pending';
  }
}
