import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Grid, List, Package, ArrowLeft, ExternalLink, Search, Star, Store as StoreIcon } from 'lucide-react';
import { TemplateProps } from './types';

export default function BaseTemplate(props: TemplateProps & { variant: 'classic' | 'stockist' | 'walidstore' | 'minimal' | 'catalog' }) {
  const { storeSlug, products, filtered, settings, categories, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, sortOption, setSortOption, viewMode, setViewMode, formatPrice, primaryColor, secondaryColor, bannerUrl, navigate } = props;

  const featured = products.filter(p => p.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
      >
        {bannerUrl && (
          <div className="absolute inset-0 opacity-30">
            <img src={bannerUrl} alt="Store banner" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
        </div>
        <div className="relative container max-w-7xl mx-auto px-4 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 text-white/90 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-start gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 text-white shadow-lg">
              <div className="w-16 h-16 bg-white/20 rounded-xl overflow-hidden flex items-center justify-center">
                {settings.store_logo ? (
                  <img src={settings.store_logo} alt={settings.store_name} className="w-full h-full object-cover" />
                ) : (
                  <StoreIcon className="w-8 h-8 text-white/80" />
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{settings.store_name || 'Store'}</h1>
                {settings.store_description && (
                  <p className="text-white/85 text-sm md:text-base max-w-2xl mt-1">{settings.store_description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-white/90">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    <Package className="w-3 h-3 mr-1" /> {products.length} Products
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    <Eye className="w-3 h-3 mr-1" /> {products.reduce((sum, p) => sum + p.views, 0)} Views
                  </Badge>
                </div>
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="secondary" className="bg-white/15 text-white border-white/20 hover:bg-white/25">
                <ExternalLink className="w-4 h-4 mr-2" /> Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {featured.length > 0 && (
        <div className="bg-muted/30 border-b">
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    const slug = product.slug;
                    if (slug && slug.length > 0) {
                      navigate(`/store/${storeSlug}/${slug}`);
                    } else {
                      navigate(`/product/${product.id}`);
                    }
                  }}
                  className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative aspect-square bg-muted">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground opacity-20" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold" style={{ color: primaryColor }}>
                        {formatPrice(Number(product.price))}
                      </span>
                      {product.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(Number(product.original_price))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="sticky top-16 z-10 mb-6">
          <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 rounded-xl border p-4 shadow-sm">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>

              {categories.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto">
                  <button className={`px-3 py-1.5 rounded-full text-sm border transition ${categoryFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`} onClick={() => setCategoryFilter('all')}>All</button>
                  {categories.map((cat) => (
                    <button key={cat} className={`px-3 py-1.5 rounded-full text-sm border transition ${categoryFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`} onClick={() => setCategoryFilter(cat)}>{cat}</button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                  <Grid className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-muted/60 to-transparent py-20">
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="w-28 h-28 mx-auto bg-background/70 backdrop-blur rounded-2xl flex items-center justify-center border">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold tracking-tight">No Products Yet</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">This store is being stocked. Check back soon or explore our marketplace!</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Button onClick={() => navigate('/marketplace')} size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Package className="mr-2 h-5 w-5" /> Browse Marketplace
                  </Button>
                  <Button onClick={() => navigate('/contact')} variant="outline" size="lg">Contact Store Owner</Button>
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
            {filtered.map((product) => {
              const discount = product.original_price ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100) : 0;
              return (
                <div key={product.id} onClick={() => {
                  const slug = product.slug;
                  if (slug && slug.length > 0) {
                    // Debug: log navigation
                    console.log('[Storefront] Navigating to', `/store/${storeSlug}/${slug}`);
                    navigate(`/store/${storeSlug}/${slug}`);
                  } else {
                    alert('Error: Product slug missing! Cannot preview this product.');
                    console.error('[Storefront] Product slug missing for product:', product);
                  }
                }} className="group bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer ring-1 ring-transparent hover:ring-primary/10" role="button" tabIndex={0}>
                  <div className={`relative aspect-[4/5] bg-muted`}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground opacity-20" />
                      </div>
                    )}
                    {discount > 0 && <Badge className="absolute top-2 right-2 bg-red-500">-{discount}%</Badge>}
                    {product.stock_quantity === 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Badge variant="secondary">Sold Out</Badge></div>}
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="font-semibold tracking-tight line-clamp-2">{product.title}</h3>
                      {product.category && <p className="text-xs text-muted-foreground mt-1">{product.category}</p>}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xl font-bold" style={{ color: primaryColor }}>{formatPrice(Number(product.price))}</span>
                        {product.original_price && <span className="text-sm text-muted-foreground line-through ml-2">{formatPrice(Number(product.original_price))}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={(e) => {
                          e.stopPropagation();
                          const slug = product.slug;
                          if (slug && slug.length > 0) navigate(`/store/${storeSlug}/${slug}`);
                          else navigate(`/product/${product.id}`);
                        }}>View</Button>
                        <Button size="sm" className="bg-primary text-primary-foreground" onClick={(e) => {
                          e.stopPropagation();
                          const slug = product.slug;
                          if (slug && slug.length > 0) navigate(`/store/${storeSlug}/checkout/${slug}`);
                          else navigate(`/guest-checkout/${product.id}`);
                        }}>Buy</Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((product) => {
              const discount = product.original_price ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100) : 0;
              return (
                <div key={product.id} onClick={() => {
                  const slug = product.slug;
                  if (slug && slug.length > 0) {
                    navigate(`/store/${storeSlug}/${slug}`);
                  } else {
                    navigate(`/product/${product.id}`);
                  }
                }} className="w-full group bg-card rounded-2xl border p-4 hover:shadow-xl transition-all cursor-pointer ring-1 ring-transparent hover:ring-primary/10" role="button" tabIndex={0}>
                  <div className="flex gap-4">
                    <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground opacity-20" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">{product.title}</h3>
                          {product.category && <Badge variant="secondary" className="text-xs">{product.category}</Badge>}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: primaryColor }}>{formatPrice(Number(product.price))}</div>
                          {product.original_price && <div className="text-sm text-muted-foreground line-through">{formatPrice(Number(product.original_price))}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs"><Eye className="w-3 h-3 mr-1" />{product.views} views</Badge>
                        {discount > 0 && <Badge className="bg-red-500 text-xs">Save {discount}%</Badge>}
                        {product.stock_quantity === 0 && <Badge variant="secondary">Out of Stock</Badge>}
                        <Button size="sm" className="ml-auto" onClick={(e) => {
                          e.stopPropagation();
                          const slug = product.slug;
                          if (slug && slug.length > 0) navigate(`/store/${storeSlug}/checkout/${slug}`);
                          else navigate(`/guest-checkout/${product.id}`);
                        }}>Buy</Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Powered by {settings.store_name || 'EcoPro'}</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>
            <ExternalLink className="w-4 h-4 mr-2" /> Explore More Stores
          </Button>
        </div>
      </div>
    </div>
  );
}
