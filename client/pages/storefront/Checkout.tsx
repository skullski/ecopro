import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Plus, Minus, Trash2, Lock, Truck } from 'lucide-react';
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
import { readStorefrontSettings, readStorefrontTemplate } from '@/lib/storefrontStorage';

interface CartItem {
  id: number;
  name?: string;
  title?: string;
  price: number;
  quantity: number;
  stock_quantity?: number;
  image?: string;
  images?: string[];
}

interface CheckoutStep {
  id: number;
  label: string;
  completed: boolean;
}

interface StoreSettings {
  template_accent_color?: string;
  template?: string;
  store_name?: string;
  [key: string]: any;
}

const TEMPLATE_STYLES: Record<string, Record<string, string>> = {
  electronics: {
    bg: 'bg-black',
    accent: '#38bdf8',
    text: 'text-gray-100',
    border: 'border-gray-700',
    button: 'bg-cyan-500 hover:bg-cyan-600 text-black',
    inputBg: 'bg-gray-800 border-gray-700',
  },
  fashion: {
    bg: 'bg-black',
    accent: '#f97316',
    text: 'text-gray-100',
    border: 'border-gray-700',
    button: 'bg-amber-500 hover:bg-amber-600 text-black',
    inputBg: 'bg-gray-800 border-gray-700',
  },
  fashion2: {
    bg: 'bg-white',
    accent: '#000000',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-black hover:bg-gray-900 text-white',
    inputBg: 'bg-gray-50 border-gray-200',
  },
  fashion3: {
    bg: 'bg-gray-900',
    accent: '#facc15',
    text: 'text-gray-100',
    border: 'border-gray-700',
    button: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold',
    inputBg: 'bg-gray-800 border-gray-700',
  },
  beauty: {
    bg: 'bg-white',
    accent: '#ec4899',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-pink-500 hover:bg-pink-600 text-white',
    inputBg: 'bg-gray-50 border-gray-200',
  },
  beaty: {
    bg: 'bg-white',
    accent: '#ec4899',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-pink-400 hover:bg-pink-500 text-white',
    inputBg: 'bg-gray-50 border-gray-200',
  },
  cafe: {
    bg: 'bg-amber-50',
    accent: '#d97706',
    text: 'text-gray-900',
    border: 'border-amber-200',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    inputBg: 'bg-white border-amber-200',
  },
  jewelry: {
    bg: 'bg-white',
    accent: '#d4af37',
    text: 'text-gray-900',
    border: 'border-gray-300',
    button: 'bg-yellow-700 hover:bg-yellow-800 text-white',
    inputBg: 'bg-gray-50 border-gray-300',
  },
  bags: {
    bg: 'bg-white',
    accent: '#111827',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-gray-900 hover:bg-gray-800 text-white',
    inputBg: 'bg-gray-50 border-gray-200',
  },
  baby: {
    bg: 'bg-amber-50',
    accent: '#fbbf24',
    text: 'text-gray-900',
    border: 'border-amber-100',
    button: 'bg-green-600 hover:bg-green-700 text-white',
    inputBg: 'bg-white border-amber-100',
  },
  furniture: {
    bg: 'bg-gray-50',
    accent: '#111827',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-gray-900 hover:bg-gray-800 text-white',
    inputBg: 'bg-white border-gray-200',
  },
  food: {
    bg: 'bg-white',
    accent: '#a3c76d',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-green-700 hover:bg-green-800 text-white',
    inputBg: 'bg-gray-50 border-gray-200',
  },
  perfume: {
    bg: 'bg-black',
    accent: '#f59e0b',
    text: 'text-gray-100',
    border: 'border-gray-700',
    button: 'bg-amber-500 hover:bg-amber-600 text-black',
    inputBg: 'bg-gray-800 border-gray-700',
  },
};

export default function Checkout() {
  // Force Arabic/RTL - no translation hook needed
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderStatus, setOrderStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [telegramStartUrls, setTelegramStartUrls] = useState<string[]>([]);
  const [telegramBotInfo, setTelegramBotInfo] = useState<
    | {
        enabled?: boolean;
        botUsername?: string;
        botUrl?: string;
        storeName?: string;
      }
    | null
  >(null);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [checkingTelegramConnection, setCheckingTelegramConnection] = useState(false);
  const [messengerInfo, setMessengerInfo] = useState<
    | {
        enabled?: boolean;
        storeName?: string;
        pageId?: string;
        url?: string;
        refToken?: string;
      }
    | null
  >(null);
  const [messengerConnected, setMessengerConnected] = useState(false);
  const [checkingMessengerConnection, setCheckingMessengerConnection] = useState(false);
  const [waitingForMessengerConnection, setWaitingForMessengerConnection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    hai: '',
    city: '',
    wilayaId: '',
    communeId: '',
    amount: '',
  });
  const [haiSuggestions, setHaiSuggestions] = useState<string[]>([]);
  const [haiSuggestionsSupported, setHaiSuggestionsSupported] = useState(true);
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [deliveryPriceHome, setDeliveryPriceHome] = useState<number | null>(null);
  const [deliveryPriceDesk, setDeliveryPriceDesk] = useState<number | null>(null);
  const [loadingDeliveryPrice, setLoadingDeliveryPrice] = useState(false);

  const deliveryPrice = deliveryType === 'desk' ? (deliveryPriceDesk ?? deliveryPriceHome) : deliveryPriceHome;

  // Get template and settings
  const template = readStorefrontTemplate('fashion');
  const settings: StoreSettings = readStorefrontSettings<StoreSettings>({} as StoreSettings);
  const style = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.fashion;
  const accentColor = settings.template_accent_color || style.accent;

  const dzWilayas = getAlgeriaWilayas();
  const dzCommunes = getAlgeriaCommunesByWilayaId(formData.wilayaId);

  // Fetch Telegram bot info for this store
  useEffect(() => {
    const fetchTelegramInfo = async () => {
      const slug = settings?.store_slug;
      if (!slug) return;
      try {
        const res = await fetch(`/api/telegram/bot-link/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          setTelegramBotInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch Telegram info:', error);
      }
    };
    fetchTelegramInfo();
  }, [settings?.store_slug]);

  // Fetch Messenger info for this store
  useEffect(() => {
    const fetchMessengerInfo = async () => {
      const slug = settings?.store_slug;
      if (!slug) return;
      try {
        const res = await fetch(`/api/messenger/page-link/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          setMessengerInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch Messenger info:', error);
      }
    };
    fetchMessengerInfo();
  }, [settings?.store_slug]);

  // Check Telegram connection when phone changes
  useEffect(() => {
    const checkConnection = async () => {
      const slug = settings?.store_slug;
      const normalizedPhone = (formData.phone || '').replace(/\D/g, '');
      if (!slug || normalizedPhone.length < 9) {
        setTelegramConnected(false);
        return;
      }

      setCheckingTelegramConnection(true);
      try {
        const res = await fetch(
          `/api/telegram/check-connection/${encodeURIComponent(slug)}?phone=${encodeURIComponent(normalizedPhone)}`
        );
        if (res.ok) {
          const data = await res.json();
          setTelegramConnected(Boolean(data?.connected));
        }
      } catch (error) {
        console.error('Failed to check Telegram connection:', error);
      } finally {
        setCheckingTelegramConnection(false);
      }
    };

    const timeout = window.setTimeout(checkConnection, 500);
    return () => window.clearTimeout(timeout);
  }, [settings?.store_slug, formData.phone]);

  // Check Messenger connection when phone changes
  useEffect(() => {
    const checkConnection = async () => {
      const slug = settings?.store_slug;
      const normalizedPhone = (formData.phone || '').replace(/\D/g, '');
      if (!slug || normalizedPhone.length < 9) {
        setMessengerConnected(false);
        return;
      }

      setCheckingMessengerConnection(true);
      try {
        const res = await fetch(
          `/api/messenger/check-connection/${encodeURIComponent(slug)}?phone=${encodeURIComponent(normalizedPhone)}`
        );
        if (res.ok) {
          const data = await res.json();
          setMessengerConnected(Boolean(data?.connected));
          if (data?.connected) setWaitingForMessengerConnection(false);
        }
      } catch (error) {
        console.error('Failed to check Messenger connection:', error);
      } finally {
        setCheckingMessengerConnection(false);
      }
    };

    const timeout = window.setTimeout(checkConnection, 500);
    return () => window.clearTimeout(timeout);
  }, [settings?.store_slug, formData.phone]);

  const handleConnectTelegram = async () => {
    const slug = settings?.store_slug;
    const botUsername = telegramBotInfo?.botUsername;
    if (!slug || !botUsername) return;

    let url = `https://t.me/${botUsername}`;
    const normalizedPhone = (formData.phone || '').replace(/\D/g, '');
    if (normalizedPhone.length >= 9) {
      try {
        const res = await fetch(
          `/api/telegram/bot-link/${encodeURIComponent(slug)}?phone=${encodeURIComponent(normalizedPhone)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.botUrl) url = String(data.botUrl);
        }
      } catch (error) {
        console.error('Failed to get Telegram link:', error);
      }
    }

    window.open(url, '_blank');
  };

  const handleConnectMessenger = async () => {
    const slug = settings?.store_slug;
    const normalizedPhone = (formData.phone || '').replace(/\D/g, '');
    const pageId = messengerInfo?.pageId;
    if (!slug || !pageId) return;

    let url = messengerInfo?.url || `https://m.me/${encodeURIComponent(pageId)}`;
    if (normalizedPhone.length >= 9) {
      try {
        const res = await fetch(
          `/api/messenger/page-link/${encodeURIComponent(slug)}?phone=${encodeURIComponent(normalizedPhone)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.url) url = String(data.url);
        }
      } catch (error) {
        console.error('Failed to get Messenger link:', error);
      }
    }

    setWaitingForMessengerConnection(true);
    window.open(url, '_blank');

    // Poll briefly so UI flips to Connected automatically
    if (normalizedPhone.length < 9) return;
    let tries = 0;
    const poll = window.setInterval(async () => {
      tries++;
      if (tries > 60) {
        window.clearInterval(poll);
        setWaitingForMessengerConnection(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/messenger/check-connection/${encodeURIComponent(slug)}?phone=${encodeURIComponent(normalizedPhone)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.connected) {
            setMessengerConnected(true);
            setWaitingForMessengerConnection(false);
            window.clearInterval(poll);
          }
        }
      } catch {
        // ignore
      }
    }, 2000);
  };

  useEffect(() => {
    let stopped = false;
    const loadHaiSuggestions = async () => {
      if (!haiSuggestionsSupported || !settings?.store_slug || !formData.communeId) {
        setHaiSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/storefront/${encodeURIComponent(settings.store_slug)}/address/hai-suggestions?communeId=${encodeURIComponent(formData.communeId)}`
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
  }, [haiSuggestionsSupported, settings?.store_slug, formData.communeId]);

  // Fetch product on mount - try checkout session first, then localStorage, then API
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('No product ID provided');
      
      // Get session ID from URL if available
      const sessionId = new URLSearchParams(window.location.search).get('session');
      
      // Try database checkout session first
      if (sessionId) {
        try {
          const response = await fetch(`/api/checkout/get-product/${encodeURIComponent(sessionId)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.product) return data.product;
          }
        } catch (error) {
          console.error('Failed to retrieve from checkout session:', error);
        }
      }
      
      // Fallback to localStorage
      const cachedProduct = localStorage.getItem(`product_${productId}`);
      if (cachedProduct) {
        const parsed = JSON.parse(cachedProduct);
        // Only use cache if it includes stock_quantity; otherwise it can allow out-of-stock checkout.
        if (typeof parsed?.stock_quantity === 'number') return parsed;
      }
      
      // Fetch from store product endpoint (products added from stock)
      const response = await fetch(`/api/client/store/products/${productId}`);
      if (response.ok) {
        return response.json();
      }
      
      throw new Error('Failed to fetch product');
    },
    enabled: !!productId,
  });

  // Fetch delivery price when wilaya changes
  useEffect(() => {
    const fetchDeliveryPrice = async () => {
      const shippingMeta: any = (product as any)?.metadata?.shipping || null;
      const shippingMode = shippingMeta?.mode || shippingMeta?.shipping_mode || null;
      if (shippingMode === 'free') {
        setDeliveryPriceHome(0);
        setDeliveryPriceDesk(0);
        setLoadingDeliveryPrice(false);
        return;
      }
      if (shippingMode === 'flat') {
        const fee = Number(
          shippingMeta?.flat_fee ??
          shippingMeta?.flatFee ??
          shippingMeta?.shipping_flat_fee ??
          0
        );
        const safeFee = Number.isFinite(fee) && fee >= 0 ? fee : 0;
        setDeliveryPriceHome(safeFee);
        setDeliveryPriceDesk(safeFee);
        setLoadingDeliveryPrice(false);
        return;
      }

      if (!settings?.store_slug || !formData.wilayaId) {
        setDeliveryPriceHome(null);
        setDeliveryPriceDesk(null);
        return;
      }

      setLoadingDeliveryPrice(true);
      try {
        const res = await fetch(
          `/api/storefront/${encodeURIComponent(settings.store_slug)}/delivery-prices?wilaya_id=${formData.wilayaId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.price) {
            const home = data.price.home_delivery_price;
            const desk = data.price.desk_delivery_price;
            setDeliveryPriceHome(home == null ? null : Number(home));
            setDeliveryPriceDesk(desk == null ? null : Number(desk));
          } else if (data.default_price) {
            const fallback = Number(data.default_price);
            setDeliveryPriceHome(Number.isFinite(fallback) ? fallback : null);
            setDeliveryPriceDesk(null);
          } else {
            setDeliveryPriceHome(null);
            setDeliveryPriceDesk(null);
          }
        } else {
          setDeliveryPriceHome(null);
          setDeliveryPriceDesk(null);
        }
      } catch {
        setDeliveryPriceHome(null);
        setDeliveryPriceDesk(null);
      } finally {
        setLoadingDeliveryPrice(false);
      }
    };

    fetchDeliveryPrice();
  }, [settings?.store_slug, formData.wilayaId, product]);

  React.useEffect(() => {
    if (product) {
      const qty = parseInt(searchParams.get('quantity') || '1');
      const stock = typeof product?.stock_quantity === 'number' ? Number(product.stock_quantity) : null;
      const safeQty = stock !== null && Number.isFinite(stock) && stock > 0 ? Math.min(Math.max(1, qty), stock) : Math.max(1, qty);
      setQuantity(safeQty);
      setCart([
        {
          id: product.id,
          title: product.title || product.name,
          name: product.title || product.name,
          price: product.price,
          quantity: safeQty,
          stock_quantity: typeof product?.stock_quantity === 'number' ? Number(product.stock_quantity) : undefined,
          image: product.images?.[0],
          images: product.images,
        },
      ]);
    }
  }, [product, searchParams]);

  // Update cart when quantity changes
  React.useEffect(() => {
    if (cart.length > 0) {
      setCart([{ ...cart[0], quantity }]);
    }
  }, [quantity]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCost = 500; // Fixed delivery fee
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + deliveryCost + tax;

  const steps: CheckoutStep[] = [
    { id: 1, label: 'السلة', completed: currentStep > 1 },
    { id: 2, label: 'التوصيل', completed: currentStep > 2 },
    { id: 3, label: 'مراجعة', completed: false },
  ];

  return (
    <div dir="rtl" className={`min-h-screen ${style.bg} ${style.text}`}>
      {/* Header */}
      <div className={`border-b ${style.border} sticky top-0 z-40 bg-opacity-95 backdrop-blur`}>
        <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-3 py-2 sm:py-3 md:py-3 flex items-center gap-2 sm:gap-3 md:gap-3">
          <button onClick={() => navigate(-1)} className="p-1 sm:p-1.5 md:p-1">
            <ChevronLeft className="w-5 sm:w-6 md:w-5 h-5 sm:h-6 md:h-5 rotate-180" />
          </button>
          <h1 className="text-lg sm:text-xl md:text-xl font-bold">إتمام الطلب</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-3 py-2 sm:py-3 md:py-4 lg:py-3 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-4">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-2 sm:space-y-3 md:space-y-3 lg:space-y-2 md:space-y-3">
            {/* Progress Steps */}
            <div className="space-y-0.5 sm:space-y-2 md:space-y-2">
              <div className="flex gap-0.5 sm:gap-1 md:gap-1">
                {steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => step.completed && setCurrentStep(step.id)}
                      className={`flex-1 py-1 sm:py-2 md:py-2 px-0.5 sm:px-1 md:px-1 rounded-lg font-semibold text-center text-xs sm:text-sm md:text-sm transition-colors ${
                        currentStep === step.id
                          ? style.button
                          : step.completed
                          ? `border ${style.border}`
                          : `border ${style.border} opacity-50`
                      }`}
                      style={
                        currentStep === step.id
                          ? { backgroundColor: accentColor, color: style.bg === 'bg-black' ? '#000' : '#fff' }
                          : {}
                      }
                    >
                      {step.label}
                    </button>
                    {idx < steps.length - 1 && <div className={`flex-1 border-t ${style.border}`} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step 1: Cart */}
            {currentStep === 1 && (
              <div className={`border ${style.border} rounded-lg p-2 sm:p-3 md:p-3 lg:p-3`}>
                <h2 className="text-base sm:text-lg md:text-lg lg:text-xl font-bold mb-2 sm:mb-3 md:mb-3 lg:mb-4">ملخص الطلب</h2>
                <div className="space-y-2 sm:space-y-2.5 md:space-y-2 lg:space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className={`flex gap-2 sm:gap-2.5 md:gap-2 lg:gap-4 border-b ${style.border} pb-2 sm:pb-2.5 md:pb-2 lg:pb-4`}>
                      <img
                        src={item.image || 'https://via.placeholder.com/80'}
                        alt={item.name}
                        className="w-12 sm:w-14 md:w-14 lg:w-20 h-12 sm:h-14 md:h-14 lg:h-20 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-xs sm:text-sm md:text-sm">{item.name}</h3>
                        <p className="text-xs sm:text-xs md:text-xs text-gray-500">{item.price} دج للقطعة</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                          <button
                            onClick={() =>
                              setCart(
                                cart.map((i) =>
                                  i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
                                )
                              )
                            }
                            className="p-0.5 sm:p-1"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                          <span className="w-4 sm:w-6 text-center text-xs sm:text-sm">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const max = typeof item.stock_quantity === 'number' && Number.isFinite(item.stock_quantity)
                                ? Number(item.stock_quantity)
                                : null;
                              setCart(
                                cart.map((i) => {
                                  if (i.id !== item.id) return i;
                                  if (max !== null && max > 0) return { ...i, quantity: Math.min(max, i.quantity + 1) };
                                  return { ...i, quantity: i.quantity + 1 };
                                })
                              );
                            }}
                            className="p-0.5 sm:p-1"
                            disabled={
                              typeof item.stock_quantity === 'number' &&
                              Number.isFinite(item.stock_quantity) &&
                              item.stock_quantity > 0 &&
                              item.quantity >= item.stock_quantity
                            }
                          >
                            <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                        </div>
                        <p className="font-bold text-xs sm:text-sm" style={{ color: accentColor }}>
                          {item.price * item.quantity} دج
                        </p>
                        <button
                          onClick={() => setCart(cart.filter((i) => i.id !== item.id))}
                          className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center gap-0.5 sm:gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          إزالة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className={`w-full py-3 rounded-lg font-bold text-lg mt-6 ${style.button}`}
                >
                  متابعة إلى معلومات التوصيل
                </button>
              </div>
            )}

            {/* Step 2: Delivery */}
            {currentStep === 2 && (
              <div className={`border-2 ${style.border} rounded-xl p-2 sm:p-3 md:p-2 lg:p-3 space-y-1.5 sm:space-y-2 md:space-y-1.5 lg:space-y-5 shadow-lg`}>
                <h2 className="text-base sm:text-lg md:text-lg lg:text-xl md:text-2xl font-bold flex items-center gap-1 sm:gap-1.5 md:gap-1.5 mb-1 sm:mb-2 md:mb-2">
                  <div style={{ backgroundColor: accentColor }} className="p-0.5 sm:p-1 md:p-1 lg:p-3 rounded-lg">
                    <Truck className="w-3 sm:w-4 md:w-4 lg:w-7 h-3 sm:h-4 md:h-4 lg:h-7" style={{ color: style.bg === 'bg-black' ? '#000' : '#fff' }} />
                  </div>
                  معلومات التوصيل
                </h2>
                
                <div className="bg-gradient-to-r from-blue-50 to-transparent p-1.5 sm:p-2 md:p-1.5 lg:p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs sm:text-xs md:text-xs lg:text-sm text-gray-700">📍 <strong>الدفع:</strong> الدفع عند الاستلام - ادفع للموزّع عند الوصول</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-4">
                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5">
                    <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">الاسم الكامل *</label>
                    <input
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm ${style.inputBg} focus:outline-none focus:ring-2 focus:ring-offset-1 transition shadow-sm`}
                      style={{ '--tw-ring-color': accentColor } as any}
                    />
                  </div>

                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5">
                  </div>

                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5">
                    <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">رقم الهاتف *</label>
                    <input
                      type="tel"
                      placeholder="05XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm ${style.inputBg} focus:outline-none focus:ring-2 focus:ring-offset-1 transition shadow-sm`}
                      style={{ '--tw-ring-color': accentColor } as any}
                    />
                    {formData.phone && !/^\+?[0-9]{7,}$/.test(formData.phone.replace(/\s/g, '')) && (
                      <p className="text-xs text-red-600 mt-1">يرجى إدخال رقم هاتف صحيح</p>
                    )}

                    {telegramBotInfo && settings?.store_slug && (
                      <div className={`mt-2 p-2 rounded-lg border ${style.border}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[11px] sm:text-xs font-bold opacity-75">
                            Telegram (Optional)
                          </div>
                          <div className="text-[11px] sm:text-xs">
                            {checkingTelegramConnection
                              ? 'Checking…'
                              : telegramConnected
                              ? 'Connected ✓'
                              : telegramBotInfo.enabled
                              ? 'Not connected'
                              : 'Unavailable'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleConnectTelegram}
                          disabled={
                            !telegramBotInfo.enabled ||
                            (formData.phone || '').replace(/\D/g, '').length < 9
                          }
                          className={`mt-2 w-full py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition disabled:opacity-60 ${style.button}`}
                          style={{ backgroundColor: accentColor, color: style.bg === 'bg-black' ? '#000' : '#fff' }}
                        >
                          {telegramBotInfo.enabled ? 'Connect Telegram' : 'Telegram Unavailable'}
                        </button>
                        {!telegramBotInfo.enabled && (
                          <div className="mt-1 text-[10px] sm:text-[11px] opacity-60">
                            Telegram is not configured for this store.
                          </div>
                        )}
                        <div className="mt-1 text-[10px] sm:text-[11px] opacity-60">
                          Add your phone number first, then connect to receive instant order updates.
                        </div>
                      </div>
                    )}

                    {messengerInfo && settings?.store_slug && (
                      <div className={`mt-2 p-2 rounded-lg border ${style.border}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[11px] sm:text-xs font-bold opacity-75">ماسنجر (اختياري)</div>
                          <div className="text-[11px] sm:text-xs">
                            {checkingMessengerConnection
                              ? 'Checking…'
                              : messengerConnected
                              ? 'Connected ✓'
                              : waitingForMessengerConnection
                              ? 'Waiting…'
                              : messengerInfo.enabled
                              ? 'Not connected'
                              : 'Unavailable'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleConnectMessenger}
                          disabled={
                            !messengerInfo.enabled ||
                            (formData.phone || '').replace(/\D/g, '').length < 9 ||
                            waitingForMessengerConnection
                          }
                          className={`mt-2 w-full py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition disabled:opacity-60 ${style.button}`}
                          style={{ backgroundColor: accentColor, color: style.bg === 'bg-black' ? '#000' : '#fff' }}
                        >
                          {waitingForMessengerConnection
                            ? 'Connecting…'
                            : messengerInfo.enabled
                            ? 'Connect Messenger'
                            : 'Messenger Unavailable'}
                        </button>
                        {!messengerInfo.enabled && (
                          <div className="mt-1 text-[10px] sm:text-[11px] opacity-60">
                            Messenger is not configured for this store.
                          </div>
                        )}
                        <div className="mt-1 text-[10px] sm:text-[11px] opacity-60">
                          Add your phone number first, then connect to receive instant order updates.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5">
                    <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">الولاية *</label>
                    <Select
                      value={formData.wilayaId}
                      onValueChange={(nextId) => {
                        setFormData({ ...formData, wilayaId: nextId, communeId: '', city: '' });
                      }}
                    >
                      <SelectTrigger
                        className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm ${style.inputBg} focus:outline-none focus:ring-2 focus:ring-offset-1 transition shadow-sm h-auto`}
                        style={{ '--tw-ring-color': accentColor } as any}
                      >
                        <SelectValue placeholder="اختر الولاية" />
                      </SelectTrigger>
                      <SelectContent>
                        {dzWilayas.map((w) => (
                          <SelectItem key={w.id} value={String(w.id)}>
                            {formatWilayaLabel(w)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5">
                    <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">البلدية *</label>
                    <Select
                      value={formData.communeId}
                      disabled={!formData.wilayaId}
                      onValueChange={(nextId) => {
                        const c = getAlgeriaCommuneById(nextId);
                        setFormData({ ...formData, communeId: nextId, city: c?.name || '' });
                      }}
                    >
                      <SelectTrigger
                        className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm ${style.inputBg} focus:outline-none focus:ring-2 focus:ring-offset-1 transition shadow-sm disabled:opacity-60 h-auto`}
                        style={{ '--tw-ring-color': accentColor } as any}
                      >
                        <SelectValue placeholder={formData.wilayaId ? "اختر البلدية" : "اختر الولاية أولاً"} />
                      </SelectTrigger>
                      <SelectContent>
                        {dzCommunes.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hai / Neighborhood removed per request */}

                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5 md:col-span-2">
                    <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">نوع التوصيل *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryType('desk');
                          setFormData((f) => ({ ...f, address: '' }));
                        }}
                        disabled={deliveryPriceDesk == null && deliveryPriceHome != null}
                        className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm font-bold transition shadow-sm text-left ${
                          deliveryType === 'desk'
                            ? 'bg-gray-900 text-white border-gray-900'
                            : `${style.inputBg} hover:bg-opacity-80`
                        } ${(deliveryPriceDesk == null && deliveryPriceHome != null) ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div>توصيل للمكتب</div>
                        <div className={`text-[11px] ${deliveryType === 'desk' ? 'text-white/80' : 'opacity-70'}`}>
                          {loadingDeliveryPrice
                            ? 'جاري التحميل...'
                            : deliveryPriceDesk != null
                              ? `${deliveryPriceDesk} دج`
                              : 'غير متوفر'}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType('home')}
                        className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm font-bold transition shadow-sm text-left ${
                          deliveryType === 'home'
                            ? 'text-white'
                            : `${style.inputBg} hover:bg-opacity-80`
                        }`}
                        style={
                          deliveryType === 'home'
                            ? ({ backgroundColor: accentColor, borderColor: accentColor } as any)
                            : undefined
                        }
                      >
                        <div>توصيل للمنزل</div>
                        <div className={`text-[11px] ${deliveryType === 'home' ? 'text-white/80' : 'opacity-70'}`}>
                          {loadingDeliveryPrice
                            ? 'جاري التحميل...'
                            : deliveryPriceHome != null
                              ? `${deliveryPriceHome} دج`
                              : 'اختر الولاية'}
                        </div>
                      </button>
                    </div>
                  </div>

                  {deliveryType === 'home' && (
                    <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5 md:col-span-2">
                      <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">العنوان *</label>
                      <input
                        type="text"
                        placeholder="أدخل عنوانك الكامل"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm ${style.inputBg} focus:outline-none focus:ring-2 focus:ring-offset-1 transition shadow-sm`}
                        style={{ '--tw-ring-color': accentColor } as any}
                      />
                    </div>
                  )}

                </div>

                {/* Compact Quantity Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-xs md:text-xs lg:text-sm font-bold whitespace-nowrap">الكمية:</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`p-0.5 sm:p-1 rounded border-2 ${style.border} hover:bg-opacity-50 transition`}
                    >
                      <Minus className="w-3 sm:w-3 h-3 sm:h-3" />
                    </button>
                    <span className="text-sm sm:text-base font-bold w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className={`p-0.5 sm:p-1 rounded border-2 ${style.border} hover:bg-opacity-50 transition`}
                    >
                      <Plus className="w-3 sm:w-3 h-3 sm:h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-1 sm:gap-1.5 md:gap-1.5 lg:gap-4 pt-1.5 sm:pt-2 md:pt-2 lg:pt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className={`flex-1 py-1.5 sm:py-2 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-xs md:text-xs lg:text-base ${style.border} font-bold transition hover:shadow-lg`}
                  >
                    ← الرجوع إلى السلة
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className={`flex-1 py-1.5 sm:py-2 md:py-1.5 lg:py-3 rounded-lg font-bold text-xs sm:text-xs md:text-xs lg:text-base transition hover:shadow-lg ${style.button}`}
                    style={{ backgroundColor: accentColor, color: style.bg === 'bg-black' ? '#000' : '#fff' }}
                  >
                    متابعة إلى المراجعة →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className={`border-2 ${style.border} rounded-xl p-2 sm:p-3 md:p-2 lg:p-3 space-y-1.5 sm:space-y-2 md:space-y-1.5 lg:space-y-2 md:space-y-3 shadow-lg`}>
                <h2 className="text-base sm:text-lg md:text-lg lg:text-xl md:text-2xl font-bold mb-1 sm:mb-2 md:mb-2 lg:mb-4">ملخص الطلب</h2>
                <div className="bg-gradient-to-r from-green-50 to-transparent border-l-4 border-green-500 p-2 sm:p-3 md:p-4 lg:p-5 rounded-lg mb-2 sm:mb-3 md:mb-4 lg:mb-4 shadow-sm">
                  <p className="text-green-700 font-bold text-sm sm:text-base md:text-base lg:text-lg">✓ جاهز لإتمام طلبك</p>
                  <p className="text-xs sm:text-xs md:text-xs lg:text-sm text-green-600 mt-1">سيتم تحصيل الدفع عند التوصيل</p>
                </div>

                <div className={`${style.inputBg} rounded-lg p-2 sm:p-2.5 md:p-2 lg:p-3 space-y-1.5 sm:space-y-2 md:space-y-1.5 lg:space-y-3 border-2 ${style.border}`}>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm md:text-xs lg:text-lg mb-1.5 sm:mb-2 md:mb-1.5 lg:mb-2">المنتجات</h3>
                    <div className="space-y-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs sm:text-xs md:text-xs lg:text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span className="font-bold">{item.price * item.quantity} دج</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Summary */}
                  <div className="border-t border-gray-400 pt-1.5 space-y-1">
                    <div className="flex justify-between text-xs sm:text-xs md:text-xs lg:text-sm">
                      <span className="opacity-70">المجموع الفرعي</span>
                      <span>{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} دج</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-xs md:text-xs lg:text-sm">
                      <span className="opacity-70">رسوم التوصيل</span>
                      {loadingDeliveryPrice ? (
                        <span className="opacity-50">جاري التحميل...</span>
                      ) : deliveryPrice !== null ? (
                        <span>{deliveryPrice} دج</span>
                      ) : (
                        <span className="opacity-50 text-xs">اختر الولاية لحساب التوصيل</span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm sm:text-base md:text-sm lg:text-lg font-bold pt-1 border-t border-gray-300">
                      <span>المجموع</span>
                      <span style={{ color: style.accent }}>
                        {cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + (deliveryPrice || 0)} دج
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-400 pt-1.5" />
                  <h3 className="font-bold text-xs sm:text-sm md:text-xs lg:text-lg mb-1.5 sm:mb-2 md:mb-1.5 lg:mb-4">تفاصيل التوصيل</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-4 text-xs sm:text-xs md:text-xs lg:text-sm">
                    <div>
                      <p className="opacity-60 text-xs font-semibold">الاسم</p>
                      <p className="font-bold">{formData.fullName || 'غير مُدخل'}</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-xs font-semibold">البريد الإلكتروني</p>
                      <p className="font-bold">{formData.email || 'غير مُدخل'}</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-xs font-semibold">الهاتف</p>
                      <p className="font-bold">{formData.phone || 'غير مُدخل'}</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-xs font-semibold">المبلغ</p>
                      <p className="font-bold">{formData.amount || '0'} دج</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-xs font-semibold">المدينة</p>
                      <p className="font-bold">{formData.city || 'غير مُدخل'}</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-xs font-semibold">نوع التوصيل</p>
                      <p className="font-bold">{deliveryType === 'desk' ? 'مكتب' : 'منزل'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="opacity-60 text-xs font-semibold">العنوان</p>
                      <p className="font-bold">{deliveryType === 'home' ? (formData.address || 'غير مُدخل') : 'مخفي (توصيل إلى مكتب)'}</p>
                    </div>
                  </div>
                </div>

                {orderStatus.type && (
                  <div
                    className={`p-2 sm:p-3 md:p-3 lg:p-4 rounded-lg text-xs sm:text-sm md:text-sm lg:text-base font-semibold ${
                      orderStatus.type === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {orderStatus.message}
                  </div>
                )}

                {orderStatus.type === 'success' && telegramStartUrls.length > 0 && (
                  <div className="p-2 sm:p-3 md:p-3 lg:p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 text-xs sm:text-sm">
                    <div className="font-bold mb-2">تتبع تيليجرام (اختياري)</div>
                    <div className="space-y-2">
                      {telegramStartUrls.slice(0, 3).map((url, idx) => (
                        <a
                          key={`${url}-${idx}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-3 py-2 rounded-lg bg-white border border-blue-200 font-bold"
                        >
                          بدء محادثة تيليجرام
                        </a>
                      ))}
                      <div className="text-[11px] text-blue-800">افتح المحادثة واضغط "بدء" مرة واحدة لتصلك رسالة التأكيد وتحديثات الطلب.</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-1 sm:gap-1.5 md:gap-1.5 lg:gap-4 pt-1.5 sm:pt-2 md:pt-2 lg:pt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className={`flex-1 py-1.5 sm:py-2 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-xs md:text-xs lg:text-base ${style.border} font-bold transition hover:shadow-lg`}
                  >
                    ← تعديل معلومات التوصيل
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setIsSubmitting(true);
                        setOrderStatus({ type: null, message: '' });

                        const missingFields: string[] = [];
                        if (!formData.fullName) missingFields.push('الاسم الكامل');
                        if (!formData.email) missingFields.push('البريد الإلكتروني');
                        if (!formData.phone) missingFields.push('رقم الهاتف');
                        if (!formData.wilayaId) missingFields.push('الولاية');
                        if (!formData.communeId) missingFields.push('البلدية');
                        if (deliveryType === 'home' && !formData.address) missingFields.push('العنوان');
                        if (formData.phone && !/^\+?[0-9]{7,}$/.test(formData.phone.replace(/\s/g, ''))) {
                          missingFields.push('رقم هاتف صحيح');
                        }

                        if (missingFields.length > 0) {
                          setOrderStatus({ type: 'error', message: `يرجى ملء الحقول التالية: ${missingFields.join('، ')}` });
                          setIsSubmitting(false);
                          return;
                        }

                        // Create an order for each cart item
                        let successCount = 0;
                        let errorMessage = '';
                        const tgLinks: string[] = [];
                        const selectedWilaya = getAlgeriaWilayaById(formData.wilayaId);
                        const selectedCommune = getAlgeriaCommuneById(formData.communeId);

                        for (const item of cart) {
                          const addressParts =
                            deliveryType === 'home'
                              ? [formData.address, selectedCommune?.name || formData.city, selectedWilaya?.name ? selectedWilaya.name : '']
                              : [selectedCommune?.name || formData.city, selectedWilaya?.name ? selectedWilaya.name : ''];

                          const orderData = {
                            product_id: item.id,
                            quantity: item.quantity,
                            total_price: item.price * item.quantity + (deliveryPrice || 0),
                            delivery_fee: deliveryPrice || 0,
                            delivery_type: deliveryType,
                            customer_name: formData.fullName,
                            customer_phone: formData.phone,
                            shipping_wilaya_id: formData.wilayaId ? Number(formData.wilayaId) : null,
                            shipping_commune_id: formData.communeId ? Number(formData.communeId) : null,
                            customer_address: addressParts.filter(Boolean).join(', '),
                          };

                          const endpoint = `/api/storefront/${settings.store_slug}/orders`;
                          console.log('[Checkout] Sending order to:', endpoint, orderData);
                          const response = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(orderData),
                          });

                          const responseData = await response.json();
                          console.log('[Checkout] Order response:', responseData);

                          if (response.ok) {
                            successCount++;
                            console.log('[Checkout] Order created with ID:', responseData.order?.id);
                            if (responseData.telegramStartUrl) {
                              tgLinks.push(String(responseData.telegramStartUrl));
                            }
                          } else {
                            errorMessage = responseData.error || 'فشل في إنشاء الطلب';
                            console.error('[Checkout] Order creation error:', errorMessage);
                          }
                        }

                        setTelegramStartUrls(tgLinks);

                        if (successCount === cart.length) {
                          setOrderStatus({
                            type: 'success',
                            message: `تم استلام ${successCount} طلب بنجاح! سيتم التوصيل قريباً.`,
                          });
                          // Stay on page so customer can optionally start Telegram tracking.
                        } else if (successCount > 0) {
                          setOrderStatus({
                            type: 'error',
                            message: `نجح ${successCount} من ${cart.length} طلبات فقط`,
                          });
                        } else {
                          setOrderStatus({
                            type: 'error',
                            message: `فشل الطلب: ${errorMessage || 'فشل في إنشاء الطلب'}`,
                          });
                        }
                      } catch (error) {
                        console.error('Error placing order:', error);
                        const errorMsg = error instanceof Error ? error.message : 'خطأ غير معروف';
                        setOrderStatus({
                          type: 'error',
                          message: `فشل الطلب: ${errorMsg}`,
                        });
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className={`flex-1 py-1.5 sm:py-2 md:py-1.5 lg:py-3 rounded-lg font-bold text-xs sm:text-xs md:text-xs lg:text-base transition hover:shadow-lg disabled:opacity-50`}
                    style={{ backgroundColor: accentColor, color: style.bg === 'bg-black' ? '#000' : '#fff' }}
                  >
                    {isSubmitting ? 'جاري المعالجة...' : 'تأكيد الطلب →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className={`border ${style.border} rounded-lg p-2 sm:p-3 md:p-3 lg:p-3 h-fit sticky top-16 md:top-16`}>
            <h3 className="text-xs sm:text-sm md:text-sm lg:text-lg font-bold mb-2 sm:mb-3 md:mb-2 lg:mb-4">إجمالي الطلب</h3>
            <div className="space-y-1 sm:space-y-1.5 md:space-y-1 lg:space-y-2 mb-2 sm:mb-3 md:mb-2 lg:mb-4 pb-2 sm:pb-3 md:pb-2 lg:pb-6 border-b border-gray-300">
              <div className="flex justify-between text-xs sm:text-xs md:text-xs lg:text-sm">
                <span>المجموع الفرعي</span>
                <span>{subtotal} دج</span>
              </div>
              <div className="flex justify-between text-xs sm:text-xs md:text-xs lg:text-sm">
                <span>التوصيل</span>
                <span>{deliveryCost} دج</span>
              </div>
              <div className="flex justify-between text-xs sm:text-xs md:text-xs lg:text-sm">
                <span>الضريبة (10%)</span>
                <span>{tax} دج</span>
              </div>
            </div>
            <div className="flex justify-between text-sm sm:text-base md:text-sm lg:text-xl font-bold" style={{ color: accentColor }}>
              <span>الإجمالي</span>
              <span>{total} دج</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 sm:mt-2 md:mt-1 lg:mt-4 text-center">الدفع آمن مع تشفير SSL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
