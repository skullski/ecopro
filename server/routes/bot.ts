import { RequestHandler } from "express";
import { pool } from "../utils/database";
import { registerTelegramWebhook, upsertTelegramWebhookSecret } from "../utils/telegram";

async function getClientAccessState(clientId: string | number): Promise<{ allowBot: boolean; reason?: string }>
{
  // Payment lock: allow login but do not allow bot usage
  try {
    const lockRes = await pool.query(
      `SELECT is_locked, locked_reason, lock_type FROM clients WHERE id = $1`,
      [clientId]
    );
    if (lockRes.rows.length) {
      const row = lockRes.rows[0];
      const lockType = row.lock_type || (typeof row.locked_reason === 'string' && /(subscription|expired|payment|trial|billing)/i.test(row.locked_reason)
        ? 'payment'
        : 'critical');
      if (row.is_locked && lockType === 'payment') {
        return { allowBot: false, reason: 'Account locked for payment. Please renew to enable the bot.' };
      }
    }
  } catch {
    // If the lock columns aren't present, skip this check.
  }

  // Subscription check
  const subRes = await pool.query(
    `SELECT status, trial_ends_at, current_period_end FROM subscriptions WHERE user_id = $1`,
    [clientId]
  );
  if (!subRes.rows.length) {
    return { allowBot: false, reason: 'No subscription found. Please renew to enable the bot.' };
  }

  const sub = subRes.rows[0];
  const now = new Date();
  if (sub.status === 'trial') {
    const trialEnd = sub.trial_ends_at ? new Date(sub.trial_ends_at) : null;
    if (trialEnd && now < trialEnd) return { allowBot: true };
    return { allowBot: false, reason: 'Trial ended. Please renew to enable the bot.' };
  }

  if (sub.status === 'active') {
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;
    if (!periodEnd || now < periodEnd) return { allowBot: true };
    return { allowBot: false, reason: 'Subscription ended. Please renew to enable the bot.' };
  }

  return { allowBot: false, reason: 'Subscription ended. Please renew to enable the bot.' };
}

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
      const access = await getClientAccessState(clientId);
      return res.json({
        enabled: access.allowBot,
        provider: 'telegram',
        whatsappPhoneId: '',
        whatsappToken: '',
        telegramBotToken: '',
        telegramBotUsername: '',
        viberAuthToken: '',
        viberSenderName: '',
        templateGreeting: `Thank you for ordering from {storeName}, {customerName}!\n\n✅ Enable notifications on Telegram to receive order confirmation and tracking updates.`,
        templateOrderConfirmation: `Hello {customerName}! 🌟\n\nThank you for your order from {companyName}! \n\n📦 Order Details:\n• Product: {productName}\n• Price: {totalPrice} DZD\n• Address: {address}\n\nDo you confirm the order? Reply "Yes" to confirm or "No" to cancel.`,
        templatePayment: `Your order #{orderId} has been confirmed. Please pay {totalPrice} DZD.`,
        templateShipping: `Your order #{orderId} has been shipped. Tracking number: {trackingNumber}.`
      });
    }

    const settings = result.rows[0];
    const access = await getClientAccessState(clientId);
    // Force enabled=false in response if subscription/payment lock blocks bot usage
    const effectiveEnabled = !!settings.enabled && access.allowBot;
    if (!access.allowBot && settings.enabled) {
      // Hard-stop the bot at the source so it cannot run while locked.
      await pool.query(
        `UPDATE bot_settings SET enabled = false, updated_at = NOW() WHERE client_id = $1`,
        [clientId]
      );
    }

    const response = {
      enabled: effectiveEnabled,
      updatesEnabled: !!settings.updates_enabled,
      trackingEnabled: !!settings.tracking_enabled,
      provider: settings.provider || 'telegram',
      whatsappPhoneId: settings.whatsapp_phone_id,
      whatsappToken: settings.whatsapp_token,
      telegramBotToken: settings.telegram_bot_token,
      telegramBotUsername: settings.telegram_bot_username,
      telegramDelayMinutes: settings.telegram_delay_minutes || 5,
      autoExpireHours: settings.auto_expire_hours || 24,
      viberAuthToken: settings.viber_auth_token,
      viberSenderName: settings.viber_sender_name,
      templateGreeting: settings.template_greeting,
      templateInstantOrder: settings.template_instant_order,
      templatePinInstructions: settings.template_pin_instructions,
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
      updatesEnabled,
      trackingEnabled,
      provider,
      whatsappPhoneId,
      whatsappToken,
      telegramBotToken,
      telegramBotUsername,
      telegramDelayMinutes,
      autoExpireHours,
      viberAuthToken,
      viberSenderName,
      templateGreeting,
      templateInstantOrder,
      templatePinInstructions,
      templateOrderConfirmation,
      templatePayment,
      templateShipping
    } = req.body;

    const effectiveProvider = provider ?? 'telegram';

    // Do not allow enabling the bot while subscription is ended or payment-locked.
    if (enabled === true) {
      const access = await getClientAccessState(clientId);
      if (!access.allowBot) {
        return res.status(403).json({
          error: access.reason || 'Subscription ended. Please renew to enable the bot.',
          paymentRequired: true,
          code: 'SUBSCRIPTION_REQUIRED_FOR_BOT'
        });
      }
    }

    // Check if settings exist
    const existingResult = await pool.query(
      `SELECT id FROM bot_settings WHERE client_id = $1`,
      [clientId]
    );

    if (existingResult.rows.length === 0) {
      // Insert new settings
      await pool.query(
        `INSERT INTO bot_settings (
          client_id, enabled, updates_enabled, tracking_enabled, provider, whatsapp_phone_id, whatsapp_token,
          telegram_bot_token, telegram_delay_minutes, auto_expire_hours, viber_auth_token, viber_sender_name,
          telegram_bot_username, telegram_webhook_secret,
          template_greeting, template_instant_order, template_pin_instructions, template_order_confirmation, template_payment, template_shipping,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())`,
        [
          clientId,
          enabled ?? true,
          updatesEnabled ?? false,
          trackingEnabled ?? false,
          effectiveProvider,
          whatsappPhoneId ?? null,
          whatsappToken ?? null,
          telegramBotToken ?? null,
          telegramDelayMinutes ?? 5,
          autoExpireHours ?? 24,
          viberAuthToken ?? null,
          viberSenderName ?? null,
          telegramBotUsername ?? null,
          null,
          templateGreeting ?? null,
          templateInstantOrder ?? null,
          templatePinInstructions ?? null,
          templateOrderConfirmation ?? null,
          templatePayment ?? null,
          templateShipping ?? null,
        ]
      );
    } else {
      // Update existing settings
      await pool.query(
        `UPDATE bot_settings SET
          enabled = $2,
          updates_enabled = $3,
          tracking_enabled = $4,
          provider = $5,
          whatsapp_phone_id = $6,
          whatsapp_token = $7,
          telegram_bot_token = $8,
          telegram_delay_minutes = $9,
          auto_expire_hours = $10,
          viber_auth_token = $11,
          viber_sender_name = $12,
          telegram_bot_username = $13,
          template_greeting = $14,
          template_instant_order = $15,
          template_pin_instructions = $16,
          template_order_confirmation = $17,
          template_payment = $18,
          template_shipping = $19,
          updated_at = NOW()
        WHERE client_id = $1`,
        [
          clientId,
          enabled ?? true,
          updatesEnabled ?? false,
          trackingEnabled ?? false,
          effectiveProvider,
          whatsappPhoneId ?? null,
          whatsappToken ?? null,
          telegramBotToken ?? null,
          telegramDelayMinutes ?? 5,
          autoExpireHours ?? 24,
          viberAuthToken ?? null,
          viberSenderName ?? null,
          telegramBotUsername ?? null,
          templateGreeting ?? null,
          templateInstantOrder ?? null,
          templatePinInstructions ?? null,
          templateOrderConfirmation ?? null,
          templatePayment ?? null,
          templateShipping ?? null,
        ]
      );
    }

    // Auto-register Telegram webhook when Telegram is enabled/configured.
    if ((enabled ?? true) && effectiveProvider === 'telegram' && telegramBotToken && telegramBotUsername) {
      const secret = await upsertTelegramWebhookSecret(clientId);
      const baseUrl = process.env.BASE_URL || 'https://ecopro-1lbl.onrender.com';
      const hook = await registerTelegramWebhook({
        botToken: telegramBotToken,
        baseUrl,
        secretToken: secret,
      });
      if (!hook.ok) {
        console.warn('[Telegram] setWebhook failed:', hook.error);
        return res.status(400).json({
          error: hook.error || 'Failed to register Telegram webhook. Check token/username and BASE_URL.',
        });
      }
    }

    res.json({ success: true, message: 'Bot settings updated successfully' });
  } catch (error) {
    console.error('Error updating bot settings:', error);
    res.status(500).json({ error: 'Failed to update bot settings' });
  }
};
