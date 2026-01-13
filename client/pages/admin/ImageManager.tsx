import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Image, Trash2, Search, Filter, AlertCircle, CheckCircle, 
  RefreshCw, Download, Eye, Package, Store as StoreIcon,
  LayoutGrid, List, FileWarning, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface ImageUsage {
  type: 'product' | 'store' | 'stock';
  name: string;
  id?: number;
}

interface ImageInfo {
  filename: string;
  url: string;
  size: number | null;
  createdAt: string | null;
  modifiedAt: string | null;
  usedIn: ImageUsage[];
  isOrphaned: boolean;
  isExternal?: boolean;
}

interface ImagesResponse {
  images: ImageInfo[];
  total: number;
  orphaned: number;
  inUse: number;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ImageManager() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'orphaned' | 'inUse'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ImageInfo | null>(null);

  // Fetch images
  const { data, isLoading, error, refetch } = useQuery<ImagesResponse>({
    queryKey: ['client-images'],
    queryFn: async () => {
      const res = await fetch('/api/client/images', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch images');
      return res.json();
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      // For external URLs, encode the full URL; for uploads, just use filename
      const deleteParam = imageUrl.startsWith('http') 
        ? encodeURIComponent(imageUrl) 
        : encodeURIComponent(imageUrl.replace('/uploads/', ''));
      
      const res = await fetch(`/api/client/images/${deleteParam}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Failed to delete image');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-images'] });
      toast.success('Image deleted from all locations');
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
  });

  // Filter and search images
  const filteredImages = useMemo(() => {
    if (!data?.images) return [];
    
    let filtered = [...data.images];
    
    // Apply filter
    if (filterType === 'orphaned') {
      filtered = filtered.filter(img => img.isOrphaned);
    } else if (filterType === 'inUse') {
      filtered = filtered.filter(img => !img.isOrphaned);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(img => 
        img.filename.toLowerCase().includes(q) ||
        img.usedIn.some(u => u.name.toLowerCase().includes(q))
      );
    }
    
    return filtered;
  }, [data?.images, filterType, searchQuery]);

  const handleDeleteClick = (img: ImageInfo) => {
    setImageToDelete(img);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (imageToDelete) {
      deleteMutation.mutate(imageToDelete.url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load images</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Image className="w-5 h-5" />
            {t('imageManager.title') || 'Image Manager'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('imageManager.description') || 'Manage all images uploaded to your store'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-3">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Image className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.total || 0}</p>
              <p className="text-sm text-muted-foreground">Total Images</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-3">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.inUse || 0}</p>
              <p className="text-sm text-muted-foreground">In Use</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-3">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FileWarning className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.orphaned || 0}</p>
              <p className="text-sm text-muted-foreground">Unused (Can Delete)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
          <SelectTrigger className="w-[170px] h-9">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Images</SelectItem>
            <SelectItem value="inUse">In Use</SelectItem>
            <SelectItem value="orphaned">Unused Only</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md h-9">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'ghost'} 
            size="sm"
            className="rounded-r-none"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="sm"
            className="rounded-l-none"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Images */}
      {filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Image className="w-14 h-14 mb-3 opacity-30" />
          <p>No images found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredImages.map((img) => (
            <div 
              key={img.url}
              className={`relative group rounded-lg border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
                img.isOrphaned ? 'border-orange-300 dark:border-orange-700' : ''
              } ${img.isExternal ? 'border-dashed' : ''}`}
              onClick={() => setSelectedImage(img)}
            >
              <div className="aspect-square bg-muted">
                <img 
                  src={img.url} 
                  alt={img.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23666" width="100" height="100"/><text x="50" y="50" fill="white" font-size="12" text-anchor="middle" dy=".3em">No Preview</text></svg>';
                  }}
                />
              </div>
              {img.isOrphaned && (
                <Badge 
                  variant="outline" 
                  className="absolute top-1.5 left-1.5 bg-orange-100 text-orange-700 border-orange-300"
                >
                  Unused
                </Badge>
              )}
              {img.isExternal && (
                <Badge 
                  variant="outline" 
                  className="absolute top-1.5 right-1.5 bg-blue-100 text-blue-700 border-blue-300 text-[10px]"
                >
                  URL
                </Badge>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(img); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-1.5 text-xs truncate">{img.filename.slice(0, 20)}...</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredImages.map((img) => (
            <div 
              key={img.url}
              className={`flex items-center gap-3 p-2.5 border rounded-lg hover:bg-muted/50 cursor-pointer ${
                img.isOrphaned ? 'border-orange-300 dark:border-orange-700' : ''
              } ${img.isExternal ? 'border-dashed' : ''}`}
              onClick={() => setSelectedImage(img)}
            >
              <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 bg-muted">
                <img 
                  src={img.url} 
                  alt={img.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23666" width="100" height="100"/><text x="50" y="50" fill="white" font-size="12" text-anchor="middle" dy=".3em">No Preview</text></svg>';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{img.filename}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(img.size)} • {formatDate(img.createdAt)}
                  {img.isExternal && <span className="ml-2 text-blue-600">(External URL)</span>}
                </p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {img.usedIn.length > 0 ? (
                    img.usedIn.map((usage, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {usage.type === 'product' ? <Package className="w-3 h-3 mr-1" /> : 
                         usage.type === 'stock' ? <Package className="w-3 h-3 mr-1" /> :
                         <StoreIcon className="w-3 h-3 mr-1" />}
                        {usage.name}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                      Unused
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="h-8 w-8 p-0"
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(img); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Detail Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-2xl p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Image Details
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.filename}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Filename</p>
                  <p className="font-mono text-xs break-all">{selectedImage.filename}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p>{formatFileSize(selectedImage.size)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{formatDate(selectedImage.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p>{selectedImage.isOrphaned ? (
                    <span className="text-orange-600">Unused (can be deleted)</span>
                  ) : (
                    <span className="text-green-600">In use</span>
                  )}</p>
                </div>
              </div>
              
              {selectedImage.usedIn.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2">Used in:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.usedIn.map((usage, i) => (
                      <Badge key={i} variant="secondary">
                        {usage.type === 'product' ? <Package className="w-3 h-3 mr-1" /> : <StoreIcon className="w-3 h-3 mr-1" />}
                        {usage.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedImage(null)}>
                  Close
                </Button>
                <a href={selectedImage.url} download={selectedImage.filename} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </a>
                {selectedImage.isOrphaned && (
                  <Button variant="destructive" onClick={() => handleDeleteClick(selectedImage)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Image
            </DialogTitle>
            <DialogDescription>
              {imageToDelete && !imageToDelete.isOrphaned ? (
                <span className="text-orange-600 dark:text-orange-400">
                  ⚠️ This image is currently used in: {imageToDelete.usedIn.map(u => u.name).join(', ')}. 
                  Deleting it will remove it from <strong>all locations</strong> in your account.
                </span>
              ) : (
                'Are you sure you want to delete this image? This action cannot be undone.'
              )}
            </DialogDescription>
          </DialogHeader>
          {imageToDelete && (
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={imageToDelete.url} 
                  alt={imageToDelete.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-sm truncate max-w-[200px]">{imageToDelete.filename}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(imageToDelete.size)}</p>
                {imageToDelete.isExternal && (
                  <Badge variant="outline" className="mt-1 text-xs">External URL</Badge>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete from Everywhere'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="flex gap-2 p-3">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">About Image Management</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Shows <strong>all images</strong> from your products, stock, and store settings</li>
              <li>Deleting an image removes it from <strong>everywhere</strong> in your account</li>
              <li><strong>External URLs</strong> (http/https) are also tracked and can be removed</li>
              <li>Deleted images cannot be recovered</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
