export const translations = {
  en: {
    // WhatsApp/SMS Templates
    orderConfirmation: `Hello {{buyer_name}}! 👋

We received your order from {{company_name}}:

📦 Order #{{order_number}}
🛍️ Product: {{product_name}}
📊 Quantity: {{quantity}}
💰 Total: {{total_price}} DZD

Please confirm your order by clicking the link below:
{{confirmation_link}}

⏰ This link expires in 48 hours.

For support, contact us at {{support_phone}}
Visit our store: {{store_url}}`,

    orderApproved: 'Your order has been APPROVED ✅',
    orderDeclined: 'Your order has been DECLINED ❌',
    orderChanged: 'Changes requested for your order 🔄',
    
    // Email Templates
    emailOrderUpdate: 'Order Status Update',
    emailWelcome: 'Welcome to Order Confirmation Bot',
    emailPasswordReset: 'Password Reset Request',
    
    // UI Labels
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    buyers: 'Buyers',
    settings: 'Bot Settings',
    analytics: 'Analytics',
    logout: 'Logout',
  },

  fr: {
    // WhatsApp/SMS Templates
    orderConfirmation: `Bonjour {{buyer_name}}! 👋

Nous avons reçu votre commande de {{company_name}}:

📦 Commande #{{order_number}}
🛍️ Produit: {{product_name}}
📊 Quantité: {{quantity}}
💰 Total: {{total_price}} DZD

Veuillez confirmer votre commande en cliquant sur le lien ci-dessous:
{{confirmation_link}}

⏰ Ce lien expire dans 48 heures.

Pour assistance, contactez-nous au {{support_phone}}
Visitez notre boutique: {{store_url}}`,

    orderApproved: 'Votre commande a été APPROUVÉE ✅',
    orderDeclined: 'Votre commande a été REFUSÉE ❌',
    orderChanged: 'Modifications demandées pour votre commande 🔄',
    
    // Email Templates
    emailOrderUpdate: 'Mise à jour du statut de la commande',
    emailWelcome: 'Bienvenue sur Order Confirmation Bot',
    emailPasswordReset: 'Demande de réinitialisation du mot de passe',
    
    // UI Labels
    dashboard: 'Tableau de bord',
    products: 'Produits',
    orders: 'Commandes',
    buyers: 'Acheteurs',
    settings: 'Paramètres Bot',
    analytics: 'Analytique',
    logout: 'Déconnexion',
  },

  ar: {
    // WhatsApp/SMS Templates
    orderConfirmation: `مرحبا {{buyer_name}}! 👋

لقد تلقينا طلبك من {{company_name}}:

📦 الطلب #{{order_number}}
🛍️ المنتج: {{product_name}}
📊 الكمية: {{quantity}}
💰 المجموع: {{total_price}} دج

يرجى تأكيد طلبك من خلال النقر على الرابط أدناه:
{{confirmation_link}}

⏰ تنتهي صلاحية هذا الرابط خلال 48 ساعة.

للدعم، اتصل بنا على {{support_phone}}
قم بزيارة متجرنا: {{store_url}}`,

    orderApproved: 'تم الموافقة على طلبك ✅',
    orderDeclined: 'تم رفض طلبك ❌',
    orderChanged: 'تم طلب تغييرات على طلبك 🔄',
    
    // Email Templates
    emailOrderUpdate: 'تحديث حالة الطلب',
    emailWelcome: 'مرحبا بك في Order Confirmation Bot',
    emailPasswordReset: 'طلب إعادة تعيين كلمة المرور',
    
    // UI Labels
    dashboard: 'لوحة التحكم',
    products: 'المنتجات',
    orders: 'الطلبات',
    buyers: 'المشترين',
    settings: 'إعدادات البوت',
    analytics: 'التحليلات',
    logout: 'تسجيل الخروج',
  },
};

export function getTranslation(lang = 'en', key) {
  return translations[lang]?.[key] || translations.en[key] || key;
}

export function replaceVariables(template, variables) {
  let result = template;
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  return result;
}
