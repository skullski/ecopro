// Delivery logging utilities
import { pool } from './database';
import crypto from 'crypto';

export function generateRequestId(): string {
  return `REQ-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

export async function logDeliveryEvent(
  orderId: number,
  clientId: number,
  companyId: number,
  eventType: string,
  description: string,
  requestId: string
) {
  try {
    await pool.query(
      `INSERT INTO delivery_events
       (order_id, client_id, delivery_company_id, tracking_number, event_type, event_status, description, request_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [orderId, clientId, companyId, `${requestId}`, eventType, 'completed', description, requestId]
    );
  } catch (err) {
    const msg = String((err as any)?.message || '');
    // Backward compatibility: some DBs may not have request_id column yet.
    if (msg.includes('request_id') && msg.includes('does not exist')) {
      try {
        await pool.query(
          `INSERT INTO delivery_events
           (order_id, client_id, delivery_company_id, tracking_number, event_type, event_status, description, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [orderId, clientId, companyId, `${requestId}`, eventType, 'completed', description]
        );
        return;
      } catch (err2) {
        console.error('[LogDeliveryEvent] Failed to log event (fallback):', err2);
        return;
      }
    }

    console.error('[LogDeliveryEvent] Failed to log event:', err);
  }
}

export async function logDeliveryError(
  clientId: number | null,
  orderId: number | null,
  companyId: number | null,
  errorType: string,
  errorMessage: string,
  requestData?: any,
  responseData?: any,
  requestId?: string
) {
  try {
    await pool.query(
      `INSERT INTO delivery_errors
       (client_id, order_id, delivery_company_id, error_type, error_message, request_id, request_data, response_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        clientId,
        orderId,
        companyId,
        errorType,
        errorMessage,
        requestId || generateRequestId(),
        requestData ? JSON.stringify(requestData) : null,
        responseData ? JSON.stringify(responseData) : null,
      ]
    );
  } catch (err) {
    console.error('[LogDeliveryError] Failed to log error:', err);
  }
}
