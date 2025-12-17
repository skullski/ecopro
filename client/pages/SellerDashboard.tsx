import React, { useEffect, useState } from "react";
// import { apiFetch } from "@/lib/api";
import { Plus, Package, DollarSign, Eye, Edit, Trash2, ShoppingBag, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/components/ui/GradientCard';

// Apple color palette constants
const APPLE_COLORS = {
  bg: '#f5f5f7',
  bgCard: '#ffffff',
  textPrimary: '#000000',
  textSecondary: '#1d1d1d',
  textTertiary: '#86868b',
  blue: '#0071e3',
  blueDark: '#0066cc',
  blueActive: '#005ab3',
  green: '#34c759',
  red: '#ff3b30',
  purple: '#5856d6',
  border: '#e5e5e7',
  borderLight: 'rgba(0,0,0,0.05)',
};

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports & Outdoors',
  'Beauty & Health',
  'Toys & Games',
  'Books & Media',
  'Automotive',
  'Food & Beverages',
  'Office Supplies',
  'Pet Supplies',
  'Other'
];

// Align with backend fields used in this page
type Product = {
  id: number | string;
  seller_id?: number | string;
  title: string;
  description?: string;
  price: number;
  original_price?: number | null;
  category?: string | null;
  images?: string[];
  stock: number;
  status: string;
  condition: string;
  location?: string | null;
  shipping_available: boolean;
  views: number;
  created_at?: string;
  updated_at?: string;
};

type Order = {
  id: number | string;
  product_id: number | string;
  status?: string;
  total_price?: string | number | null;
  created_at: string; // ISO from DB
  // Optional shipping fields if present in o.*
  shipping_name?: string | null;
  shipping_line1?: string | null;
  shipping_line2?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;
  shipping_phone?: string | null;
  // joined
  product_title?: string;
  product_images?: string[];
};

export default function SellerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    stock: '1',
    condition: 'new',
    location: '',
    shipping_available: true,
    images: [] as string[],
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        const reader = new FileReader();
        
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        newImages.push(imageUrl);
      }

      setFormData({
        ...formData,
        images: [...formData.images, ...newImages].slice(0, 5)
      });
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setUploadingImage(false);
    }
  };
  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  useEffect(() => {
    loadSellerData();
  }, []);

  const loadSellerData = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        window.location.href = '/seller/login';
        return;
      }

      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/seller/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/seller/orders', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (productsRes.ok) {
        const productsData: Product[] = await productsRes.json();
        setProducts(productsData || []);
      }

      if (ordersRes.ok) {
        const ordersData: Order[] = await ordersRes.json();
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Failed to load seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);

    try {
      // Client-side validation for price caps
      const priceNum = parseFloat(formData.price);
      const originalNum = formData.original_price ? parseFloat(formData.original_price) : null;
      const MAX = 99999999.99; // DECIMAL(10,2)
      if (!Number.isFinite(priceNum)) {
        setSaveError('Price must be a valid number');
        setSaving(false);
        return;
      }
      if (priceNum > MAX || priceNum < 0) {
        setSaveError('Price exceeds allowed range (max 99,999,999.99)');
        setSaving(false);
        return;
      }
      if (originalNum != null) {
        if (!Number.isFinite(originalNum)) {
          setSaveError('Original price must be a valid number');
          setSaving(false);
          return;
        }
        if (originalNum > MAX || originalNum < 0) {
          setSaveError('Original price exceeds allowed range (max 99,999,999.99)');
          setSaving(false);
          return;
        }
      }

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const url = editingProduct
        ? `/api/seller/products/${editingProduct.id}`
        : '/api/seller/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: priceNum,
          original_price: originalNum,
          stock: parseInt(formData.stock),
        }),
      });

      if (!res.ok) {
        let message = 'Failed to save product';
        // Status-specific guidance
        if (res.status === 401) message = 'Authentication required. Please log in as a seller.';
        else if (res.status === 403) message = 'Seller access required. Use a seller account.';
        else if (res.status === 413) message = 'Images too large. Use smaller images or upload fewer.';
        else if (res.status === 400) message = 'Invalid data. Ensure title, price and valid numbers.';
        try {
          const contentType = res.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data?.error) message = data.error;
          } else {
            const text = await res.text();
            if (text) message = text.slice(0, 200);
          }
        } catch (parseErr) {
          console.warn('Failed to parse error response', parseErr);
        }
        console.warn('Product save failed', { status: res.status });
        setSaveError(message);
        return;
      }

      await loadSellerData();
      resetForm();
      setShowAddProduct(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
      setSaveError(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: String(product.price ?? ''),
      original_price: product.original_price != null ? String(product.original_price) : '',
      category: product.category || '',
      stock: String(product.stock ?? '1'),
      condition: product.condition || 'new',
      location: product.location || '',
      shipping_available: product.shipping_available ?? true,
      images: product.images || [],
    });
    setShowAddProduct(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await loadSellerData();
      } else {
        console.warn('Delete failed', res.status);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      original_price: '',
      category: '',
      stock: '1',
      condition: 'new',
      location: '',
      shipping_available: true,
      images: [],
    });
  };

  const totalRevenue = orders.reduce((sum, o) => {
    const n = typeof o.total_price === 'string' ? parseFloat(o.total_price) : (o.total_price ?? 0);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: APPLE_COLORS.bg }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-white shadow-md mb-6 backdrop-blur-sm" style={{ backgroundColor: APPLE_COLORS.bgCard }}>
            <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ 
              borderColor: `${APPLE_COLORS.blue} transparent ${APPLE_COLORS.blue} transparent`
            }}></div>
          </div>
          <p className="text-sm font-medium" style={{ color: APPLE_COLORS.textTertiary }}>Loading your store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: APPLE_COLORS.bg }}>
      {/* Apple-style fixed header */}
      <div className="fixed top-0 left-0 right-0 h-14 z-50 backdrop-blur-md border-b" 
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderColor: APPLE_COLORS.borderLight
        }}>
        <div className="flex items-center justify-center h-full px-6 max-w-6xl mx-auto w-full">
          <h1 className="text-base font-bold" style={{ color: APPLE_COLORS.textPrimary }}>Store Manager</h1>
        </div>
      </div>

      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Page Header */}
          <div className="mb-10 mt-2">
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: APPLE_COLORS.textPrimary }}>My Products</h1>
            <p className="text-lg" style={{ color: APPLE_COLORS.textTertiary }}>Manage your marketplace listings and track sales</p>
          </div>

          {/* Apple iOS-style stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Total Products Card */}
            <div className="rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border backdrop-blur-sm"
              style={{ 
                backgroundColor: APPLE_COLORS.bgCard,
                borderColor: APPLE_COLORS.borderLight
              }}>
              <div className="flex items-start justify-between mb-10">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2.5" style={{ color: APPLE_COLORS.textTertiary }}>Total Products</p>
                  <p className="text-4xl md:text-5xl font-bold" style={{ color: APPLE_COLORS.textPrimary }}>{products.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                  style={{ backgroundColor: `${APPLE_COLORS.blue}15` }}>
                  <Package className="w-6 h-6" style={{ color: APPLE_COLORS.blue }} />
                </div>
              </div>
              <div className="h-0.5 rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${APPLE_COLORS.blue}, ${APPLE_COLORS.blue}33)` }}></div>
            </div>

            {/* Total Revenue Card */}
            <div className="rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border backdrop-blur-sm"
              style={{ 
                backgroundColor: APPLE_COLORS.bgCard,
                borderColor: APPLE_COLORS.borderLight
              }}>
              <div className="flex items-start justify-between mb-10">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2.5" style={{ color: APPLE_COLORS.textTertiary }}>Total Revenue</p>
                  <p className="text-4xl md:text-5xl font-bold" style={{ color: APPLE_COLORS.textPrimary }}>${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                  style={{ backgroundColor: `${APPLE_COLORS.green}15` }}>
                  <DollarSign className="w-6 h-6" style={{ color: APPLE_COLORS.green }} />
                </div>
              </div>
              <div className="h-0.5 rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${APPLE_COLORS.green}, ${APPLE_COLORS.green}33)` }}></div>
            </div>

            {/* Pending Orders Card */}
            <div className="rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border backdrop-blur-sm"
              style={{ 
                backgroundColor: APPLE_COLORS.bgCard,
                borderColor: APPLE_COLORS.borderLight
              }}>
              <div className="flex items-start justify-between mb-10">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2.5" style={{ color: APPLE_COLORS.textTertiary }}>Pending Orders</p>
                  <p className="text-4xl md:text-5xl font-bold" style={{ color: APPLE_COLORS.textPrimary }}>{pendingOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                  style={{ backgroundColor: `${APPLE_COLORS.red}15` }}>
                  <ShoppingBag className="w-6 h-6" style={{ color: APPLE_COLORS.red }} />
                </div>
              </div>
              <div className="h-0.5 rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${APPLE_COLORS.red}, ${APPLE_COLORS.red}33)` }}></div>
            </div>

            {/* Total Views Card */}
            <div className="rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border backdrop-blur-sm"
              style={{ 
                backgroundColor: APPLE_COLORS.bgCard,
                borderColor: APPLE_COLORS.borderLight
              }}>
              <div className="flex items-start justify-between mb-10">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2.5" style={{ color: APPLE_COLORS.textTertiary }}>Total Views</p>
                  <p className="text-4xl md:text-5xl font-bold" style={{ color: APPLE_COLORS.textPrimary }}>{products.reduce((sum, p) => sum + (p.views || 0), 0)}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                  style={{ backgroundColor: `${APPLE_COLORS.purple}15` }}>
                  <Eye className="w-6 h-6" style={{ color: APPLE_COLORS.purple }} />
                </div>
              </div>
              <div className="h-0.5 rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${APPLE_COLORS.purple}, ${APPLE_COLORS.purple}33)` }}></div>
            </div>
          </div>

        {/* Add Product Button - Apple Style */}
        <div className="mb-8">
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowAddProduct(!showAddProduct);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            style={{
              backgroundColor: APPLE_COLORS.blue,
              color: APPLE_COLORS.bgCard,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = APPLE_COLORS.blueDark}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = APPLE_COLORS.blue}
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </button>
        </div>

        {/* Add/Edit Product Form - Apple Style */}
        {showAddProduct && (
          <div className="rounded-3xl border p-8 shadow-sm mb-10 backdrop-blur-sm"
            style={{ 
              backgroundColor: APPLE_COLORS.bgCard,
              borderColor: APPLE_COLORS.borderLight
            }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: APPLE_COLORS.textPrimary }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Title */}
                <div>
                  <label className="text-sm font-semibold mb-2.5 block" style={{ color: APPLE_COLORS.textSecondary }}>Product Title*</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., iPhone 13 Pro"
                    className="h-11 rounded-xl border focus:ring-0 text-base"
                    style={{
                      borderColor: APPLE_COLORS.border,
                      backgroundColor: '#f5f5f7',
                    }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-semibold mb-2.5 block" style={{ color: APPLE_COLORS.textSecondary }}>Category*</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border font-medium transition-all text-base"
                    style={{
                      borderColor: APPLE_COLORS.border,
                      backgroundColor: '#f5f5f7',
                      color: APPLE_COLORS.textPrimary,
                    }}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="text-sm font-semibold mb-2.5 block" style={{ color: APPLE_COLORS.textSecondary }}>Price*</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="h-11 rounded-xl border focus:ring-0 text-base"
                    style={{
                      borderColor: APPLE_COLORS.border,
                      backgroundColor: '#f5f5f7',
                    }}
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="text-sm font-semibold mb-2.5 block" style={{ color: APPLE_COLORS.textSecondary }}>Original Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="0.00"
                    className="h-11 rounded-xl border focus:ring-0 text-base"
                    style={{
                      borderColor: APPLE_COLORS.border,
                      backgroundColor: '#f5f5f7',
                    }}
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="text-sm font-semibold mb-2.5 block" style={{ color: APPLE_COLORS.textSecondary }}>Stock</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="1"
                    className="h-11 rounded-xl border focus:ring-0 text-base"
                    style={{
                      borderColor: APPLE_COLORS.border,
                      backgroundColor: '#f5f5f7',
                    }}
                  />
                </div>

                {/* Condition */}
                <div>
                  <label className="text-sm font-semibold mb-2.5 block" style={{ color: APPLE_COLORS.textSecondary }}>Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border font-medium transition-all text-base"
                    style={{
                      borderColor: APPLE_COLORS.border,
                      backgroundColor: '#f5f5f7',
                      color: APPLE_COLORS.textPrimary,
                    }}
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-semibold mb-2.5 block" style={{ color: APPLE_COLORS.textSecondary }}>Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., New York, NY"
                    className="h-11 rounded-xl border focus:ring-0 text-base"
                    style={{
                      borderColor: APPLE_COLORS.border,
                      backgroundColor: '#f5f5f7',
                    }}
                  />
                </div>

                {/* Shipping Available */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="shipping"
                    checked={formData.shipping_available}
                    onChange={(e) => setFormData({ ...formData, shipping_available: e.target.checked })}
                    className="w-5 h-5 rounded cursor-pointer"
                    style={{
                      accentColor: APPLE_COLORS.blue,
                    }}
                  />
                  <label htmlFor="shipping" className="text-sm font-semibold cursor-pointer" style={{ color: APPLE_COLORS.textSecondary }}>
                    Shipping Available
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold mb-2.5 block" style={{ color: APPLE_COLORS.textSecondary }}>Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={4}
                  className="rounded-xl border font-medium resize-none text-base"
                  style={{
                    borderColor: APPLE_COLORS.border,
                    backgroundColor: '#f5f5f7',
                    color: APPLE_COLORS.textPrimary,
                  }}
                />
              </div>

              {/* Product Images */}
              <div>
                <label className="text-sm font-semibold mb-3 block" style={{ color: APPLE_COLORS.textSecondary }}>Product Images (Max 5)</label>
                
                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border" 
                        style={{ borderColor: APPLE_COLORS.border }}>
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          style={{ backgroundColor: APPLE_COLORS.red }}
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {formData.images.length < 5 && (
                  <div className="border-2 border-dashed rounded-2xl p-8 text-center transition-colors" 
                    style={{ 
                      borderColor: APPLE_COLORS.border,
                      backgroundColor: '#f5f5f7',
                    }}>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <Upload className="w-8 h-8" style={{ color: APPLE_COLORS.textTertiary }} />
                      <span className="text-sm font-medium" style={{ color: APPLE_COLORS.textSecondary }}>
                        {uploadingImage ? 'Uploading...' : 'Click to upload images'}
                      </span>
                      <span className="text-xs" style={{ color: APPLE_COLORS.textTertiary }}>
                        PNG, JPG up to 5MB each ({5 - formData.images.length} remaining)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {saveError && (
                <div className="rounded-xl border-l-4 px-4 py-3" 
                  style={{ 
                    backgroundColor: `${APPLE_COLORS.red}10`,
                    borderColor: APPLE_COLORS.red,
                    color: APPLE_COLORS.red,
                  }}>
                  <p className="text-sm font-medium">{saveError}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 text-white"
                  style={{ backgroundColor: APPLE_COLORS.blue }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = APPLE_COLORS.blueDark}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = APPLE_COLORS.blue}
                >
                  {saving ? (editingProduct ? 'Saving...' : 'Adding...') : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    resetForm();
                    setSaveError(null);
                  }}
                  className="px-6 py-3 rounded-full font-semibold transition-all duration-200 border"
                  style={{ 
                    color: APPLE_COLORS.blue,
                    borderColor: APPLE_COLORS.blue,
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${APPLE_COLORS.blue}10`}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid - iOS Style Cards */}
        <div className="rounded-3xl border shadow-sm overflow-hidden"
          style={{ 
            backgroundColor: APPLE_COLORS.bgCard,
            borderColor: APPLE_COLORS.borderLight
          }}>
          <div className="p-6 border-b" style={{ borderColor: APPLE_COLORS.borderLight }}>
            <h2 className="text-2xl font-bold" style={{ color: APPLE_COLORS.textPrimary }}>Your Products</h2>
          </div>

          {products.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: APPLE_COLORS.textTertiary }} />
              <p className="text-base font-medium" style={{ color: APPLE_COLORS.textTertiary }}>No products yet. Add your first product to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
              {products.map((product) => (
                <div key={product.id} className="rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 group"
                  style={{ 
                    backgroundColor: APPLE_COLORS.bgCard,
                    borderColor: APPLE_COLORS.borderLight
                  }}>
                  {/* Product Image Container */}
                  <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: '#f5f5f7' }}>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8" style={{ color: APPLE_COLORS.textTertiary, opacity: 0.3 }} />
                      </div>
                    )}
                    
                    {/* Action Buttons Overlay */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-full shadow-sm transition-all duration-200 active:scale-90"
                        style={{ backgroundColor: APPLE_COLORS.bgCard }}
                        onClick={() => handleEdit(product)}
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" style={{ color: APPLE_COLORS.blue }} />
                      </button>
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-full shadow-sm transition-all duration-200 active:scale-90"
                        style={{ backgroundColor: APPLE_COLORS.bgCard }}
                        onClick={() => handleDelete(product.id)}
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: APPLE_COLORS.red }} />
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <div className="text-xs font-bold px-2.5 py-1 rounded-full" 
                        style={{
                          backgroundColor: product.status === 'active' ? APPLE_COLORS.green : APPLE_COLORS.textTertiary,
                          color: APPLE_COLORS.bgCard,
                        }}>
                        {product.status}
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h3 className="font-bold text-xs mb-2 line-clamp-2" style={{ color: APPLE_COLORS.textPrimary }}>
                      {product.title}
                    </h3>
                    
                    {/* Price Section */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="font-bold text-sm" style={{ color: APPLE_COLORS.blue }}>${product.price}</span>
                      {product.original_price && (
                        <span className="text-xs line-through" style={{ color: APPLE_COLORS.textTertiary }}>
                          ${product.original_price}
                        </span>
                      )}
                    </div>

                    {/* Stats Footer */}
                    <div className="flex items-center justify-between text-xs border-t pt-2.5" 
                      style={{ borderColor: APPLE_COLORS.borderLight, color: APPLE_COLORS.textTertiary }}>
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {product.stock}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {product.views || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders Section - Apple Style */}
        <div className="rounded-3xl border shadow-sm mt-10 overflow-hidden"
          style={{ 
            backgroundColor: APPLE_COLORS.bgCard,
            borderColor: APPLE_COLORS.borderLight
          }}>
          <div className="p-6 border-b" style={{ borderColor: APPLE_COLORS.borderLight }}>
            <h2 className="text-2xl font-bold" style={{ color: APPLE_COLORS.textPrimary }}>Incoming Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-16 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: APPLE_COLORS.textTertiary }} />
              <p className="text-base font-medium" style={{ color: APPLE_COLORS.textTertiary }}>No orders yet.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: APPLE_COLORS.borderLight }}>
              {orders.map((order) => {
                const createdAt = new Date(order.created_at).toLocaleString();
                return (
                  <div key={order.id} className="p-5 hover:bg-opacity-30 transition-colors duration-200" 
                    style={{ backgroundColor: 'rgba(0,0,0,0)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1.5" style={{ color: APPLE_COLORS.textTertiary }}>
                          Order #{order.id} • {createdAt}
                        </div>
                        <div className="font-semibold text-base" style={{ color: APPLE_COLORS.textPrimary }}>
                          {order.product_title || `Product #${order.product_id}`}
                        </div>
                      </div>
                      {order.total_price && (
                        <div className="text-right">
                          <div className="text-sm font-medium" style={{ color: APPLE_COLORS.textTertiary }}>Amount</div>
                          <div className="text-lg font-bold" style={{ color: APPLE_COLORS.green }}>
                            ${typeof order.total_price === 'string' ? parseFloat(order.total_price).toFixed(2) : (order.total_price?.toFixed(2) || '0.00')}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shipping Info */}
                    {(order.shipping_line1 || order.shipping_city || order.shipping_country) ? (
                      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#f5f5f7' }}>
                        <div className="font-semibold text-sm mb-2" style={{ color: APPLE_COLORS.textPrimary }}>Ship to</div>
                        <div className="text-sm space-y-1" style={{ color: APPLE_COLORS.textSecondary }}>
                          {order.shipping_line1 && (
                            <div>{order.shipping_line1}</div>
                          )}
                          {order.shipping_line2 && (
                            <div>{order.shipping_line2}</div>
                          )}
                          <div>
                            {order.shipping_city}
                            {order.shipping_state ? `, ${order.shipping_state}` : ''}{' '}
                            {order.shipping_postal_code}
                          </div>
                          {order.shipping_country && (
                            <div>{order.shipping_country}</div>
                          )}
                          {order.shipping_phone && (
                            <div className="font-medium">📞 {order.shipping_phone}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm" style={{ color: APPLE_COLORS.textTertiary }}>
                        No shipping info on file.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
