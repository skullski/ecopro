import twilio from "twilio";
import { ensureConnection } from "./database";

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(
  toPhoneNumber: string,
  message: string,
  mediaUrl?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Get Twilio credentials from environment or bot settings
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromPhoneNumber) {
      console.error("Twilio credentials not configured");
      return { success: false, error: "Twilio not configured" };
    }

    const client = twilio(accountSid, authToken);

    const messageResponse = await client.messages.create({
      body: message,
      from: `whatsapp:${fromPhoneNumber}`,
      to: `whatsapp:${toPhoneNumber}`,
      ...(mediaUrl && { mediaUrl: [mediaUrl] })
    });

    console.log(`[WhatsApp] Message sent to ${toPhoneNumber}: ${messageResponse.sid}`);
    return { success: true, messageId: messageResponse.sid };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[WhatsApp] Failed to send message: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Send SMS message via Twilio
 */
export async function sendSMSMessage(
  toPhoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhoneNumber = process.env.TWILIO_SMS_NUMBER;

    if (!accountSid || !authToken || !fromPhoneNumber) {
      console.error("Twilio SMS credentials not configured");
      return { success: false, error: "Twilio SMS not configured" };
    }

    const client = twilio(accountSid, authToken);

    const messageResponse = await client.messages.create({
      body: message,
      from: fromPhoneNumber,
      to: toPhoneNumber
    });

    console.log(`[SMS] Message sent to ${toPhoneNumber}: ${messageResponse.sid}`);
    return { success: true, messageId: messageResponse.sid };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[SMS] Failed to send message: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Generate confirmation link token
 */
export function generateConfirmationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Create confirmation link in database
 */
export async function createConfirmationLink(
  orderId: number,
  clientId: number
): Promise<string> {
  const token = generateConfirmationToken();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
  const pool = await ensureConnection();

  await pool.query(
    `INSERT INTO confirmation_links (order_id, client_id, link_token, expires_at, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [orderId, clientId, token, expiresAt]
  );

  return token;
}

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, "g"), String(value));
  });
  return result;
}

/**
 * Send bot messages (WhatsApp + SMS) for an order
 */
export async function sendOrderConfirmationMessages(
  orderId: number,
  clientId: number,
  customerPhone: string,
  customerName: string,
  storeName: string,
  productName: string,
  price: number,
  confirmationLink: string
): Promise<void> {
  try {
    const pool = await ensureConnection();
    // Get bot settings for this store owner
    const settingsResult = await pool.query(
      `SELECT * FROM bot_settings WHERE client_id = $1 AND enabled = true`,
      [clientId]
    );

    if (settingsResult.rows.length === 0) {
      console.log(`[Bot] Bot disabled for client ${clientId}, skipping message send`);
      return;
    }

    const settings = settingsResult.rows[0];
    const templateVariables = {
      customerName,
      storeName,
      productName,
      price,
      orderId,
      confirmationLink
    };

    // Schedule WhatsApp message
    if (settings.whatsapp_token) {
      const whatsappMessage = replaceTemplateVariables(
        settings.template_order_confirmation || defaultWhatsAppTemplate(),
        templateVariables
      );

      const whatsappDelayMinutes = settings.whatsapp_delay_minutes || 60;
      const sendAt = new Date(Date.now() + whatsappDelayMinutes * 60 * 1000);

      await pool.query(
        `INSERT INTO bot_messages (order_id, client_id, customer_phone, message_type, message_content, confirmation_link, send_at)
         VALUES ($1, $2, $3, 'whatsapp', $4, $5, $6)`,
        [orderId, clientId, customerPhone, whatsappMessage, confirmationLink, sendAt]
      );

      console.log(`[Bot] WhatsApp scheduled for ${customerPhone} at ${sendAt}`);
    }

    // Schedule SMS message
    if (settings.sms_token) {
      const smsMessage = replaceTemplateVariables(
        settings.template_sms || defaultSMSTemplate(),
        templateVariables
      );

      const smsDelayMinutes = settings.sms_delay_minutes || 240; // 4 hours default
      const sendAt = new Date(Date.now() + smsDelayMinutes * 60 * 1000);

      await pool.query(
        `INSERT INTO bot_messages (order_id, client_id, customer_phone, message_type, message_content, confirmation_link, send_at)
         VALUES ($1, $2, $3, 'sms', $4, $5, $6)`,
        [orderId, clientId, customerPhone, smsMessage, confirmationLink, sendAt]
      );

      console.log(`[Bot] SMS scheduled for ${customerPhone} at ${sendAt}`);
    }
  } catch (error) {
    console.error("Error scheduling bot messages:", error);
    throw error;
  }
}

/**
 * Default WhatsApp template
 */
function defaultWhatsAppTemplate(): string {
  return `السلام عليكم {customerName}! 🌟

شكراً لك على طلبك من {storeName}! 

📦 تفاصيل الطلب:
• المنتج: {productName}
• السعر: {price} دج
• رقم الطلب: {orderId}

يرجى تأكيد طلبك من خلال الرابط أدناه:
{confirmationLink}

شكراً لك! 🎉`;
}

/**
 * Default SMS template
 */
function defaultSMSTemplate(): string {
  return `Hello {customerName}! Your order for {productName} ({price} DZD) from {storeName} is confirmed. Please approve: {confirmationLink}`;
}

/**
 * Background job to send pending messages
 * Call this periodically (e.g., every 5 minutes)
 */
export async function processPendingMessages(): Promise<void> {
  try {
    const pool = await ensureConnection();
    // Get all messages that are due to be sent
    const result = await pool.query(
      `SELECT * FROM bot_messages 
       WHERE status = 'pending' 
       AND send_at <= NOW()
       LIMIT 100`
    );

    for (const message of result.rows) {
      try {
        let sendResult;

        if (message.message_type === "whatsapp") {
          // Get Twilio token from bot settings
          const settingsResult = await pool.query(
            `SELECT whatsapp_token FROM bot_settings WHERE client_id = $1`,
            [message.client_id]
          );

          if (settingsResult.rows.length > 0 && settingsResult.rows[0].whatsapp_token) {
            sendResult = await sendWhatsAppMessage(
              message.customer_phone,
              message.message_content
            );
          }
        } else if (message.message_type === "sms") {
          sendResult = await sendSMSMessage(message.customer_phone, message.message_content);
        }

        // Update message status
        if (sendResult?.success) {
          await pool.query(
            `UPDATE bot_messages SET status = 'sent', sent_at = NOW() WHERE id = $1`,
            [message.id]
          );
        } else {
          await pool.query(
            `UPDATE bot_messages SET status = 'failed', error_message = $1, updated_at = NOW() WHERE id = $2`,
            [sendResult?.error || "Unknown error", message.id]
          );
        }
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
        const pool = await ensureConnection();
        await pool.query(
          `UPDATE bot_messages SET status = 'failed', error_message = $1, updated_at = NOW() WHERE id = $2`,
          [error instanceof Error ? error.message : String(error), message.id]
        );
      }
    }

    console.log(`[Bot] Processed ${result.rows.length} pending messages`);
  } catch (error) {
    console.error("Error in processPendingMessages:", error);
  }
}

/**
 * Background job to archive old declined orders and pending orders
 * - Declined orders → move to archived after 24 hours
 * - Pending orders (no response) → stay visible but marked as "awaiting response"
 * - Expired confirmation links → allow resending
 */
export async function cleanupOldOrders(): Promise<void> {
  try {
    const pool = await ensureConnection();
    // Archive declined orders older than 24 hours
    const declinedResult = await pool.query(
      `UPDATE store_orders 
       SET status = 'cancelled', updated_at = NOW()
       WHERE status = 'declined' 
       AND updated_at < NOW() - INTERVAL '24 hours'
       RETURNING id`
    );

    console.log(`[Cleanup] Archived ${declinedResult.rows.length} declined orders`);

    // Extend/renew confirmation links for pending orders (optional - for resending messages)
    const expiredLinksResult = await pool.query(
      `SELECT COUNT(*) FROM confirmation_links 
       WHERE expires_at < NOW() AND accessed_at IS NULL`
    );

    console.log(`[Cleanup] Found ${expiredLinksResult.rows[0].count} expired unaccessed confirmation links`);
  } catch (error) {
    console.error("Error in cleanupOldOrders:", error);
  }
}
