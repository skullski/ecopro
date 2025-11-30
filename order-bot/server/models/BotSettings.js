import { query } from '../db/index.js';

export class BotSettings {
  // Get settings for a client (creates default if doesn't exist)
  static async getByClientId(clientId) {
    let result = await query(
      `SELECT bs.*, c.language 
       FROM bot_settings bs
       LEFT JOIN clients c ON c.id = bs.client_id
       WHERE bs.client_id = $1`,
      [clientId]
    );

    // If no settings exist, create default
    if (result.rows.length === 0) {
      result = await query(
        `INSERT INTO bot_settings (client_id)
         VALUES ($1)
         RETURNING *`,
        [clientId]
      );
      
      // Get language from client
      const clientResult = await query(
        'SELECT language FROM clients WHERE id = $1',
        [clientId]
      );
      result.rows[0].language = clientResult.rows[0]?.language || 'en';
    }

    return result.rows[0];
  }

  // Update settings
  static async update(clientId, settings) {
    const {
      language,
      whatsapp_template,
      sms_template,
      whatsapp_delay,
      sms_delay,
      sms_enabled,
      company_name,
      support_phone,
      store_url,
    } = settings;

    const result = await query(
      `UPDATE bot_settings 
       SET whatsapp_template = COALESCE($1, whatsapp_template),
           sms_template = COALESCE($2, sms_template),
           whatsapp_delay = COALESCE($3, whatsapp_delay),
           sms_delay = COALESCE($4, sms_delay),
           sms_enabled = COALESCE($5, sms_enabled),
           company_name = COALESCE($6, company_name),
           support_phone = COALESCE($7, support_phone),
           store_url = COALESCE($8, store_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE client_id = $9
       RETURNING *`,
      [
        whatsapp_template,
        sms_template,
        whatsapp_delay,
        sms_delay,
        sms_enabled,
        company_name,
        support_phone,
        store_url,
        clientId,
      ]
    );

    // Add language back from clients table
    if (result.rows[0]) {
      const clientResult = await query(
        'SELECT language FROM clients WHERE id = $1',
        [clientId]
      );
      result.rows[0].language = clientResult.rows[0]?.language || 'en';
    }

    return result.rows[0];
  }

  // Replace template variables with actual order data
  static replaceVariables(template, data) {
    const {
      buyer_name,
      order_number,
      product_name,
      quantity,
      total_price,
      confirmation_link,
      company_name,
      support_phone,
      store_url,
    } = data;

    return template
      .replace(/{buyer_name}/g, buyer_name || '')
      .replace(/{order_number}/g, order_number || '')
      .replace(/{product_name}/g, product_name || '')
      .replace(/{quantity}/g, quantity || '')
      .replace(/{total_price}/g, total_price || '')
      .replace(/{confirmation_link}/g, confirmation_link || '')
      .replace(/{company_name}/g, company_name || '')
      .replace(/{support_phone}/g, support_phone || '')
      .replace(/{store_url}/g, store_url || '');
  }
}
