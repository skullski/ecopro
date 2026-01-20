// Anderson Ecommerce Courier Service
// Uses Ecotrack platform: https://anderson-ecommerce.ecotrack.dz
// This is a white-label instance of Ecotrack for Anderson delivery

import { CourierService } from '../courier-service';
import { CourierShipmentResponse, CourierStatusResponse, ShipmentInput } from '../../types/delivery';
import crypto from 'crypto';

interface AndersonOrderResponse {
  id: number;
  tracking_code: string;
  reference: string;
  status: string;
  status_label: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  wilaya: string;
  commune: string;
  cod_amount: number;
  delivery_fee: number;
  label_url?: string;
  created_at: string;
  updated_at: string;
}

export class AndersonService implements CourierService {
  // Anderson uses Ecotrack platform with custom subdomain
  private readonly apiUrl = 'https://anderson-ecommerce.ecotrack.dz/api/v1';

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

  async createShipment(
    shipment: ShipmentInput,
    apiKey: string,
    accountId?: string
  ): Promise<CourierShipmentResponse> {
    try {
      // Anderson API expects specific field names and valid values
      const payload = {
        reference: shipment.reference_id || `ORD-${Date.now()}`,
        nom_client: shipment.customer_name || 'Customer',
        telephone: shipment.customer_phone || '',
        adresse: shipment.delivery_address || '',
        code_wilaya: shipment.wilaya_id || shipment.wilaya || '',
        commune: shipment.commune || '',
        montant: shipment.cod_amount || 0,
        type: 1, // Anderson API expects integer for type (1 = standard)
        description: shipment.product_description || 'Products',
        poids: shipment.weight || 1,
        is_fragile: false,
        allow_open: true,
        notes: shipment.notes || '',
      };

      const response = await fetch(`${this.apiUrl}/create/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(accountId ? { 'X-Account-ID': accountId } : {}),
        },
        body: JSON.stringify(payload),
      });

      const { json, text, contentType } = await this.readApiResponse(response);
      const data = json ?? {};

      if (!response.ok) {
        const snippet = text.slice(0, 400);
        console.error('[Anderson] Create order error:', {
          status: response.status,
          contentType,
          bodySnippet: snippet,
          data,
        });
        return {
          success: false,
          tracking_number: '',
          error:
            (data?.message || data?.error) ??
            `API Error ${response.status} (${contentType || 'unknown content-type'}): ${snippet || 'empty response'}`,
        };
      }

      if (!json) {
        return {
          success: false,
          tracking_number: '',
          error: `API returned non-JSON success response (${contentType || 'unknown'}): ${text.slice(0, 200)}`,
        };
      }

      const order: AndersonOrderResponse = json;

      return {
        success: true,
        tracking_number: order.tracking_code,
        label_url: order.label_url,
        reference_id: order.reference,
      };
    } catch (error: any) {
      console.error('[Anderson] createShipment exception:', error);
      return {
        success: false,
        tracking_number: '',
        error: error.message || 'Order creation failed',
      };
    }
  }

  async getStatus(
    trackingNumber: string,
    apiKey: string,
    accountId?: string
  ): Promise<CourierStatusResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/orders/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(accountId ? { 'X-Account-ID': accountId } : {}),
        },
      });

      const { json, text, contentType } = await this.readApiResponse(response);
      const data = json ?? {};

      if (!response.ok) {
        return {
          tracking_number: trackingNumber,
          status: 'unknown',
          error:
            (data?.message || data?.error) ??
            `Failed to fetch status: HTTP ${response.status} (${contentType || 'unknown'}): ${text.slice(0, 200)}`,
        };
      }

      if (!json) {
        return {
          tracking_number: trackingNumber,
          status: 'unknown',
          error: `API returned non-JSON success response (${contentType || 'unknown'}): ${text.slice(0, 200)}`,
        };
      }

      const order: AndersonOrderResponse = json;

      return {
        tracking_number: trackingNumber,
        status: this.mapStatus(order.status),
        last_update: order.updated_at,
        location: order.wilaya,
        events: [],
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
    accountId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/orders/${trackingNumber}/cancel`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(accountId ? { 'X-Account-ID': accountId } : {}),
        },
      });

      const { json } = await this.readApiResponse(response);

      if (!response.ok) {
        return {
          success: false,
          error: json?.message || json?.error || `Cancel failed: HTTP ${response.status}`,
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Cancel request failed',
      };
    }
  }

  verifyWebhook(payload: any, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(JSON.stringify(payload)).digest('hex');
    return digest === signature;
  }

  parseWebhookPayload(payload: any) {
    return {
      tracking_number: payload.tracking_code || payload.tracking_number,
      event_type: this.mapStatus(payload.status),
      status: payload.status,
      timestamp: payload.updated_at || payload.timestamp,
      location: payload.wilaya || payload.location,
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
