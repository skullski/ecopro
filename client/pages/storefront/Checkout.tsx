import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Plus, Minus, Trash2, Lock, Truck } from 'lucide-react';

interface CartItem {
  id: number;
  name?: string;
  title?: string;
  price: number;
  quantity: number;
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
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderStatus, setOrderStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    amount: '',
  });

  // Get template and settings
  const template = localStorage.getItem('template') || 'fashion';
  const settings: StoreSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
  const style = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.fashion;
  const accentColor = settings.template_accent_color || style.accent;

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
        return JSON.parse(cachedProduct);
      }
      
      // Try marketplace product first
      let response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        return response.json();
      }
      
      // Fallback to store product endpoint (for products added from stock)
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        response = await fetch(`/api/client/store/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          return response.json();
        }
      }
      
      throw new Error('Failed to fetch product from marketplace or store');
    },
    enabled: !!productId,
  });

  React.useEffect(() => {
    if (product) {
      const qty = parseInt(searchParams.get('quantity') || '1');
      setQuantity(qty);
      setCart([
        {
          id: product.id,
          title: product.title || product.name,
          name: product.title || product.name,
          price: product.price,
          quantity: qty,
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
    { id: 1, label: 'Cart', completed: currentStep > 1 },
    { id: 2, label: 'Delivery', completed: currentStep > 2 },
    { id: 3, label: 'Review', completed: false },
  ];

  return (
    <div className={`min-h-screen ${style.bg} ${style.text}`}>
      {/* Header */}
      <div className={`border-b ${style.border} sticky top-0 z-40 bg-opacity-95 backdrop-blur`}>
        <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-3 py-2 sm:py-3 md:py-3 flex items-center gap-2 sm:gap-3 md:gap-3">
          <button onClick={() => navigate(-1)} className="p-1 sm:p-1.5 md:p-1">
            <ChevronLeft className="w-5 sm:w-6 md:w-5 h-5 sm:h-6 md:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl md:text-xl font-bold">Checkout</h1>
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
                <h2 className="text-base sm:text-lg md:text-lg lg:text-xl font-bold mb-2 sm:mb-3 md:mb-3 lg:mb-4">Order Summary</h2>
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
                        <p className="text-xs sm:text-xs md:text-xs text-gray-500">{item.price} DZD each</p>
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
                          >
                            <Minus className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                          <span className="w-4 sm:w-6 text-center text-xs sm:text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              setCart(cart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)))
                            }
                            className="p-0.5 sm:p-1"
                          >
                            <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                        </div>
                        <p className="font-bold text-xs sm:text-sm" style={{ color: accentColor }}>
                          {item.price * item.quantity} DZD
                        </p>
                        <button
                          onClick={() => setCart(cart.filter((i) => i.id !== item.id))}
                          className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center gap-0.5 sm:gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className={`w-full py-3 rounded-lg font-bold text-lg mt-6 ${style.button}`}
                >
                  Continue to Delivery
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
                  Delivery Info
                </h2>
                
                <div className="bg-gradient-to-r from-blue-50 to-transparent p-1.5 sm:p-2 md:p-1.5 lg:p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs sm:text-xs md:text-xs lg:text-sm text-gray-700">📍 <strong>Payment:</strong> Cash on Delivery - Pay driver on arrival</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-4">
                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5">
                    <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm ${style.inputBg} focus:outline-none focus:ring-2 focus:ring-offset-1 transition shadow-sm`}
                      style={{ '--tw-ring-color': accentColor } as any}
                    />
                  </div>

                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5">
                    <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">Email *</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm ${style.inputBg} focus:outline-none focus:ring-2 focus:ring-offset-1 transition shadow-sm`}
                      style={{ '--tw-ring-color': accentColor } as any}
                    />
                  </div>

                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5">
                    <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+213 5XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm ${style.inputBg} focus:outline-none focus:ring-2 focus:ring-offset-1 transition shadow-sm`}
                      style={{ '--tw-ring-color': accentColor } as any}
                    />
                    {formData.phone && !/^\+?[0-9]{7,}$/.test(formData.phone.replace(/\s/g, '')) && (
                      <p className="text-xs text-red-600 mt-1">Please enter a valid phone number</p>
                    )}
                  </div>

                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5">
                    <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">City *</label>
                    <input
                      type="text"
                      placeholder="e.g., Algiers, Oran"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm ${style.inputBg} focus:outline-none focus:ring-2 focus:ring-offset-1 transition shadow-sm`}
                      style={{ '--tw-ring-color': accentColor } as any}
                    />
                  </div>

                  <div className="space-y-0.5 sm:space-y-0.5 md:space-y-0.5 md:col-span-2">
                    <label className="block text-xs sm:text-xs md:text-xs lg:text-sm font-bold opacity-75">Delivery Address *</label>
                    <input
                      type="text"
                      placeholder="Street address, building, apartment number, etc."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full px-2 sm:px-3 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-sm md:text-xs lg:text-sm ${style.inputBg} focus:outline-none focus:ring-2 focus:ring-offset-1 transition shadow-sm`}
                      style={{ '--tw-ring-color': accentColor } as any}
                    />
                  </div>

                </div>

                {/* Compact Quantity Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-xs md:text-xs lg:text-sm font-bold whitespace-nowrap">Qty:</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`p-0.5 sm:p-1 rounded border ${style.border} hover:bg-opacity-50 transition`}
                    >
                      <Minus className="w-3 sm:w-3 h-3 sm:h-3" />
                    </button>
                    <span className="text-sm sm:text-base font-bold w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className={`p-0.5 sm:p-1 rounded border ${style.border} hover:bg-opacity-50 transition`}
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
                    ← Back to Cart
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className={`flex-1 py-1.5 sm:py-2 md:py-1.5 lg:py-3 rounded-lg font-bold text-xs sm:text-xs md:text-xs lg:text-base transition hover:shadow-lg ${style.button}`}
                    style={{ backgroundColor: accentColor, color: style.bg === 'bg-black' ? '#000' : '#fff' }}
                  >
                    Continue to Review →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className={`border-2 ${style.border} rounded-xl p-2 sm:p-3 md:p-2 lg:p-3 space-y-1.5 sm:space-y-2 md:space-y-1.5 lg:space-y-2 md:space-y-3 shadow-lg`}>
                <h2 className="text-base sm:text-lg md:text-lg lg:text-xl md:text-2xl font-bold mb-1 sm:mb-2 md:mb-2 lg:mb-4">Order Review</h2>
                <div className="bg-gradient-to-r from-green-50 to-transparent border-l-4 border-green-500 p-2 sm:p-3 md:p-4 lg:p-5 rounded-lg mb-2 sm:mb-3 md:mb-4 lg:mb-4 shadow-sm">
                  <p className="text-green-700 font-bold text-sm sm:text-base md:text-base lg:text-lg">✓ Ready to complete your order</p>
                  <p className="text-xs sm:text-xs md:text-xs lg:text-sm text-green-600 mt-1">Payment will be collected upon delivery</p>
                </div>

                <div className={`${style.inputBg} rounded-lg p-2 sm:p-2.5 md:p-2 lg:p-3 space-y-1.5 sm:space-y-2 md:space-y-1.5 lg:space-y-3 border-2 ${style.border}`}>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm md:text-xs lg:text-lg mb-1.5 sm:mb-2 md:mb-1.5 lg:mb-2">Order Items</h3>
                    <div className="space-y-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs sm:text-xs md:text-xs lg:text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span className="font-bold">{item.price * item.quantity} DZD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-400 pt-1.5" />
                  <h3 className="font-bold text-xs sm:text-sm md:text-xs lg:text-lg mb-1.5 sm:mb-2 md:mb-1.5 lg:mb-4">Delivery Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-4 text-xs sm:text-xs md:text-xs lg:text-sm">
                    <div>
                      <p className="opacity-60 text-xs font-semibold">Name</p>
                      <p className="font-bold">{formData.fullName || 'Not filled'}</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-xs font-semibold">Email</p>
                      <p className="font-bold">{formData.email || 'Not filled'}</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-xs font-semibold">Phone</p>
                      <p className="font-bold">{formData.phone || 'Not filled'}</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-xs font-semibold">Amount</p>
                      <p className="font-bold">{formData.amount || '0'} DZD</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-xs font-semibold">City</p>
                      <p className="font-bold">{formData.city || 'Not filled'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="opacity-60 text-xs font-semibold">Address</p>
                      <p className="font-bold">{formData.address || 'Not filled'}</p>
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

                <div className="flex gap-1 sm:gap-1.5 md:gap-1.5 lg:gap-4 pt-1.5 sm:pt-2 md:pt-2 lg:pt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className={`flex-1 py-1.5 sm:py-2 md:py-1.5 lg:py-3 rounded-lg border-2 text-xs sm:text-xs md:text-xs lg:text-base ${style.border} font-bold transition hover:shadow-lg`}
                  >
                    ← Edit Delivery
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setIsSubmitting(true);
                        setOrderStatus({ type: null, message: '' });

                        const missingFields: string[] = [];
                        if (!formData.fullName) missingFields.push('Full Name');
                        if (!formData.email) missingFields.push('Email');
                        if (!formData.phone) missingFields.push('Phone');
                        if (!formData.city) missingFields.push('City');
                        if (!formData.address) missingFields.push('Address');
                        if (formData.phone && !/^\+?[0-9]{7,}$/.test(formData.phone.replace(/\s/g, ''))) {
                          missingFields.push('Valid Phone Number');
                        }

                        if (missingFields.length > 0) {
                          setOrderStatus({ type: 'error', message: `Please fill in: ${missingFields.join(', ')}` });
                          setIsSubmitting(false);
                          return;
                        }

                        // Create an order for each cart item
                        let successCount = 0;
                        let errorMessage = '';
                        for (const item of cart) {
                          const orderData = {
                            product_id: item.id,
                            quantity: item.quantity,
                            total_price: item.price * item.quantity,
                            customer_name: formData.fullName,
                            customer_email: formData.email,
                            customer_phone: formData.phone,
                            customer_address: `${formData.address}, ${formData.city}`,
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
                          } else {
                            errorMessage = responseData.error || 'Order creation failed';
                            console.error('[Checkout] Order creation error:', errorMessage);
                          }
                        }

                        if (successCount === cart.length) {
                          setOrderStatus({
                            type: 'success',
                            message: `✓ Order placed successfully! ${successCount} item(s) will be delivered soon.`,
                          });
                          setTimeout(() => navigate('/'), 2000);
                        } else if (successCount > 0) {
                          setOrderStatus({
                            type: 'error',
                            message: `Partial success: ${successCount}/${cart.length} items ordered`,
                          });
                        } else {
                          setOrderStatus({
                            type: 'error',
                            message: `Failed to place order. ${errorMessage || 'Please try again.'}`,
                          });
                        }
                      } catch (error) {
                        console.error('Error placing order:', error);
                        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                        setOrderStatus({
                          type: 'error',
                          message: `Failed to place order: ${errorMsg}. Check your connection and try again.`,
                        });
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className={`flex-1 py-1.5 sm:py-2 md:py-1.5 lg:py-3 rounded-lg font-bold text-xs sm:text-xs md:text-xs lg:text-base transition hover:shadow-lg disabled:opacity-50`}
                    style={{ backgroundColor: accentColor, color: style.bg === 'bg-black' ? '#000' : '#fff' }}
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className={`border ${style.border} rounded-lg p-2 sm:p-3 md:p-3 lg:p-3 h-fit sticky top-16 md:top-16`}>
            <h3 className="text-xs sm:text-sm md:text-sm lg:text-lg font-bold mb-2 sm:mb-3 md:mb-2 lg:mb-4">Order Total</h3>
            <div className="space-y-1 sm:space-y-1.5 md:space-y-1 lg:space-y-2 mb-2 sm:mb-3 md:mb-2 lg:mb-4 pb-2 sm:pb-3 md:pb-2 lg:pb-6 border-b border-gray-300">
              <div className="flex justify-between text-xs sm:text-xs md:text-xs lg:text-sm">
                <span>Subtotal</span>
                <span>{subtotal} DZD</span>
              </div>
              <div className="flex justify-between text-xs sm:text-xs md:text-xs lg:text-sm">
                <span>Delivery</span>
                <span>{deliveryCost} DZD</span>
              </div>
              <div className="flex justify-between text-xs sm:text-xs md:text-xs lg:text-sm">
                <span>Tax (10%)</span>
                <span>{tax} DZD</span>
              </div>
            </div>
            <div className="flex justify-between text-sm sm:text-base md:text-sm lg:text-xl font-bold" style={{ color: accentColor }}>
              <span>Total</span>
              <span>{total} DZD</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 sm:mt-2 md:mt-1 lg:mt-4 text-center">Secure checkout with SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}
