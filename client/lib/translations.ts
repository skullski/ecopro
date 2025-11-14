import type { Locale } from './i18n';

export const translations: Record<Locale, Record<string, string>> = {
  ar: {
    // Common
    "back": "رجوع",
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "add": "إضافة",
    "search": "بحث",
    "filter": "تصفية",
    "loading": "جاري التحميل...",
    "noData": "لا توجد بيانات",
    "currency": "دج",

    // Navigation & Brand
    "brand": "walidstore",
    "menu.features": "المزايا",
    "menu.pricing": "الأسعار",
    "menu.faq": "الأسئلة الشائعة",
    "menu.store": "المتجر",
    "menu.admin": "لوحة المسؤول",

    // Auth
    "auth.login": "تسجيل الدخول",
    "auth.signup": "إنشاء حساب",
    "auth.logout": "تسجيل الخروج",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.confirmPassword": "تأكيد كلمة المرور",
    "auth.forgotPassword": "نسيت كلمة المرور؟",
    "auth.rememberMe": "تذكرني",
    "auth.name": "الاسم",
    "auth.phone": "رقم الهاتف",

    // Homepage
    "hero.badge": "منصة SaaS للمتاجر الإلكترونية",
    "hero.title": "أنشئ متجرًا إلكترونيًا احترافيًا وأدِر مبيعاتك من مكان واحد",
    "hero.desc": "منصة متكاملة لتصميم، إدارة وتسويق متجرك بسهولة عبر الإنترنت",
    "cta.features": "استعراض المزايا",
    "cta.pricing": "الأسعار",
    "cta.start": "ابدأ الآن",

    // Features
    "features.title": "كل ما تحتاجه للنجاح",
    "features.desc": "من التصميم إلى إدارة المخزون والمدفوعات والشحن والتسويق — نوفر لك كل الأدوات",
    "features.design": "تصميم احترافي",
    "features.payment": "إدارة المدفوعات",
    "features.shipping": "خيارات الشحن",
    "features.marketing": "أدوات التسويق",

    // Admin Panel
    "admin.title": "لوحة المسؤول",
    "admin.dashboard": "لوحة التحكم",
    "admin.products": "المنتجات",
    "admin.orders": "الطلبات",
    "admin.customers": "العملاء",
    "admin.settings": "الإعدادات",
    "admin.analytics": "التحليلات",
    "admin.stores": "المتاجر",
    "admin.marketing": "التسويق",

    // Orders
    "orders.title": "الطلبات",
    "orders.download": "تحميل",
    "orders.filter": "تصفية",
    "orders.orderNumber": "رقم الطلب",
    "orders.customer": "العميل",
    "orders.amount": "المبلغ",
    "orders.status": "الحالة",
    "orders.time": "الوقت",
    "orders.actions": "الإجراءات",
    "orders.status.confirmed": "مؤكد",
    "orders.status.pending": "قيد الانتظار",
    "orders.status.failed": "فشل",
    "orders.action.confirm": "تأكيد",
    "orders.action.cancel": "إلغاء",
    "orders.action.followup": "متابعة",
    "orders.showing": "عرض {start}-{end} من {total} طلب",
    "orders.prev": "السابق",
    "orders.next": "التالي",
    "orders.time.minutes": "منذ {n} دقائق",
    "orders.time.hours": "منذ {n} ساعات",
    "orders.time.hour": "منذ ساعة",
    "orders.time.hours.single": "منذ {n} ساعة",

    // Store Management
    "store.management": "إدارة المتجر",
    "store.settings": "إعدادات المتجر",
    "store.products": "المنتجات",
    "store.orders": "الطلبات",
    "store.customers": "العملاء",
    "store.analytics": "التحليلات",
    "store.empty": "لا توجد منتجات",

    // Products
    "product.add": "إضافة منتج",
    "product.edit": "تعديل منتج",
    "product.name": "اسم المنتج",
    "product.description": "وصف المنتج",
    "product.price": "السعر",
    "product.stock": "المخزون",
    "product.category": "التصنيف",
    "product.images": "الصور",
    "product.addToCart": "إضافة إلى السلة",

    // Wasselni Integration
    "wasselni.title": "Wasselni - نظام تأكيد الطلبات الذكي",
    "wasselni.desc": "نظام ذكي للتأكيد الآلي للمكالمات الصوتية باللهجة المحلية",
    "wasselni.settings": "إعدادات Wasselni",
    "wasselni.calls": "المكالمات",
    "wasselni.calls.empty": "لا توجد مكالمات مجدولة",

    // Footer
    "footer.copyright": "© {year} walidstore. جميع الحقوق محفوظة",
  },
  en: {
    // Common
    "back": "Back",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "search": "Search",
    "filter": "Filter",
    "loading": "Loading...",
    "noData": "No data available",
    "currency": "DZD",

    // Navigation & Brand
    "brand": "walidstore",
    "menu.features": "Features",
    "menu.pricing": "Pricing",
    "menu.faq": "FAQ",
    "menu.store": "Store",
    "menu.admin": "Admin Panel",

    // Auth
    "auth.login": "Log in",
    "auth.signup": "Sign up",
    "auth.logout": "Log out",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.forgotPassword": "Forgot Password?",
    "auth.rememberMe": "Remember me",
    "auth.name": "Name",
    "auth.phone": "Phone Number",

    // Homepage
    "hero.badge": "SaaS E-commerce Platform",
    "hero.title": "Create a Professional Online Store and Manage Sales in One Place",
    "hero.desc": "All-in-one platform to design, manage and market your store online",
    "cta.features": "Explore Features",
    "cta.pricing": "View Pricing",
    "cta.start": "Get Started",

    // Features
    "features.title": "Everything You Need to Succeed",
    "features.desc": "From design to inventory, payments, shipping and marketing — we've got you covered",
    "features.design": "Professional Design",
    "features.payment": "Payment Management",
    "features.shipping": "Shipping Options",
    "features.marketing": "Marketing Tools",

    // Admin Panel
    "admin.title": "Admin Panel",
    "admin.dashboard": "Dashboard",
    "admin.products": "Products",
    "admin.orders": "Orders",
    "admin.customers": "Customers",
    "admin.settings": "Settings",
    "admin.analytics": "Analytics",
    "admin.stores": "Stores",
    "admin.marketing": "Marketing",

    // Orders
    "orders.title": "Orders",
    "orders.download": "Download",
    "orders.filter": "Filter",
    "orders.orderNumber": "Order #",
    "orders.customer": "Customer",
    "orders.amount": "Amount",
    "orders.status": "Status",
    "orders.time": "Time",
    "orders.actions": "Actions",
    "orders.status.confirmed": "Confirmed",
    "orders.status.pending": "Pending",
    "orders.status.failed": "Failed",
    "orders.action.confirm": "Confirm",
    "orders.action.cancel": "Cancel",
    "orders.action.followup": "Follow up",
    "orders.showing": "Showing {start}-{end} of {total} orders",
    "orders.prev": "Previous",
    "orders.next": "Next",
    "orders.time.minutes": "{n} minutes ago",
    "orders.time.hours": "{n} hours ago",
    "orders.time.hour": "1 hour ago",
    "orders.time.hours.single": "{n} hour ago",

    // Store Management
    "store.management": "Store Management",
    "store.settings": "Store Settings",
    "store.products": "Products",
    "store.orders": "Orders",
    "store.customers": "Customers",
    "store.analytics": "Analytics",
    "store.empty": "No products available",

    // Products
    "product.add": "Add Product",
    "product.edit": "Edit Product",
    "product.name": "Product Name",
    "product.description": "Description",
    "product.price": "Price",
    "product.stock": "Stock",
    "product.category": "Category",
    "product.images": "Images",
    "product.addToCart": "Add to Cart",

    // Wasselni Integration
    "wasselni.title": "Wasselni - Smart Call Confirmation System",
    "wasselni.desc": "AI-powered voice calls for order confirmation in local dialects",
    "wasselni.settings": "Wasselni Settings",
    "wasselni.calls": "Calls",
    "wasselni.calls.empty": "No scheduled calls",

    // Footer
    "footer.copyright": "© {year} walidstore. All rights reserved",
  },
  fr: {
    // Common
    "back": "Retour",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "add": "Ajouter",
    "search": "Rechercher",
    "filter": "Filtrer",
    "loading": "Chargement...",
    "noData": "Aucune donnée disponible",
    "currency": "DZD",

    // Navigation & Brand
    "brand": "walidstore",
    "menu.features": "Fonctionnalités",
    "menu.pricing": "Tarifs",
    "menu.faq": "FAQ",
    "menu.store": "Boutique",
    "menu.admin": "Panel Admin",

    // Auth
    "auth.login": "Connexion",
    "auth.signup": "S'inscrire",
    "auth.logout": "Déconnexion",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.confirmPassword": "Confirmer le mot de passe",
    "auth.forgotPassword": "Mot de passe oublié ?",
    "auth.rememberMe": "Se souvenir de moi",
    "auth.name": "Nom",
    "auth.phone": "Numéro de téléphone",

    // Homepage
    "hero.badge": "Plateforme E-commerce SaaS",
    "hero.title": "Créez une Boutique en Ligne Professionnelle et Gérez vos Ventes en Un Seul Endroit",
    "hero.desc": "Plateforme tout-en-un pour concevoir, gérer et promouvoir votre boutique en ligne",
    "cta.features": "Découvrir les Fonctionnalités",
    "cta.pricing": "Voir les Tarifs",
    "cta.start": "Commencer",

    // Features
    "features.title": "Tout ce dont Vous Avez Besoin pour Réussir",
    "features.desc": "Du design à l'inventaire, paiements, expédition et marketing — nous vous accompagnons",
    "features.design": "Design Professionnel",
    "features.payment": "Gestion des Paiements",
    "features.shipping": "Options d'Expédition",
    "features.marketing": "Outils Marketing",

    // Admin Panel
    "admin.title": "Panel Administrateur",
    "admin.dashboard": "Tableau de Bord",
    "admin.products": "Produits",
    "admin.orders": "Commandes",
    "admin.customers": "Clients",
    "admin.settings": "Paramètres",
    "admin.analytics": "Analytique",
    "admin.stores": "Boutiques",
    "admin.marketing": "Marketing",

    // Orders
    "orders.title": "Commandes",
    "orders.download": "Télécharger",
    "orders.filter": "Filtrer",
    "orders.orderNumber": "Commande N°",
    "orders.customer": "Client",
    "orders.amount": "Montant",
    "orders.status": "Statut",
    "orders.time": "Temps",
    "orders.actions": "Actions",
    "orders.status.confirmed": "Confirmée",
    "orders.status.pending": "En attente",
    "orders.status.failed": "Échouée",
    "orders.action.confirm": "Confirmer",
    "orders.action.cancel": "Annuler",
    "orders.action.followup": "Suivre",
    "orders.showing": "Affichage {start}-{end} sur {total} commandes",
    "orders.prev": "Précédent",
    "orders.next": "Suivant",
    "orders.time.minutes": "il y a {n} minutes",
    "orders.time.hours": "il y a {n} heures",
    "orders.time.hour": "il y a 1 heure",
    "orders.time.hours.single": "il y a {n} heure",

    // Store Management
    "store.management": "Gestion de la Boutique",
    "store.settings": "Paramètres de la Boutique",
    "store.products": "Produits",
    "store.orders": "Commandes",
    "store.customers": "Clients",
    "store.analytics": "Analytique",
    "store.empty": "Aucun produit disponible",

    // Products
    "product.add": "Ajouter un Produit",
    "product.edit": "Modifier le Produit",
    "product.name": "Nom du Produit",
    "product.description": "Description",
    "product.price": "Prix",
    "product.stock": "Stock",
    "product.category": "Catégorie",
    "product.images": "Images",
    "product.addToCart": "Ajouter au Panier",

    // Wasselni Integration
    "wasselni.title": "Wasselni - Système de Confirmation d'Appel Intelligent",
    "wasselni.desc": "Appels vocaux automatisés par IA pour la confirmation des commandes en dialecte local",
    "wasselni.settings": "Paramètres Wasselni",
    "wasselni.calls": "Appels",
    "wasselni.calls.empty": "Aucun appel programmé",

    // Footer
    "footer.copyright": "© {year} walidstore. Tous droits réservés",
  }
};