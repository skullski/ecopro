import { RequestHandler } from "express";
import { pool } from "../utils/database";

// Get bot settings for the current client
export const getBotSettings: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get bot settings from database
    const result = await pool.query(
      `SELECT * FROM bot_settings WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default settings
      return res.json({
        enabled: false,
        language: 'ar',
        whatsappDelay: 5,
        smsDelay: 30,
        companyName: '',
        supportPhone: '',
        storeUrl: '',
        whatsappTemplate: `السلام عليكم {customerName}! 🌟

شكراً لك على طلبك من {companyName}! 

📦 تفاصيل الطلب:
• المنتج: {productName}
• السعر: {totalPrice} دج
• العنوان: {address}

هل تؤكد الطلب؟ رد ب "نعم" للتأكيد أو "لا" للإلغاء.

للمساعدة: {supportPhone}`,
        smsTemplate: `مرحبا {customerName}! طلبك #{orderId} من {companyName} بـ {totalPrice} دج. رد "نعم" للتأكيد. {supportPhone}`
      });
    }

    const settings = result.rows[0];
    
    // Parse JSON fields
    const response = {
      enabled: settings.enabled,
      language: settings.language,
      whatsappDelay: settings.whatsapp_delay,
      smsDelay: settings.sms_delay,
      companyName: settings.company_name,
      supportPhone: settings.support_phone,
      storeUrl: settings.store_url,
      whatsappTemplate: settings.whatsapp_template,
      smsTemplate: settings.sms_template
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
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      enabled,
      language,
      whatsappDelay,
      smsDelay,
      companyName,
      supportPhone,
      storeUrl,
      whatsappTemplate,
      smsTemplate
    } = req.body;

    // Check if settings exist
    const existingResult = await pool.query(
      `SELECT id FROM bot_settings WHERE user_id = $1`,
      [userId]
    );

    if (existingResult.rows.length === 0) {
      // Insert new settings
      await pool.query(
        `INSERT INTO bot_settings (
          user_id, enabled, language, whatsapp_delay, sms_delay,
          company_name, support_phone, store_url,
          whatsapp_template, sms_template, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          userId, enabled, language, whatsappDelay, smsDelay,
          companyName, supportPhone, storeUrl,
          whatsappTemplate, smsTemplate
        ]
      );
    } else {
      // Update existing settings
      await pool.query(
        `UPDATE bot_settings SET
          enabled = $2,
          language = $3,
          whatsapp_delay = $4,
          sms_delay = $5,
          company_name = $6,
          support_phone = $7,
          store_url = $8,
          whatsapp_template = $9,
          sms_template = $10,
          updated_at = NOW()
        WHERE user_id = $1`,
        [
          userId, enabled, language, whatsappDelay, smsDelay,
          companyName, supportPhone, storeUrl,
          whatsappTemplate, smsTemplate
        ]
      );
    }

    res.json({ success: true, message: 'Bot settings updated successfully' });
  } catch (error) {
    console.error('Error updating bot settings:', error);
    res.status(500).json({ error: 'Failed to update bot settings' });
  }
};
