import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function updateTemplates() {
  // Generic templates that work for all messaging apps (no app-specific mentions)
  const arabicTemplates = {
    template_greeting: `شكراً لطلبك من {storeName}، {customerName}! 🎉

✅ فعّل الإشعارات لتلقي تأكيد الطلب وتحديثات التتبع.`,
    
    template_instant_order: `🎉 شكراً لك {customerName}!

تم استلام طلبك بنجاح ✅

━━━━━━━━━━━━━━━━
📦 تفاصيل الطلب
━━━━━━━━━━━━━━━━
🔢 رقم الطلب: #{orderId}
📱 المنتج: {productName}
💰 السعر: {totalPrice} دج
📍 الكمية: {quantity}

━━━━━━━━━━━━━━━━
👤 معلومات التوصيل
━━━━━━━━━━━━━━━━
📛 الاسم: {customerName}
📞 الهاتف: {customerPhone}
🏠 العنوان: {address}

━━━━━━━━━━━━━━━━
🚚 حالة الطلب: قيد المعالجة
━━━━━━━━━━━━━━━━

سنتصل بك قريباً للتأكيد 📞

⭐ من {storeName}`,

    template_pin_instructions: `📌 نصيحة مهمة:

اضغط مطولاً على الرسالة السابقة واختر "تثبيت" لتتبع طلبك بسهولة!

🔔 تأكد من:
• تفعيل الإشعارات
• عدم كتم المحادثة
• ستتلقى تحديثات حالة الطلب هنا مباشرة`,

    template_order_confirmation: `مرحباً {customerName}! 🌟

شكراً لطلبك من {companyName}!

📦 تفاصيل الطلب:
• المنتج: {productName}
• السعر: {totalPrice} دج
• العنوان: {address}

هل تؤكد الطلب؟ اضغط ✅ للتأكيد أو ❌ للإلغاء.`,

    template_payment: `تم تأكيد طلبك #{orderId}. المبلغ المطلوب: {totalPrice} دج.`,
    
    template_shipping: `تم شحن طلبك #{orderId}. رقم التتبع: {trackingNumber}.`
  };

  try {
    // Update for client 10
    const result = await pool.query(
      `UPDATE bot_settings SET 
        template_greeting = $1,
        template_instant_order = $2,
        template_pin_instructions = $3,
        template_order_confirmation = $4,
        template_payment = $5,
        template_shipping = $6,
        updated_at = NOW()
       WHERE client_id = 10
       RETURNING client_id`,
      [
        arabicTemplates.template_greeting,
        arabicTemplates.template_instant_order,
        arabicTemplates.template_pin_instructions,
        arabicTemplates.template_order_confirmation,
        arabicTemplates.template_payment,
        arabicTemplates.template_shipping
      ]
    );
    console.log('Updated templates for client:', result.rows[0]?.client_id);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

updateTemplates();
