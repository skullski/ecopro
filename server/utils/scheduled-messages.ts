/**
 * Scheduled Message Worker
 * Processes scheduled messages (like delayed order confirmations with buttons)
 * Runs on a timer and sends messages when their scheduled time arrives
 */

import { ensureConnection } from './database';
import { sendTelegramMessage } from './bot-messaging';

let workerInterval: NodeJS.Timeout | null = null;

/**
 * Process all pending scheduled messages that are ready to be sent
 */
export async function processScheduledMessages(): Promise<void> {
  try {
    const pool = await ensureConnection();
    
    // Get all pending messages that are past their scheduled time
    const result = await pool.query(
      `SELECT sm.*, bs.telegram_bot_token
       FROM scheduled_messages sm
       JOIN bot_settings bs ON sm.client_id = bs.client_id AND bs.provider = 'telegram' AND bs.enabled = true
       WHERE sm.status = 'pending' 
         AND sm.scheduled_at <= NOW()
         AND sm.telegram_chat_id IS NOT NULL
       ORDER BY sm.scheduled_at ASC
       LIMIT 50`
    );
    
    if (result.rows.length === 0) {
      return;
    }
    
    console.log(`[ScheduledMessages] Processing ${result.rows.length} pending messages`);
    
    for (const msg of result.rows) {
      try {
        // For order confirmation messages, add confirm/cancel buttons
        let replyMarkup: any = undefined;
        
        if (msg.message_type === 'order_confirmation' && msg.order_id) {
          const confirmCallback = `confirm_order_${msg.order_id}_${msg.client_id}`;
          const cancelCallback = `cancel_order_${msg.order_id}_${msg.client_id}`;
          
          replyMarkup = {
            inline_keyboard: [
              [
                { text: '✅ تأكيد الطلب', callback_data: confirmCallback },
                { text: '❌ إلغاء الطلب', callback_data: cancelCallback }
              ]
            ]
          };
        }
        
        // Send the message
        const sendResult = await sendTelegramMessage(
          msg.telegram_bot_token,
          msg.telegram_chat_id,
          msg.message_content,
          replyMarkup ? { reply_markup: replyMarkup } : undefined
        );
        
        if (sendResult.success) {
          // Mark as sent
          await pool.query(
            `UPDATE scheduled_messages 
             SET status = 'sent', sent_at = NOW(), updated_at = NOW()
             WHERE id = $1`,
            [msg.id]
          );
          console.log(`[ScheduledMessages] Sent message ${msg.id} for order ${msg.order_id}`);
        } else {
          // Mark as failed, increment retry count
          const newRetryCount = (msg.retry_count || 0) + 1;
          const newStatus = newRetryCount >= 3 ? 'failed' : 'pending';
          
          // If still pending, reschedule for 1 minute later
          const rescheduleAt = newStatus === 'pending' 
            ? new Date(Date.now() + 60 * 1000).toISOString() 
            : msg.scheduled_at;
          
          await pool.query(
            `UPDATE scheduled_messages 
             SET status = $1, error_message = $2, retry_count = $3, 
                 scheduled_at = $4, updated_at = NOW()
             WHERE id = $5`,
            [newStatus, sendResult.error, newRetryCount, rescheduleAt, msg.id]
          );
          console.log(`[ScheduledMessages] Failed to send message ${msg.id}: ${sendResult.error}`);
        }
      } catch (error) {
        console.error(`[ScheduledMessages] Error processing message ${msg.id}:`, error);
        
        // Mark as failed
        await pool.query(
          `UPDATE scheduled_messages 
           SET status = 'failed', error_message = $1, updated_at = NOW()
           WHERE id = $2`,
          [error instanceof Error ? error.message : String(error), msg.id]
        );
      }
    }
  } catch (error) {
    console.error('[ScheduledMessages] Worker error:', error);
  }
}

/**
 * Start the scheduled message worker
 * Runs every 30 seconds to check for messages to send
 */
export function startScheduledMessageWorker(): void {
  if (workerInterval) {
    console.log('[ScheduledMessages] Worker already running');
    return;
  }
  
  console.log('[ScheduledMessages] Starting worker (30s interval)');
  
  // Run immediately on start
  processScheduledMessages().catch(console.error);
  
  // Then run every 30 seconds
  workerInterval = setInterval(() => {
    processScheduledMessages().catch(console.error);
  }, 30 * 1000);
}

/**
 * Stop the scheduled message worker
 */
export function stopScheduledMessageWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('[ScheduledMessages] Worker stopped');
  }
}

/**
 * Cancel a scheduled message (e.g., if order is already confirmed/cancelled)
 */
export async function cancelScheduledMessage(orderId: number): Promise<void> {
  try {
    const pool = await ensureConnection();
    await pool.query(
      `UPDATE scheduled_messages 
       SET status = 'cancelled', updated_at = NOW()
       WHERE order_id = $1 AND status = 'pending'`,
      [orderId]
    );
    console.log(`[ScheduledMessages] Cancelled pending messages for order ${orderId}`);
  } catch (error) {
    console.error(`[ScheduledMessages] Error cancelling messages for order ${orderId}:`, error);
  }
}
