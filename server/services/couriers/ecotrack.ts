// Ecotrack Courier Service
// Logistics SaaS platform that aggregates multiple carriers
// Partners: DHD, Conexlog/UPS, and more

import { CourierService } from '../courier-service';
import { CourierShipmentResponse, CourierStatusResponse, ShipmentInput } from '../../types/delivery';
import crypto from 'crypto';

interface EcotrackOrderResponse {
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

export class EcotrackService implements CourierService {
  private readonly apiUrl = 'https://api.ecotrack.dz/v1';

  async createShipment(
    shipment: ShipmentInput,
    apiKey: string,
    accountId?: string
  ): Promise<CourierShipmentResponse> {
    try {
      const payload = {
        reference: shipment.reference_id || `ORD-${Date.now()}`,
        recipient_name: shipment.customer_name || 'Customer',
        recipient_phone: shipment.customer_phone || '',
        recipient_address: shipment.delivery_address || '',
        wilaya: shipment.wilaya || 'Alger',
        commune: shipment.commune || 'Alger Centre',
        product_description: shipment.product_description || 'Products',
        cod_amount: shipment.cod_amount || 0,
        weight: shipment.weight || 1,
        is_fragile: false,
        allow_open: true,
      };

      const response = await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-Account-ID': accountId || '',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[Ecotrack] Create order error:', data);
        return {
          success: false,
          tracking_number: '',
          error: data.message || data.error || `API Error ${response.status}`,
        };
      }

      const order: EcotrackOrderResponse = data;

      return {
        success: true,
        tracking_number: order.tracking_code,
        label_url: order.label_url,
        reference_id: order.reference,
      };
    } catch (error: any) {
      console.error('[Ecotrack] createShipment exception:', error);
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
          'Authorization': `Bearer ${apiKey}`,
          'X-Account-ID': accountId || '',
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

      const order: EcotrackOrderResponse = data;

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
