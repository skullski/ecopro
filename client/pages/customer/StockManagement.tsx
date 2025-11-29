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
      const token = localStorage.getItem('token');
      const res = await fetch('/api/client/stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStock(data);
      }
    } catch (error) {
      console.error('Failed to load stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
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

  const handleCreateStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/client/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await loadStock();
        setShowAddModal(false);
        setFormData({});
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create stock item');
      }
    } catch (error) {
      console.error('Create stock error:', error);
      alert('Failed to create stock item');
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedItem) return;

    try {
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Management</h1>
            <p className="text-muted-foreground">Manage your inventory and track stock levels</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => {
              setFormData({});
              setShowAddModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stock.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {stock.filter(i => i.status === 'out_of_stock').length}
                </p>
              </div>
              <PackageX className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, SKU, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showLowStock ? 'default' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Low Stock Only
            </Button>

            <Button variant="outline" onClick={loadStock}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">SKU</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-right p-4 font-medium">Quantity</th>
                  <th className="text-right p-4 font-medium">Unit Price</th>
                  <th className="text-left p-4 font-medium">Location</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                        ? 'No products match your filters'
                        : 'No stock items yet. Add your first product!'}
                    </td>
                  </tr>
                ) : (
                  filteredStock.map(item => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.is_low_stock && (
                            <Badge variant="destructive" className="mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{item.sku || '-'}</td>
                      <td className="p-4">
                        {item.category && (
                          <Badge variant="outline">{item.category}</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span className={item.is_low_stock ? 'text-orange-600 font-bold' : ''}>
                          {item.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          / {item.reorder_level}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {item.unit_price ? `$${item.unit_price.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-4 text-muted-foreground">{item.location || '-'}</td>
                      <td className="p-4">
                        <Badge 
                          variant={
                            item.status === 'active' ? 'default' :
                            item.status === 'out_of_stock' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {item.status}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showAddModal ? 'Add New Product' : 'Edit Product'}</DialogTitle>
            <DialogDescription>
              {showAddModal ? 'Add a new item to your stock inventory' : 'Update product information'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Product SKU"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Electronics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Storage location"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || 0}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={formData.unit_price || ''}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || undefined })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorder_level">Reorder Level</Label>
                <Input
                  id="reorder_level"
                  type="number"
                  value={formData.reorder_level || 10}
                  onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 10 })}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_name">Supplier Name</Label>
                <Input
                  id="supplier_name"
                  value={formData.supplier_name || ''}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier_contact">Supplier Contact</Label>
                <Input
                  id="supplier_contact"
                  value={formData.supplier_contact || ''}
                  onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
                  placeholder="Email or phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'active'}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setFormData({});
            }}>
              Cancel
            </Button>
            <Button onClick={showAddModal ? handleCreateStock : handleUpdateStock}>
              {showAddModal ? 'Add Product' : 'Save Changes'}
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
              <p className="text-center py-8 text-muted-foreground">No history records</p>
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
