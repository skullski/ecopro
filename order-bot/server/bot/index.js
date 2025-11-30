import dotenv from 'dotenv';
import { initWhatsAppBot } from './whatsapp.js';
import { whatsappWorker, smsWorker } from './workers.js';
import { Order } from '../models/Order.js';
import { Buyer } from '../models/Buyer.js';
import { scheduleOrderMessages } from '../queue/index.js';

dotenv.config();

async function startBot() {
  console.log('🤖 Starting Order Confirmation Bot...\n');

  try {
    // Initialize WhatsApp bot
    await initWhatsAppBot();

    console.log('\n✅ Bot is running!');
    console.log('📋 Workers are processing queued messages');
    console.log('👀 Monitoring for new orders...\n');

    // Monitor for new unprocessed orders every 30 seconds
    setInterval(async () => {
      try {
        const unprocessedOrders = await Order.findUnprocessedOrders();
        
        if (unprocessedOrders.length > 0) {
          console.log(`📦 Found ${unprocessedOrders.length} new order(s) to process`);
        }
        
        for (const order of unprocessedOrders) {
          console.log(`   → Processing order #${order.order_number} for ${order.buyer_name}`);
          
          const buyer = await Buyer.findById(order.buyer_id);
          if (buyer) {
            await scheduleOrderMessages(order, buyer);
            console.log(`   ✓ Messages scheduled (WhatsApp: 2hrs, SMS: 4hrs)`);
          }
        }
      } catch (error) {
        console.error('❌ Error monitoring orders:', error.message);
      }
    }, 30000); // Check every 30 seconds

    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down bot...');
      whatsappWorker.close();
      smsWorker.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

startBot();
