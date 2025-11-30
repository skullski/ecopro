import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { BotSettings } from '../models/BotSettings.js';
import { getTranslation, replaceVariables } from '../utils/translations.js';

dotenv.config();

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

// Create queues
export const whatsappQueue = new Queue('whatsapp-messages', { connection });
export const smsQueue = new Queue('sms-messages', { connection });

// Schedule messages for an order
export async function scheduleOrderMessages(order, buyer) {
  const confirmationLink = `${process.env.BASE_URL}/confirm?orderId=${order.id}&token=${order.confirmation_token}`;

  // Get client's bot settings (includes language)
  const settings = await BotSettings.getByClientId(order.client_id);
  const language = settings.language || 'en';

  // Prepare template data
  const templateData = {
    buyer_name: buyer.name,
    order_number: order.order_number,
    product_name: order.product_name,
    quantity: order.quantity.toString(),
    total_price: order.total_price.toString(),
    confirmation_link: confirmationLink,
    company_name: settings.company_name || 'Our Store',
    support_phone: settings.support_phone || '',
    store_url: settings.store_url || '',
  };

  // Use custom template OR default translated template
  let whatsappTemplate = settings.whatsapp_template;
  let smsTemplate = settings.sms_template;

  if (!whatsappTemplate) {
    whatsappTemplate = getTranslation(language, 'orderConfirmation');
  }
  if (!smsTemplate) {
    smsTemplate = getTranslation(language, 'orderConfirmation');
  }

  // Generate messages from templates
  const whatsappMessage = replaceVariables(whatsappTemplate, templateData);
  const smsMessage = replaceVariables(smsTemplate, templateData);

  // Schedule WhatsApp message with client's custom delay
  await whatsappQueue.add(
    'send-whatsapp',
    {
      orderId: order.id,
      clientId: order.client_id,
      buyerId: buyer.id,
      phone: buyer.phone,
      message: whatsappMessage,
    },
    {
      delay: settings.whatsapp_delay * 60 * 1000, // Convert minutes to ms
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 60000,
      },
    }
  );

  // Schedule SMS message if enabled
  if (settings.sms_enabled) {
    await smsQueue.add(
      'send-sms',
      {
        orderId: order.id,
        clientId: order.client_id,
        buyerId: buyer.id,
        phone: buyer.phone,
        message: smsMessage,
      },
      {
        delay: settings.sms_delay * 60 * 1000, // Convert minutes to ms
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000,
        },
      }
    );
  }

  console.log(`✅ Scheduled messages for order ${order.order_number} (${language}):`);
  console.log(`   - WhatsApp in ${settings.whatsapp_delay} minutes`);
  if (settings.sms_enabled) {
    console.log(`   - SMS in ${settings.sms_delay} minutes`);
  }
}

export { connection };
