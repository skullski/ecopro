import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Plus, Trash2, Edit2, Eye, EyeOff, Package, TrendingUp, 
  AlertCircle, CheckCircle, Loader2, Filter, Download, MoreVertical,
  Lock, Unlock, BarChart3, Tag
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Product {
  id: number;
  title: string;
  price: number;
  stock_quantity: number;
  images: string[];
  category?: string;
  views: number;
  sales: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at: string;
  variants?: any[];
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'price' | 'sales' | 'views'>('newest');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch products
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['seller-products', filterStatus, sortBy],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/seller/products?status=${filterStatus}&sort=${sortBy}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  // Filter products
  const filteredProducts = (products as Product[]).filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (productId: number) => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      refetch();
    }
  });

  // Batch delete mutation
  const batchDelete = useMutation({
    mutationFn: async (productIds: number[]) => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/seller/products/batch/delete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds })
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      setSelectedProducts(new Set());
      refetch();
    }
  });

  const handleSelectProduct = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedProducts.size === 0) {
      alert('Please select products');
      return;
    }
    if (confirm(`Delete ${selectedProducts.size} product(s)?`)) {
      batchDelete.mutate(Array.from(selectedProducts));
    }
  };

  // Dark mode detection
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const stats = {
    total: products.length,
    active: products.filter((p: Product) => p.status === 'active').length,
    outOfStock: products.filter((p: Product) => p.stock_quantity === 0).length,
    totalViews: products.reduce((sum: number, p: Product) => sum + (p.views || 0), 0),
    totalSales: products.reduce((sum: number, p: Product) => sum + (p.sales || 0), 0),
  };

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Products
              </h1>
              <p className={`text-sm mt-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage and monitor your store inventory
              </p>
            </div>
            <Button className="gap-2" size="lg">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Products</p>
                  <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                </div>
                <Package className={`w-8 h-8 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              </div>
            </div>

            <div className={`p-4 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
                  <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.active}</p>
                </div>
                <CheckCircle className={`w-8 h-8 transition-colors ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
              </div>
            </div>

            <div className={`p-4 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Out of Stock</p>
                  <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.outOfStock}</p>
                </div>
                <AlertCircle className={`w-8 h-8 transition-colors ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
              </div>
            </div>

            <div className={`p-4 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Views</p>
                  <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalViews}</p>
                </div>
                <Eye className={`w-8 h-8 transition-colors ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              </div>
            </div>

            <div className={`p-4 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Sales</p>
                  <p className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalSales}</p>
                </div>
                <TrendingUp className={`w-8 h-8 transition-colors ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className={`flex-1 flex items-center gap-2 px-4 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
              <Search className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-4 py-2 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
            >
              <option value="newest">Newest</option>
              <option value="price">Price</option>
              <option value="sales">Sales</option>
              <option value="views">Views</option>
            </select>

            {selectedProducts.size > 0 && (
              <Button 
                variant="destructive"
                onClick={handleBatchDelete}
                disabled={batchDelete.isPending}
              >
                Delete ({selectedProducts.size})
              </Button>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className={`rounded-lg border overflow-hidden transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className={`w-12 h-12 mb-4 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No products found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className={`border-b transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stock</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Views</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sales</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={`border-b transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/40'}
                          alt={product.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div>
                          <p className={`font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.title}</p>
                          <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{product.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {product.price} DZD
                    </td>
                    <td className={`px-4 py-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.stock_quantity > 10 
                          ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                          : product.stock_quantity > 0
                          ? isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                          : isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className={`px-4 py-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {product.views || 0}
                    </td>
                    <td className={`px-4 py-3 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {product.sales || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'active'
                          ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                          : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className={`p-2 rounded hover:bg-gray-100 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : ''}`}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Delete this product?')) {
                              deleteProduct.mutate(product.id);
                            }
                          }}
                          className={`p-2 rounded hover:bg-red-100 transition-colors ${isDarkMode ? 'hover:bg-red-900' : ''}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
