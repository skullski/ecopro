import express from 'express';
import { Message } from '../models/Message.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get message logs for a client (protected route)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clientId = req.clientId;

    const messages = await Message.findByClientId(clientId);

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get messages for a specific order (protected route)
router.get('/order/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    const messages = await Message.findByOrderId(orderId);

    res.json({ messages });
  } catch (error) {
    console.error('Get order messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;
