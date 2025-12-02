import { RequestHandler } from "express";
import { pool } from "../utils/database";

// Get bot settings for the current client
export const getBotSettings: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get bot settings from database
    const result = await pool.query(
      `SELECT * FROM bot_settings WHERE client_id = $1`,
      [clientId]
    );

    if (result.rows.length === 0) {
      // Return default settings
      return res.json({
        enabled: true,
        provider: 'whatsapp_cloud',
        whatsappPhoneId: '',
        whatsappToken: '',
        templateOrderConfirmation: `السلام عليكم {customerName}! 🌟\n\nشكراً لك على طلبك من {companyName}! \n\n📦 تفاصيل الطلب:\n• المنتج: {productName}\n• السعر: {totalPrice} دج\n• العنوان: {address}\n\nهل تؤكد الطلب؟ رد ب "نعم" للتأكيد أو "لا" للإلغاء.`,
        templatePayment: `تم تأكيد طلبك #{orderId}. يرجى الدفع بـ {totalPrice} دج.`,
        templateShipping: `تم شحن طلبك #{orderId}. رقم التتبع: {trackingNumber}.`
      });
    }

    const settings = result.rows[0];
    const response = {
      enabled: settings.enabled,
      provider: settings.provider,
      whatsappPhoneId: settings.whatsapp_phone_id,
      whatsappToken: settings.whatsapp_token,
      templateOrderConfirmation: settings.template_order_confirmation,
      templatePayment: settings.template_payment,
      templateShipping: settings.template_shipping,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching bot settings:', error);
    res.status(500).json({ error: 'Failed to fetch bot settings' });
  }
};

// Update bot settings for the current client
export const updateBotSettings: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user?.id;
    
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      enabled,
      provider,
      whatsappPhoneId,
      whatsappToken,
      templateOrderConfirmation,
      templatePayment,
      templateShipping
    } = req.body;

    // Check if settings exist
    const existingResult = await pool.query(
      `SELECT id FROM bot_settings WHERE client_id = $1`,
      [clientId]
    );

    if (existingResult.rows.length === 0) {
      // Insert new settings
      await pool.query(
        `INSERT INTO bot_settings (
          client_id, enabled, provider, whatsapp_phone_id, whatsapp_token,
          template_order_confirmation, template_payment, template_shipping,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          clientId, enabled ?? true, provider ?? 'whatsapp_cloud', whatsappPhoneId ?? null, whatsappToken ?? null,
          templateOrderConfirmation ?? null, templatePayment ?? null, templateShipping ?? null
        ]
      );
    } else {
      // Update existing settings
      await pool.query(
        `UPDATE bot_settings SET
          enabled = $2,
          provider = $3,
          whatsapp_phone_id = $4,
          whatsapp_token = $5,
          template_order_confirmation = $6,
          template_payment = $7,
          template_shipping = $8,
          updated_at = NOW()
        WHERE client_id = $1`,
        [
          clientId, enabled ?? true, provider ?? 'whatsapp_cloud', whatsappPhoneId ?? null, whatsappToken ?? null,
          templateOrderConfirmation ?? null, templatePayment ?? null, templateShipping ?? null
        ]
      );
    }

    res.json({ success: true, message: 'Bot settings updated successfully' });
  } catch (error) {
    console.error('Error updating bot settings:', error);
    res.status(500).json({ error: 'Failed to update bot settings' });
  }
};
