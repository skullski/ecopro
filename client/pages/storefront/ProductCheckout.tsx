import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Heart, Share2, ChevronLeft, Plus, Minus, ShoppingBag, Truck, 
  Shield, Clock, Star, Check, MapPin, Phone, Mail, User, 
  CreditCard, Package, Sparkles, ArrowRight, X, ChevronRight,
  Copy, MessageCircle, Zap, Gift, Send, CheckCircle2
} from 'lucide-react';
import {
  formatWilayaLabel,
  getAlgeriaCommuneById,
  getAlgeriaCommunesByWilayaId,
  getAlgeriaWilayaById,
  getAlgeriaWilayas,
} from '@/lib/algeriaGeo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PixelScripts, { trackAllPixels, PixelEvents } from '@/components/storefront/PixelScripts';

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
  
  // Delivery pricing states
  const [deliveryPrice, setDeliveryPrice] = useState<number | null>(null);
  const [loadingDeliveryPrice, setLoadingDeliveryPrice] = useState(false);
  
  // Telegram pre-connect states
  const [telegramBotInfo, setTelegramBotInfo] = useState<{
    enabled: boolean;
    botUrl?: string;
    botUsername?: string;
    storeName?: string;
  } | null>(null);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [waitingForTelegramConnection, setWaitingForTelegramConnection] = useState(false);

  // Messenger pre-connect states
  const [messengerInfo, setMessengerInfo] = useState<{
    enabled: boolean;
    pageId?: string;
    url?: string;
    storeName?: string;
  } | null>(null);
  const [messengerConnected, setMessengerConnected] = useState(false);
  const [waitingForMessengerConnection, setWaitingForMessengerConnection] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    wilayaId: '',
    communeId: '',
    hai: '',
    address: '',
    notes: '',
  });
  const [haiSuggestions, setHaiSuggestions] = useState<string[]>([]);
  const [haiSuggestionsSupported, setHaiSuggestionsSupported] = useState(true);

  // Get template and settings
  const template = localStorage.getItem('template') || 'fashion';
  const settings: StoreSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
  const accentColor = settings.template_accent_color || '#3b82f6';

  const dzWilayas = getAlgeriaWilayas();
  const dzCommunes = getAlgeriaCommunesByWilayaId(formData.wilayaId);

  useEffect(() => {
    let stopped = false;
    const loadHaiSuggestions = async () => {
      const slug = storeSlug || localStorage.getItem('currentStoreSlug');
      if (!haiSuggestionsSupported || !slug || !formData.communeId) {
        setHaiSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/storefront/${encodeURIComponent(String(slug))}/address/hai-suggestions?communeId=${encodeURIComponent(formData.communeId)}`
        );
        if (res.status === 404) {
          if (!stopped) {
            setHaiSuggestions([]);
            setHaiSuggestionsSupported(false);
          }
          return;
        }
        if (!res.ok) {
          if (!stopped) setHaiSuggestions([]);
          return;
        }
        const data = await res.json();
        const values = Array.isArray(data?.suggestions)
          ? data.suggestions
              .map((s: any) => String(s?.value || '').trim())
              .filter((v: string) => v.length > 0)
          : [];
        if (!stopped) setHaiSuggestions(values);
      } catch {
        if (!stopped) setHaiSuggestions([]);
      }
    };
    loadHaiSuggestions();
    return () => {
      stopped = true;
    };
  }, [haiSuggestionsSupported, storeSlug, formData.communeId]);

  // Fetch product
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productIdentifier],
    queryFn: async () => {
      const sessionId = searchParams.get('session');

      // Public product page view tracking (counts views)
      // Only applies when visiting via /store/:storeSlug/:productSlug
      if (storeSlug && productSlug) {
        const res = await fetch(
          `/api/store/${encodeURIComponent(String(storeSlug))}/${encodeURIComponent(String(productSlug))}?track_view=1`
        );
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem(`product_${productIdentifier}`, JSON.stringify(data));
          return data;
        }
      }
      
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
        // Only use cache if it includes stock_quantity.
        // Older cached payloads may miss it and can allow out-of-stock checkout.
        if (parsed.store_slug && typeof parsed.stock_quantity === 'number') return parsed;
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
      
      // Try client store products (for store checkout)
      response = await fetch(`/api/client/store/products/${productIdentifier}`);
      if (response.ok) return response.json();
      
      throw new Error('Failed to fetch product');
    },
  });

  // Track ViewContent when product loads
  useEffect(() => {
    if (product) {
      trackAllPixels(PixelEvents.VIEW_CONTENT, {
        content_name: product.title || product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: settings.currency_code || 'DZD'
      });
    }
  }, [product?.id]);

  // Auto-scroll to checkout when opened & track InitiateCheckout
  useEffect(() => {
    if (showCheckout) {
      document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
      // Track InitiateCheckout event
      if (product) {
        trackAllPixels(PixelEvents.INITIATE_CHECKOUT, {
          content_name: product.title || product.name,
          content_ids: [product.id],
          content_type: 'product',
          value: product.price * quantity,
          currency: settings.currency_code || 'DZD',
          num_items: quantity
        });
      }
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

  // Fetch Messenger info for this store
  useEffect(() => {
    const fetchMessengerInfo = async () => {
      const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
      if (!slug) return;
      
      try {
        const res = await fetch(`/api/messenger/page-link/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setMessengerInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch Messenger info:', error);
      }
    };
    fetchMessengerInfo();
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

  // Check Messenger connection when phone changes
  useEffect(() => {
    const checkConnection = async () => {
      const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
      if (!slug || !formData.phone || formData.phone.replace(/\D/g, '').length < 9) {
        setMessengerConnected(false);
        return;
      }
      
      try {
        const normalizedPhone = formData.phone.replace(/\D/g, '');
        const res = await fetch(`/api/messenger/check-connection/${slug}?phone=${normalizedPhone}`);
        if (res.ok) {
          const data = await res.json();
          setMessengerConnected(data.connected);
        }
      } catch (error) {
        console.error('Failed to check Messenger connection:', error);
      }
    };
    
    const timeout = setTimeout(checkConnection, 500);
    return () => clearTimeout(timeout);
  }, [storeSlug, product?.store_slug, formData.phone]);

  // After placing an order, poll briefly for Telegram connection so UI updates automatically.
  useEffect(() => {
    if (!orderSuccess) return;

    const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
    const normalizedPhone = (formData.phone || '').replace(/\D/g, '');

    if (!slug) return;
    if (telegramConnected) return;
    if (!telegramBotInfo?.enabled) return;
    if (normalizedPhone.length < 9) return;

    let stopped = false;
    let tries = 0;

    const tick = async () => {
      if (stopped) return;
      tries++;
      try {
        const res = await fetch(`/api/telegram/check-connection/${slug}?phone=${normalizedPhone}`);
        if (res.ok) {
          const data = await res.json();
          if (data.connected) {
            setTelegramConnected(true);
            stopped = true;
            return;
          }
        }
      } catch {
        // ignore
      }

      if (tries >= 15) {
        stopped = true;
      }
    };

    tick();
    const interval = setInterval(tick, 2000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [orderSuccess, storeSlug, product?.store_slug, formData.phone, telegramConnected, telegramBotInfo?.enabled]);

  // After placing an order, poll briefly for Messenger connection so UI updates automatically.
  useEffect(() => {
    if (!orderSuccess) return;

    const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
    const normalizedPhone = (formData.phone || '').replace(/\D/g, '');

    if (!slug) return;
    if (messengerConnected) return;
    if (!messengerInfo?.enabled) return;
    if (normalizedPhone.length < 9) return;

    let stopped = false;
    let tries = 0;

    const tick = async () => {
      if (stopped) return;
      tries++;
      try {
        const res = await fetch(`/api/messenger/check-connection/${slug}?phone=${normalizedPhone}`);
        if (res.ok) {
          const data = await res.json();
          if (data.connected) {
            setMessengerConnected(true);
            setWaitingForMessengerConnection(false);
            stopped = true;
          }
        }
      } catch {
        // non-fatal
      }

      if (!stopped && tries < 20) {
        setTimeout(tick, 1000);
      }
    };

    setTimeout(tick, 1000);
    return () => {
      stopped = true;
    };
  }, [orderSuccess, storeSlug, product?.store_slug, formData.phone, messengerConnected, messengerInfo?.enabled]);

  // Poll for Telegram connection after clicking Connect button
  useEffect(() => {
    if (!waitingForTelegramConnection) return;
    if (telegramConnected) {
      setWaitingForTelegramConnection(false);
      return;
    }

    const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
    const normalizedPhone = (formData.phone || '').replace(/\D/g, '');

    if (!slug || normalizedPhone.length < 9) return;

    let stopped = false;
    let tries = 0;

    const tick = async () => {
      if (stopped) return;
      tries++;
      try {
        const res = await fetch(`/api/telegram/check-connection/${slug}?phone=${normalizedPhone}`);
        if (res.ok) {
          const data = await res.json();
          if (data.connected) {
            setTelegramConnected(true);
            setWaitingForTelegramConnection(false);
            stopped = true;
            return;
          }
        }
      } catch {
        // ignore
      }

      // Stop after 60 attempts (2 min)
      if (tries >= 60) {
        setWaitingForTelegramConnection(false);
        stopped = true;
      }
    };

    tick();
    const interval = setInterval(tick, 2000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [waitingForTelegramConnection, telegramConnected, storeSlug, product?.store_slug, formData.phone]);

  // Generate Telegram connect URL with phone
  const getTelegramConnectUrl = () => {
    if (!telegramBotInfo?.enabled || !telegramBotInfo?.botUsername) return null;
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 9) {
      return `https://t.me/${telegramBotInfo.botUsername}`;
    }
    // Re-fetch with phone to get personalized link
    const normalizedPhone = formData.phone.replace(/\D/g, '');
    const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
    if (!slug) return `https://t.me/${telegramBotInfo.botUsername}`;
    return `/api/telegram/bot-link/${slug}?phone=${normalizedPhone}`;
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
    
    // Start polling for connection
    setWaitingForTelegramConnection(true);
    window.open(url, '_blank');
  };

  // Open Messenger with proper link
  const handleConnectMessenger = async () => {
    if (!messengerInfo?.enabled || !messengerInfo?.pageId) return;
    
    let url = messengerInfo.url || `https://m.me/${messengerInfo.pageId}`;
    const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
    
    if (slug && formData.phone && formData.phone.replace(/\D/g, '').length >= 9) {
      try {
        const normalizedPhone = formData.phone.replace(/\D/g, '');
        const res = await fetch(`/api/messenger/page-link/${slug}?phone=${normalizedPhone}`);
        if (res.ok) {
          const data = await res.json();
          if (data.url) url = data.url;
        }
      } catch (error) {
        console.error('Failed to get Messenger link:', error);
      }
    }
    
    // Start polling for connection
    setWaitingForMessengerConnection(true);
    window.open(url, '_blank');
    
    // Poll for connection
    const slug2 = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
    const normalizedPhone = (formData.phone || '').replace(/\D/g, '');
    if (slug2 && normalizedPhone.length >= 9) {
      let tries = 0;
      const poll = setInterval(async () => {
        tries++;
        if (tries > 60) {
          clearInterval(poll);
          setWaitingForMessengerConnection(false);
          return;
        }
        try {
          const res = await fetch(`/api/messenger/check-connection/${slug2}?phone=${normalizedPhone}`);
          if (res.ok) {
            const data = await res.json();
            if (data.connected) {
              setMessengerConnected(true);
              setWaitingForMessengerConnection(false);
              clearInterval(poll);
            }
          }
        } catch {}
      }, 2000);
    }
  };

  // Fetch delivery price when wilaya changes
  useEffect(() => {
    const fetchDeliveryPrice = async () => {
      const slug = storeSlug || product?.store_slug || localStorage.getItem('currentStoreSlug');
      if (!slug || !formData.wilayaId) {
        setDeliveryPrice(null);
        return;
      }
      setLoadingDeliveryPrice(true);
      try {
        const res = await fetch(`/api/storefront/${encodeURIComponent(slug)}/delivery-prices?wilaya_id=${formData.wilayaId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.price?.home_delivery_price != null) {
            setDeliveryPrice(data.price.home_delivery_price);
          } else if (data.default_price != null) {
            setDeliveryPrice(data.default_price);
          } else {
            setDeliveryPrice(null);
          }
        } else {
          setDeliveryPrice(null);
        }
      } catch (error) {
        setDeliveryPrice(null);
      } finally {
        setLoadingDeliveryPrice(false);
      }
    };
    fetchDeliveryPrice();
  }, [storeSlug, product?.store_slug, formData.wilayaId]);

  const handleSubmitOrder = async () => {
    const currentStock = Number(product?.stock_quantity ?? 0);
    if (Number.isFinite(currentStock) && currentStock <= 0) {
      alert('Out of stock');
      return;
    }
    if (Number.isFinite(currentStock) && quantity > currentStock) {
      alert('Insufficient stock');
      return;
    }
    if (!formData.fullName || !formData.phone || !formData.wilayaId || !formData.communeId || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    if (!product?.id) {
      alert('Product error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedWilaya = getAlgeriaWilayaById(formData.wilayaId);
      const selectedCommune = getAlgeriaCommuneById(formData.communeId);

      // Build order data matching the API expectations
      const orderData = {
        product_id: product.id,
        quantity: quantity,
        total_price: ((product.price || 0) * quantity) + (deliveryPrice || 0),
        delivery_fee: deliveryPrice || 0,
        delivery_type: 'home',
        customer_name: formData.fullName,
        customer_phone: formData.phone,
        ...(formData.email?.trim() ? { customer_email: formData.email.trim() } : {}),
        shipping_wilaya_id: formData.wilayaId ? Number(formData.wilayaId) : null,
        shipping_commune_id: formData.communeId ? Number(formData.communeId) : null,
        shipping_hai: (formData.hai || '').trim() || null,
        customer_address: [
          selectedCommune?.name || formData.city,
          selectedWilaya?.name ? selectedWilaya.name : '',
          formData.hai,
        ]
          .filter(Boolean)
          .join(', ') + ` - ${formData.address}${formData.notes ? ` (${formData.notes})` : ''}`,
      };

      console.log('Submitting order:', orderData);

      const postJson = async (body: any) => {
        const resp = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const rawText = await resp.text();
        let json: any = null;
        try {
          json = rawText ? JSON.parse(rawText) : null;
        } catch {
          json = null;
        }
        return { resp, rawText, json };
      };

      let { resp: response, rawText: raw, json: result } = await postJson(orderData);

      // Backward-compat: older servers reject unknown shipping_* fields (Zod .strict())
      if (!response.ok && response.status === 400) {
        const formErrors: string[] = result?.details?.formErrors || [];
        const unrecognized = formErrors.some((e) => String(e).includes('Unrecognized key'));
        if (unrecognized) {
          const { shipping_wilaya_id, shipping_commune_id, shipping_hai, ...fallback } = orderData as any;
          ({ resp: response, rawText: raw, json: result } = await postJson(fallback));
        }
      }
      
      if (response.ok) {
        console.log('Order created:', result);
        setOrderId(result.orderId || result.id);
        if (result.telegramUrls) setTelegramUrls(result.telegramUrls);
        setOrderSuccess(true);
        
        // Track Purchase event
        trackAllPixels(PixelEvents.PURCHASE, {
          content_name: product.title || product.name,
          content_ids: [product.id],
          content_type: 'product',
          value: product.price * quantity,
          currency: settings.currency_code || 'DZD',
          num_items: quantity,
          order_id: result.orderId || result.id
        });
      } else {
        console.error('Order failed:', result);
        const msg = result?.error || result?.message || raw || `HTTP ${response.status}`;
        throw new Error(msg);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Order failed: ${msg}`);
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
  const availableStock = Number(product.stock_quantity ?? 0);
  const inStock = Number.isFinite(availableStock) && availableStock > 0;
  const subtotalPrice = productPrice * quantity;
  const totalPrice = subtotalPrice + (deliveryPrice || 0);

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
              <div className="flex justify-between text-white/60 text-sm">
                <span>Subtotal</span>
                <span>{subtotalPrice.toLocaleString()} DZD</span>
              </div>
              {deliveryPrice !== null && (
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Delivery</span>
                  <span>{deliveryPrice.toLocaleString()} DZD</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2 mt-2">
                <span>Total</span>
                <span>{totalPrice.toLocaleString()} DZD</span>
              </div>
            </div>

            {telegramBotInfo && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4 text-left">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-300" />
                    <div>
                      <p className="text-white font-bold text-sm">Telegram confirmation</p>
                      <p className="text-white/70 text-xs">
                        {telegramConnected 
                          ? 'Connected ✓' 
                          : waitingForTelegramConnection 
                            ? 'Waiting for connection...' 
                            : telegramBotInfo.enabled
                              ? 'Not connected yet'
                              : 'Unavailable'}
                      </p>
                    </div>
                  </div>

                  {!telegramConnected ? (
                    <button
                      onClick={handleConnectTelegram}
                      disabled={
                        !telegramBotInfo.enabled ||
                        !formData.phone ||
                        formData.phone.replace(/\D/g, '').length < 9 ||
                        waitingForTelegramConnection
                      }
                      className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                    >
                      {waitingForTelegramConnection ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Waiting...
                        </>
                      ) : (
                        telegramBotInfo.enabled ? 'Connect' : 'Unavailable'
                      )}
                    </button>
                  ) : (
                    <span className="text-green-300 text-xs font-bold">Ready</span>
                  )}
                </div>

                <div className="text-white/80 text-xs leading-relaxed">
                  <p className="mb-1">You will receive:</p>
                  <p>1) Order received message</p>
                  <p>2) Pin instructions</p>
                  <p>3) Confirmation buttons (Confirm / Cancel)</p>
                </div>

                {telegramUrls.length > 0 && (
                  <a
                    href={telegramUrls[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Open Telegram
                  </a>
                )}
              </div>
            )}

            {messengerInfo && (
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4 mb-4 text-left">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-300" />
                    <div>
                      <p className="text-white font-bold text-sm">Messenger confirmation</p>
                      <p className="text-white/70 text-xs">
                        {messengerConnected
                          ? 'Connected ✓'
                          : waitingForMessengerConnection
                            ? 'Waiting for connection...'
                            : messengerInfo.enabled
                              ? 'Not connected yet'
                              : 'Not available'}
                      </p>
                    </div>
                  </div>

                  {!messengerConnected ? (
                    <button
                      onClick={handleConnectMessenger}
                      disabled={
                        !messengerInfo.enabled ||
                        !formData.phone ||
                        formData.phone.replace(/\D/g, '').length < 9 ||
                        waitingForMessengerConnection
                      }
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                    >
                      {waitingForMessengerConnection ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Waiting...
                        </>
                      ) : messengerInfo.enabled ? (
                        'Connect'
                      ) : (
                        'Unavailable'
                      )}
                    </button>
                  ) : (
                    <span className="text-green-300 text-xs font-bold">Ready</span>
                  )}
                </div>

                <div className="text-white/80 text-xs leading-relaxed">
                  {messengerInfo.enabled ? (
                    <>
                      <p className="mb-1">You will receive:</p>
                      <p>1) Order received message</p>
                      <p>2) Confirmation buttons (Confirm / Cancel)</p>
                    </>
                  ) : (
                    <p>Messenger tracking is not enabled for this store.</p>
                  )}
                </div>
              </div>
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

  // Get store slug for pixel tracking
  const pixelStoreSlug = storeSlug || product?.store_slug || settings.store_slug || '';

  return (
    <>
      {pixelStoreSlug && <PixelScripts storeSlug={pixelStoreSlug} />}
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

      {/* Main Content - Responsive Layout */}
      <div className="pt-16 px-4 pb-4 min-h-[calc(100vh-64px)] overflow-y-auto md:h-[calc(100vh-64px)] md:overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col md:flex-row gap-4">
          
          {/* Image - Top on mobile, Left on desktop */}
          <div className="w-full md:w-1/2 md:h-full flex items-center shrink-0">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden max-h-[50vh] md:max-h-none">
              <img src={productImages[activeImageIndex]} alt={productName} className="w-full h-full object-cover" />
              {productImages.length > 1 && (
                <>
                  <button onClick={() => setActiveImageIndex(i => (i > 0 ? i - 1 : productImages.length - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setActiveImageIndex(i => (i < productImages.length - 1 ? i + 1 : 0))} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white"><ChevronRight className="w-4 h-4" /></button>
                </>
              )}
            </div>
          </div>

          {/* Form - Bottom on mobile, Right on desktop */}
          <div className="w-full md:w-1/2 flex flex-col justify-center gap-3">
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
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-7 h-7 rounded bg-white/10 text-white flex items-center justify-center disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-white font-bold w-6 text-center">{quantity}</span>
                <button
                  onClick={() => {
                    if (!Number.isFinite(availableStock) || availableStock <= 0) return;
                    setQuantity((q) => Math.min(availableStock, q + 1));
                  }}
                  disabled={!inStock || (Number.isFinite(availableStock) && quantity >= availableStock)}
                  className="w-7 h-7 rounded bg-white/10 text-white flex items-center justify-center disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-sm ${inStock ? 'text-green-400' : 'text-red-400'}`}>{inStock ? '✓ In Stock' : '✗ Out of Stock'}</span>
                <span className="text-white/70 text-xs">Subtotal: {subtotalPrice.toLocaleString()} DZD</span>
                <span className="text-white/70 text-xs">
                  Delivery:{' '}
                  {loadingDeliveryPrice ? (
                    <span className="text-white/40">Loading...</span>
                  ) : deliveryPrice !== null ? (
                    <span className="text-white font-semibold">+{deliveryPrice.toLocaleString()} DZD</span>
                  ) : (
                    <span className="text-white/40">Select wilaya</span>
                  )}
                </span>
                <span className="text-white font-bold">Total: {totalPrice.toLocaleString()} DZD</span>
              </div>
            </div>

            {/* Form - 2x2 */}
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={(e) => setFormData(f => ({ ...f, fullName: e.target.value }))} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none" />
              <input type="tel" placeholder="Phone Number *" value={formData.phone} onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none" dir="ltr" />
              <Select
                value={formData.wilayaId}
                onValueChange={(nextId) => {
                  setFormData((f) => ({ ...f, wilayaId: nextId, communeId: '', city: '' }));
                }}
              >
                <SelectTrigger className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none h-auto">
                  <SelectValue placeholder="Wilaya *" />
                </SelectTrigger>
                <SelectContent>
                  {dzWilayas.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {formatWilayaLabel(w)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.communeId}
                disabled={!formData.wilayaId}
                onValueChange={(nextId) => {
                  const c = getAlgeriaCommuneById(nextId);
                  setFormData((f) => ({ ...f, communeId: nextId, city: c?.name || '' }));
                }}
              >
                <SelectTrigger className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none disabled:opacity-60 h-auto">
                  <SelectValue placeholder={formData.wilayaId ? 'Baladia/Commune *' : 'Select Wilaya first'} />
                </SelectTrigger>
                <SelectContent>
                  {dzCommunes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {haiSuggestions.length > 0 && (
                <Select
                  value={formData.hai}
                  onValueChange={(v) => setFormData(f => ({ ...f, hai: v }))}
                >
                  <SelectTrigger className="col-span-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none h-auto">
                    <SelectValue placeholder="Choose Hai (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {haiSuggestions.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <input
                type="text"
                placeholder="Hai / Neighborhood (optional)"
                value={formData.hai}
                onChange={(e) => setFormData(f => ({ ...f, hai: e.target.value }))}
                className="col-span-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none"
              />
              <input type="text" placeholder="Address *" value={formData.address} onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none" />
            </div>

            {/* Telegram */}
            {telegramBotInfo && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm">Track via Telegram</span>
                  {telegramConnected && <span className="text-green-400 text-xs">✓</span>}
                  {!telegramBotInfo.enabled && <span className="text-white/50 text-xs">(Not available)</span>}
                </div>
                {!telegramConnected && (
                  <button
                    onClick={handleConnectTelegram}
                    disabled={
                      !telegramBotInfo.enabled ||
                      !formData.phone ||
                      formData.phone.replace(/\D/g, '').length < 9
                    }
                    className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-bold disabled:opacity-50"
                  >
                    {telegramBotInfo.enabled ? 'Connect' : 'Unavailable'}
                  </button>
                )}
              </div>
            )}

            {/* Messenger */}
            {messengerInfo && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-600/10 border border-blue-600/20">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-white text-sm">Track via Messenger</span>
                  {messengerConnected && <span className="text-green-400 text-xs">✓</span>}
                  {!messengerInfo.enabled && <span className="text-white/50 text-xs">(Not available)</span>}
                </div>
                {!messengerConnected && (
                  <button
                    onClick={handleConnectMessenger}
                    disabled={
                      !messengerInfo.enabled ||
                      !formData.phone ||
                      formData.phone.replace(/\D/g, '').length < 9 ||
                      waitingForMessengerConnection
                    }
                    className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-bold disabled:opacity-50"
                  >
                    {waitingForMessengerConnection ? 'Waiting...' : messengerInfo.enabled ? 'Connect' : 'Unavailable'}
                  </button>
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
    </>
  );
}
