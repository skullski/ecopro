import { RequestHandler } from "express";
import { pool } from "../utils/database";
import { registerTelegramWebhook, upsertTelegramWebhookSecret } from "../utils/telegram";
import { getPublicBaseUrl } from '../utils/public-url';
import { ensureBotSettingsRow } from '../utils/client-provisioning';

const PLATFORM_FB_PAGE_ID = String(process.env.PLATFORM_FB_PAGE_ID || '').trim();
const PLATFORM_FB_PAGE_ACCESS_TOKEN = String(process.env.PLATFORM_FB_PAGE_ACCESS_TOKEN || '').trim();
const PLATFORM_MESSENGER_AVAILABLE = !!PLATFORM_FB_PAGE_ID && !!PLATFORM_FB_PAGE_ACCESS_TOKEN;

const PLATFORM_TELEGRAM_BOT_TOKEN = String(process.env.PLATFORM_TELEGRAM_BOT_TOKEN || '').trim();
const PLATFORM_TELEGRAM_BOT_USERNAME = String(process.env.PLATFORM_TELEGRAM_BOT_USERNAME || '').trim();
const PLATFORM_TELEGRAM_AVAILABLE = !!PLATFORM_TELEGRAM_BOT_TOKEN && !!PLATFORM_TELEGRAM_BOT_USERNAME;

function normalizeTelegramUsername(username: string): string {
  return String(username || '').trim().replace(/^@/, '');
}

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

  // Check subscription_extended_until on the clients table first (admin-granted extensions)
  try {
    const extRes = await pool.query(
      `SELECT subscription_extended_until FROM clients WHERE id = $1`,
      [clientId]
    );
    if (extRes.rows.length) {
      const extRaw = extRes.rows[0].subscription_extended_until;
      if (extRaw) {
        const extensionEnds = new Date(extRaw);
        if (Number.isFinite(extensionEnds.getTime()) && new Date() < extensionEnds) {
          return { allowBot: true };
        }
      }
    }
  } catch {
    // If column doesn't exist yet, fall through to subscription check.
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

  if (sub.status === 'active' || sub.status === 'extended') {
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
      // Older behavior returned in-memory defaults but did not create a DB row.
      // That breaks scheduling/sending which JOINs bot_settings. Ensure row exists.
      const access = await getClientAccessState(clientId);
      try {
        await ensureBotSettingsRow(Number(clientId), { enabled: access.allowBot });
      } catch (e) {
        console.warn('[getBotSettings] Failed to ensure bot_settings row:', (e as any)?.message || e);
      }

      const refetch = await pool.query(`SELECT * FROM bot_settings WHERE client_id = $1`, [clientId]);
      if (refetch.rows.length === 0) {
        // Fallback: preserve old behavior if the DB insert failed for any reason.
        return res.json({
          enabled: access.allowBot,
          provider: 'telegram',
          whatsappPhoneId: '',
          // Never expose tokens/secrets to store owners.
          whatsappToken: '',
          whatsappTokenConfigured: false,
          telegramBotToken: '',
          telegramTokenConfigured: PLATFORM_TELEGRAM_AVAILABLE,
          telegramBotUsername: '',
          telegramDelayMinutes: 5,
          autoExpireHours: 24,
          viberAuthToken: '',
          viberSenderName: '',
          messengerEnabled: false,
          fbPageId: '',
          fbPageAccessToken: '',
          fbPageAccessTokenConfigured: false,
          messengerDelayMinutes: 5,
          platformMessengerAvailable: PLATFORM_MESSENGER_AVAILABLE,
          platformTelegramAvailable: PLATFORM_TELEGRAM_AVAILABLE,
          usePlatformMessenger: PLATFORM_MESSENGER_AVAILABLE,
          messengerUsingPlatform: PLATFORM_MESSENGER_AVAILABLE,
          usePlatformTelegram: PLATFORM_TELEGRAM_AVAILABLE,
          telegramUsingPlatform: PLATFORM_TELEGRAM_AVAILABLE,
          // Do not expose platform Page ID to store owners.
          platformMessengerPageId: '',
          templateGreeting: `شكراً لطلبك من {storeName}، {customerName}! 🎉\n\n✅ فعّل الإشعارات لتلقي تأكيد الطلب وتحديثات التتبع.`,
          templateInstantOrder: `🎉 شكراً لك {customerName}!\n\nتم استلام طلبك بنجاح ✅\n\n━━━━━━━━━━━━━━━━\n📦 تفاصيل الطلب\n━━━━━━━━━━━━━━━━\n🔢 رقم الطلب: #{orderId}\n📱 المنتج: {productName}\n💰 السعر: {totalPrice} دج\n📍 الكمية: {quantity}\n\n━━━━━━━━━━━━━━━━\n👤 معلومات التوصيل\n━━━━━━━━━━━━━━━━\n📛 الاسم: {customerName}\n📞 الهاتف: {customerPhone}\n🏠 العنوان: {address}\n\n━━━━━━━━━━━━━━━━\n🚚 حالة الطلب: قيد المعالجة\n━━━━━━━━━━━━━━━━\n\nسنتصل بك قريباً للتأكيد 📞\n\n⭐ من {storeName}`,
          templatePinInstructions: `📌 نصيحة مهمة:\n\nاضغط مطولاً على الرسالة السابقة واختر "تثبيت" لتتبع طلبك بسهولة!\n\n🔔 تأكد من:\n• تفعيل الإشعارات\n• عدم كتم المحادثة\n• ستتلقى تحديثات حالة الطلب هنا مباشرة`,
          templateOrderConfirmation: `مرحباً {customerName}! 🌟\n\nشكراً لطلبك من {companyName}!\n\n📦 تفاصيل الطلب:\n• المنتج: {productName}\n• السعر: {totalPrice} دج\n• العنوان: {address}\n\nهل تؤكد الطلب؟ اضغط ✅ للتأكيد أو ❌ للإلغاء.`,
          templatePayment: `تم تأكيد طلبك #{orderId}. المبلغ المطلوب: {totalPrice} دج.`,
          templateShipping: `تم شحن طلبك #{orderId}. رقم التتبع: {trackingNumber}.`,
        });
      }

      // Continue as normal with a real DB row.
      (result as any).rows = refetch.rows;
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

    let storedTelegramToken = String(settings.telegram_bot_token || '').trim();
    let storedTelegramUsername = String(settings.telegram_bot_username || '').trim();
    const telegramTokenConfigured = !!storedTelegramToken;
    const telegramUsingPlatform = PLATFORM_TELEGRAM_AVAILABLE && (!storedTelegramToken || storedTelegramToken === PLATFORM_TELEGRAM_BOT_TOKEN);

    // If platform bot is configured and this client has no stored Telegram token,
    // backfill the platform token/username into bot_settings.
    // This keeps downstream SQL JOINs working without ever exposing the secret to store owners.
    if (PLATFORM_TELEGRAM_AVAILABLE && !storedTelegramToken) {
      const normalizedPlatformUsername = normalizeTelegramUsername(PLATFORM_TELEGRAM_BOT_USERNAME);
      try {
        await pool.query(
          `UPDATE bot_settings
           SET telegram_bot_token = $2,
               telegram_bot_username = COALESCE(NULLIF(BTRIM(telegram_bot_username), ''), $3),
               updated_at = NOW()
           WHERE client_id = $1
             AND (telegram_bot_token IS NULL OR BTRIM(telegram_bot_token) = '')`,
          [clientId, PLATFORM_TELEGRAM_BOT_TOKEN, normalizedPlatformUsername]
        );
        storedTelegramToken = PLATFORM_TELEGRAM_BOT_TOKEN;
        storedTelegramUsername = storedTelegramUsername || normalizedPlatformUsername;
      } catch (e) {
        console.warn('[getBotSettings] Failed to backfill platform Telegram token:', (e as any)?.message || e);
      }
    }

    const storedFbPageId = String(settings.fb_page_id || '').trim();
    const storedFbPageAccessToken = String(settings.fb_page_access_token || '').trim();
    const messengerTokenConfigured = !!storedFbPageAccessToken;
    const messengerUsingPlatform = PLATFORM_MESSENGER_AVAILABLE && (!storedFbPageId || storedFbPageId === PLATFORM_FB_PAGE_ID);

    const whatsappTokenConfigured = !!String(settings.whatsapp_token || '').trim();

    const response = {
      enabled: effectiveEnabled,
      updatesEnabled: !!settings.updates_enabled,
      trackingEnabled: !!settings.tracking_enabled,
      provider: settings.provider || 'telegram',
      whatsappPhoneId: settings.whatsapp_phone_id,
      // Never expose tokens/secrets to store owners.
      whatsappToken: '',
      whatsappTokenConfigured,
      telegramBotToken: '',
      telegramTokenConfigured: telegramTokenConfigured || telegramUsingPlatform,
      // Username isn't secret, but hide it when platform bot is used.
      telegramBotUsername: telegramUsingPlatform ? '' : normalizeTelegramUsername(storedTelegramUsername),
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
      fbPageId: messengerUsingPlatform ? '' : (settings.fb_page_id || ''),
      fbPageAccessToken: '',
      fbPageAccessTokenConfigured: messengerTokenConfigured || messengerUsingPlatform,
      messengerDelayMinutes: settings.messenger_delay_minutes || 5,
      platformMessengerAvailable: PLATFORM_MESSENGER_AVAILABLE,
      platformTelegramAvailable: PLATFORM_TELEGRAM_AVAILABLE,
      usePlatformMessenger: messengerUsingPlatform,
      messengerUsingPlatform,
      usePlatformTelegram: telegramUsingPlatform,
      telegramUsingPlatform,
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
      messengerDelayMinutes,
      usePlatformMessenger,
      usePlatformTelegram,
    } = req.body;

    const effectiveProvider = provider ?? 'telegram';

    const normalizedWhatsappToken = typeof whatsappToken === 'string' ? whatsappToken.trim() : '';
    const normalizedTelegramBotToken = typeof telegramBotToken === 'string' ? telegramBotToken.trim() : '';
    const normalizedTelegramBotUsername = typeof telegramBotUsername === 'string' ? telegramBotUsername.trim() : '';
    const normalizedFbPageId = typeof fbPageId === 'string' ? fbPageId.trim() : '';
    const normalizedFbPageAccessToken = typeof fbPageAccessToken === 'string' ? fbPageAccessToken.trim() : '';

    // Load existing secrets so we can preserve them unless explicitly replaced.
    const existingSecretsRes = await pool.query(
      `SELECT whatsapp_token, telegram_bot_token, telegram_bot_username, fb_page_id, fb_page_access_token
       FROM bot_settings WHERE client_id = $1`,
      [clientId]
    );
    const existingSecrets = existingSecretsRes.rows[0] || {};

    const existingTelegramIsPlatform = PLATFORM_TELEGRAM_AVAILABLE
      && String(existingSecrets.telegram_bot_token || '').trim() === PLATFORM_TELEGRAM_BOT_TOKEN;
    const existingMessengerIsPlatform = PLATFORM_MESSENGER_AVAILABLE
      && String(existingSecrets.fb_page_id || '').trim() === PLATFORM_FB_PAGE_ID;

    const wantsPlatformMessenger = usePlatformMessenger === true
      || (usePlatformMessenger == null && existingMessengerIsPlatform);
    const wantsPlatformTelegram = usePlatformTelegram === true
      || (usePlatformTelegram == null && existingTelegramIsPlatform);

    let finalWhatsappToken: string | null = existingSecrets.whatsapp_token ?? null;
    if (normalizedWhatsappToken) {
      finalWhatsappToken = normalizedWhatsappToken;
    }

    let finalTelegramBotToken: string | null = existingSecrets.telegram_bot_token ?? null;
    let finalTelegramBotUsername: string | null = existingSecrets.telegram_bot_username ?? null;

    if (wantsPlatformTelegram) {
      if (!PLATFORM_TELEGRAM_AVAILABLE) {
        return res.status(400).json({ error: 'Platform Telegram bot is not configured on the server.' });
      }
      finalTelegramBotToken = PLATFORM_TELEGRAM_BOT_TOKEN;
      finalTelegramBotUsername = normalizeTelegramUsername(PLATFORM_TELEGRAM_BOT_USERNAME);
    } else {
      const switchingFromPlatform = existingTelegramIsPlatform;
      if (switchingFromPlatform && !normalizedTelegramBotToken) {
        return res.status(400).json({ error: 'Paste your Telegram bot token when switching to a custom bot.' });
      }
      if (normalizedTelegramBotToken) {
        finalTelegramBotToken = normalizedTelegramBotToken;
      }
      if (normalizedTelegramBotUsername) {
        finalTelegramBotUsername = normalizeTelegramUsername(normalizedTelegramBotUsername);
      }
    }

    // Messenger page/token behavior.
    let finalFbPageId: string | null = existingSecrets.fb_page_id ?? null;
    let finalFbPageAccessToken: string | null = existingSecrets.fb_page_access_token ?? null;

    if (wantsPlatformMessenger) {
      if (!PLATFORM_MESSENGER_AVAILABLE) {
        return res.status(400).json({ error: 'Platform Messenger page is not configured on the server.' });
      }
      finalFbPageId = PLATFORM_FB_PAGE_ID;
      // Use env-based token instead; never store platform token in DB.
      finalFbPageAccessToken = null;
    } else {
      const switchingFromPlatform = existingMessengerIsPlatform;
      if (switchingFromPlatform && (!normalizedFbPageId || !normalizedFbPageAccessToken)) {
        return res.status(400).json({ error: 'Paste your Facebook Page ID + Page Access Token when switching to a custom Page.' });
      }

      if (normalizedFbPageId) {
        finalFbPageId = normalizedFbPageId;
      }
      if (normalizedFbPageAccessToken) {
        finalFbPageAccessToken = normalizedFbPageAccessToken;
      }
    }

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
          finalWhatsappToken,
          finalTelegramBotToken,
          telegramDelayMinutes ?? 5,
          autoExpireHours ?? 24,
          viberAuthToken ?? null,
          viberSenderName ?? null,
          finalTelegramBotUsername,
          null,
          templateGreeting ?? null,
          templateInstantOrder ?? null,
          templatePinInstructions ?? null,
          templateOrderConfirmation ?? null,
          templatePayment ?? null,
          templateShipping ?? null,
          messengerEnabled ?? false,
          finalFbPageId,
          finalFbPageAccessToken,
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
          finalWhatsappToken,
          finalTelegramBotToken,
          telegramDelayMinutes ?? 5,
          autoExpireHours ?? 24,
          viberAuthToken ?? null,
          viberSenderName ?? null,
          finalTelegramBotUsername,
          templateGreeting ?? null,
          templateInstantOrder ?? null,
          templatePinInstructions ?? null,
          templateOrderConfirmation ?? null,
          templatePayment ?? null,
          templateShipping ?? null,
          messengerEnabled ?? false,
          finalFbPageId,
          finalFbPageAccessToken,
          messengerDelayMinutes ?? 5,
        ]
      );
    }

    // Auto-register Telegram webhook when Telegram is enabled/configured.
    if (effectiveEnabled && effectiveProvider === 'telegram' && finalTelegramBotToken && finalTelegramBotUsername) {
      const secret = await upsertTelegramWebhookSecret(clientId, finalTelegramBotToken);
      const baseUrl = getPublicBaseUrl(req);
      const hook = await registerTelegramWebhook({
        botToken: finalTelegramBotToken,
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
