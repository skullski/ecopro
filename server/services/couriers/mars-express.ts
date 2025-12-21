// Mars Express Courier Service
import { CourierService } from '../courier-service';
import { CourierShipmentResponse, CourierStatusResponse, ShipmentInput } from '../../types/delivery';
import crypto from 'crypto';

export class MarsExpressService implements CourierService {
  private readonly apiUrl = 'https://api.marsexpress.dz';

  async createShipment(shipment: ShipmentInput, apiKey: string): Promise<CourierShipmentResponse> {
    try {
      const payload = {
        customer_name: shipment.customer_name,
        customer_phone: shipment.customer_phone,
        customer_email: shipment.customer_email,
        delivery_address: shipment.delivery_address,
        item_description: shipment.product_description || 'Item',
        item_quantity: shipment.quantity,
        item_weight: shipment.weight || 0.5,
        payment_method: shipment.cod_amount ? 'cod' : 'prepaid',
        cod_amount: shipment.cod_amount || 0,
        order_reference: shipment.reference_id,
      };

      const response = await fetch(`${this.apiUrl}/v2/shipments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.shipment_number) {
        return {
          success: false,
          tracking_number: '',
          error: data.error_message || 'Failed to create shipment',
        };
      }

      return {
        success: true,
        tracking_number: data.shipment_number,
        label_url: data.label_url,
        label_data: data.label_base64,
        reference_id: shipment.reference_id,
        estimated_delivery: data.estimated_delivery_date,
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
      const response = await fetch(`${this.apiUrl}/v2/tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ shipment_number: trackingNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          tracking_number: trackingNumber,
          status: 'unknown',
          error: data.error_message || 'Failed to fetch status',
        };
      }

      return {
        tracking_number: trackingNumber,
        status: data.current_status,
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
      tracking_number: payload.shipment_number,
      event_type: this.mapEventType(payload.status_code),
      status: payload.status_code,
      timestamp: payload.timestamp,
      location: payload.location,
      description: payload.status_description,
    };
  }

  private mapEventType(statusCode: string): string {
    const mapping: Record<string, string> = {
      'created': 'in_transit',
      'picked_up': 'pickup',
      'transit': 'in_transit',
      'out_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'failed': 'failed',
      'returned': 'returned',
    };
    return mapping[statusCode] || 'in_transit';
  }
}
