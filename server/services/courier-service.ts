// Base service for courier integrations
// Each courier implements this interface

import { CourierShipmentResponse, CourierStatusResponse, ShipmentInput } from '../types/delivery';

export interface CourierService {
  /**
   * Create a shipment with the courier
   * @param shipment Shipment details
   * @param apiKey API key for the courier
   * @returns Tracking number and label URL/data
   */
  createShipment(
    shipment: ShipmentInput,
    apiKey: string,
    secondaryCredential?: string
  ): Promise<CourierShipmentResponse>;

  /**
   * Get delivery status for a shipment
   * @param trackingNumber Tracking number
   * @param apiKey API key for the courier
   * @returns Current status and events
   */
  getStatus(
    trackingNumber: string,
    apiKey: string,
    secondaryCredential?: string
  ): Promise<CourierStatusResponse>;

  /**
   * Verify webhook signature from courier
   * @param payload Webhook payload
   * @param signature Signature from courier
   * @param secret Webhook secret
   * @returns true if signature is valid
   */
  verifyWebhook(payload: any, signature: string, secret: string): boolean;

  /**
   * Parse webhook payload and extract delivery event
   * @param payload Webhook payload from courier
   * @returns Parsed event data
   */
  parseWebhookPayload(payload: any): {
    tracking_number: string;
    event_type: string;
    status: string;
    timestamp?: string;
    location?: string;
    description?: string;
  };
}

// Service Registry
export const courierServices: Record<string, () => CourierService> = {};

// Register courier services
export function registerCourierService(companyName: string, ServiceClass: new () => CourierService) {
  courierServices[companyName.toLowerCase()] = () => new ServiceClass();
}

// Get courier service by company name
export function getCourierService(companyName: string): CourierService | null {
  const serviceFn = courierServices[companyName.toLowerCase()];
  return serviceFn ? serviceFn() : null;
}
