import express from 'express';
import crypto from 'crypto';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Buyer } from '../models/Buyer.js';
import { Client } from '../models/Client.js';
import { BotSettings } from '../models/BotSettings.js';
import { scheduleOrderMessages } from '../queue/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get storefront products for a client
router.get('/:clientId/products', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const products = await Product.findByClientId(clientId);
    
    // Only return active products with stock
    const availableProducts = products.filter(
      p => p.is_active && p.stock > 0
    );

    res.json({ products: availableProducts });
  } catch (error) {
    console.error('Get storefront products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get store info
router.get('/:clientId/info', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const client = await Client.findById(clientId);
    const settings = await BotSettings.getByClientId(clientId);

    if (!client) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({
      company_name: settings.company_name || client.company_name,
      support_phone: settings.support_phone || client.phone,
      store_url: settings.store_url,
    });
  } catch (error) {
    console.error('Get store info error:', error);
    res.status(500).json({ error: 'Failed to fetch store info' });
  }
});

// Place order from storefront (public endpoint)
router.post('/:clientId/orders', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get or create buyer
    const buyerData = orders[0].buyer;
    let buyer = await Buyer.findByPhone(clientId, buyerData.phone);

    if (!buyer) {
      buyer = await Buyer.create({
        client_id: clientId,
        name: buyerData.name,
        phone: buyerData.phone,
        email: buyerData.email || null,
        address: buyerData.address || null,
      });
    }

    // Create all orders
    const createdOrders = [];
    for (const orderData of orders) {
        const order = await Order.create({
          order_number: `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').slice(0, 5).toUpperCase()}`,
        client_id: clientId,
        buyer_id: buyer.id,
        product_id: orderData.product_id,
        product_name: orderData.product_name,
        quantity: orderData.quantity,
        total_price: orderData.total_price,
        confirmation_token: uuidv4(),
        wilaya: orderData.wilaya || null,
        commune: orderData.commune || null,
        shipping_address: buyerData.address || null,
        notes: orderData.notes || null,
      });

      createdOrders.push(order);

      // Update product stock
      await Product.updateStock(orderData.product_id, -orderData.quantity);

      // Schedule confirmation messages
      await scheduleOrderMessages(order, buyer);
    }

    res.json({
      message: 'Orders placed successfully',
      orders: createdOrders,
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

export default router;
