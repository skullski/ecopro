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
      alert('Please fill in all required fields');
      return;
    }

    if (!product?.id) {
      alert('Product error');
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
      alert('An error occurred while submitting the order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">Product not found</h2>
          <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const productImage = product.images?.[0] || 'https://via.placeholder.com/500';
  const productImages = product.images || [productImage];
  const productPrice = product.price || 0;
  const productName = product.title || product.name || 'Product';
  const productDesc = product.description || 'High quality product';
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
            <h1 className="text-3xl font-bold text-white mb-2">Order Placed Successfully! 🎉</h1>
            <p className="text-white/70 mb-6">
              Thank you! We will contact you soon to confirm your order
            </p>
            
            {orderId && (
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <p className="text-white/60 text-sm mb-1">Order Number</p>
                <p className="text-2xl font-bold text-white">#{orderId}</p>
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-4 mb-6 text-right">
              <div className="flex justify-between text-white/70 mb-2">
                <span>{productName}</span>
                <span>x{quantity}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2 mt-2">
                <span>Total</span>
                <span>{totalPrice.toLocaleString()} DZD</span>
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
                Track via Telegram
              </a>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
            >
              Return to Store
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
            <span className="font-bold text-white">{settings.store_name || 'Store'}</span>
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

      {/* Main Content - Wide Single Column, No Scroll */}
      <div className="pt-16 px-4 h-[calc(100vh-64px)] overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex gap-4">
          
          {/* Left - Image */}
          <div className="w-1/2 h-full flex items-center">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden">
              <img src={productImages[activeImageIndex]} alt={productName} className="w-full h-full object-cover" />
              {productImages.length > 1 && (
                <>
                  <button onClick={() => setActiveImageIndex(i => (i > 0 ? i - 1 : productImages.length - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setActiveImageIndex(i => (i < productImages.length - 1 ? i + 1 : 0))} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white"><ChevronRight className="w-4 h-4" /></button>
                </>
              )}
            </div>
          </div>

          {/* Right - Info + Form */}
          <div className="w-1/2 flex flex-col justify-center gap-3">
            {/* Product Info */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-white font-bold text-lg">{productName}</h1>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  <span className="text-white/40 text-xs">(128)</span>
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: accentColor }}>{productPrice.toLocaleString()} DZD</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between py-2 border-y border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Quantity:</span>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-7 h-7 rounded bg-white/10 text-white flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <span className="text-white font-bold w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-7 h-7 rounded bg-white/10 text-white flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${inStock ? 'text-green-400' : 'text-red-400'}`}>{inStock ? '✓ In Stock' : '✗ Out of Stock'}</span>
                <span className="text-white font-bold">{totalPrice.toLocaleString()} DZD</span>
              </div>
            </div>

            {/* Form - 2x2 */}
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={(e) => setFormData(f => ({ ...f, fullName: e.target.value }))} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none" />
              <input type="tel" placeholder="Phone Number *" value={formData.phone} onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none" dir="ltr" />
              <input type="text" placeholder="City *" value={formData.city} onChange={(e) => setFormData(f => ({ ...f, city: e.target.value }))} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none" />
              <input type="text" placeholder="Address *" value={formData.address} onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none" />
            </div>

            {/* Telegram */}
            {telegramBotInfo?.enabled && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm">Track via Telegram</span>
                  {telegramConnected && <span className="text-green-400 text-xs">✓</span>}
                </div>
                {!telegramConnected && (
                  <button onClick={handleConnectTelegram} disabled={!formData.phone || formData.phone.replace(/\D/g, '').length < 9} className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-bold disabled:opacity-50">Connect</button>
                )}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmitOrder} disabled={isSubmitting || !inStock} className="w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: accentColor }}>
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ShoppingBag className="w-4 h-4" />Confirm Order • {totalPrice.toLocaleString()} DZD</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
