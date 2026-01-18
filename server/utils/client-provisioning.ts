import { ensureConnection } from './database';

const PLATFORM_TELEGRAM_BOT_TOKEN = String(process.env.PLATFORM_TELEGRAM_BOT_TOKEN || '').trim();
const PLATFORM_TELEGRAM_BOT_USERNAME = String(process.env.PLATFORM_TELEGRAM_BOT_USERNAME || '').trim();
const PLATFORM_TELEGRAM_AVAILABLE = !!PLATFORM_TELEGRAM_BOT_TOKEN && !!PLATFORM_TELEGRAM_BOT_USERNAME;

const PLATFORM_FB_PAGE_ID = String(process.env.PLATFORM_FB_PAGE_ID || '').trim();
const PLATFORM_FB_PAGE_ACCESS_TOKEN = String(process.env.PLATFORM_FB_PAGE_ACCESS_TOKEN || '').trim();
const PLATFORM_MESSENGER_AVAILABLE = !!PLATFORM_FB_PAGE_ID && !!PLATFORM_FB_PAGE_ACCESS_TOKEN;

const DEFAULT_TEMPLATES = {
  greeting: `شكراً لطلبك من {storeName}، {customerName}! 🎉\n\n✅ فعّل الإشعارات لتلقي تأكيد الطلب وتحديثات التتبع.`,
  instantOrder: `🎉 شكراً لك {customerName}!\n\nتم استلام طلبك بنجاح ✅\n\n━━━━━━━━━━━━━━━━\n📦 تفاصيل الطلب\n━━━━━━━━━━━━━━━━\n🔢 رقم الطلب: #{orderId}\n📱 المنتج: {productName}\n💰 السعر: {totalPrice} دج\n📍 الكمية: {quantity}\n\n━━━━━━━━━━━━━━━━\n👤 معلومات التوصيل\n━━━━━━━━━━━━━━━━\n📛 الاسم: {customerName}\n📞 الهاتف: {customerPhone}\n🏠 العنوان: {address}\n\n━━━━━━━━━━━━━━━━\n🚚 حالة الطلب: قيد المعالجة\n━━━━━━━━━━━━━━━━\n\nسنتصل بك قريباً للتأكيد 📞\n\n⭐ من {storeName}`,
  pinInstructions: `📌 نصيحة مهمة:\n\nاضغط مطولاً على الرسالة السابقة واختر "تثبيت" لتتبع طلبك بسهولة!\n\n🔔 تأكد من:\n• تفعيل الإشعارات\n• عدم كتم المحادثة\n• ستتلقى تحديثات حالة الطلب هنا مباشرة`,
  orderConfirmation: `مرحباً {customerName}! 🌟\n\nشكراً لطلبك من {companyName}!\n\n📦 تفاصيل الطلب:\n• المنتج: {productName}\n• السعر: {totalPrice} دج\n• العنوان: {address}\n\nهل تؤكد الطلب؟ اضغط ✅ للتأكيد أو ❌ للإلغاء.`,
  payment: `تم تأكيد طلبك #{orderId}. المبلغ المطلوب: {totalPrice} دج.`,
  shipping: `تم شحن طلبك #{orderId}. رقم التتبع: {trackingNumber}.`,
};

let cachedOrderStatusesHasIsSystem: boolean | null = null;

async function orderStatusesHasIsSystem(): Promise<boolean> {
  if (cachedOrderStatusesHasIsSystem != null) return cachedOrderStatusesHasIsSystem;
  const pool = await ensureConnection();
  const res = await pool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'order_statuses' AND column_name = 'is_system'
     LIMIT 1`
  );
  cachedOrderStatusesHasIsSystem = res.rowCount > 0;
  return cachedOrderStatusesHasIsSystem;
}

/**
 * Ensure a bot_settings row exists for a client.
 * This fixes the "bots not used for new users" issue: much of the bot pipeline
 * assumes a DB row exists, but the UI previously only returned in-memory defaults.
 */
export async function ensureBotSettingsRow(
  clientId: number,
  opts?: { enabled?: boolean }
): Promise<void> {
  const pool = await ensureConnection();

  const existing = await pool.query('SELECT id FROM bot_settings WHERE client_id = $1 LIMIT 1', [clientId]);
  if (existing.rowCount) return;

  // Auto-enable bots when platform credentials are configured
  const platformAvailable = PLATFORM_TELEGRAM_AVAILABLE || PLATFORM_MESSENGER_AVAILABLE;
  const enabled = opts?.enabled ?? platformAvailable;

  // Store Page ID but do NOT store platform Page Access Token (env-only).
  const fbPageId = PLATFORM_MESSENGER_AVAILABLE ? PLATFORM_FB_PAGE_ID : null;
  const fbPageAccessToken = null;

  // Auto-enable Messenger when platform Messenger is configured
  const messengerEnabled = PLATFORM_MESSENGER_AVAILABLE;

  await pool.query(
    `INSERT INTO bot_settings (
      client_id, enabled, updates_enabled, tracking_enabled, provider,
      whatsapp_phone_id, whatsapp_token,
      telegram_bot_token, telegram_bot_username, telegram_delay_minutes, auto_expire_hours,
      viber_auth_token, viber_sender_name, viber_delay_minutes,
      template_greeting, template_instant_order, template_pin_instructions, template_order_confirmation, template_payment, template_shipping,
      messenger_enabled, fb_page_id, fb_page_access_token, messenger_delay_minutes,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7,
      $8, $9, $10, $11,
      $12, $13, $14,
      $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24,
      NOW(), NOW()
    )`,
    [
      clientId,
      enabled,
      true,
      true,
      'telegram',
      null,
      null,
      PLATFORM_TELEGRAM_AVAILABLE ? PLATFORM_TELEGRAM_BOT_TOKEN : null,
      PLATFORM_TELEGRAM_AVAILABLE ? PLATFORM_TELEGRAM_BOT_USERNAME : null,
      5,
      24,
      null,
      null,
      5,
      DEFAULT_TEMPLATES.greeting,
      DEFAULT_TEMPLATES.instantOrder,
      DEFAULT_TEMPLATES.pinInstructions,
      DEFAULT_TEMPLATES.orderConfirmation,
      DEFAULT_TEMPLATES.payment,
      DEFAULT_TEMPLATES.shipping,
      messengerEnabled,
      fbPageId,
      fbPageAccessToken,
      5,
    ]
  );
}

/**
 * Ensure system order statuses exist for a client.
 * Many dashboards/revenue queries rely on order_statuses rows.
 */
export async function ensureSystemOrderStatuses(clientId: number): Promise<void> {
  const pool = await ensureConnection();

  const exists = await pool.query('SELECT 1 FROM order_statuses WHERE client_id = $1 LIMIT 1', [clientId]);
  if (exists.rowCount) return;

  const hasIsSystem = await orderStatusesHasIsSystem();

  const baseCols = ['client_id', 'name', 'key', 'color', 'icon', 'sort_order', 'is_default', 'counts_as_revenue'];
  const cols = hasIsSystem ? [...baseCols, 'is_system'] : baseCols;

  const values: any[] = [];
  const rows = [
    { key: 'pending', name: 'Pending', color: '#eab308', icon: '●', sort_order: 0, is_default: true, counts_as_revenue: false, is_system: true },
    { key: 'confirmed', name: 'Confirmed', color: '#22c55e', icon: '✓', sort_order: 1, is_default: true, counts_as_revenue: false, is_system: true },
    { key: 'completed', name: 'Completed', color: '#10b981', icon: '✓', sort_order: 2, is_default: true, counts_as_revenue: true, is_system: true },
    { key: 'cancelled', name: 'Cancelled', color: '#ef4444', icon: '✕', sort_order: 3, is_default: true, counts_as_revenue: false, is_system: true },
    { key: 'at_delivery', name: 'At Delivery', color: '#8b5cf6', icon: '🚚', sort_order: 4, is_default: true, counts_as_revenue: false, is_system: true },
  ];

  const tuples: string[] = [];
  for (const r of rows) {
    const rowVals = [
      clientId,
      r.name,
      r.key,
      r.color,
      r.icon,
      r.sort_order,
      r.is_default,
      r.counts_as_revenue,
      ...(hasIsSystem ? [r.is_system] : []),
    ];
    const placeholders = rowVals.map((_, i) => `$${values.length + i + 1}`);
    values.push(...rowVals);
    tuples.push(`(${placeholders.join(',')})`);
  }

  await pool.query(
    `INSERT INTO order_statuses (${cols.join(', ')})
     VALUES ${tuples.join(', ')}
     ON CONFLICT DO NOTHING`,
    values
  );
}
