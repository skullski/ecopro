import { Worker } from 'bullmq';
import { connection } from '../queue/index.js';
import { sendWhatsAppMessage } from './whatsapp.js';
import { sendSMS } from './sms.js';

// WhatsApp message worker
export const whatsappWorker = new Worker(
  'whatsapp-messages',
  async (job) => {
    const { orderId, clientId, buyerId, phone, message } = job.data;

    console.log(`Processing WhatsApp message for order ${orderId}...`);

    try {
      await sendWhatsAppMessage(phone, message, orderId, clientId, buyerId);
      return { success: true };
    } catch (error) {
      console.error('WhatsApp worker error:', error);
      throw error;
    }
  },
  { connection }
);

// SMS message worker
export const smsWorker = new Worker(
  'sms-messages',
  async (job) => {
    const { orderId, clientId, buyerId, phone, message } = job.data;

    console.log(`Processing SMS message for order ${orderId}...`);

    try {
      await sendSMS(phone, message, orderId, clientId, buyerId);
      return { success: true };
    } catch (error) {
      console.error('SMS worker error:', error);
      throw error;
    }
  },
  { connection }
);

whatsappWorker.on('completed', (job) => {
  console.log(`✅ WhatsApp job ${job.id} completed`);
});

whatsappWorker.on('failed', (job, err) => {
  console.error(`❌ WhatsApp job ${job.id} failed:`, err);
});

smsWorker.on('completed', (job) => {
  console.log(`✅ SMS job ${job.id} completed`);
});

smsWorker.on('failed', (job, err) => {
  console.error(`❌ SMS job ${job.id} failed:`, err);
});

console.log('✅ Message workers started');
