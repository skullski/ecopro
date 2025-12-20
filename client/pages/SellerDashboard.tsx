import React, { useEffect, useState } from "react";
// import { apiFetch } from "@/lib/api";
import { Plus, Package, DollarSign, Eye, Edit, Trash2, ShoppingBag, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/components/ui/GradientCard';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="w-4/5 mx-auto px-4 py-4 md:py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">My Products</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Manage your marketplace listings and track sales</p>
        </div>

        {/* Stats with standardized vibrant presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-4">
          <GradientCard
            title="Total Products"
            value={products.length}
            preset="purple"
            icon={
              <Package className="w-6 h-6 text-purple-400" />
            }
          />

          <GradientCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            preset="emerald"
            icon={
              <DollarSign className="w-6 h-6 text-emerald-400" />
            }
          />

          <GradientCard
            title="Pending Orders"
            value={pendingOrders}
            preset="orange"
            icon={
              <ShoppingBag className="w-6 h-6 text-orange-400" />
            }
          />

          <GradientCard
            title="Total Views"
            value={products.reduce((sum, p) => sum + (p.views || 0), 0)}
            preset="blue"
            icon={
              <Eye className="w-6 h-6 text-blue-400" />
            }
          />
        </div>

        {/* Add Product Button */}
        <div className="mb-6">
          <Button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowAddProduct(!showAddProduct);
            }}
            className="bg-gradient-to-r from-primary to-accent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>

        {/* Add/Edit Product Form */}
        {showAddProduct && (
          <div className="bg-card rounded-xl border p-6 shadow-lg mb-4 md:mb-6" style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)' }}>
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Product Title*</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., iPhone 13 Pro"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category*</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Price*</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Original Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Stock</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., New York, NY"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="shipping"
                    checked={formData.shipping_available}
                    onChange={(e) => setFormData({ ...formData, shipping_available: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="shipping" className="text-sm font-medium">
                    Shipping Available
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={4}
                />
              </div>

              {/* Product Images */}
              <div>
                <label className="text-sm font-medium mb-2 block">Product Images (Max 5)</label>
                
                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {formData.images.length < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {uploadingImage ? 'Uploading...' : 'Click to upload images'}
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG up to 5MB each ({5 - formData.images.length} remaining)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {saveError && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-md">
                  {saveError}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-to-r from-primary to-accent" disabled={saving}>
                  {saving ? (editingProduct ? 'Saving...' : 'Adding...') : (editingProduct ? 'Update Product' : 'Add Product')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    resetForm();
                    setSaveError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid */}
        <div className="bg-card rounded-xl border" style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)' }}>
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Your Products</h2>
          </div>

          {products.length === 0 ? (
            <div className="p-6 md:p-6 text-center text-muted-foreground">
              <Package className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-3 opacity-20" />
              <p className="text-sm md:text-base">No products yet. Add your first product to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 p-3">
              {products.map((product) => (
                <div key={product.id} className="bg-card border rounded-lg overflow-hidden transition-all group" style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)'}>
                  {/* Product Image */}
                  <div className="relative aspect-square bg-muted">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground opacity-20" />
                      </div>
                    )}
                    {/* Action Buttons - Show on Hover */}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    {/* Status Badge */}
                    <div className="absolute top-1 left-1">
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                        {product.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-2">
                    <h3 className="font-bold text-xs mb-0.5 line-clamp-1">
                      {product.title}
                    </h3>
                    
                    {/* Price */}
                    <div className="flex items-center gap-1 mb-2">
                      <span className="font-bold text-sm text-primary">${product.price}</span>
                      {product.original_price && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          ${product.original_price}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t">
                      <span className="flex items-center gap-0.5">
                        <Package className="w-2.5 h-2.5" /> {product.stock}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" /> {product.views || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-card rounded-xl border mt-4 md:mt-6" style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)' }}>
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Incoming Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-6 md:p-6 text-center text-muted-foreground">
              <Package className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-3 opacity-20" />
              <p className="text-sm md:text-base">No orders yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => {
                const createdAt = new Date(order.created_at).toLocaleString();
                return (
                  <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Order {order.id} • {createdAt}
                        </div>
                        <div className="font-medium">
                          Product: {order.product_title || order.product_id}
                        </div>
                      </div>
                    </div>

                    {/* Shipping info (optional if your DB has these columns) */}
                    {(order.shipping_line1 || order.shipping_city || order.shipping_country) ? (
                      <div className="text-sm text-muted-foreground">
                        <div className="font-semibold">Ship to</div>
                        <div>
                          {order.shipping_line1}
                          {order.shipping_line2 ? `, ${order.shipping_line2}` : ''}
                        </div>
                        <div>
                          {order.shipping_city}
                          {order.shipping_state ? `, ${order.shipping_state}` : ''}{' '}
                          {order.shipping_postal_code}
                        </div>
                        <div>{order.shipping_country}</div>
                        {order.shipping_phone && <div>Phone: {order.shipping_phone}</div>}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No shipping info on file.</div>
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
