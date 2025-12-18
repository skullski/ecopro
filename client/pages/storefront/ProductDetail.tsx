import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Share2, ChevronLeft, Plus, Minus } from 'lucide-react';

interface Product {
  id: number;
  slug?: string;
  title?: string;
  name?: string;
  price: number;
  images?: string[];
  description?: string;
  category?: string;
  [key: string]: any;
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
  },
  fashion: {
    bg: 'bg-black',
    accent: '#f97316',
    text: 'text-gray-100',
    border: 'border-gray-700',
    button: 'bg-amber-500 hover:bg-amber-600 text-black',
  },
  fashion2: {
    bg: 'bg-white',
    accent: '#000000',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-black hover:bg-gray-900 text-white',
  },
  fashion3: {
    bg: 'bg-gray-900',
    accent: '#facc15',
    text: 'text-gray-100',
    border: 'border-gray-700',
    button: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold',
  },
  beauty: {
    bg: 'bg-white',
    accent: '#ec4899',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-pink-500 hover:bg-pink-600 text-white',
  },
  beaty: {
    bg: 'bg-white',
    accent: '#ec4899',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-pink-400 hover:bg-pink-500 text-white',
  },
  cafe: {
    bg: 'bg-amber-50',
    accent: '#d97706',
    text: 'text-gray-900',
    border: 'border-amber-200',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  jewelry: {
    bg: 'bg-white',
    accent: '#d4af37',
    text: 'text-gray-900',
    border: 'border-gray-300',
    button: 'bg-yellow-700 hover:bg-yellow-800 text-white',
  },
  bags: {
    bg: 'bg-white',
    accent: '#111827',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-gray-900 hover:bg-gray-800 text-white',
  },
  baby: {
    bg: 'bg-amber-50',
    accent: '#fbbf24',
    text: 'text-gray-900',
    border: 'border-amber-100',
    button: 'bg-green-600 hover:bg-green-700 text-white',
  },
  furniture: {
    bg: 'bg-gray-50',
    accent: '#111827',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-gray-900 hover:bg-gray-800 text-white',
  },
  food: {
    bg: 'bg-white',
    accent: '#a3c76d',
    text: 'text-gray-900',
    border: 'border-gray-200',
    button: 'bg-green-700 hover:bg-green-800 text-white',
  },
  perfume: {
    bg: 'bg-black',
    accent: '#f59e0b',
    text: 'text-gray-100',
    border: 'border-gray-700',
    button: 'bg-amber-500 hover:bg-amber-600 text-black',
  },
};

export default function ProductDetail() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  // Get template and settings from session/props
  const template = localStorage.getItem('template') || 'fashion';
  const settings: StoreSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
  const style = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.fashion;
  const accentColor = settings.template_accent_color || style.accent;

  // Fetch product
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id || slug],
    queryFn: async () => {
      const response = await fetch(`/api/product/${id || slug}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen ${style.bg} flex items-center justify-center`}>
        <div className={`text-center ${style.text}`}>Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-screen ${style.bg} flex items-center justify-center`}>
        <div className={`text-center ${style.text}`}>Product not found</div>
      </div>
    );
  }

  const productImage = product.images?.[0] || 'https://via.placeholder.com/500';
  const productPrice = product.price || 0;
  const productName = product.title || product.name || 'Product';
  const productDesc = product.description || 'Premium quality product';

  return (
    <div className={`min-h-screen ${style.bg} ${style.text} transition-colors`}>
      {/* Header */}
      <div className={`border-b ${style.border} sticky top-0 z-40 bg-opacity-95 backdrop-blur`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded hover:${style.bg === 'bg-black' ? 'bg-gray-800' : 'bg-gray-100'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center">{settings.store_name || 'Store'}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="flex items-center justify-center">
            <div
              className={`relative w-full aspect-square rounded-lg overflow-hidden border ${style.border} bg-gray-100`}
              style={{ borderColor: accentColor }}
            >
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setWishlist(!wishlist)}
                className={`absolute top-4 right-4 p-2 rounded-full ${
                  wishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-900'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Product Info */}
            <div>
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ backgroundColor: accentColor, color: style.bg === 'bg-black' ? '#000' : '#fff' }}
              >
                {product.category || 'Product'}
              </div>
              <h1 className="text-4xl font-bold mb-2">{productName}</h1>
              <p className="text-gray-500 text-lg mb-4">{product.material || product.realm || product.category || 'Premium'}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: accentColor }}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">(128 reviews)</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="border-t border-b border-gray-300 py-6" style={{ borderColor: accentColor, borderWidth: '1px' }}>
              <div className="text-3xl font-bold" style={{ color: accentColor }}>
                {productPrice} DZD
              </div>
              <p className="text-sm text-gray-500 mt-2">Inclusive of all taxes</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-gray-600 leading-relaxed">{productDesc}</p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="block font-semibold">Quantity</label>
              <div className="flex items-center gap-4 w-max">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`p-2 rounded border ${style.border}`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className={`p-2 rounded border ${style.border}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => navigate(`/checkout/${id || slug}?quantity=${quantity}`)}
                className={`w-full py-4 rounded-lg font-bold text-lg ${style.button} transition-colors`}
              >
                Buy Now
              </button>
              <button
                className={`w-full py-3 rounded-lg border ${style.border} font-semibold transition-colors`}
                style={{
                  borderColor: accentColor,
                  color: accentColor,
                }}
              >
                Add to Bag
              </button>
            </div>

            {/* Share */}
            <button
              className="flex items-center gap-2 w-full justify-center py-2 rounded-lg hover:bg-gray-100"
              style={{ color: accentColor }}
            >
              <Share2 className="w-4 h-4" />
              Share Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
