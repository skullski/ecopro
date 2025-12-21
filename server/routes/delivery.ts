// Delivery API Routes
import { Router, RequestHandler } from 'express';
import { pool } from '../utils/database';
import { DeliveryService } from '../services/delivery';
import {
  AssignDeliverySchema,
  GenerateLabelSchema,
  ConfigureIntegrationSchema,
} from '../types/delivery';
import { encryptData } from '../utils/encryption';

export const deliveryRouter = Router();

/**
 * GET /api/delivery/companies
 * Get list of available delivery companies
 */
export const getDeliveryCompanies: RequestHandler = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, features, is_active FROM delivery_companies WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('[Delivery] getDeliveryCompanies error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery companies' });
  }
};

/**
 * POST /api/delivery/integrations
 * Configure delivery integration for a client
 */
export const configureDeliveryIntegration: RequestHandler = async (req, res) => {
  try {
    const clientId = req.user?.id || (req.body.client_id as number);
    if (!clientId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = ConfigureIntegrationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Invalid input', details: validation.error });
      return;
    }

    const { delivery_company_id, api_key, api_secret, account_number, merchant_id, webhook_secret } =
      validation.data;

    // Verify company exists
    const companyCheck = await pool.query(
      'SELECT id FROM delivery_companies WHERE id = $1',
      [delivery_company_id]
    );

    if (companyCheck.rows.length === 0) {
      res.status(404).json({ error: 'Delivery company not found' });
      return;
    }

    // Upsert integration
    const encryptedKey = encryptData(api_key);
    const encryptedSecret = api_secret ? encryptData(api_secret) : null;
    const encryptedWebhookSecret = webhook_secret ? encryptData(webhook_secret) : null;

    const result = await pool.query(
      `INSERT INTO delivery_integrations
       (client_id, delivery_company_id, api_key_encrypted, api_secret_encrypted, account_number, merchant_id, webhook_secret_encrypted, configured_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (client_id, delivery_company_id)
       DO UPDATE SET
         api_key_encrypted = $3,
         api_secret_encrypted = $4,
         account_number = $5,
         merchant_id = $6,
         webhook_secret_encrypted = $7,
         updated_at = NOW()
       RETURNING id`,
      [clientId, delivery_company_id, encryptedKey, encryptedSecret, account_number, merchant_id, encryptedWebhookSecret]
    );

    res.json({ success: true, integration_id: result.rows[0].id });
  } catch (error: any) {
    console.error('[Delivery] configureDeliveryIntegration error:', error);
    res.status(500).json({ error: 'Failed to configure integration' });
  }
};

/**
 * POST /api/orders/:id/assign-delivery
 * Assign delivery company to an order
 */
export const assignDeliveryToOrder: RequestHandler = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const clientId = req.user?.id || (req.body.client_id as number);
    const { delivery_company_id, cod_amount } = req.body;

    if (!clientId || !delivery_company_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await DeliveryService.assignDeliveryCompany(orderId, clientId as number, Number(delivery_company_id), cod_amount);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Delivery] assignDeliveryToOrder error:', error);
    res.status(500).json({ error: 'Failed to assign delivery' });
  }
};

/**
 * POST /api/orders/:id/generate-label
 * Generate shipping label for an order
 */
export const generateShippingLabel: RequestHandler = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const clientId = req.user?.id || (req.body.client_id as number);
    const { delivery_company_id } = req.body;

    if (!clientId || !delivery_company_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await DeliveryService.generateLabel(orderId, clientId as number, Number(delivery_company_id));

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      success: true,
      tracking_number: result.tracking_number,
      label_url: result.label_url,
    });
  } catch (error: any) {
    console.error('[Delivery] generateShippingLabel error:', error);
    res.status(500).json({ error: 'Failed to generate label' });
  }
};

/**
 * GET /api/orders/:id/tracking
 * Get delivery tracking information
 */
export const getOrderTracking: RequestHandler = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const clientId = req.user?.id || (req.query.client_id as string | undefined);

    if (!clientId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await DeliveryService.getDeliveryStatus(orderId, parseInt(clientId));

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json(result);
  } catch (error: any) {
    console.error('[Delivery] getOrderTracking error:', error);
    res.status(500).json({ error: 'Failed to fetch tracking' });
  }
};

/**
 * POST /api/webhooks/delivery/:company
 * Receive webhook updates from courier
 */
export const handleDeliveryWebhook: RequestHandler = async (req, res) => {
  try {
    const companyName = req.params.company;
    const signature = req.headers['x-signature'] as string | undefined;
    const payload = req.body;

    const result = await DeliveryService.handleWebhook(companyName, payload, signature);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Delivery] handleDeliveryWebhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Register routes
deliveryRouter.get('/companies', getDeliveryCompanies);
deliveryRouter.post('/integrations', configureDeliveryIntegration);
deliveryRouter.post('/orders/:id/assign', assignDeliveryToOrder);
deliveryRouter.post('/orders/:id/generate-label', generateShippingLabel);
deliveryRouter.get('/orders/:id/tracking', getOrderTracking);
deliveryRouter.post('/webhooks/:company', handleDeliveryWebhook);

export default deliveryRouter;
