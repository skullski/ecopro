import express from 'express';
import { BotSettings } from '../models/BotSettings.js';
import { Client } from '../models/Client.js';
import { authMiddleware } from '../middleware/auth.js';
import { getTranslation, replaceVariables } from '../utils/translations.js';

const router = express.Router();

// Get bot settings for authenticated client
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clientId = req.clientId;
    const settings = await BotSettings.getByClientId(clientId);
    res.json({ settings });
  } catch (error) {
    console.error('Get bot settings error:', error);
    res.status(500).json({ error: 'Failed to get bot settings' });
  }
});

// Update bot settings
router.put('/', authMiddleware, async (req, res) => {
  try {
    const clientId = req.clientId;
    const updates = req.body;

    // Ensure settings exist first
    await BotSettings.getByClientId(clientId);

    // Update settings
    const settings = await BotSettings.update(clientId, updates);

    // If language changed, also update client table
    if (updates.language) {
      await Client.updateLanguage(clientId, updates.language);
    }

    res.json({ settings, message: 'Bot settings updated successfully' });
  } catch (error) {
    console.error('Update bot settings error:', error);
    res.status(500).json({ error: 'Failed to update bot settings' });
  }
});

// Preview message with sample data
router.post('/preview', authMiddleware, async (req, res) => {
  try {
    const { template, type } = req.body;

    if (!template || !type) {
      return res.status(400).json({ error: 'Template and type required' });
    }

    // Sample data for preview
    const sampleData = {
      buyer_name: 'Ahmed Ali',
      order_number: 'ORD123456',
      product_name: 'Samsung Galaxy S23',
      quantity: '2',
      total_price: '150,000',
      confirmation_link: 'https://yourbot.com/confirm?token=abc123',
      company_name: 'Tech Store DZ',
      support_phone: '+213555123456',
      store_url: 'https://facebook.com/techstore',
    };

    const preview = BotSettings.replaceVariables(template, sampleData);

    res.json({ preview });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

export default router;
