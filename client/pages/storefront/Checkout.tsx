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
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // Get template and settings
  const template = localStorage.getItem('template') || 'fashion';
  const settings: StoreSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
  const style = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.fashion;
  const accentColor = settings.template_accent_color || style.accent;

  // Fetch product on mount
  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`/api/product/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
  });

  React.useEffect(() => {
    if (product) {
      const quantity = parseInt(searchParams.get('quantity') || '1');
      setCart([
        {
          id: product.id,
          title: product.title || product.name,
          name: product.title || product.name,
          price: product.price,
          quantity,
          image: product.images?.[0],
          images: product.images,
        },
      ]);
    }
  }, [product, searchParams]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 500;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shipping + tax;

  const steps: CheckoutStep[] = [
    { id: 1, label: 'Cart', completed: currentStep > 1 },
    { id: 2, label: 'Shipping', completed: currentStep > 2 },
    { id: 3, label: 'Payment', completed: currentStep > 3 },
    { id: 4, label: 'Review', completed: false },
  ];

  return (
    <div className={`min-h-screen ${style.bg} ${style.text}`}>
      {/* Header */}
      <div className={`border-b ${style.border} sticky top-0 z-40 bg-opacity-95 backdrop-blur`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Steps */}
            <div className="space-y-4">
              <div className="flex gap-2">
                {steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => step.completed && setCurrentStep(step.id)}
                      className={`flex-1 py-3 rounded-lg font-semibold text-center transition-colors ${
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
              <div className={`border ${style.border} rounded-lg p-6`}>
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className={`flex gap-4 border-b ${style.border} pb-4`}>
                      <img
                        src={item.image || 'https://via.placeholder.com/80'}
                        alt={item.name}
                        className="w-20 h-20 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.price} DZD each</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() =>
                              setCart(
                                cart.map((i) =>
                                  i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
                                )
                              )
                            }
                            className="p-1"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              setCart(cart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)))
                            }
                            className="p-1"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-bold" style={{ color: accentColor }}>
                          {item.price * item.quantity} DZD
                        </p>
                        <button
                          onClick={() => setCart(cart.filter((i) => i.id !== item.id))}
                          className="text-red-500 text-xs mt-2 flex items-center gap-1"
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
                  Continue to Shipping
                </button>
              </div>
            )}

            {/* Step 2: Shipping */}
            {currentStep === 2 && (
              <div className={`border ${style.border} rounded-lg p-6 space-y-6`}>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Truck className="w-6 h-6" />
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`px-4 py-2 rounded border ${style.inputBg}`}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`px-4 py-2 rounded border ${style.inputBg}`}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`px-4 py-2 rounded border ${style.inputBg}`}
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`px-4 py-2 rounded border ${style.inputBg}`}
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`px-4 py-2 rounded border md:col-span-2 ${style.inputBg}`}
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className={`px-4 py-2 rounded border ${style.inputBg}`}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className={`flex-1 py-3 rounded-lg border ${style.border} font-bold`}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className={`flex-1 py-3 rounded-lg font-bold text-lg ${style.button}`}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className={`border ${style.border} rounded-lg p-6 space-y-6`}>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Payment Method
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className={`px-4 py-2 rounded border ${style.inputBg}`}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className={`px-4 py-2 rounded border ${style.inputBg}`}
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                      className={`px-4 py-2 rounded border ${style.inputBg}`}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className={`flex-1 py-3 rounded-lg border ${style.border} font-bold`}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className={`flex-1 py-3 rounded-lg font-bold text-lg ${style.button}`}
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className={`border ${style.border} rounded-lg p-6 space-y-6`}>
                <h2 className="text-2xl font-bold">Order Review</h2>
                <div className={`bg-green-50 border-l-4 border-green-500 p-4 rounded`}>
                  <p className="text-green-700 font-semibold">✓ Ready to complete your order</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className={`flex-1 py-3 rounded-lg border ${style.border} font-bold`}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      alert('Order placed successfully!');
                      navigate('/');
                    }}
                    className={`flex-1 py-3 rounded-lg font-bold text-lg ${style.button}`}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className={`border ${style.border} rounded-lg p-6 h-fit sticky top-20`}>
            <h3 className="text-lg font-bold mb-6">Order Total</h3>
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-300">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{subtotal} DZD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping} DZD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%)</span>
                <span>{tax} DZD</span>
              </div>
            </div>
            <div className="flex justify-between text-2xl font-bold" style={{ color: accentColor }}>
              <span>Total</span>
              <span>{total} DZD</span>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">Secure checkout with SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}
