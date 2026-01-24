import React from 'react';
import {
  formatWilayaLabel,
  getAlgeriaCommuneById,
  getAlgeriaCommunesByWilayaId,
  getAlgeriaWilayaById,
  getAlgeriaWilayas,
} from '@/lib/algeriaGeo';

type Theme = {
  bg: string;
  text: string;
  muted: string;
  accent: string;
  cardBg: string;
  border: string;
};

type ProductLike = {
  id: number;
  title?: string;
  name?: string;
  price: number;
  images?: string[];
  stock_quantity?: number;
  metadata?: any;
};

export default function EmbeddedCheckout(props: {
  storeSlug: string;
  product?: ProductLike;
  formatPrice: (n: number) => string;
  theme: Theme;
  disabled?: boolean;
  heading?: string;
  subheading?: string;
  dir?: 'rtl' | 'ltr';
}) {
  const {
    storeSlug,
    product,
    formatPrice,
    theme,
    disabled = false,
    heading = 'Checkout',
    subheading,
    dir = 'ltr',
  } = props;

  const dzWilayas = getAlgeriaWilayas();

  const [quantity, setQuantity] = React.useState(1);
  const [deliveryType, setDeliveryType] = React.useState<'home' | 'desk'>('home');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderStatus, setOrderStatus] = React.useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [telegramStartUrl, setTelegramStartUrl] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    wilayaId: '',
    communeId: '',
  });

  const [haiSuggestions, setHaiSuggestions] = React.useState<string[]>([]);
  const [haiSuggestionsSupported, setHaiSuggestionsSupported] = React.useState(true);

  const [deliveryPriceHome, setDeliveryPriceHome] = React.useState<number | null>(null);
  const [deliveryPriceDesk, setDeliveryPriceDesk] = React.useState<number | null>(null);
  const [loadingDeliveryPrice, setLoadingDeliveryPrice] = React.useState(false);

  const dzCommunes = getAlgeriaCommunesByWilayaId(formData.wilayaId);

  React.useEffect(() => {
    setTelegramStartUrl(null);
    setOrderStatus({ type: null, message: '' });
  }, [product?.id]);

  React.useEffect(() => {
    // Reset delivery type when switching products.
    setDeliveryType('home');
  }, [product?.id]);

  React.useEffect(() => {
    let stopped = false;

    const loadHaiSuggestions = async () => {
      if (disabled || !haiSuggestionsSupported || !storeSlug || !formData.communeId) {
        setHaiSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/storefront/${encodeURIComponent(String(storeSlug))}/address/hai-suggestions?communeId=${encodeURIComponent(
            formData.communeId
          )}`
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
  }, [disabled, haiSuggestionsSupported, storeSlug, formData.communeId]);

  React.useEffect(() => {
    let cancelled = false;

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
        const fee = Number(shippingMeta?.flat_fee ?? shippingMeta?.flatFee ?? shippingMeta?.shipping_flat_fee ?? 0);
        const safeFee = Number.isFinite(fee) && fee >= 0 ? fee : 0;
        setDeliveryPriceHome(safeFee);
        setDeliveryPriceDesk(safeFee);
        setLoadingDeliveryPrice(false);
        return;
      }

      if (disabled || !storeSlug || !formData.wilayaId) {
        setDeliveryPriceHome(null);
        setDeliveryPriceDesk(null);
        setLoadingDeliveryPrice(false);
        return;
      }

      setLoadingDeliveryPrice(true);
      try {
        const res = await fetch(
          `/api/storefront/${encodeURIComponent(String(storeSlug))}/delivery-prices?wilaya_id=${encodeURIComponent(
            String(formData.wilayaId)
          )}`
        );

        if (!res.ok) {
          if (!cancelled) {
            setDeliveryPriceHome(null);
            setDeliveryPriceDesk(null);
          }
          return;
        }

        const data = await res.json();
        if (data?.price) {
          const home = data.price.home_delivery_price;
          const desk = data.price.desk_delivery_price;
          if (!cancelled) {
            setDeliveryPriceHome(home == null ? null : Number(home));
            setDeliveryPriceDesk(desk == null ? null : Number(desk));
          }
        } else if (data?.default_price != null) {
          const fallback = Number(data.default_price);
          if (!cancelled) {
            setDeliveryPriceHome(Number.isFinite(fallback) ? fallback : null);
            setDeliveryPriceDesk(null);
          }
        } else {
          if (!cancelled) {
            setDeliveryPriceHome(null);
            setDeliveryPriceDesk(null);
          }
        }
      } catch {
        if (!cancelled) {
          setDeliveryPriceHome(null);
          setDeliveryPriceDesk(null);
        }
      } finally {
        if (!cancelled) setLoadingDeliveryPrice(false);
      }
    };

    fetchDeliveryPrice();
    return () => {
      cancelled = true;
    };
  }, [disabled, storeSlug, formData.wilayaId, product]);

  const title = product ? String(product.title || product.name || 'Product') : 'Product';
  const price = product ? Number(product.price) || 0 : 0;
  const subtotal = price * quantity;
  const deliveryFee = deliveryType === 'desk' ? (deliveryPriceDesk ?? deliveryPriceHome) : deliveryPriceHome;
  const total = subtotal + (deliveryFee || 0);

  const deskUnavailable = deliveryPriceDesk == null && deliveryPriceHome != null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: '10px 12px',
    background: disabled ? 'rgba(0,0,0,0.03)' : theme.bg,
    color: theme.text,
    outline: 'none',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
  };

  const submit = async () => {
    setOrderStatus({ type: null, message: '' });
    setTelegramStartUrl(null);

    if (disabled) return;
    if (!storeSlug) {
      setOrderStatus({ type: 'error', message: 'Store not ready. Please refresh.' });
      return;
    }
    if (!product?.id) {
      setOrderStatus({ type: 'error', message: 'Please select a product first.' });
      return;
    }

    if (deliveryType === 'desk' && deskUnavailable) {
      setOrderStatus({
        type: 'error',
        message: dir === 'rtl' ? 'توصيل إلى مكتب غير متوفر لهذه الولاية' : 'Desk delivery is not available for this state.',
      });
      return;
    }

    const missing: string[] = [];
    if (!formData.fullName.trim()) missing.push(dir === 'rtl' ? 'الاسم' : 'Name');
    if (!formData.phone.trim()) missing.push(dir === 'rtl' ? 'الهاتف' : 'Phone');
    if (!formData.wilayaId) missing.push(dir === 'rtl' ? 'الولاية' : 'State');
    if (!formData.communeId) missing.push(dir === 'rtl' ? 'البلدية' : 'City');
    if (deliveryType === 'home' && !formData.address.trim()) missing.push(dir === 'rtl' ? 'العنوان' : 'Address');

    const normalizedPhone = formData.phone.replace(/\s/g, '');
    if (formData.phone && !/^\+?[0-9]{7,}$/.test(normalizedPhone)) {
      missing.push(dir === 'rtl' ? 'هاتف صحيح' : 'Valid phone');
    }

    if (missing.length) {
      setOrderStatus({ type: 'error', message: `${dir === 'rtl' ? 'يرجى ملء' : 'Please fill'}: ${missing.join(', ')}` });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedWilaya = getAlgeriaWilayaById(formData.wilayaId);
      const selectedCommune = getAlgeriaCommuneById(formData.communeId);

      const addressParts =
        deliveryType === 'home'
          ? [formData.address, selectedCommune?.name || '', selectedWilaya?.name || '']
          : [selectedCommune?.name || '', selectedWilaya?.name || ''];

      const orderData: any = {
        product_id: product.id,
        quantity,
        total_price: price * quantity + (deliveryFee || 0),
        delivery_fee: deliveryFee || 0,
        delivery_type: deliveryType,
        customer_name: formData.fullName.trim(),
        ...(formData.email?.trim() ? { customer_email: formData.email.trim() } : {}),
        customer_phone: normalizedPhone,
        shipping_wilaya_id: formData.wilayaId ? Number(formData.wilayaId) : null,
        shipping_commune_id: formData.communeId ? Number(formData.communeId) : null,
        customer_address: addressParts.filter(Boolean).join(', '),
      };

      const endpoint = `/api/storefront/${encodeURIComponent(String(storeSlug))}/orders`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOrderStatus({ type: 'error', message: String(data?.error || 'Order failed. Please try again.') });
        return;
      }

      if (data?.telegramStartUrl) {
        setTelegramStartUrl(String(data.telegramStartUrl));
      }

      setOrderStatus({
        type: 'success',
        message: dir === 'rtl' ? 'تم إرسال الطلب بنجاح ✅' : 'Order placed successfully ✅',
      });
    } catch {
      setOrderStatus({ type: 'error', message: dir === 'rtl' ? 'فشل إرسال الطلب' : 'Failed to place order.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: 14,
        direction: dir,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 14 }}>{heading}</div>
      {subheading ? <div style={{ marginTop: 4, color: theme.muted, fontSize: 12 }}>{subheading}</div> : null}

      <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <div style={{ fontWeight: 900, fontSize: 13, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          <div style={{ fontWeight: 900, color: theme.accent, fontSize: 13 }}>{formatPrice(price)}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: theme.muted }}>{dir === 'rtl' ? 'الاسم' : 'Name'}</span>
            <input
              value={formData.fullName}
              disabled={disabled}
              onChange={(e) => setFormData((s) => ({ ...s, fullName: e.target.value }))}
              style={inputStyle}
              placeholder={dir === 'rtl' ? 'الاسم الكامل' : 'Full name'}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: theme.muted }}>{dir === 'rtl' ? 'الهاتف' : 'Phone'}</span>
            <input
              value={formData.phone}
              disabled={disabled}
              onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))}
              style={inputStyle}
              placeholder={dir === 'rtl' ? 'مثال: 07xxxxxxxx' : 'e.g. 07xxxxxxxx'}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 12, color: theme.muted }}>{dir === 'rtl' ? 'نوع التوصيل' : 'Delivery type'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              disabled={disabled || deskUnavailable}
              onClick={() => {
                if (disabled || deskUnavailable) return;
                setDeliveryType('desk');
              }}
              style={{
                borderRadius: 12,
                border: `1px solid ${theme.border}`,
                padding: '10px 12px',
                background: deliveryType === 'desk' ? theme.accent : theme.bg,
                color: deliveryType === 'desk' ? '#fff' : theme.text,
                cursor: disabled || deskUnavailable ? 'not-allowed' : 'pointer',
                fontWeight: 900,
                opacity: deskUnavailable ? 0.6 : 1,
              }}
            >
              {dir === 'rtl' ? 'مكتب' : 'Desk'}
              <div style={{ marginTop: 2, fontSize: 11, fontWeight: 700, opacity: deliveryType === 'desk' ? 0.85 : 0.7 }}>
                {deskUnavailable
                  ? dir === 'rtl'
                    ? 'غير متوفر'
                    : 'Unavailable'
                  : deliveryPriceDesk != null
                    ? formatPrice(deliveryPriceDesk)
                    : dir === 'rtl'
                      ? 'اختر الولاية'
                      : 'Select state'}
              </div>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setDeliveryType('home')}
              style={{
                borderRadius: 12,
                border: `1px solid ${theme.border}`,
                padding: '10px 12px',
                background: deliveryType === 'home' ? theme.accent : theme.bg,
                color: deliveryType === 'home' ? '#fff' : theme.text,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: 900,
              }}
            >
              {dir === 'rtl' ? 'منزل' : 'Home'}
              <div style={{ marginTop: 2, fontSize: 11, fontWeight: 700, opacity: deliveryType === 'home' ? 0.85 : 0.7 }}>
                {deliveryPriceHome != null
                  ? formatPrice(deliveryPriceHome)
                  : dir === 'rtl'
                    ? 'اختر الولاية'
                    : 'Select state'}
              </div>
            </button>
          </div>
        </div>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, color: theme.muted }}>{dir === 'rtl' ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}</span>
          <input
            value={formData.email}
            disabled={disabled}
            onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
            style={inputStyle}
            placeholder={dir === 'rtl' ? 'name@example.com' : 'name@example.com'}
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: theme.muted }}>{dir === 'rtl' ? 'الولاية' : 'State'}</span>
            <select
              value={formData.wilayaId}
              disabled={disabled}
              onChange={(e) => {
                const wilayaId = e.target.value;
                setFormData((s) => ({ ...s, wilayaId, communeId: '' }));
              }}
              style={selectStyle}
            >
              <option value="">{dir === 'rtl' ? 'اختر الولاية' : 'Select state'}</option>
              {dzWilayas.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {formatWilayaLabel(w)}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: theme.muted }}>{dir === 'rtl' ? 'البلدية' : 'City'}</span>
            <select
              value={formData.communeId}
              disabled={disabled || !formData.wilayaId}
              onChange={(e) => setFormData((s) => ({ ...s, communeId: e.target.value }))}
              style={selectStyle}
            >
              <option value="">{dir === 'rtl' ? 'اختر البلدية' : 'Select city'}</option>
              {dzCommunes.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Hai / Neighborhood removed per UI update */}

        {deliveryType === 'home' && (
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: theme.muted }}>{dir === 'rtl' ? 'العنوان' : 'Address'}</span>
            <input
              value={formData.address}
              disabled={disabled}
              onChange={(e) => setFormData((s) => ({ ...s, address: e.target.value }))}
              style={inputStyle}
              placeholder={dir === 'rtl' ? 'الشارع / رقم المنزل' : 'Street / house number'}
            />
          </label>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', border: `1px solid ${theme.border}`, borderRadius: 14, padding: 12, background: 'rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 12, color: theme.muted }}>{dir === 'rtl' ? 'الكمية' : 'Quantity'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 900, color: theme.text }}
            >
              −
            </button>
            <div style={{ fontWeight: 900, minWidth: 18, textAlign: 'center' }}>{quantity}</div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 900, color: theme.text }}
            >
              +
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: theme.muted }}>
            <span>{dir === 'rtl' ? 'المجموع' : 'Subtotal'}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: theme.muted }}>
            <span>{dir === 'rtl' ? 'التوصيل' : 'Delivery'}</span>
            <span>
              {loadingDeliveryPrice
                ? dir === 'rtl'
                  ? '...جارٍ'
                  : '...'
                : formatPrice(deliveryFee || 0)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, fontWeight: 900 }}>
            <span>{dir === 'rtl' ? 'الإجمالي' : 'Total'}</span>
            <span style={{ color: theme.accent }}>{formatPrice(total)}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled || isSubmitting}
          onClick={submit}
          style={{
            width: '100%',
            background: theme.accent,
            border: 0,
            borderRadius: 14,
            padding: '13px 16px',
            fontWeight: 950,
            cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
            color: '#fff',
            fontSize: 14,
            opacity: disabled || isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? (dir === 'rtl' ? 'جارٍ الإرسال...' : 'Processing...') : dir === 'rtl' ? 'إرسال الطلب' : 'Place Order'}
        </button>

        {orderStatus.type && (
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              background: orderStatus.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${orderStatus.type === 'success' ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)'}`,
              color: orderStatus.type === 'success' ? '#166534' : '#991b1b',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {orderStatus.message}
          </div>
        )}

        {telegramStartUrl ? (
          <a
            href={telegramStartUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: 12,
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              fontWeight: 900,
              textDecoration: 'none',
              background: theme.bg,
            }}
          >
            {dir === 'rtl' ? 'تتبع الطلب عبر تيليجرام' : 'Track on Telegram'}
          </a>
        ) : null}

        <div style={{ textAlign: 'center', color: theme.muted, fontSize: 12 }}>
          {dir === 'rtl' ? 'الدفع عند الاستلام • توصيل سريع' : 'Cash on delivery • Fast delivery'}
        </div>
      </div>
    </div>
  );
}
