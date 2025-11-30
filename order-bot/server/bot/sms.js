import { Order } from '../models/Order.js';
import { Message } from '../models/Message.js';

/**
 * SMS sending function - Placeholder for GSM modem integration
 * 
 * To integrate with a GSM modem:
 * 1. Install a library like 'serialport' for serial communication
 * 2. Connect to the modem using AT commands
 * 3. Send SMS using AT+CMGS command
 * 
 * Example with serialport:
 * const { SerialPort } = require('serialport');
 * const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
 * port.write('AT+CMGS="+213555123456"\r');
 * port.write('Your message\x1A');
 */

export async function sendSMS(phone, message, orderId, clientId, buyerId) {
  try {
    // Log message to database
    const messageLog = await Message.create({
      order_id: orderId,
      client_id: clientId,
      buyer_id: buyerId,
      message_type: 'sms',
      recipient_phone: phone,
      message_content: message,
    });

    // Placeholder: In production, replace this with actual GSM modem code
    if (process.env.SMS_ENABLED === 'true') {
      // TODO: Integrate with GSM modem or SMS gateway API
      // Example: await sendViaGSMModem(phone, message);
      console.log(`📱 SMS would be sent to ${phone}: ${message}`);
      
      // Simulate SMS sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      await Message.updateStatus(messageLog.id, 'sent');
    } else {
      // Testing mode - just log
      console.log(`📱 [TEST MODE] SMS to ${phone}:\n${message}\n`);
      await Message.updateStatus(messageLog.id, 'sent');
    }

    // Mark order as SMS sent
    await Order.markSMSSent(orderId);

    console.log(`✅ SMS sent to ${phone}`);

    return { success: true, messageId: messageLog.id };
  } catch (error) {
    console.error('Failed to send SMS:', error);

    // Log failure
    const messageLog = await Message.create({
      order_id: orderId,
      client_id: clientId,
      buyer_id: buyerId,
      message_type: 'sms',
      recipient_phone: phone,
      message_content: message,
    });

    await Message.updateStatus(messageLog.id, 'failed', error.message);

    throw error;
  }
}

/**
 * Example GSM modem integration (commented out)
 * 
 * import { SerialPort } from 'serialport';
 * 
 * async function sendViaGSMModem(phone, message) {
 *   return new Promise((resolve, reject) => {
 *     const port = new SerialPort({
 *       path: '/dev/ttyUSB0', // Adjust based on your modem
 *       baudRate: 9600
 *     });
 * 
 *     port.write('AT+CMGF=1\r', (err) => {
 *       if (err) return reject(err);
 *       
 *       setTimeout(() => {
 *         port.write(`AT+CMGS="${phone}"\r`, (err) => {
 *           if (err) return reject(err);
 *           
 *           setTimeout(() => {
 *             port.write(`${message}\x1A`, (err) => {
 *               if (err) return reject(err);
 *               port.close();
 *               resolve();
 *             });
 *           }, 500);
 *         });
 *       }, 500);
 *     });
 *   });
 * }
 */
