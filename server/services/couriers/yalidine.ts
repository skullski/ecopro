// Yalidine Express Courier Service
import { CourierService } from './courier-service';
import { CourierShipmentResponse, CourierStatusResponse, ShipmentInput } from '../types/delivery';
import crypto from 'crypto';

export class YalidineService implements CourierService {
  private readonly apiUrl = 'https://api.yalidine.net';

  async createShipment(shipment: ShipmentInput, apiKey: string): Promise<CourierShipmentResponse> {
    try {
      const payload = {
        client_name: shipment.customer_name,
        client_phone: shipment.customer_phone,
        client_email: shipment.customer_email || '',
        delivery_address: shipment.delivery_address,
        delivery_type: 1, // Standard delivery
        product_list: [
          {
            product_name: shipment.product_description || 'Item',
            qty: shipment.quantity,
          },
        ],
        cod: shipment.cod_amount ? shipment.cod_amount : 0,
        reference: shipment.reference_id,
      };

      const response = await fetch(`${this.apiUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.tracking_number) {
        return {
          success: false,
          tracking_number: '',
          error: data.message || 'Failed to create shipment',
        };
      }

      return {
        success: true,
        tracking_number: data.tracking_number,
        label_url: data.label_url,
        reference_id: shipment.reference_id,
        estimated_delivery: data.estimated_delivery,
      };
    } catch (error: any) {
      return {
        success: false,
        tracking_number: '',
        error: error.message || 'Shipment creation failed',
      };
    }
  }

  async getStatus(trackingNumber: string, apiKey: string): Promise<CourierStatusResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/track/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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

      return {
        tracking_number: trackingNumber,
        status: data.status || 'pending',
        last_update: data.last_update,
        location: data.current_location,
        events: data.events || [],
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
      tracking_number: payload.tracking_number,
      event_type: this.mapEventType(payload.status),
      status: payload.status,
      timestamp: payload.timestamp,
      location: payload.location,
      description: payload.message,
    };
  }

  private mapEventType(status: string): string {
    const mapping: Record<string, string> = {
      'pending': 'in_transit',
      'picked_up': 'pickup',
      'in_transit': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'failed': 'failed',
      'returned': 'returned',
    };
    return mapping[status] || 'in_transit';
  }
}
