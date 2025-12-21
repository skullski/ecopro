// Algérie Poste Courier Service
import { CourierService } from '../courier-service';
import { CourierShipmentResponse, CourierStatusResponse, ShipmentInput } from '../../types/delivery';
import crypto from 'crypto';

export class AlgeriePosteService implements CourierService {
  private readonly apiUrl = 'https://api.poste.dz';

  async createShipment(shipment: ShipmentInput, apiKey: string): Promise<CourierShipmentResponse> {
    try {
      const payload = {
        recipient_name: shipment.customer_name,
        recipient_phone: shipment.customer_phone,
        recipient_email: shipment.customer_email || '',
        recipient_address: shipment.delivery_address,
        parcel_type: 'standard',
        weight: shipment.weight || 1,
        description: shipment.product_description || 'Parcel',
        reference: shipment.reference_id,
        cod_amount: shipment.cod_amount || 0,
      };

      const response = await fetch(`${this.apiUrl}/v1/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.tracking_number) {
        return {
          success: false,
          tracking_number: '',
          error: data.error || 'Failed to create shipment',
        };
      }

      return {
        success: true,
        tracking_number: data.tracking_number,
        label_url: data.label_download_url,
        reference_id: shipment.reference_id,
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
      const response = await fetch(`${this.apiUrl}/v1/tracking/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          tracking_number: trackingNumber,
          status: 'unknown',
          error: data.error || 'Failed to fetch status',
        };
      }

      return {
        tracking_number: trackingNumber,
        status: data.status,
        last_update: data.last_update_date,
        location: data.current_location || data.last_location,
        events: data.tracking_events || [],
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
      event_type: this.mapEventType(payload.event_code),
      status: payload.event_code,
      timestamp: payload.event_date,
      location: payload.location_code,
      description: payload.event_description,
    };
  }

  private mapEventType(eventCode: string): string {
    const mapping: Record<string, string> = {
      'collected': 'pickup',
      'in_transit': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'failed': 'failed',
      'returned': 'returned',
    };
    return mapping[eventCode] || 'in_transit';
  }
}
