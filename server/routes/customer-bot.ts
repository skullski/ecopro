import { Router, Request, Response } from 'express';
import { ensureConnection } from '../utils/database';
import { sendWhatsAppMessage } from '../utils/messaging';
import { sendTelegramMessage } from '../utils/bot-messaging';

const router = Router();

// Get customer segments counts for the dashboard
router.get('/segments', async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pool = await ensureConnection();
    
    // Get counts for each segment
    const [allOrders, completed, cancelled, pending, failedDelivery] = await Promise.all([
      // All customers who ever placed an order
      pool.query(`
        SELECT COUNT(DISTINCT customer_phone) as count 
        FROM store_orders 
        WHERE client_id = $1 AND customer_phone IS NOT NULL AND customer_phone != ''
      `, [clientId]),
      
      // Completed/Delivered orders
      pool.query(`
        SELECT COUNT(DISTINCT customer_phone) as count 
        FROM store_orders 
        WHERE client_id = $1 AND status = 'delivered' AND customer_phone IS NOT NULL AND customer_phone != ''
      `, [clientId]),
      
      // Cancelled orders
      pool.query(`
        SELECT COUNT(DISTINCT customer_phone) as count 
        FROM store_orders 
        WHERE client_id = $1 AND status IN ('cancelled','declined') AND customer_phone IS NOT NULL AND customer_phone != ''
      `, [clientId]),
      
      // Pending orders
      pool.query(`
        SELECT COUNT(DISTINCT customer_phone) as count 
        FROM store_orders 
        WHERE client_id = $1 AND status = 'pending' AND customer_phone IS NOT NULL AND customer_phone != ''
      `, [clientId]),
      
      // Failed delivery (returned, failed, etc.)
      pool.query(`
        SELECT COUNT(DISTINCT customer_phone) as count 
        FROM store_orders 
        WHERE client_id = $1 AND (
          status IN ('returned','failed','didnt_pickup','delivery_failed')
          OR delivery_status = 'failed'
        )
        AND customer_phone IS NOT NULL AND customer_phone != ''
      `, [clientId]),
    ]);

    res.json({
      all: parseInt(allOrders.rows[0]?.count || '0'),
      completed: parseInt(completed.rows[0]?.count || '0'),
      cancelled: parseInt(cancelled.rows[0]?.count || '0'),
      pending: parseInt(pending.rows[0]?.count || '0'),
      failed_delivery: parseInt(failedDelivery.rows[0]?.count || '0'),
    });
  } catch (error) {
    console.error('Error getting customer segments:', error);
    res.status(500).json({ error: 'Failed to get customer segments' });
  }
});

// Get customers by segment
router.get('/customers/:segment', async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { segment } = req.params;
    const pool = await ensureConnection();
    
    let whereClause = '';
    switch (segment) {
      case 'all':
        whereClause = '';
        break;
      case 'completed':
        whereClause = "AND status = 'delivered'";
        break;
      case 'cancelled':
        whereClause = "AND status IN ('cancelled','declined')";
        break;
      case 'pending':
        whereClause = "AND status = 'pending'";
        break;
      case 'failed_delivery':
        whereClause = "AND (status IN ('returned','failed','didnt_pickup','delivery_failed') OR delivery_status = 'failed')";
        break;
      default:
        return res.status(400).json({ error: 'Invalid segment' });
    }

    // Use DISTINCT ON to get the latest order per customer, plus a window count.
    // (Avoid aggregates here; DISTINCT ON + aggregate causes GROUP BY errors.)
    const result = await pool.query(`
      SELECT
        customer_phone,
        customer_name,
        customer_email,
        created_at as last_order_date,
        order_count
      FROM (
        SELECT DISTINCT ON (customer_phone)
          customer_phone,
          customer_name,
          customer_email,
          created_at,
          COUNT(*) OVER (PARTITION BY customer_phone) as order_count
        FROM store_orders
        WHERE client_id = $1
          AND customer_phone IS NOT NULL
          AND customer_phone != ''
          ${whereClause}
        ORDER BY customer_phone, created_at DESC
      ) t
      ORDER BY last_order_date DESC
      LIMIT 500
    `, [clientId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
});

// Get all campaigns for the store owner
router.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pool = await ensureConnection();
    const result = await pool.query(`
      SELECT * FROM message_campaigns 
      WHERE client_id = $1 
      ORDER BY created_at DESC
      LIMIT 50
    `, [clientId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting campaigns:', error);
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

// Create a new campaign
router.post('/campaigns', async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, message, target_category, channel } = req.body;

    if (!name || !message || !target_category) {
      return res.status(400).json({ error: 'Missing required fields: name, message, target_category' });
    }

    const pool = await ensureConnection();

    // Default channel to the store's configured provider (keeps UX "easy")
    const settingsRes = await pool.query(
      `SELECT provider, updates_enabled
       FROM bot_settings
       WHERE client_id = $1
       LIMIT 1`,
      [clientId]
    );
    const provider = String(settingsRes.rows[0]?.provider || 'telegram');
    const updatesEnabled = !!settingsRes.rows[0]?.updates_enabled;
    if (!updatesEnabled) {
      return res.status(400).json({ error: 'Updates bot is disabled in settings' });
    }

    const requestedChannel = channel ? String(channel) : provider;
    // Backwards compatibility: UI uses "whatsapp" but backend expects WhatsApp Cloud.
    const normalizedChannel = requestedChannel === 'whatsapp' ? 'whatsapp_cloud' : requestedChannel;

    const result = await pool.query(`
      INSERT INTO message_campaigns (client_id, name, message, target_category, channel, status)
      VALUES ($1, $2, $3, $4, $5, 'draft')
      RETURNING *
    `, [clientId, name, message, target_category, normalizedChannel]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Send a campaign
router.post('/campaigns/:id/send', async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const pool = await ensureConnection();

    // Get the campaign
    const campaignResult = await pool.query(
      'SELECT * FROM message_campaigns WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];
    
    if (campaign.status === 'sent') {
      return res.status(400).json({ error: 'Campaign already sent' });
    }

    // Get customers for this segment
    let whereClause = '';
    switch (campaign.target_category) {
      case 'completed':
        whereClause = "AND status = 'delivered'";
        break;
      case 'cancelled':
        whereClause = "AND status IN ('cancelled','declined')";
        break;
      case 'pending':
        whereClause = "AND status = 'pending'";
        break;
      case 'failed_delivery':
        whereClause = "AND (status IN ('returned','failed','didnt_pickup','delivery_failed') OR delivery_status = 'failed')";
        break;
      default:
        whereClause = '';
    }

    const customersResult = await pool.query(`
      SELECT DISTINCT ON (customer_phone)
        id as order_id,
        customer_phone, 
        customer_name, 
        customer_email
      FROM store_orders 
      WHERE client_id = $1 
        AND customer_phone IS NOT NULL 
        AND customer_phone != ''
        ${whereClause}
      ORDER BY customer_phone, created_at DESC
    `, [clientId]);

    const customers = customersResult.rows;
    
    if (customers.length === 0) {
      return res.status(400).json({ error: 'No customers found for this segment' });
    }

    // Update campaign status to sending
    await pool.query(
      'UPDATE message_campaigns SET status = $1, recipients_count = $2, updated_at = NOW() WHERE id = $3 AND client_id = $4',
      ['sending', customers.length, id, clientId]
    );

    // Load bot settings for channel dispatch
    const botSettingsRes = await pool.query(
      `SELECT updates_enabled, provider, whatsapp_phone_id, whatsapp_token, telegram_bot_token
       FROM bot_settings
       WHERE client_id = $1
       LIMIT 1`,
      [clientId]
    );
    const botSettings = botSettingsRes.rows[0];
    if (!botSettings?.updates_enabled) {
      return res.status(400).json({ error: 'Updates bot is disabled in settings' });
    }

    // Send messages to each customer
    let sentCount = 0;
    let failedCount = 0;

    for (const customer of customers) {
      try {
        // Personalize message with customer name
        const personalizedMessage = campaign.message
          .replace(/{name}/gi, customer.customer_name || 'Valued Customer')
          .replace(/{phone}/gi, customer.customer_phone || '');

        const channel = String(campaign.channel || botSettings?.provider || 'telegram');

        if (channel === 'whatsapp_cloud' || channel === 'whatsapp') {
          if (!botSettings?.whatsapp_token || !botSettings?.whatsapp_phone_id) {
            throw new Error('WhatsApp Cloud credentials missing in bot settings');
          }
          await sendWhatsAppMessage(customer.customer_phone, personalizedMessage, {
            token: String(botSettings.whatsapp_token),
            phoneId: String(botSettings.whatsapp_phone_id),
          });
        } else if (channel === 'telegram') {
          if (!botSettings?.telegram_bot_token) {
            throw new Error('Telegram bot token missing in bot settings');
          }
          const chatRes = await pool.query(
            `SELECT telegram_chat_id
             FROM customer_messaging_ids
             WHERE client_id = $1 AND customer_phone = $2 AND telegram_chat_id IS NOT NULL
             LIMIT 1`,
            [clientId, String(customer.customer_phone || '').replace(/\D/g, '')]
          );
          const chatId = chatRes.rows[0]?.telegram_chat_id;
          if (!chatId) {
            throw new Error('Customer not connected on Telegram');
          }
          await sendTelegramMessage(String(botSettings.telegram_bot_token), String(chatId), personalizedMessage);
        } else {
          throw new Error(`Unsupported channel: ${channel}`);
        }

        // Log success
        await pool.query(`
          INSERT INTO message_logs (campaign_id, client_id, customer_phone, customer_email, customer_name, order_id, channel, status, sent_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent', NOW())
        `, [id, clientId, customer.customer_phone, customer.customer_email, customer.customer_name, customer.order_id, campaign.channel]);

        sentCount++;
      } catch (sendError: any) {
        console.error(`Failed to send message to ${customer.customer_phone}:`, sendError);
        
        // Log failure
        await pool.query(`
          INSERT INTO message_logs (campaign_id, client_id, customer_phone, customer_email, customer_name, order_id, channel, status, error_message)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'failed', $8)
        `, [id, clientId, customer.customer_phone, customer.customer_email, customer.customer_name, customer.order_id, campaign.channel, sendError.message]);

        failedCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update campaign with final counts
    await pool.query(`
      UPDATE message_campaigns 
      SET status = 'sent', sent_count = $1, failed_count = $2, sent_at = NOW(), updated_at = NOW() 
      WHERE id = $3
    `, [sentCount, failedCount, id]);

    res.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: customers.length,
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

// Delete a campaign
router.delete('/campaigns/:id', async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const pool = await ensureConnection();

    await pool.query(
      'DELETE FROM message_campaigns WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// Get campaign logs
router.get('/campaigns/:id/logs', async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const pool = await ensureConnection();

    // Verify campaign belongs to client
    const campaignCheck = await pool.query(
      'SELECT id FROM message_campaigns WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );

    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const result = await pool.query(`
      SELECT * FROM message_logs 
      WHERE campaign_id = $1 
      ORDER BY created_at DESC
      LIMIT 100
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting campaign logs:', error);
    res.status(500).json({ error: 'Failed to get campaign logs' });
  }
});

export default router;
