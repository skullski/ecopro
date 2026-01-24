import React, { useEffect, useState, ReactNode } from "react";
import { StoreHeader } from '@/components/StoreHeader';
import { useNavigate, useParams } from "react-router-dom";
import { AddressForm, AddressFormValue } from "@/components/AddressForm";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { z } from "zod";
import {
  formatWilayaLabel,
  getAlgeriaCommuneById,
  getAlgeriaCommunesByWilayaId,
  getAlgeriaWilayaById,
  getAlgeriaWilayas,
} from "@/lib/algeriaGeo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Product = {
  description: ReactNode;
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  stock_quantity?: number;
  store_slug?: string;
  variants?: Array<{
    id: number;
    color?: string | null;
    size?: string | null;
    variant_name?: string | null;
    price?: number | null;
    stock_quantity: number;
    images?: string[] | null;
    sort_order?: number | null;
  }>;
};



export default function Checkout() {
  const { t, locale, setLocale } = useTranslation();

  useEffect(() => {
    const prev = locale;
    if (prev !== 'ar') setLocale('ar');
    return () => {
      if (prev !== 'ar') setLocale(prev);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { productId, storeSlug, productSlug } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [settings, setSettings] = useState<any>({});
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
  const [deliveryPlace, setDeliveryPlace] = useState<'home' | 'desk'>('home');
  const [searchQuery, setSearchQuery] = useState("");
  const [addr, setAddr] = useState<AddressFormValue & { hai?: string }>({
    name: "",
    email: "",
    line1: "",
    line2: "",
    hai: "",
    city: "",
    state: "",
    postalCode: "",
    country: "الجزائر",
    phone: "",
  } as AddressFormValue & { hai?: string });
  const [dzWilayaId, setDzWilayaId] = useState<string>("");
  const [dzCommuneId, setDzCommuneId] = useState<string>("");
  const [haiSuggestions, setHaiSuggestions] = useState<string[]>([]);
  const [haiSuggestionsSupported, setHaiSuggestionsSupported] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [telegramStartUrl, setTelegramStartUrl] = useState<string | null>(null);

  const dzWilayas = getAlgeriaWilayas();
  const dzCommunes = getAlgeriaCommunesByWilayaId(dzWilayaId);

  useEffect(() => {
    let stopped = false;
    const loadHaiSuggestions = async () => {
      if (!haiSuggestionsSupported || !storeSlug || !dzCommuneId) {
        setHaiSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/storefront/${encodeURIComponent(storeSlug)}/address/hai-suggestions?communeId=${encodeURIComponent(dzCommuneId)}`
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
  }, [haiSuggestionsSupported, storeSlug, dzCommuneId]);

  // Fetch Telegram bot info for this store (only when storeSlug is present)
  useEffect(() => {
    const fetchTelegramInfo = async () => {
      if (!storeSlug) {
        setTelegramBotInfo(null);
        return;
      }
      try {
        const res = await fetch(`/api/telegram/bot-link/${encodeURIComponent(storeSlug)}`);
        if (res.ok) {
          const data = await res.json();
          setTelegramBotInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch Telegram info:', error);
      }
    };
    fetchTelegramInfo();
  }, [storeSlug]);

  // Fetch Messenger info for this store
  useEffect(() => {
    const fetchMessengerInfo = async () => {
      if (!storeSlug) {
        setMessengerInfo(null);
        return;
      }
      try {
        const res = await fetch(`/api/messenger/page-link/${encodeURIComponent(storeSlug)}`);
        if (res.ok) {
          const data = await res.json();
          setMessengerInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch Messenger info:', error);
      }
    };
    fetchMessengerInfo();
  }, [storeSlug]);

  // Check Telegram connection when phone changes
  useEffect(() => {
    const checkConnection = async () => {
      if (!storeSlug) {
        setTelegramConnected(false);
        return;
      }

      const normalizedPhone = (addr.phone || '').replace(/\D/g, '');
      if (normalizedPhone.length < 9) {
        setTelegramConnected(false);
        return;
      }

      setCheckingTelegramConnection(true);
      try {
        const res = await fetch(
          `/api/telegram/check-connection/${encodeURIComponent(storeSlug)}?phone=${encodeURIComponent(normalizedPhone)}`
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
  }, [storeSlug, addr.phone]);

  // Check Messenger connection when phone changes
  useEffect(() => {
    const checkConnection = async () => {
      if (!storeSlug) {
        setMessengerConnected(false);
        return;
      }

      const normalizedPhone = (addr.phone || '').replace(/\D/g, '');
      if (normalizedPhone.length < 9) {
        setMessengerConnected(false);
        return;
      }

      setCheckingMessengerConnection(true);
      try {
        const res = await fetch(
          `/api/messenger/check-connection/${encodeURIComponent(storeSlug)}?phone=${encodeURIComponent(normalizedPhone)}`
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
  }, [storeSlug, addr.phone]);

  const handleConnectTelegram = async () => {
    if (!storeSlug || !telegramBotInfo?.botUsername) return;

    // If the order is already created, use the order-scoped start link.
    // This prevents Telegram from treating the connection as "preconnect before ordering".
    if (telegramStartUrl) {
      window.open(telegramStartUrl, '_blank');
      return;
    }

    let url = `https://t.me/${telegramBotInfo.botUsername}`;
    const normalizedPhone = (addr.phone || '').replace(/\D/g, '');
    if (normalizedPhone.length >= 9) {
      try {
        const res = await fetch(
          `/api/telegram/bot-link/${encodeURIComponent(storeSlug)}?phone=${encodeURIComponent(normalizedPhone)}`
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
    if (!storeSlug || !messengerInfo?.pageId) return;

    let url = messengerInfo.url || `https://m.me/${encodeURIComponent(messengerInfo.pageId)}`;
    const normalizedPhone = (addr.phone || '').replace(/\D/g, '');
    if (normalizedPhone.length >= 9) {
      try {
        const res = await fetch(
          `/api/messenger/page-link/${encodeURIComponent(storeSlug)}?phone=${encodeURIComponent(normalizedPhone)}`
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
          `/api/messenger/check-connection/${encodeURIComponent(storeSlug)}?phone=${encodeURIComponent(normalizedPhone)}`
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
    // Load store settings for header branding
    if (storeSlug) {
      fetch(`/api/storefront/${storeSlug}/settings`).then(async (res) => {
        if (res.ok) setSettings(await res.json());
      });
    }
    // Determine source: check localStorage first (saved by store template), then API
    const load = async () => {
      try {
        // Try localStorage first (set by store template when clicking Buy)
        const cachedProduct = localStorage.getItem(`product_${productSlug}`);
        if (cachedProduct) {
          const p = JSON.parse(cachedProduct);
          // Only trust cached products if stock_quantity exists; otherwise we might allow out-of-stock checkout.
          const cachedStock = typeof p.stock_quantity === 'number' ? Number(p.stock_quantity) : undefined;
          const cachedVariantsOk = Array.isArray(p.variants);
          if (cachedStock === undefined || !cachedVariantsOk) {
            // fall through to API
          } else {
          setProduct({ 
            id: String(p.id), 
            title: p.title || p.name, 
            price: Number(p.price), 
            imageUrl: p.images?.[0] || p.image, 
            description: p.description ?? "",
            stock_quantity: cachedStock,
            store_slug: p.store_slug,
            variants: Array.isArray(p.variants) ? p.variants : undefined,
          });
          return;
          }
        }
        
        // Fall back to API
        if (storeSlug && productSlug) {
          // Try by slug first
          let res = await fetch(`/api/store/${storeSlug}/${productSlug}?track_view=0`);
          if (!res.ok) {
            // Try by ID (productSlug might be numeric ID)
            res = await fetch(`/api/storefront/${storeSlug}/products/${productSlug}`);
          }
          if (res.ok) {
            const p = await res.json();
            setProduct({
              id: String(p.id),
              title: p.title || p.name,
              price: Number(p.price),
              imageUrl: p.images?.[0],
              description: p.description ?? "",
              stock_quantity: typeof p.stock_quantity === 'number' ? Number(p.stock_quantity) : undefined,
              store_slug: p.store_slug,
              variants: Array.isArray(p.variants) ? p.variants : undefined,
            });
          }
        } else if (productId) {
          const p = await apiFetch<Product>(`/api/products/${productId}`);
          setProduct(p);
        }
      } catch (e) {
        console.error('Failed to load product:', e);
      }
    };
    load();
  }, [productId, storeSlug, productSlug]);

  // Initialize default variant selection (when variants exist)
  useEffect(() => {
    const variants = Array.isArray(product?.variants) ? product!.variants! : [];
    if (!variants.length) return;
    if (selectedVariantId != null) return;

    const first = variants.find((v) => Number(v?.stock_quantity ?? 0) > 0) || variants[0];
    if (!first) return;
    setSelectedVariantId(Number(first.id));
    setSelectedColor(String(first.color || ''));
    setSelectedSize(String(first.size || ''));
  }, [product, selectedVariantId]);

  // Clamp quantity when variant changes
  useEffect(() => {
    const variants = Array.isArray(product?.variants) ? product!.variants! : [];
    if (!variants.length) return;

    const selected = variants.find((v) => Number(v.id) === Number(selectedVariantId));
    const stock = Number(selected?.stock_quantity ?? 0);
    if (!Number.isFinite(stock) || stock <= 0) {
      setQuantity(1);
      return;
    }
    setQuantity((q) => Math.min(q, stock));
  }, [product, selectedVariantId]);

  async function placeOrder() {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const variants = Array.isArray(product?.variants) ? product!.variants! : [];
      const selectedVariant = variants.find((v) => Number(v.id) === Number(selectedVariantId)) || null;
      const currentStock = selectedVariant
        ? Number(selectedVariant.stock_quantity ?? 0)
        : (typeof product?.stock_quantity === 'number' ? Number(product.stock_quantity) : null);
      if (currentStock !== null && Number.isFinite(currentStock) && currentStock <= 0) {
        setErrorMsg(t('checkout.error.outOfStockTitle'));
        return;
      }
      if (currentStock !== null && Number.isFinite(currentStock) && currentStock < quantity) {
        setErrorMsg(t('checkout.error.insufficientStockTitle'));
        return;
      }
      // Anderson/Ecotrack required fields validation
      const needsHomeAddress = deliveryPlace === 'home';
      if (!addr.name || !addr.city || !addr.country || !addr.phone || !dzWilayaId || !dzCommuneId || (needsHomeAddress && !addr.line1)) {
        setErrorMsg(t('checkout.error.requiredFieldsDesc'));
        setSubmitting(false);
        return;
      }
      // Additional Anderson/Ecotrack fields
      if (!product?.title) {
        setErrorMsg(t('checkout.error.productDesc'));
        setSubmitting(false);
        return;
      }
      if (!quantity || quantity < 1) {
        setErrorMsg("الكمية يجب أن تكون 1 على الأقل");
        setSubmitting(false);
        return;
      }
      const selectedWilaya = dzWilayaId ? getAlgeriaWilayaById(dzWilayaId) : null;
      const selectedCommune = dzCommuneId ? getAlgeriaCommuneById(dzCommuneId) : null;

      const addressStr =
        deliveryPlace === 'desk'
          ? [t('checkout.deliveryLocationDesk'), selectedCommune?.name, selectedWilaya?.name, addr.country].filter(Boolean).join(', ')
          : [addr.line1, addr.line2, addr.hai, addr.city, addr.state, addr.postalCode, addr.country]
              .filter(Boolean)
              .join(', ');

      const unitPrice = selectedVariant && selectedVariant.price != null ? Number(selectedVariant.price) : Number(product?.price ?? 0);
      const payload = {
        product_id: Number(product?.id) || Number(productId),
        variant_id: selectedVariant ? Number(selectedVariant.id) : null,
        client_id: null,
        quantity: Number(quantity) || 1,
        total_price: unitPrice * (Number(quantity) || 1),
        customer_name: addr.name || '',
        ...(addr.email?.trim() ? { customer_email: addr.email.trim() } : {}),
        customer_phone: addr?.phone || '',
        customer_address: addressStr,
        shipping_wilaya_id: dzWilayaId ? Number(dzWilayaId) : null,
        shipping_commune_id: dzCommuneId ? Number(dzCommuneId) : null,
        shipping_hai: (addr.hai || '').trim() || null,
        store_slug: storeSlug || undefined,
      };
      const endpoint = storeSlug ? `/api/storefront/${storeSlug}/orders` : '/api/orders/create';
      // Log payload and endpoint for debugging
      console.log('Placing order:', { endpoint, payload });
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let responseText = await res.text();
      let responseJson = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = null;
      }
      if (!res.ok) {
        const errorDetail = responseJson?.error || responseJson?.message || responseText;
        setErrorMsg(`${t('checkout.error.orderFailedPrefix')}: ${errorDetail}`);
        console.error('Order failed:', { status: res.status, response: responseJson, text: responseText });
        return;
      }
      const orderId = String(responseJson?.order?.id || responseJson?.id || '');
      setOrderId(orderId);
      setTelegramStartUrl(responseJson?.telegramStartUrl ? String(responseJson.telegramStartUrl) : null);
      console.log('✅ Order created successfully:', { orderId, response: responseJson });
    } catch (e: any) {
      const msg = e?.message || String(e) || "";
      setErrorMsg(`${t('checkout.error.networkErrorPrefix')}: ${msg || t('checkout.notAvailable')}`);
      console.error('Order create failed:', { error: e, stack: e?.stack });
    } finally {
      setSubmitting(false);
    }
  }


  // Only render the content below the header (header is now in StoreLayout)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-2" style={{ background: 'radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)' }}>
      {!product ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="p-6 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-t-green-400 border-gray-700 rounded-full mb-4"></div>
            <div className="text-lg text-white font-semibold">{t('checkout.loadingProductTitle')}</div>
            <div className="text-gray-400 mt-2">{t('checkout.loadingProductDesc')}</div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Order Summary */}
          <div className="flex flex-col gap-3 md:gap-4">
            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="bg-[#13162a] rounded-2xl shadow-lg border-2 border-[#23264a] p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t('checkout.chooseVariant')}</h3>
                {(() => {
                  const variants = product.variants || [];
                  const colors = Array.from(new Set(variants.map((v) => String(v.color || '').trim()).filter(Boolean)));
                  const sizes = Array.from(new Set(variants.map((v) => String(v.size || '').trim()).filter(Boolean)));
                  const selected = variants.find((v) => Number(v.id) === Number(selectedVariantId)) || null;
                  const selectedName = selected?.variant_name || [selected?.color, selected?.size].filter(Boolean).join(' / ');
                  const selectedStock = selected ? Number(selected.stock_quantity ?? 0) : null;

                  return (
                    <div className="space-y-3">
                      {(colors.length > 0 || sizes.length > 0) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {colors.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.variant.color')}</label>
                              <Select
                                value={selectedColor}
                                onValueChange={(c) => {
                                  setSelectedColor(c);
                                  const match = variants.find((v) => {
                                    const vColor = String(v.color || '');
                                    const vSize = String(v.size || '');
                                    const okColor = c ? vColor === c : true;
                                    const okSize = selectedSize ? vSize === selectedSize : true;
                                    return okColor && okSize;
                                  });
                                  if (match) {
                                    setSelectedVariantId(Number(match.id));
                                    setSelectedSize(String(match.size || ''));
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all h-auto">
                                  <SelectValue placeholder={t('checkout.variant.selectColor')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {colors.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {sizes.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.variant.size')}</label>
                              <Select
                                value={selectedSize}
                                onValueChange={(s) => {
                                  setSelectedSize(s);
                                  const match = variants.find((v) => {
                                    const vColor = String(v.color || '');
                                    const vSize = String(v.size || '');
                                    const okColor = selectedColor ? vColor === selectedColor : true;
                                    const okSize = s ? vSize === s : true;
                                    return okColor && okSize;
                                  });
                                  if (match) {
                                    setSelectedVariantId(Number(match.id));
                                    setSelectedColor(String(match.color || ''));
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all h-auto">
                                  <SelectValue placeholder={t('checkout.variant.selectSize')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {sizes.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedName && (
                        <div className="text-sm text-gray-300">
                          {t('checkout.variant.selected')} <span className="font-semibold text-white">{selectedName}</span>
                          {selectedStock != null && (
                            <span className="ml-2 text-xs text-gray-400">({t('checkout.variant.stock')}: {selectedStock})</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="bg-[#13162a] rounded-2xl shadow-lg border-2 border-[#23264a] p-6">
              <h3 className="text-lg font-semibold text-white mb-3">{t('checkout.quantityTitle')}</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg bg-[#181b2a] border-2 border-[#23264a] text-white disabled:opacity-50"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <div className="min-w-[56px] text-center text-white font-semibold">{quantity}</div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg bg-[#181b2a] border-2 border-[#23264a] text-white"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">{t('checkout.quantityHint')}</p>
            </div>

            <div className="bg-[#13162a] rounded-2xl shadow-lg border-2 border-[#23264a] p-6">
              <h2 className="text-xl font-bold text-white mb-4">{t('checkout.orderSummary')}</h2>
              <div className="flex items-center gap-4">
                <img src={product.imageUrl} alt={product.title} className="w-20 h-20 object-cover rounded-xl border-2 border-[#23264a]" />
                <div>
                  <div className="font-semibold text-white text-lg mb-1">{product.title}</div>
                  <div className="text-cyan-400 text-xl md:text-2xl font-extrabold">
                    {Math.round(
                      (
                        (Array.isArray(product.variants)
                          ? (product.variants.find((v) => Number(v.id) === Number(selectedVariantId))?.price ?? product.price)
                          : product.price) as number
                      ) / 100
                    )}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{product.description}</div>
                </div>
              </div>
            </div>
            <div className="bg-[#13162a] rounded-2xl shadow-lg border-2 border-[#23264a] p-6">
              <h3 className="text-lg font-semibold text-white mb-3">{t('checkout.orderDetails')}</h3>
              <div className="flex flex-col gap-2 text-base">
                <div className="flex justify-between text-gray-300">
                  <span>{t('checkout.subtotal')}</span>
                  <span className="font-medium text-white">
                    {Math.round(
                      (
                        (Array.isArray(product.variants)
                          ? (product.variants.find((v) => Number(v.id) === Number(selectedVariantId))?.price ?? product.price)
                          : product.price) as number
                      ) * quantity / 100
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{t('checkout.shippingLabel')}</span>
                  <span className="font-medium text-green-400">{t('checkout.free')}</span>
                </div>
                <div className="border-t border-[#23264a] my-2"></div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-white">{t('checkout.total')}</span>
                  <span className="font-extrabold text-cyan-400">
                    {Math.round(
                      (
                        (Array.isArray(product.variants)
                          ? (product.variants.find((v) => Number(v.id) === Number(selectedVariantId))?.price ?? product.price)
                          : product.price) as number
                      ) * quantity / 100
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-[#13162a] rounded-2xl shadow-lg border-2 border-[#23264a] p-5">
              <div className="flex gap-3 items-start">
                <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <div className="font-semibold text-white mb-1">{t('checkout.buyerProtectionTitle')}</div>
                  <p className="text-gray-400">{t('checkout.buyerProtectionDesc')}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Shipping Form */}
          <div className="bg-[#13162a] rounded-2xl shadow-lg border-2 border-[#23264a] p-4 md:p-6 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-white mb-4">{t('checkout.shipping')}</h2>
            <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); console.log('Form submitted, placing order...'); placeOrder(); }}>
              {/* Restore previous input field styles for clarity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.fullName')} <span className="text-red-500">*</span></label>
                <input type="text" className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.name || ''} onChange={e => setAddr({ ...addr, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.email')}</label>
                <input type="email" className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.email || ''} onChange={e => setAddr({ ...addr, email: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('checkout.deliveryLocation')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryPlace('home')}
                    className={
                      deliveryPlace === 'home'
                        ? 'w-full py-3 rounded-lg bg-[#181b2a] border-2 border-cyan-400 text-white font-bold'
                        : 'w-full py-3 rounded-lg bg-[#181b2a] border-2 border-[#23264a] text-gray-200 font-semibold hover:border-cyan-400/60'
                    }
                  >
                    {t('checkout.deliveryLocationHome')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryPlace('desk')}
                    className={
                      deliveryPlace === 'desk'
                        ? 'w-full py-3 rounded-lg bg-[#181b2a] border-2 border-cyan-400 text-white font-bold'
                        : 'w-full py-3 rounded-lg bg-[#181b2a] border-2 border-[#23264a] text-gray-200 font-semibold hover:border-cyan-400/60'
                    }
                  >
                    {t('checkout.deliveryLocationDesk')}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {deliveryPlace === 'home'
                    ? t('checkout.deliveryHintHome')
                    : t('checkout.deliveryHintDesk')}
                </p>
              </div>

              {deliveryPlace === 'home' && (
                <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.addressLine1')} <span className="text-red-500">*</span></label>
                <input type="text" className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.line1 || ''} onChange={e => setAddr({ ...addr, line1: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.addressLine2')}</label>
                <input type="text" className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.line2 || ''} onChange={e => setAddr({ ...addr, line2: e.target.value })} placeholder={t('checkout.addressLine2Placeholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.haiNeighborhood')}</label>
                {haiSuggestions.length > 0 && (
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">{t('checkout.chooseHaiOptional')}</label>
                    <Select
                      value={String(addr.hai || '')}
                      onValueChange={(v) => setAddr({ ...addr, hai: v })}
                    >
                      <SelectTrigger className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all h-auto">
                        <SelectValue placeholder={t('checkout.selectHai')} />
                      </SelectTrigger>
                      <SelectContent>
                        {haiSuggestions.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <input
                  type="text"
                  className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  value={addr.hai || ''}
                  onChange={e => setAddr({ ...addr, hai: e.target.value })}
                  placeholder={t('checkout.haiExamplePlaceholder')}
                />
              </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.wilaya')} <span className="text-red-500">*</span></label>
                  <Select
                    value={dzWilayaId}
                    onValueChange={(nextId) => {
                      setDzWilayaId(nextId);
                      setDzCommuneId("");
                      const w = getAlgeriaWilayaById(nextId);
                      setAddr({ ...addr, state: w?.name || "", city: "" });
                    }}
                  >
                    <SelectTrigger className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all h-auto">
                      <SelectValue placeholder={t('checkout.selectWilaya')} />
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.commune')} <span className="text-red-500">*</span></label>
                  <Select
                    value={dzCommuneId}
                    disabled={!dzWilayaId}
                    onValueChange={(nextId) => {
                      setDzCommuneId(nextId);
                      const c = getAlgeriaCommuneById(nextId);
                      setAddr({ ...addr, city: c?.name || "" });
                    }}
                  >
                    <SelectTrigger className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all disabled:opacity-60 h-auto">
                      <SelectValue placeholder={dzWilayaId ? t('checkout.selectCommune') : t('checkout.selectWilayaFirst')} />
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.country')} <span className="text-red-500">*</span></label>
                <input type="text" className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.country || ''} onChange={e => setAddr({ ...addr, country: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('checkout.phone')}</label>
                <input type="tel" className="w-full rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.phone || ''} onChange={e => setAddr({ ...addr, phone: e.target.value })} placeholder={t('checkout.phonePlaceholder')} />
              </div>

              {storeSlug && telegramBotInfo && (
                <div className="rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-200">{t('checkout.telegramOptional')}</div>
                    <div className="text-xs text-gray-400">
                      {checkingTelegramConnection
                        ? t('checkout.status.checking')
                        : telegramConnected
                        ? t('checkout.confirmation.connected')
                        : telegramBotInfo.enabled
                        ? t('checkout.status.notConnected')
                        : t('checkout.confirmation.unavailable')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectTelegram}
                    disabled={
                      !telegramBotInfo.enabled ||
                      (addr.phone || '').replace(/\D/g, '').length < 9
                    }
                    className="w-full mt-3 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-bold shadow hover:from-cyan-500 hover:to-cyan-600 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all disabled:opacity-60"
                  >
                    {telegramBotInfo.enabled ? t('checkout.action.connectTelegram') : t('checkout.action.telegramUnavailable')}
                  </button>
                  {!telegramBotInfo.enabled && (
                    <div className="text-xs text-gray-500 mt-2">
                      {t('checkout.telegramNotConfigured')}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {t('checkout.connectInfo')}
                  </div>
                </div>
              )}

              {storeSlug && messengerInfo && (
                <div className="rounded-lg bg-[#181b2a] border-2 border-[#23264a] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-200">{t('checkout.messengerOptional')}</div>
                    <div className="text-xs text-gray-400">
                      {checkingMessengerConnection
                        ? t('checkout.status.checking')
                        : messengerConnected
                        ? t('checkout.confirmation.connected')
                        : waitingForMessengerConnection
                        ? t('checkout.confirmation.waitingShort')
                        : messengerInfo.enabled
                        ? t('checkout.status.notConnected')
                        : t('checkout.confirmation.unavailable')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectMessenger}
                    disabled={
                      !messengerInfo.enabled ||
                      (addr.phone || '').replace(/\D/g, '').length < 9 ||
                      waitingForMessengerConnection
                    }
                    className="w-full mt-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all disabled:opacity-60"
                  >
                    {waitingForMessengerConnection
                      ? t('checkout.action.connecting')
                      : messengerInfo.enabled
                      ? t('checkout.action.connectMessenger')
                      : t('checkout.action.messengerUnavailable')}
                  </button>
                  {!messengerInfo.enabled && (
                    <div className="text-xs text-gray-500 mt-2">
                      {t('checkout.messengerNotConfigured')}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {t('checkout.connectInfo')}
                  </div>
                </div>
              )}
              <button type="submit" className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-lg shadow-lg hover:from-green-500 hover:to-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all disabled:opacity-60" disabled={submitting || !product}>
                {submitting ? t('checkout.action.placing') : t('checkout.placeOrder')}
              </button>
              {errorMsg && (
                <div className="mt-4 bg-red-900/20 border border-red-700 text-red-300 text-center px-4 py-3 rounded-lg font-semibold shadow">
                  {errorMsg}
                </div>
              )}
              <p className="text-xs text-center text-gray-500 mt-2">{t('checkout.termsNotice')}</p>
              {orderId && (
                <div className="mt-4 bg-green-900/20 border border-green-700 text-green-300 text-center px-4 py-3 rounded-lg font-semibold shadow">
                  {t('checkout.orderCreatedNotice', { id: orderId })}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
