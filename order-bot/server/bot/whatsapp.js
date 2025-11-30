import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeInMemoryStore,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { Order } from '../models/Order.js';
import { Message } from '../models/Message.js';

let sock = null;
let isConnected = false;

const logger = pino({ level: 'silent' });

export async function initWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState(
    process.env.WHATSAPP_SESSION_PATH || './whatsapp-session'
  );

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱 Scan this QR code with WhatsApp:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log(
        'Connection closed. Reconnecting:',
        shouldReconnect
      );

      isConnected = false;

      if (shouldReconnect) {
        initWhatsAppBot();
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp bot connected successfully!');
      isConnected = true;
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    // Handle incoming messages if needed
    const msg = messages[0];
    if (!msg.key.fromMe && msg.message) {
      console.log('Received message:', msg.message);
    }
  });

  return sock;
}

export async function sendWhatsAppMessage(phone, message, orderId, clientId, buyerId) {
  if (!sock || !isConnected) {
    throw new Error('WhatsApp bot is not connected');
  }

  try {
    // Format phone number (remove + and add country code if needed)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.includes('@')) {
      formattedPhone = `${formattedPhone}@s.whatsapp.net`;
    }

    // Log message to database
    const messageLog = await Message.create({
      order_id: orderId,
      client_id: clientId,
      buyer_id: buyerId,
      message_type: 'whatsapp',
      recipient_phone: phone,
      message_content: message,
    });

    // Send message
    await sock.sendMessage(formattedPhone, { text: message });

    // Update message status
    await Message.updateStatus(messageLog.id, 'sent');

    // Mark order as WhatsApp sent
    await Order.markWhatsAppSent(orderId);

    console.log(`✅ WhatsApp message sent to ${phone}`);

    return { success: true, messageId: messageLog.id };
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);

    // Log failure
    const messageLog = await Message.create({
      order_id: orderId,
      client_id: clientId,
      buyer_id: buyerId,
      message_type: 'whatsapp',
      recipient_phone: phone,
      message_content: message,
    });

    await Message.updateStatus(messageLog.id, 'failed', error.message);

    throw error;
  }
}

export function isWhatsAppConnected() {
  return isConnected;
}

export function getWhatsAppSocket() {
  return sock;
}
