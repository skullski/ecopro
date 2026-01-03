// Delivery Management Service
// Main business logic for handling delivery operations

import { pool } from '../utils/database';
import { encryptData, decryptData } from '../utils/encryption';
import { generateRequestId, logDeliveryEvent } from '../utils/delivery-logging';
import { getCourierService } from './courier-service';
import { registerCourierService } from './courier-service';
import { CourierShipmentResponse, DeliveryStatus } from '../types/delivery';

// Import real courier services (verified APIs only)
import { YalidineService } from './couriers/yalidine';
import { GuepexService } from './couriers/guepex';
import { EcotrackService } from './couriers/ecotrack';
import { ZRExpressService } from './couriers/zr-express';
import { MaystroService } from './couriers/maystro';
import { DolivrooService } from './couriers/dolivroo';

// ========================================
// REGISTER REAL ALGERIAN DELIVERY PROVIDERS
// Only services with verified public APIs
// ========================================
registerCourierService('yalidine', YalidineService);
registerCourierService('yalidine express', YalidineService);
registerCourierService('guepex', GuepexService);
registerCourierService('ecotrack', EcotrackService);
// Noest portal is powered by Ecotrack (token + GUID). Treat Noest as Ecotrack API.
registerCourierService('noest', EcotrackService);
registerCourierService('noest express', EcotrackService);
registerCourierService('zr express', ZRExpressService);
registerCourierService('zr-express', ZRExpressService);
registerCourierService('maystro', MaystroService);
registerCourierService('maystro delivery', MaystroService);
registerCourierService('dolivroo', DolivrooService); // Aggregator - recommended

export class DeliveryService {
  /**
   * Upload an order to the courier (create shipment) without requiring/storing a label.
   * This is what the UI calls "Upload to Delivery" when labels are not requested.
   */
  static async createShipment(
    orderId: number,
    clientId: number,
    companyId: number
  ): Promise<{ success: boolean; tracking_number?: string; label_url?: string; courier_response?: any; error?: string }> {
    const requestId = generateRequestId();

    try {
      const orderResult = await pool.query(
        `SELECT so.*, dc.name as company_name 
         FROM store_orders so
         LEFT JOIN delivery_companies dc ON so.delivery_company_id = dc.id
         WHERE so.id = $1 AND so.client_id = $2`,
        [orderId, clientId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];

      const integrationResult = await pool.query(
        `SELECT id, api_key_encrypted, api_secret_encrypted
         FROM delivery_integrations
         WHERE client_id = $1 AND delivery_company_id = $2 AND is_enabled = true`,
        [clientId, companyId]
      );

      if (integrationResult.rows.length === 0) {
        throw new Error('Delivery integration not configured for this company');
      }

      const integration = integrationResult.rows[0];
      const apiKey = decryptData(integration.api_key_encrypted);
      const secondaryCredential = integration.api_secret_encrypted
        ? decryptData(integration.api_secret_encrypted)
        : undefined;

      const service = getCourierService(order.company_name);
      if (!service) {
        throw new Error(`No service found for ${order.company_name}`);
      }

      const shipmentResponse = await service.createShipment(
        {
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_email: order.customer_email,
          delivery_address: order.customer_address,
          product_description: `Order #${orderId}`,
          quantity: order.quantity,
          cod_amount: order.cod_amount,
          reference_id: `ORDER-${orderId}`,
        },
        apiKey,
        secondaryCredential
      );

      if (!shipmentResponse.success) {
        throw new Error(shipmentResponse.error || 'Failed to create shipment');
      }

      const trackingNumber = shipmentResponse.tracking_number;

      await pool.query(
        `UPDATE store_orders
         SET tracking_number = $1,
             delivery_status = $2,
             shipping_label_url = COALESCE($3, shipping_label_url),
             courier_response = $4::jsonb,
             updated_at = NOW()
         WHERE id = $5 AND client_id = $6`,
        [
          trackingNumber,
          DeliveryStatus.IN_TRANSIT,
          shipmentResponse.label_url || null,
          JSON.stringify(shipmentResponse),
          orderId,
          clientId,
        ]
      );

      await logDeliveryEvent(
        orderId,
        clientId,
        companyId,
        'uploaded',
        `Shipment created with ${order.company_name}`,
        requestId
      );

      return {
        success: true,
        tracking_number: trackingNumber,
        label_url: shipmentResponse.label_url,
        courier_response: shipmentResponse,
      };
    } catch (error: any) {
      console.error(`[DeliveryService] createShipment failed:`, error);
      await this.logError(orderId, clientId, companyId, 'shipment_create_failed', error.message, requestId);
      return { success: false, error: error.message };
    }
  }

  /**
   * Assign a delivery company to an order
   */
  static async assignDeliveryCompany(
    orderId: number,
    clientId: number,
    companyId: number,
    codAmount?: number
  ): Promise<{ success: boolean; error?: string }> {
    const requestId = generateRequestId();

    try {
      const orderResult = await pool.query(
        'SELECT id FROM store_orders WHERE id = $1 AND client_id = $2',
        [orderId, clientId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const companyResult = await pool.query(
        'SELECT id, name FROM delivery_companies WHERE id = $1 AND is_active = true',
        [companyId]
      );

      if (companyResult.rows.length === 0) {
        throw new Error('Delivery company not found or inactive');
      }

      await pool.query(
        `UPDATE store_orders 
         SET delivery_company_id = $1, 
             delivery_status = $2,
             cod_amount = $3,
             updated_at = NOW()
         WHERE id = $4 AND client_id = $5`,
        [companyId, DeliveryStatus.ASSIGNED, codAmount || null, orderId, clientId]
      );

      await logDeliveryEvent(
        orderId,
        clientId,
        companyId,
        'assigned',
        `Delivery company assigned: ${companyResult.rows[0].name}`,
        requestId
      );

      return { success: true };
    } catch (error: any) {
      console.error(`[DeliveryService] assignDeliveryCompany failed:`, error);
      await this.logError(orderId, clientId, null, 'assignment_failed', error.message, requestId);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate shipping label for an order
   */
  static async generateLabel(
    orderId: number,
    clientId: number,
    companyId: number
  ): Promise<{ success: boolean; tracking_number?: string; label_url?: string; error?: string }> {
    const requestId = generateRequestId();

    try {
      const shipmentResult = await this.createShipment(orderId, clientId, companyId);
      if (!shipmentResult.success) {
        throw new Error(shipmentResult.error || 'Failed to create shipment');
      }

      const trackingNumber = shipmentResult.tracking_number!;

      await pool.query(
        `INSERT INTO delivery_labels 
         (order_id, client_id, delivery_company_id, tracking_number, label_url, generated_at, label_format)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
        [orderId, clientId, companyId, trackingNumber, shipmentResult.label_url || null, 'pdf']
      );

      // createShipment already updated tracking/status; only ensure label fields are stamped.
      await pool.query(
        `UPDATE store_orders
         SET shipping_label_url = $1,
             label_generated_at = NOW(),
             updated_at = NOW()
         WHERE id = $2 AND client_id = $3`,
        [shipmentResult.label_url || null, orderId, clientId]
      );

      await logDeliveryEvent(
        orderId,
        clientId,
        companyId,
        'label_generated',
        `Label generated with tracking: ${trackingNumber}`,
        requestId
      );

      return {
        success: true,
        tracking_number: trackingNumber,
        label_url: shipmentResult.label_url,
      };
    } catch (error: any) {
      console.error(`[DeliveryService] generateLabel failed:`, error);
      await this.logError(orderId, clientId, companyId, 'label_generation_failed', error.message, requestId);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get delivery status for an order
   */
  static async getDeliveryStatus(
    orderId: number,
    clientId: number
  ): Promise<{ success: boolean; status?: string; tracking_number?: string; events?: any[]; error?: string }> {
    try {
      const orderResult = await pool.query(
        `SELECT so.*, dc.name as company_name
         FROM store_orders so
         LEFT JOIN delivery_companies dc ON so.delivery_company_id = dc.id
         WHERE so.id = $1 AND so.client_id = $2`,
        [orderId, clientId]
      );

      if (orderResult.rows.length === 0) {
        return { success: false, error: 'Order not found' };
      }

      const order = orderResult.rows[0];

      if (!order.tracking_number) {
        return { success: false, error: 'No tracking information for this order' };
      }

      // Get events from database
      const eventsResult = await pool.query(
        `SELECT event_type, event_status, description, location, created_at
         FROM delivery_events
         WHERE order_id = $1
         ORDER BY created_at DESC`,
        [orderId]
      );

      return {
        success: true,
        status: order.delivery_status,
        tracking_number: order.tracking_number,
        events: eventsResult.rows,
      };
    } catch (error: any) {
      console.error(`[DeliveryService] getDeliveryStatus failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle incoming webhook from courier
   */
  static async handleWebhook(
    companyName: string,
    payload: any,
    signature?: string
  ): Promise<{ success: boolean; error?: string }> {
    const requestId = generateRequestId();

    try {
      // Get delivery company
      const companyResult = await pool.query(
        'SELECT id FROM delivery_companies WHERE name = $1',
        [companyName]
      );

      if (companyResult.rows.length === 0) {
        throw new Error(`Delivery company not found: ${companyName}`);
      }

      const companyId = companyResult.rows[0].id;

      // Get courier service
      const service = getCourierService(companyName);
      if (!service) {
        throw new Error(`No service for ${companyName}`);
      }

      // Parse webhook
      const event = service.parseWebhookPayload(payload);
      const trackingNumber = event.tracking_number;

      // Find order by tracking number
      const orderResult = await pool.query(
        'SELECT id, client_id FROM store_orders WHERE tracking_number = $1',
        [trackingNumber]
      );

      if (orderResult.rows.length === 0) {
        console.warn(`[Webhook] No order found for tracking: ${trackingNumber}`);
        return { success: true }; // Don't fail, just log
      }

      const { id: orderId, client_id: clientId } = orderResult.rows[0];

      // Save event
      const eventInsert = await pool.query(
        `INSERT INTO delivery_events
         (order_id, client_id, delivery_company_id, tracking_number, event_type, event_status, description, location, webhook_payload, webhook_verified, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, NOW())
         RETURNING id`,
        [
          orderId,
          clientId,
          companyId,
          trackingNumber,
          event.event_type,
          'completed',
          event.description,
          event.location,
          JSON.stringify(payload),
          signature ? true : false,
        ]
      );

      // Update order delivery status if final state
      if (['delivered', 'failed', 'returned'].includes(event.event_type)) {
        await pool.query(
          `UPDATE store_orders
           SET delivery_status = $1, updated_at = NOW()
           WHERE id = $2`,
          [event.event_type, orderId]
        );
      }

      console.log(`[Webhook] Event processed for order ${orderId}: ${event.event_type}`);
      return { success: true };
    } catch (error: any) {
      console.error(`[DeliveryService] handleWebhook failed:`, error);
      return { success: false, error: error.message };
    }
  }

  // Helper function
  private static async logError(
    orderId: number,
    clientId: number | null,
    companyId: number | null,
    errorType: string,
    errorMessage: string,
    requestId: string
  ) {
    try {
      await pool.query(
        `INSERT INTO delivery_errors
         (client_id, order_id, delivery_company_id, error_type, error_message, request_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [clientId, orderId, companyId, errorType, errorMessage, requestId]
      );
    } catch (err) {
      console.error('Failed to log delivery error', err);
    }
  }
}
