import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import buyerRoutes from './routes/buyers.js';
import messageRoutes from './routes/messages.js';
import webhookRoutes from './routes/webhook.js';
import botSettingsRoutes from './routes/bot-settings.js';
import productRoutes from './routes/products.js';
import analyticsRoutes from './routes/analytics.js';
import storefrontRoutes from './routes/storefront.js';
import { whatsappWorker, smsWorker } from './bot/workers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/bot-settings', botSettingsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/storefront', storefrontRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   - POST /api/auth/register - Client registration`);
  console.log(`   - POST /api/auth/login - Client login`);
  console.log(`   - GET  /api/orders - View client orders`);
  console.log(`   - POST /api/orders/webhook - Receive orders from external stores`);
  console.log(`   - GET  /api/orders/confirm/:token - Buyer confirmation page`);
  console.log(`   - POST /api/orders/confirm/:token - Buyer confirms order`);
  console.log(`   - GET  /api/buyers - View buyers`);
  console.log(`   - GET  /api/messages - View message logs`);
  console.log(`\n✅ Message workers are running`);
  console.log(`🤖 Bot will monitor for new orders automatically`);
});

// WebSocket for real-time updates
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('📡 Client connected to WebSocket');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });

  ws.on('close', () => {
    console.log('📡 Client disconnected from WebSocket');
  });
});

// Broadcast function for order updates
export function broadcastOrderUpdate(order) {
  const message = JSON.stringify({
    type: 'order-update',
    order,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down server...');
  whatsappWorker.close();
  smsWorker.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
