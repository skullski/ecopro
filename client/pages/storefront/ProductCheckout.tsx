import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Heart, Share2, ChevronLeft, Plus, Minus, ShoppingBag, Truck, 
  Shield, Clock, Star, Check, MapPin, Phone, Mail, User, 
  CreditCard, Package, Sparkles, ArrowRight, X, ChevronRight,
  Copy, MessageCircle, Zap, Gift, Send, CheckCircle2
} from 'lucide-react';

interface Product {
  id: number;
  slug?: string;
  title?: string;
  name?: string;
  price: number;
  images?: string[];
  description?: string;
  category?: string;
  stock_quantity?: number;
  [key: string]: any;
}

interface StoreSettings {
  template_accent_color?: string;
  template?: string;
  store_name?: string;
  logo_url?: string;
  [key: string]: any;
}

export default function ProductCheckout() {
  const { id, slug, productSlug, storeSlug, productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get the product identifier from any of the possible params
  const productIdentifier = id || slug || productSlug || productId;
  
  // States
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [telegramUrls, setTelegramUrls] = useState<string[]>([]);
  
  // Telegram pre-connect states
  const [telegramBotInfo, setTelegramBotInfo] = useState<{
    enabled: boolean;
    botUrl?: string;
    botUsername?: string;
    storeName?: string;
  } | null>(null);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    notes: '',
  });

  // Get template and settings
  const template = localStorage.getItem('template') || 'fashion';
  const settings: StoreSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
  const accentColor = settings.template_accent_color || '#3b82f6';
  
  // Get store slug from URL params, localStorage, or product data
  const getEffectiveStoreSlug = () => {
    if (storeSlug) return storeSlug;
    // Try from localStorage
    const storedSlug = localStorage.getItem('currentStoreSlug');
    if (storedSlug) return storedSlug;
    // Try from product data
    if (product?.store_slug) return product.store_slug;
    return null;
  };
  const effectiveStoreSlug = getEffectiveStoreSlug();

  // Fetch product
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productIdentifier],
    queryFn: async () => {
      const sessionId = searchParams.get('session');
      
      if (sessionId) {
        try {
          const response = await fetch(`/api/checkout/get-product/${encodeURIComponent(sessionId)}`);
          if (response.ok) {
            const data = await response.json();
            return data.product;
          }
        } catch (error) {
          console.error('Failed to retrieve from checkout session:', error);
        }
      }
      
      const cachedProduct = localStorage.getItem(`product_${productIdentifier}`);
      if (cachedProduct) {
        const parsed = JSON.parse(cachedProduct);
        // If cached product has store_slug, use it
        if (parsed.store_slug) return parsed;
      }
      
      // Try the new product-info endpoint that returns store_slug
      let response = await fetch(`/api/product-info/${productIdentifier}`);
      if (response.ok) {
        const data = await response.json();
        // Cache the result with store_slug
        localStorage.setItem(`product_${productIdentifier}`, JSON.stringify(data));
        return data;
      }
      
      // Try multiple API endpoints
      response = await fetch(`/api/product/${productIdentifier}`);
      if (response.ok) return response.json();
      
      // Try products endpoint
      response = await fetch(`/api/products/${productIdentifier}`);
      if (response.ok) return response.json();
      
      // Try client store products (for store checkout)
      const token = localStorage.getItem('authToken');
      if (token) {
        response = await fetch(`/api/client/store/products/${productIdentifier}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) return response.json();
      }
      
      throw new Error('Failed to fetch product');
    },
  });

  // Auto-scroll to checkout when opened
  useEffect(() => {
    if (showCheckout) {
      document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showCheckout]);

  // Fetch Telegram bot info for this store
  useEffect(() => {
    const fetchTelegramInfo = async () => {
      // Get store slug from multiple sources
      const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
      if (!slug) return;
      
      try {
        const res = await fetch(`/api/telegram/bot-link/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setTelegramBotInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch Telegram info:', error);
      }
    };
    fetchTelegramInfo();
  }, [storeSlug, product?.store_slug]);

  // Check Telegram connection when phone changes
  useEffect(() => {
    const checkConnection = async () => {
      const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
      if (!slug || !formData.phone || formData.phone.replace(/\D/g, '').length < 9) {
        setTelegramConnected(false);
        return;
      }
      
      setCheckingConnection(true);
      try {
        const normalizedPhone = formData.phone.replace(/\D/g, '');
        const res = await fetch(`/api/telegram/check-connection/${slug}?phone=${normalizedPhone}`);
        if (res.ok) {
          const data = await res.json();
          setTelegramConnected(data.connected);
        }
      } catch (error) {
        console.error('Failed to check Telegram connection:', error);
      } finally {
        setCheckingConnection(false);
      }
    };
    
    // Debounce the check
    const timeout = setTimeout(checkConnection, 500);
    return () => clearTimeout(timeout);
  }, [storeSlug, product?.store_slug, formData.phone]);

  // Generate Telegram connect URL with phone
  const getTelegramConnectUrl = () => {
    if (!telegramBotInfo?.enabled || !telegramBotInfo?.botUsername) return null;
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 9) {
      return `https://t.me/${telegramBotInfo.botUsername}`;
    }
    // Re-fetch with phone to get personalized link
    const normalizedPhone = formData.phone.replace(/\D/g, '');
    return `/api/telegram/bot-link/${storeSlug}?phone=${normalizedPhone}`;
  };

  // Open Telegram with proper link
  const handleConnectTelegram = async () => {
    if (!telegramBotInfo?.enabled || !telegramBotInfo?.botUsername) return;
    
    let url = `https://t.me/${telegramBotInfo.botUsername}`;
    const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
    
    if (slug && formData.phone && formData.phone.replace(/\D/g, '').length >= 9) {
      try {
        const normalizedPhone = formData.phone.replace(/\D/g, '');
        const res = await fetch(`/api/telegram/bot-link/${slug}?phone=${normalizedPhone}`);
        if (res.ok) {
          const data = await res.json();
          if (data.botUrl) url = data.botUrl;
        }
      } catch (error) {
        console.error('Failed to get Telegram link:', error);
      }
    }
    
    window.open(url, '_blank');
  };

  const handleSubmitOrder = async () => {
    if (!formData.fullName || !formData.phone || !formData.city || !formData.address) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!product?.id) {
      alert('خطأ في المنتج');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Build order data matching the API expectations
      const orderData = {
        product_id: product.id,
        store_slug: storeSlug || product.store_slug,
        quantity: quantity,
        total_price: (product.price || 0) * quantity,
        customer_name: formData.fullName,
        customer_phone: formData.phone,
        customer_email: formData.email || '',
        customer_address: `${formData.city} - ${formData.address}${formData.notes ? ` (${formData.notes})` : ''}`,
      };

      console.log('Submitting order:', orderData);

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Order created:', result);
        setOrderId(result.orderId || result.id);
        if (result.telegramUrls) setTelegramUrls(result.telegramUrls);
        setOrderSuccess(true);
      } else {
        console.error('Order failed:', result);
        throw new Error(result.error || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">المنتج غير موجود</h2>
          <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline">
            العودة للخلف
          </button>
        </div>
      </div>
    );
  }

  const productImage = product.images?.[0] || 'https://via.placeholder.com/500';
  const productImages = product.images || [productImage];
  const productPrice = product.price || 0;
  const productName = product.title || product.name || 'Product';
  const productDesc = product.description || 'منتج عالي الجودة';
  const inStock = (product.stock_quantity ?? 10) > 0;
  const totalPrice = productPrice * quantity;

  // Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">تم الطلب بنجاح! 🎉</h1>
            <p className="text-white/70 mb-6">
              شكراً لك! سيتم التواصل معك قريباً لتأكيد طلبك
            </p>
            
            {orderId && (
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <p className="text-white/60 text-sm mb-1">رقم الطلب</p>
                <p className="text-2xl font-bold text-white">#{orderId}</p>
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-4 mb-6 text-right">
              <div className="flex justify-between text-white/70 mb-2">
                <span>{productName}</span>
                <span>x{quantity}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2 mt-2">
                <span>المجموع</span>
                <span>{totalPrice.toLocaleString()} دج</span>
              </div>
            </div>

            {telegramUrls.length > 0 && (
              <a
                href={telegramUrls[0]}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold mb-4 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                تتبع عبر تليجرام
              </a>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
            >
              العودة للمتجر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Floating Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {settings.logo_url && (
              <img src={settings.logo_url} alt="" className="w-8 h-8 rounded-lg" />
            )}
            <span className="font-bold text-white">{settings.store_name || 'المتجر'}</span>
          </div>
          
          <button
            onClick={() => setWishlist(!wishlist)}
            className={`p-2 rounded-xl transition-all ${
              wishlist ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${wishlist ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-14 pb-6 lg:pt-12 lg:pb-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start lg:items-stretch">
            
            {/* Left Column - Image on top, Details below */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 h-full flex flex-col">
              {/* On laptop: image + details side-by-side to reduce height */}
              <div className="flex flex-col lg:flex-row lg:gap-4 lg:items-stretch flex-1 min-h-0">
                {/* Image + thumbnails */}
                <div className="lg:flex-[7] lg:min-w-0 flex flex-col min-h-0">
                  {/* Image Section - Fixed aspect ratio */}
                  <div className="relative aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-0 rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-3">
                    <img
                      src={productImages[activeImageIndex]}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Badge */}
                    {product.category && (
                      <span 
                        className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                        style={{ backgroundColor: accentColor }}
                      >
                        {product.category}
                      </span>
                    )}

                    {/* Image Navigation */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIndex(i => (i > 0 ? i - 1 : productImages.length - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveImageIndex(i => (i < productImages.length - 1 ? i + 1 : 0))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnails */}
                  {productImages.length > 1 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto">
                      {productImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                            idx === activeImageIndex 
                              ? 'border-white' 
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="lg:flex-[3] lg:min-w-0 flex flex-col min-h-0">
                <div>
                  {/* Title & Price Row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h1 className="text-lg font-bold text-white leading-tight">{productName}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-white/50 text-xs">(128 تقييم)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('تم نسخ الرابط!');
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex-shrink-0"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-2 mb-3">
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: accentColor }}
                    >
                      {productPrice.toLocaleString()}
                    </span>
                    <span className="text-white/50 text-sm mb-1">دج</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-white/5 border border-white/10 mb-3">
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{Math.floor(Math.random() * 5000) + 500}</p>
                      <p className="text-white/50 text-[10px]">مشاهدة</p>
                    </div>
                    <div className="text-center border-x border-white/10">
                      <p className="text-sm font-bold text-white">{Math.floor(Math.random() * 200) + 50}</p>
                      <p className="text-white/50 text-[10px]">تم البيع</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-green-400">{inStock ? 'متوفر' : 'نفذ'}</p>
                      <p className="text-white/50 text-[10px]">المخزون</p>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  {inStock && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-white font-medium text-sm">الكمية</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-bold text-white w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(q => q + 1)}
                          className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total & Trust Badges Row */}
                <div className="flex items-center justify-between pt-3 mt-auto">
                  <div className="flex gap-2">
                    <div className="bg-white/5 rounded-lg p-1.5 text-center border border-white/10">
                      <Truck className="w-4 h-4 text-blue-400 mx-auto" />
                      <p className="text-white/70 text-[8px] mt-0.5">توصيل</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-1.5 text-center border border-white/10">
                      <Shield className="w-4 h-4 text-green-400 mx-auto" />
                      <p className="text-white/70 text-[8px] mt-0.5">ضمان</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-1.5 text-center border border-white/10">
                      <CreditCard className="w-4 h-4 text-amber-400 mx-auto" />
                      <p className="text-white/70 text-[8px] mt-0.5">دفع</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white/50 text-xs">المجموع:</span>
                    <p className="text-xl font-bold text-white">{totalPrice.toLocaleString()} دج</p>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Right Column - Checkout Form */}
            <div className="lg:sticky lg:top-16">
              <div 
                id="checkout-section"
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">معلومات التوصيل</h2>
                    <p className="text-white/50 text-[10px]">أدخل بياناتك لإتمام الطلب</p>
                  </div>
                </div>

                {/* Payment Notice */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/10 rounded-lg p-2 mb-3 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                      <CreditCard className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-emerald-300 font-bold text-xs">الدفع عند الاستلام</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields - Single column for narrow layout */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-white/70 text-[10px] mb-0.5">الاسم الكامل *</label>
                    <input
                      type="text"
                      placeholder="أدخل اسمك"
                      value={formData.fullName}
                      onChange={(e) => setFormData(f => ({ ...f, fullName: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-[10px] mb-0.5">رقم الهاتف *</label>
                    <input
                      type="tel"
                      placeholder="05XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-[10px] mb-0.5">المدينة *</label>
                    <input
                      type="text"
                      placeholder="الجزائر، وهران..."
                      value={formData.city}
                      onChange={(e) => setFormData(f => ({ ...f, city: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-[10px] mb-0.5">العنوان *</label>
                    <input
                      type="text"
                      placeholder="الشارع، رقم البناية..."
                      value={formData.address}
                      onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
                      className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                </div>

                {/* Telegram Connect Section */}
                {telegramBotInfo?.enabled && (
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/30">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold text-sm">تتبع الطلب عبر Telegram</h3>
                          {telegramConnected && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              متصل
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 text-[10px] mb-2">
                          {telegramConnected 
                            ? 'تم ربط حسابك! ستصلك رسالة تأكيد فور إتمام الطلب 📦'
                            : 'اربط حسابك لاستلام تأكيد الطلب وتتبع الشحنة مباشرة على Telegram'
                          }
                        </p>
                        
                        {!telegramConnected && (
                          <>
                            <button
                              type="button"
                              onClick={handleConnectTelegram}
                              disabled={!formData.phone || formData.phone.replace(/\D/g, '').length < 9}
                              className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                              ابدأ محادثة مع البوت
                            </button>
                            <p className="text-white/40 text-[9px] mt-1.5 text-center">
                              {formData.phone && formData.phone.replace(/\D/g, '').length >= 9
                                ? '👆 اضغط لفتح Telegram، ثم اضغط "Start" وارجع هنا'
                                : '👆 أدخل رقم هاتفك أولاً ثم اضغط هنا'
                              }
                            </p>
                          </>
                        )}
                        
                        {checkingConnection && (
                          <p className="text-blue-400 text-[10px] mt-1 flex items-center gap-1">
                            <span className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                            جاري التحقق...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Summary - Compact */}
                <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-xs truncate">{productName}</p>
                      <p className="text-white/50 text-[10px]">{quantity}x {productPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm border-t border-white/10 pt-2">
                    <span>الإجمالي</span>
                    <span style={{ color: accentColor }}>{totalPrice.toLocaleString()} دج</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || !inStock}
                  className="w-full mt-3 py-2.5 rounded-lg font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 20px -4px ${accentColor}80`
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      {inStock ? 'تأكيد الطلب' : 'نفذت الكمية'}
                    </>
                  )}
                </button>

                {/* Security Note */}
                <p className="text-center text-white/40 text-[8px] mt-2 flex items-center justify-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  معلوماتك محمية
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-white/50 text-sm">المجموع</p>
            <p className="text-xl font-bold text-white">{totalPrice.toLocaleString()} دج</p>
          </div>
          <button
            onClick={() => document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' })}
            disabled={!inStock}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              inStock ? 'text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
            style={inStock ? { backgroundColor: accentColor } : {}}
          >
            <ShoppingBag className="w-5 h-5" />
            اطلب الآن
          </button>
        </div>
      </div>
    </div>
  );
}
