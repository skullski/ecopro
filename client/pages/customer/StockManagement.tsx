import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, PackageX, Package, AlertTriangle, 
  TrendingDown, TrendingUp, Edit, Trash2, History, Download,
  BarChart3, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StockItem {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  category?: string;
  quantity: number;
  unit_price?: number;
  reorder_level: number;
  location?: string;
  supplier_name?: string;
  supplier_contact?: string;
  status: 'active' | 'discontinued' | 'out_of_stock';
  notes?: string;
  is_low_stock?: boolean;
  images?: string[];
  created_at: string;
  updated_at: string;
}

interface StockHistory {
  id: number;
  quantity_before: number;
  quantity_after: number;
  adjustment: number;
  reason: string;
  notes?: string;
  created_at: string;
  adjusted_by_name?: string;
}

export default function StockManagement() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [filteredStock, setFilteredStock] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showLowStock, setShowLowStock] = useState(false);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Selected item
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<StockItem>>({});
  const [uploading, setUploading] = useState(false);
  const [adjustData, setAdjustData] = useState({
    adjustment: 0,
    reason: 'adjustment',
    notes: '',
  });

  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    loadStock();
    loadCategories();
  }, []);

  useEffect(() => {
    filterStock();
  }, [stock, searchQuery, categoryFilter, statusFilter, showLowStock]);

  useEffect(() => {
    // Calculate stats
    const lowCount = stock.filter(item => item.is_low_stock).length;
    const value = stock.reduce((sum, item) => sum + (item.quantity * (item.unit_price || 0)), 0);
    setLowStockCount(lowCount);
    setTotalValue(value);
  }, [stock]);

  const loadStock = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/client/stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[loadStock] Fetched stock items:', data);
        console.log('[loadStock] First item:', data[0]);
        console.log('[loadStock] First item images:', data[0]?.images);
        setStock(data);
      } else {
        console.error('[loadStock] Failed with status:', res.status);
      }
    } catch (error) {
      console.error('Failed to load stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      const res = await fetch('/api/client/stock/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.map((c: any) => c.category));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const filterStock = () => {
    let filtered = [...stock];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Low stock filter
    if (showLowStock) {
      filtered = filtered.filter(item => item.is_low_stock);
    }

    setFilteredStock(filtered);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Starting image upload:', file.name, file.size, file.type);

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      e.target.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      console.log('Token present:', !!token);
      
      if (!token) {
        alert('Not authenticated. Please log in again.');
        setUploading(false);
        return;
      }
      
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      console.log('Uploading to /api/upload...');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: uploadFormData
      });

      console.log('Upload response status:', res.status, res.statusText);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));

      // Get response text first
      const responseText = await res.text();
      console.log('Response text:', responseText);

      if (!res.ok) {
        console.error('Upload failed with status:', res.status);
        try {
          const error = JSON.parse(responseText);
          alert(`Upload failed: ${error.error || 'Unknown error'}`);
        } catch {
          alert(`Upload failed: ${res.statusText} - ${responseText}`);
        }
        e.target.value = '';
        return;
      }

      // Parse JSON only if we have content
      if (responseText) {
        try {
          const data = JSON.parse(responseText);
          console.log('Upload successful, URL:', data.url);
          // Just use the relative URL - don't add origin
          const imageUrl = data.url;
          console.log('Setting image URL:', imageUrl);
          setFormData(prev => { 
            const updated = { ...prev, images: [imageUrl] };
            console.log('FormData after image upload:', updated);
            return updated;
          });
          
          // If editing an existing item, auto-save the image immediately
          if (selectedItem?.id) {
            console.log('[handleImageUpload] Auto-saving image for existing item:', selectedItem.id);
            try {
              const updateRes = await fetch(`/api/client/stock/${selectedItem.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  images: [imageUrl]
                })
              });

              if (updateRes.ok) {
                console.log('[handleImageUpload] Image auto-saved successfully');
                await loadStock();
              } else {
                console.warn('[handleImageUpload] Failed to auto-save image');
              }
            } catch (autoSaveErr) {
              console.warn('[handleImageUpload] Auto-save error:', autoSaveErr);
            }
          }
          
          e.target.value = '';
          alert('Image uploaded successfully!');
        } catch (parseErr) {
          console.error('Failed to parse response:', parseErr);
          alert('Upload succeeded but failed to parse response');
          e.target.value = '';
        }
      } else {
        console.error('Empty response from server');
        alert('Upload succeeded but server returned empty response');
        e.target.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload error: ${error instanceof Error ? error.message : 'Failed to upload image'}`);
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleCreateStock = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        alert('Not authenticated. Please log in again.');
        return;
      }
      
      console.log('[handleCreateStock] Submitting form data:', formData);
      console.log('[handleCreateStock] Images in formData:', formData.images);
      console.log('[handleCreateStock] Images count:', formData.images?.length);
      
      const res = await fetch('/api/client/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log('[handleCreateStock] Response status:', res.status);
      
      if (res.ok) {
        const createdItem = await res.json();
        console.log('[handleCreateStock] Created item:', createdItem);
        console.log('[handleCreateStock] Created item images:', createdItem.images);
        await loadStock();
        setShowAddModal(false);
        setFormData({});
        alert('Stock item created successfully!');
      } else {
        const error = await res.json();
        console.error('[handleCreateStock] Error response:', error);
        alert(error.error || 'Failed to create stock item');
      }
    } catch (error) {
      console.error('Create stock error:', error);
      alert(`Failed to create stock item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedItem) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await fetch(`/api/client/stock/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await loadStock();
        setShowEditModal(false);
        setSelectedItem(null);
        setFormData({});
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update stock item');
      }
    } catch (error) {
      console.error('Update stock error:', error);
      alert('Failed to update stock item');
    }
  };

  const handleAdjustQuantity = async () => {
    if (!selectedItem) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await fetch(`/api/client/stock/${selectedItem.id}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adjustData)
      });

      if (res.ok) {
        await loadStock();
        setShowAdjustModal(false);
        setSelectedItem(null);
        setAdjustData({ adjustment: 0, reason: 'adjustment', notes: '' });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to adjust quantity');
      }
    } catch (error) {
      console.error('Adjust quantity error:', error);
      alert('Failed to adjust quantity');
    }
  };

  const handleDeleteStock = async () => {
    if (!selectedItem) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await fetch(`/api/client/stock/${selectedItem.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        await loadStock();
        setShowDeleteDialog(false);
        setSelectedItem(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete stock item');
      }
    } catch (error) {
      console.error('Delete stock error:', error);
      alert('Failed to delete stock item');
    }
  };

  const loadHistory = async (itemId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/client/stock/${itemId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStockHistory(data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const openEditModal = (item: StockItem) => {
    setSelectedItem(item);
    setFormData(item);
    setShowEditModal(true);
  };

  const openAdjustModal = (item: StockItem) => {
    setSelectedItem(item);
    setAdjustData({ adjustment: 0, reason: 'adjustment', notes: '' });
    setShowAdjustModal(true);
  };

  const openHistoryModal = async (item: StockItem) => {
    setSelectedItem(item);
    await loadHistory(item.id);
    setShowHistoryModal(true);
  };

  const openDeleteDialog = (item: StockItem) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Quantity', 'Unit Price', 'Location', 'Status'];
    const rows = filteredStock.map(item => [
      item.name,
      item.sku || '',
      item.category || '',
      item.quantity,
      item.unit_price || 0,
      item.location || '',
      item.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/30 p-3 md:p-4">
      <div className="max-w-7xl mx-auto space-y-2 md:space-y-3">
        {/* Header with Gradient */}
        <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-primary/10 to-purple-600/10 dark:from-primary/5 dark:to-purple-600/5 rounded-lg border border-primary/20 p-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              📦 Stock Management
            </h1>
            <p className="text-muted-foreground text-base font-semibold">Track and optimize your inventory</p>
          </div>
          <div className="flex gap-1 md:gap-2">
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="border-primary/30 hover:bg-primary/10 transition-all gap-1 text-sm font-bold py-2 px-3 h-9"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button 
              onClick={() => {
                setFormData({});
                setShowAddModal(true);
              }}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all gap-1 text-base font-bold py-2 px-4 h-10"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards with Gradients - Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-900/20 dark:to-blue-900/5 rounded border border-blue-500/30 p-2 md:p-3 hover:border-blue-500/50 transition-all hover:shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium truncate">📦 Items</p>
                <p className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">{stock.length}</p>
              </div>
              <div className="bg-blue-500/20 dark:bg-blue-500/10 p-2 rounded flex-shrink-0">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 dark:from-orange-900/20 dark:to-orange-900/5 rounded border border-orange-500/30 p-2 md:p-3 hover:border-orange-500/50 transition-all hover:shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium truncate">⚠️ Low Stock</p>
                <p className="text-lg md:text-xl font-bold text-orange-600 dark:text-orange-400">{lowStockCount}</p>
              </div>
              <div className="bg-orange-500/20 dark:bg-orange-500/10 p-2 rounded flex-shrink-0">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-900/20 dark:to-emerald-900/5 rounded border border-emerald-500/30 p-2 md:p-3 hover:border-emerald-500/50 transition-all hover:shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium truncate">💰 Value</p>
                <p className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400">${totalValue.toFixed(0)}</p>
              </div>
              <div className="bg-emerald-500/20 dark:bg-emerald-500/10 p-2 rounded flex-shrink-0">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 dark:from-red-900/20 dark:to-red-900/5 rounded border border-red-500/30 p-2 md:p-3 hover:border-red-500/50 transition-all hover:shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium truncate">❌ Out Stock</p>
                <p className="text-lg md:text-xl font-bold text-red-600 dark:text-red-400">
                  {stock.filter(i => i.status === 'out_of_stock').length}
                </p>
              </div>
              <div className="bg-red-500/20 dark:bg-red-500/10 p-2 rounded flex-shrink-0">
                <PackageX className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-r from-primary/5 to-purple-600/5 dark:from-slate-800/50 dark:to-slate-800/30 rounded border border-primary/20 p-2 md:p-3 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 min-w-[150px]">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 border-primary/30 focus:border-primary/60 transition-colors h-9 text-base"
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[140px] border-primary/30 focus:border-primary/60 h-8 text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[140px] border-primary/30 focus:border-primary/60 h-9 text-base font-semibold">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="out_of_stock">Out Stock</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showLowStock ? 'default' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
              className={showLowStock ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' : 'border-primary/30 hover:bg-primary/10'}
              size="sm"
            >
              <Filter className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline ml-1 text-xs">Low</span>
            </Button>

            <Button 
              variant="outline" 
              onClick={loadStock}
              className="border-primary/30 hover:bg-primary/10"
              size="sm"
            >
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-gradient-to-br from-background to-primary/5 dark:from-slate-900/50 dark:to-slate-800/30 rounded border border-primary/20 overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-base font-semibold">
              <thead className="bg-gradient-to-r from-primary/15 to-purple-600/15 dark:from-primary/10 dark:to-purple-600/10 border-b border-primary/20">
                <tr>
                <th className="text-left p-2 md:p-3 font-bold text-primary dark:text-primary/90 text-base">Product</th>
                <th className="text-left p-2 md:p-3 font-bold text-primary dark:text-primary/90 text-base">SKU</th>
                <th className="text-left p-2 md:p-3 font-bold text-primary dark:text-primary/90 text-base">Category</th>
                <th className="text-right p-2 md:p-3 font-bold text-primary dark:text-primary/90 text-base">Qty</th>
                <th className="text-right p-2 md:p-3 font-bold text-primary dark:text-primary/90 text-base">Price</th>
                <th className="text-right p-2 md:p-3 font-bold text-primary dark:text-primary/90 text-base">Location</th>
                <th className="text-right p-2 md:p-3 font-bold text-primary dark:text-primary/90 text-base">Actions</th>
                  <th className="text-right p-2 md:p-3 font-semibold text-primary dark:text-primary/90">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 md:py-6 text-muted-foreground">
                      <Package className="w-6 h-6 mx-auto opacity-50 mb-2" />
                      <p className="text-base font-semibold">
                        {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                          ? 'No products match your filters'
                          : 'No stock items yet'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStock.map(item => (
                    <tr key={item.id} className="border-b border-primary/10 hover:bg-primary/10 dark:hover:bg-primary/5 transition-colors">
                      <td className="p-2 md:p-3">
                        <div className="flex items-center gap-2">
                          {item.images?.[0] ? (
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-muted/40 flex items-center justify-center flex-shrink-0 text-xs text-muted-foreground">
                              📦
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-base truncate">{item.name}</p>
                            {item.is_low_stock && (
                              <Badge className="mt-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30 text-xs py-0">
                                <AlertTriangle className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                                Low
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 md:p-3 text-muted-foreground text-sm font-mono">{item.sku || '-'}</td>
                      <td className="p-2 md:p-3">
                        {item.category && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs py-0">{item.category}</Badge>
                        )}
                      </td>
                      <td className="p-2 md:p-3 text-right font-semibold">
                        <span className={item.is_low_stock ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {item.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1 block md:inline">
                          /{item.reorder_level}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-right font-medium text-sm">
                        {item.unit_price ? `$${Number(item.unit_price).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-2 md:p-3 text-muted-foreground text-sm truncate">{item.location || '-'}</td>
                      <td className="p-2 md:p-3">
                        <Badge 
                          className={`text-xs py-0 ${
                            item.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                            item.status === 'out_of_stock' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' :
                            'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30'
                          }`}
                        >
                          {item.status === 'active' ? '✅' : item.status === 'out_of_stock' ? '❌' : '⏸️'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openAdjustModal(item)}
                            title="Adjust Quantity"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openHistoryModal(item)}
                            title="View History"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(item)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteDialog(item)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          setFormData({});
          setSelectedItem(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5 dark:from-slate-950 dark:to-slate-900/30 p-3 md:p-4">
          <DialogHeader className="space-y-1 pb-2 md:pb-3 border-b border-border/50">
            <DialogTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {showAddModal ? '➕ Add New Product' : '✏️ Edit Product'}
            </DialogTitle>
            <DialogDescription className="text-base font-semibold">
              {showAddModal ? 'Add a new item to your stock inventory' : 'Update product information'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 md:gap-3 py-2 md:py-3">
            <div className="space-y-2 bg-primary/5 dark:bg-slate-800/30 p-2 md:p-3 rounded border border-primary/20">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                📋 Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-base font-bold">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Product name"
                    className="border-primary/30 focus:border-primary/60 transition-colors h-9 text-base"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sku" className="text-base font-bold">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Product SKU"
                    className="border-primary/30 focus:border-primary/60 transition-colors h-9 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 bg-blue-500/5 dark:bg-blue-900/10 p-2 md:p-3 rounded border border-blue-500/20">
              <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                📝 Description & Details
              </h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-base font-bold">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description"
                    rows={3}
                    className="border-blue-500/30 focus:border-blue-500/60 transition-colors resize-none text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="category" className="text-base font-bold">Category</Label>
                    <Input
                      id="category"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Electronics"
                      className="border-blue-500/30 focus:border-blue-500/60 transition-colors h-9 text-base"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="location" className="text-base font-bold">📍 Location</Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Warehouse A"
                      className="border-blue-500/30 focus:border-blue-500/60 transition-colors h-9 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 bg-emerald-500/5 dark:bg-emerald-900/10 p-2 md:p-3 rounded border border-emerald-500/20">
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                📦 Inventory & Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                <div className="space-y-1">
                  <Label htmlFor="quantity" className="text-base font-bold">📊 Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity || 0}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="border-emerald-500/30 focus:border-emerald-500/60 transition-colors h-9 text-base"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="unit_price" className="text-base font-bold">💰 Unit Price</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price || ''}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || undefined })}
                    min="0"
                    className="border-emerald-500/30 focus:border-emerald-500/60 transition-colors h-9 text-base"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reorder_level" className="text-base font-bold">⚠️ Reorder Level</Label>
                  <Input
                    id="reorder_level"
                    type="number"
                    value={formData.reorder_level || 10}
                    onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 10 })}
                    min="0"
                    className="border-emerald-500/30 focus:border-emerald-500/60 transition-colors h-9 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 bg-amber-500/5 dark:bg-amber-900/10 p-2 md:p-3 rounded border border-amber-500/20">
              <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                🤝 Supplier Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                <div className="space-y-1">
                  <Label htmlFor="supplier_name" className="text-base font-bold">Supplier Name</Label>
                  <Input
                    id="supplier_name"
                    value={formData.supplier_name || ''}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    placeholder="Supplier name"
                    className="border-amber-500/30 focus:border-amber-500/60 transition-colors h-9 text-base"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="supplier_contact" className="text-base font-bold">Contact Info</Label>
                  <Input
                    id="supplier_contact"
                    value={formData.supplier_contact || ''}
                    onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
                    placeholder="Email or phone"
                    className="border-amber-500/30 focus:border-amber-500/60 transition-colors h-9 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 bg-indigo-500/5 dark:bg-indigo-900/10 p-2 md:p-3 rounded border border-indigo-500/20">
              <Label htmlFor="images" className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                🖼️ Product Image
              </Label>
              <div className="space-y-3">
                {formData.images?.[0] && (
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <img
                      src={formData.images[0]}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, images: [] })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload product image (2MB max). Images will appear when you add this stock item to your store.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 bg-purple-500/5 dark:bg-purple-900/10 p-2 md:p-3 rounded border border-purple-500/20">
              <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                ⚙️ Status & Notes
              </h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="status" className="text-base font-bold">Status</Label>
                  <Select
                    value={formData.status || 'active'}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="border-purple-500/30 focus:border-purple-500/60 h-9 text-base font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">✅ Active</SelectItem>
                      <SelectItem value="discontinued">❌ Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-base font-bold">📌 Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes or observations..."
                    rows={3}
                    className="border-purple-500/30 focus:border-purple-500/60 transition-colors resize-none text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/50 pt-2 md:pt-3 mt-2 gap-2 flex flex-row-reverse">
            <Button 
              onClick={showAddModal ? handleCreateStock : handleUpdateStock}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow hover:shadow-md transition-all text-base font-bold h-10"
            >
              {showAddModal ? '➕ Add Product' : '💾 Save Changes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setFormData({});
              }}
              className="border-muted-foreground/30 hover:bg-muted/50 text-base font-bold h-10"
            >
              ❌ Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Quantity Modal */}
      <Dialog open={showAdjustModal} onOpenChange={(open) => {
        if (!open) {
          setShowAdjustModal(false);
          setSelectedItem(null);
          setAdjustData({ adjustment: 0, reason: 'adjustment', notes: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock Quantity</DialogTitle>
            <DialogDescription>
              {selectedItem && `Current stock: ${selectedItem.quantity} units`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adjustment">Adjustment</Label>
              <Input
                id="adjustment"
                type="number"
                value={adjustData.adjustment}
                onChange={(e) => setAdjustData({ ...adjustData, adjustment: parseInt(e.target.value) || 0 })}
                placeholder="Enter quantity (positive to add, negative to remove)"
              />
              {selectedItem && (
                <p className="text-sm text-muted-foreground">
                  New quantity will be: {selectedItem.quantity + adjustData.adjustment}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select
                value={adjustData.reason}
                onValueChange={(value) => setAdjustData({ ...adjustData, reason: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="damage">Damage/Loss</SelectItem>
                  <SelectItem value="stocktake">Stocktake</SelectItem>
                  <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjust_notes">Notes</Label>
              <Textarea
                id="adjust_notes"
                value={adjustData.notes}
                onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                placeholder="Additional details about this adjustment"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustQuantity}>
              Adjust Quantity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={(open) => {
        if (!open) {
          setShowHistoryModal(false);
          setSelectedItem(null);
          setStockHistory([]);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Stock History</DialogTitle>
            <DialogDescription>
              {selectedItem && `History for: ${selectedItem.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-96">
            {stockHistory.length === 0 ? (
              <p className="text-center py-4 md:py-6 text-muted-foreground">No history records</p>
            ) : (
              <div className="space-y-4">
                {stockHistory.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline">{record.reason.replace('_', ' ')}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${record.adjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {record.adjustment >= 0 ? '+' : ''}{record.adjustment}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.quantity_before} → {record.quantity_after}
                        </p>
                      </div>
                    </div>
                    {record.notes && (
                      <p className="text-sm mt-2 text-muted-foreground">{record.notes}</p>
                    )}
                    {record.adjusted_by_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        By: {record.adjusted_by_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stock Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone
              and will also delete all associated history records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStock} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
