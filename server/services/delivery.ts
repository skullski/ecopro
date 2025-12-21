// Delivery Management Service
// Main business logic for handling delivery operations

import { pool } from '../utils/database';
import { encryptData, decryptData } from '../utils/encryption';
import { generateRequestId, logDeliveryEvent } from '../utils/delivery-logging';
import { getCourierService } from './courier-service';
import { YalidineService } from './couriers/yalidine';
import { AlgeriePosteService } from './couriers/algerie-poste';
import { MarsExpressService } from './couriers/mars-express';
import { registerCourierService } from './courier-service';
import { CourierShipmentResponse, DeliveryStatus } from '../types/delivery';

// Register all courier services
registerCourierService('Yalidine Express', YalidineService);
registerCourierService('Algérie Poste', AlgeriePosteService);
registerCourierService('Mars Express', MarsExpressService);

export class DeliveryService {
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
      // Validate order exists and belongs to client
      const orderResult = await pool.query(
        'SELECT id FROM store_orders WHERE id = $1 AND client_id = $2',
        [orderId, clientId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      // Validate delivery company exists
      const companyResult = await pool.query(
        'SELECT id, name FROM delivery_companies WHERE id = $1 AND is_active = true',
        [companyId]
      );

      if (companyResult.rows.length === 0) {
        throw new Error('Delivery company not found or inactive');
      }

      // Update order with delivery company
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
      // Get order details
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

      // Get delivery integration credentials
      const integrationResult = await pool.query(
        `SELECT id, api_key_encrypted, api_secret_encrypted, webhook_secret_encrypted
         FROM delivery_integrations
         WHERE client_id = $1 AND delivery_company_id = $2 AND is_enabled = true`,
        [clientId, companyId]
      );

      if (integrationResult.rows.length === 0) {
        throw new Error('Delivery integration not configured for this company');
      }

      const integration = integrationResult.rows[0];
      const apiKey = decryptData(integration.api_key_encrypted);

      // Get courier service
      const service = getCourierService(order.company_name);
      if (!service) {
        throw new Error(`No service found for ${order.company_name}`);
      }

      // Create shipment with courier
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
        apiKey
      );

      if (!shipmentResponse.success) {
        throw new Error(shipmentResponse.error || 'Failed to create shipment');
      }

      const trackingNumber = shipmentResponse.tracking_number;

      // Save label to database
      const labelResult = await pool.query(
        `INSERT INTO delivery_labels 
         (order_id, client_id, delivery_company_id, tracking_number, label_url, generated_at, label_format)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)
         RETURNING id`,
        [orderId, clientId, companyId, trackingNumber, shipmentResponse.label_url || null, 'pdf']
      );

      // Update order with tracking info
      await pool.query(
        `UPDATE store_orders
         SET tracking_number = $1,
             delivery_status = $2,
             shipping_label_url = $3,
             label_generated_at = NOW(),
             courier_response = $4::jsonb,
             updated_at = NOW()
         WHERE id = $5`,
        [
          trackingNumber,
          DeliveryStatus.IN_TRANSIT,
          shipmentResponse.label_url,
          JSON.stringify(shipmentResponse),
          orderId,
        ]
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
        label_url: shipmentResponse.label_url,
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
