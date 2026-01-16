import { RequestHandler } from "express";
import { pool } from "../utils/database";
import { registerTelegramWebhook, upsertTelegramWebhookSecret } from "../utils/telegram";
import { getPublicBaseUrl } from '../utils/public-url';

const PLATFORM_FB_PAGE_ID = String(process.env.PLATFORM_FB_PAGE_ID || '').trim();
const PLATFORM_FB_PAGE_ACCESS_TOKEN = String(process.env.PLATFORM_FB_PAGE_ACCESS_TOKEN || '').trim();
const PLATFORM_MESSENGER_AVAILABLE = !!PLATFORM_FB_PAGE_ID && !!PLATFORM_FB_PAGE_ACCESS_TOKEN;

async function getClientAccessState(clientId: string | number): Promise<{ allowBot: boolean; reason?: string }>
{
  // Check if user is locked - is_locked means subscription issue, bot should be disabled
  try {
    const lockRes = await pool.query(
      `SELECT is_locked, locked_reason FROM clients WHERE id = $1`,
      [clientId]
    );
    if (lockRes.rows.length && lockRes.rows[0].is_locked) {
      return { 
        allowBot: false, 
        reason: lockRes.rows[0].locked_reason || 'Account locked. Please renew your subscription to enable the bot.' 
      };
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
      // Return default settings with Arabic templates
      const access = await getClientAccessState(clientId);
      return res.json({
        enabled: access.allowBot,
        provider: 'telegram',
        whatsappPhoneId: '',
        whatsappToken: '',
        telegramBotToken: '',
        telegramBotUsername: '',
        telegramDelayMinutes: 5,
        autoExpireHours: 24,
        viberAuthToken: '',
        viberSenderName: '',
        messengerEnabled: false,
        fbPageId: '',
        fbPageAccessToken: '',
        messengerDelayMinutes: 5,
        platformMessengerAvailable: PLATFORM_MESSENGER_AVAILABLE,
        // Do not expose platform Page ID to store owners.
        platformMessengerPageId: '',
        templateGreeting: `شكراً لطلبك من {storeName}، {customerName}! 🎉\n\n✅ فعّل الإشعارات لتلقي تأكيد الطلب وتحديثات التتبع.`,
        templateInstantOrder: `🎉 شكراً لك {customerName}!\n\nتم استلام طلبك بنجاح ✅\n\n━━━━━━━━━━━━━━━━\n📦 تفاصيل الطلب\n━━━━━━━━━━━━━━━━\n🔢 رقم الطلب: #{orderId}\n📱 المنتج: {productName}\n💰 السعر: {totalPrice} دج\n📍 الكمية: {quantity}\n\n━━━━━━━━━━━━━━━━\n👤 معلومات التوصيل\n━━━━━━━━━━━━━━━━\n📛 الاسم: {customerName}\n📞 الهاتف: {customerPhone}\n🏠 العنوان: {address}\n\n━━━━━━━━━━━━━━━━\n🚚 حالة الطلب: قيد المعالجة\n━━━━━━━━━━━━━━━━\n\nسنتصل بك قريباً للتأكيد 📞\n\n⭐ من {storeName}`,
        templatePinInstructions: `📌 نصيحة مهمة:\n\nاضغط مطولاً على الرسالة السابقة واختر "تثبيت" لتتبع طلبك بسهولة!\n\n🔔 تأكد من:\n• تفعيل الإشعارات\n• عدم كتم المحادثة\n• ستتلقى تحديثات حالة الطلب هنا مباشرة`,
        templateOrderConfirmation: `مرحباً {customerName}! 🌟\n\nشكراً لطلبك من {companyName}!\n\n📦 تفاصيل الطلب:\n• المنتج: {productName}\n• السعر: {totalPrice} دج\n• العنوان: {address}\n\nهل تؤكد الطلب؟ اضغط ✅ للتأكيد أو ❌ للإلغاء.`,
        templatePayment: `تم تأكيد طلبك #{orderId}. المبلغ المطلوب: {totalPrice} دج.`,
        templateShipping: `تم شحن طلبك #{orderId}. رقم التتبع: {trackingNumber}.`
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
      messengerEnabled: !!settings.messenger_enabled,
      fbPageId: settings.fb_page_id || '',
      fbPageAccessToken: settings.fb_page_access_token || '',
      messengerDelayMinutes: settings.messenger_delay_minutes || 5,
      platformMessengerAvailable: PLATFORM_MESSENGER_AVAILABLE,
      // Do not expose platform Page ID to store owners.
      platformMessengerPageId: '',
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
      templateShipping,
      messengerEnabled,
      fbPageId,
      fbPageAccessToken,
      messengerDelayMinutes
    } = req.body;

    const effectiveProvider = provider ?? 'telegram';

    // If the platform shared Page is available and the client is pointing at it,
    // do not store a Page Access Token in the database. Use env-based token instead.
    // This avoids stale/invalid DB tokens causing OAuthException 190 failures.
    const normalizedFbPageId = typeof fbPageId === 'string' ? fbPageId.trim() : '';
    const usingPlatformPage = !!normalizedFbPageId && normalizedFbPageId === PLATFORM_FB_PAGE_ID;
    const effectiveFbPageAccessToken = (PLATFORM_MESSENGER_AVAILABLE && usingPlatformPage)
      ? null
      : (fbPageAccessToken ?? null);

    let effectiveEnabled: boolean = enabled ?? true;
    let botDisabledReason: string | undefined;

    // Do not allow enabling the bot while subscription is ended or payment-locked.
    if (enabled === true) {
      const access = await getClientAccessState(clientId);
      if (!access.allowBot) {
        // Allow saving other settings (Messenger credentials/templates/etc), but hard-disable the bot.
        effectiveEnabled = false;
        botDisabledReason = access.reason || 'Subscription ended. Please renew to enable the bot.';
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
          messenger_enabled, fb_page_id, fb_page_access_token, messenger_delay_minutes,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW(), NOW())`,
        [
          clientId,
          effectiveEnabled,
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
          messengerEnabled ?? false,
          fbPageId ?? null,
          effectiveFbPageAccessToken,
          messengerDelayMinutes ?? 5,
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
          messenger_enabled = $20,
          fb_page_id = $21,
          fb_page_access_token = $22,
          messenger_delay_minutes = $23,
          updated_at = NOW()
        WHERE client_id = $1`,
        [
          clientId,
          effectiveEnabled,
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
          messengerEnabled ?? false,
          fbPageId ?? null,
          effectiveFbPageAccessToken,
          messengerDelayMinutes ?? 5,
        ]
      );
    }

    // Auto-register Telegram webhook when Telegram is enabled/configured.
    if (effectiveEnabled && effectiveProvider === 'telegram' && telegramBotToken && telegramBotUsername) {
      const secret = await upsertTelegramWebhookSecret(clientId);
      const baseUrl = getPublicBaseUrl(req);
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

    if (botDisabledReason) {
      return res.json({
        success: true,
        message: 'Settings saved, but the bot remains disabled until subscription is renewed.',
        botDisabled: true,
        reason: botDisabledReason,
        paymentRequired: true,
        code: 'SUBSCRIPTION_REQUIRED_FOR_BOT',
      });
    }

    res.json({ success: true, message: 'Bot settings updated successfully' });
  } catch (error) {
    console.error('Error updating bot settings:', error);
    res.status(500).json({ error: 'Failed to update bot settings' });
  }
};
