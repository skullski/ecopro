// ZR Express / Procolis Courier Service
// API available via Procolis platform

import { CourierService } from '../courier-service';
import { CourierShipmentResponse, CourierStatusResponse, ShipmentInput } from '../../types/delivery';
import crypto from 'crypto';

interface ZRExpressOrderResponse {
  id: number;
  tracking: string;
  reference: string;
  status: string;
  status_text: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  wilaya: string;
  commune: string;
  cod: number;
  shipping_fee: number;
  created_at: string;
}

export class ZRExpressService implements CourierService {
  private readonly apiUrl = 'https://api.procolis.com/v1';

  async createShipment(
    shipment: ShipmentInput,
    apiKey: string,
    apiId?: string
  ): Promise<CourierShipmentResponse> {
    try {
      const payload = {
        reference: shipment.reference_id || `ORD-${Date.now()}`,
        customer_name: shipment.customer_name || 'Customer',
        customer_phone: shipment.customer_phone || '',
        address: shipment.delivery_address || '',
        wilaya: shipment.wilaya || 'Alger',
        commune: shipment.commune || 'Alger Centre',
        product: shipment.product_description || 'Products',
        cod: shipment.cod_amount || 0,
        weight: shipment.weight || 1,
        note: shipment.notes || '',
      };

      const response = await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-ID': apiId || '',
          'X-API-TOKEN': apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ZRExpress] Create order error:', data);
        return {
          success: false,
          tracking_number: '',
          error: data.message || data.error || `API Error ${response.status}`,
        };
      }

      const order: ZRExpressOrderResponse = data;

      return {
        success: true,
        tracking_number: order.tracking,
        reference_id: order.reference,
      };
    } catch (error: any) {
      console.error('[ZRExpress] createShipment exception:', error);
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
    apiId?: string
  ): Promise<CourierStatusResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/orders/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'X-API-ID': apiId || '',
          'X-API-TOKEN': apiKey,
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

      const order: ZRExpressOrderResponse = data;

      return {
        tracking_number: trackingNumber,
        status: this.mapStatus(order.status),
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
      tracking_number: payload.tracking || payload.tracking_number,
      event_type: this.mapStatus(payload.status),
      status: payload.status,
      timestamp: payload.updated_at || payload.timestamp,
      location: payload.wilaya || payload.location,
      description: payload.status_text || payload.description,
    };
  }

  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'new': 'pending',
      'pending': 'pending',
      'confirmed': 'pending',
      'picked': 'in_transit',
      'in_transit': 'in_transit',
      'at_warehouse': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'failed': 'failed',
      'returned': 'returned',
    };
    return statusMap[status] || 'pending';
  }
}
