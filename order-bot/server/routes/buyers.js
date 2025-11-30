import express from 'express';
import { Buyer } from '../models/Buyer.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create new buyer (protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const clientId = req.clientId;

    // Check if buyer with this phone already exists for this client
    const existing = await Buyer.findByPhone(phone, clientId);
    if (existing) {
      return res.status(400).json({ error: 'Buyer with this phone already exists' });
    }

    const buyer = await Buyer.create({
      client_id: clientId,
      name,
      phone,
      email,
      address,
    });

    res.status(201).json({ buyer });
  } catch (error) {
    console.error('Buyer creation error:', error);
    res.status(500).json({ error: 'Failed to create buyer' });
  }
});

// Get all buyers for a client (protected route)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clientId = req.clientId;
    const { search } = req.query;

    let buyers;
    
    if (search) {
      buyers = await Buyer.search(clientId, search);
    } else {
      buyers = await Buyer.findByClientId(clientId);
    }

    res.json({ buyers });
  } catch (error) {
    console.error('Get buyers error:', error);
    res.status(500).json({ error: 'Failed to get buyers' });
  }
});

// Get single buyer (protected route)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.clientId;

    const buyer = await Buyer.findById(id);

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    if (buyer.client_id !== clientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ buyer });
  } catch (error) {
    console.error('Get buyer error:', error);
    res.status(500).json({ error: 'Failed to get buyer' });
  }
});

// Update buyer (protected route)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.clientId;
    const { name, phone, email, address } = req.body;

    const buyer = await Buyer.findById(id);

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    if (buyer.client_id !== clientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedBuyer = await Buyer.update(id, { name, phone, email, address });

    res.json({ buyer: updatedBuyer });
  } catch (error) {
    console.error('Update buyer error:', error);
    res.status(500).json({ error: 'Failed to update buyer' });
  }
});

export default router;
