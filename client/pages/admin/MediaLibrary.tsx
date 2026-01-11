import React, { useEffect, useState } from 'react';
import { Trash2, Search, Image, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface MediaItem {
  id: string;
  url: string;
  source: string; // 'product', 'hero', 'banner', 'logo', 'store_images', etc.
  source_id?: number;
  source_name?: string;
  created_at?: string;
}

export default function MediaLibrary() {
  const { t, locale } = useTranslation();
  const [images, setImages] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadAllImages();
  }, []);

  const loadAllImages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/client/media-library');
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (item: MediaItem) => {
    if (!confirm(locale === 'ar' 
      ? 'هل أنت متأكد من حذف هذه الصورة؟ سيتم إزالتها من المكان الذي تُستخدم فيه.'
      : 'Are you sure you want to delete this image? It will be removed from where it\'s used.'
    )) return;

    setDeletingId(item.id);
    try {
      const res = await fetch('/api/client/media-library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: item.url, 
          source: item.source, 
          source_id: item.source_id 
        })
      });
      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== item.id));
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      product: { ar: 'منتج', en: 'Product' },
      hero_main_url: { ar: 'صورة البطل الرئيسية', en: 'Hero Main' },
      hero_tile1_url: { ar: 'صورة البطل 1', en: 'Hero Tile 1' },
      hero_tile2_url: { ar: 'صورة البطل 2', en: 'Hero Tile 2' },
      banner_url: { ar: 'البانر', en: 'Banner' },
      logo_url: { ar: 'الشعار', en: 'Logo' },
      store_images: { ar: 'صور المتجر', en: 'Store Images' },
      favicon_url: { ar: 'أيقونة الموقع', en: 'Favicon' },
    };
    return labels[source]?.[locale === 'ar' ? 'ar' : 'en'] || source;
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      product: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      hero_main_url: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      hero_tile1_url: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      hero_tile2_url: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      banner_url: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      logo_url: 'bg-green-500/20 text-green-500 border-green-500/30',
      store_images: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
      favicon_url: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    };
    return colors[source] || 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  };

  // Get unique sources for filter
  const sources = ['all', ...new Set(images.map(img => img.source))];

  // Filter images
  const filteredImages = images.filter(img => {
    const matchesSource = selectedSource === 'all' || img.source === selectedSource;
    const matchesSearch = !searchQuery || 
      img.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.source_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {locale === 'ar' ? '📁 مكتبة الوسائط' : '📁 Media Library'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {locale === 'ar' 
              ? `${images.length} صورة في حسابك`
              : `${images.length} images in your account`
            }
          </p>
        </div>
        <button
          onClick={loadAllImages}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {locale === 'ar' ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Source filter */}
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {sources.map(source => (
            <option key={source} value={source}>
              {source === 'all' 
                ? (locale === 'ar' ? 'الكل' : 'All Sources')
                : getSourceLabel(source)
              }
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredImages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Image className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {locale === 'ar' ? 'لا توجد صور' : 'No images found'}
          </p>
          <p className="text-sm">
            {locale === 'ar' 
              ? 'قم برفع صور للمنتجات أو إعدادات المتجر'
              : 'Upload images for products or store settings'
            }
          </p>
        </div>
      )}

      {/* Image Grid */}
      {!isLoading && filteredImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredImages.map((item) => (
            <div
              key={item.id}
              className="group relative bg-muted/30 border border-border rounded-lg overflow-hidden aspect-square"
            >
              {/* Image */}
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.png';
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title={locale === 'ar' ? 'نسخ الرابط' : 'Copy URL'}
                  >
                    {copiedUrl === item.url ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-white" />
                    )}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title={locale === 'ar' ? 'فتح في نافذة جديدة' : 'Open in new tab'}
                  >
                    <ExternalLink className="h-4 w-4 text-white" />
                  </a>
                  <button
                    onClick={() => deleteImage(item)}
                    disabled={deletingId === item.id}
                    className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-lg transition-colors disabled:opacity-50"
                    title={locale === 'ar' ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Source badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getSourceColor(item.source)}`}>
                  {getSourceLabel(item.source)}
                </span>
              </div>

              {/* Source name (product title, etc) */}
              {item.source_name && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                  <p className="text-xs text-white truncate">{item.source_name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
