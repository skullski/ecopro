import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Package, ArrowLeft, Star, Search, ExternalLink } from 'lucide-react';
import { TemplateProps } from './types';

export default function EditorialTemplate(props: TemplateProps & { mode: 'supreme' | 'fullframe' }) {
  const { storeSlug, products, filtered, settings, categories, searchQuery, setSearchQuery, formatPrice, primaryColor, secondaryColor, bannerUrl, navigate } = props;
  const featured = products.filter(p => p.is_featured).slice(0, 8);
  const bigTitle = props.mode === 'fullframe';

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
        {bannerUrl && (
          <div className="absolute inset-0">
            <img src={bannerUrl} alt="Store banner" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
        <div className={`relative container max-w-7xl mx-auto px-4 ${bigTitle ? 'py-20' : 'py-14'}`}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 text-white/90 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className={bigTitle ? 'max-w-5xl' : 'max-w-3xl'}>
            <h1 className={`${bigTitle ? 'text-6xl md:text-7xl' : 'text-4xl md:text-6xl'} font-bold tracking-tight text-white`}>{settings.store_name || 'Store'}</h1>
            {settings.store_description && (
              <p className={`${bigTitle ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} text-white/90 mt-3`}>{settings.store_description}</p>
            )}
            <div className="flex gap-2 mt-5 text-white/90">
              <Badge variant="secondary" className="bg-white/20 text-white border-0"><Package className="w-3 h-3 mr-1" /> {products.length} Products</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0"><Eye className="w-3 h-3 mr-1" /> {products.reduce((s, p) => s + p.views, 0)} Views</Badge>
            </div>
          </div>
          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80" />
              <Input value={searchQuery} onChange={(e) => props.setSearchQuery(e.target.value)} placeholder="Search products..." className="pl-10 bg-white/15 border-white/20 text-white placeholder:text-white/70" />
            </div>
          </div>
        </div>
      </div>

      {featured.length > 0 && (
        <div className="container max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-2xl font-bold">Highlights</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map(p => (
              <div
                key={p.id}
                className="group rounded-xl overflow-hidden border bg-card hover:shadow-xl transition"
                onClick={() => {
                  const slug = p.slug;
                  if (slug && slug.length > 0) navigate(`/store/${storeSlug}/${slug}`);
                  else navigate(`/product/${p.id}`);
                }}
              >
                <div className="relative aspect-square bg-muted">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-muted-foreground opacity-20"/></div>}
                </div>
                <div className="p-3">
                  <div className="font-medium line-clamp-2 min-h-[2.5rem]">{p.title}</div>
                  <div className="mt-1 font-semibold" style={{ color: primaryColor }}>{formatPrice(Number(p.price))}</div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={(e) => { e.stopPropagation(); const slug = p.slug; if (slug && slug.length > 0) navigate(`/store/${storeSlug}/${slug}`); else navigate(`/product/${p.id}`); }}
                    >
                      View
                    </Button>
                    <Button
                      onClick={(e) => { e.stopPropagation(); const slug = p.slug; if (slug && slug.length > 0) navigate(`/store/${storeSlug}/checkout/${slug}`); else navigate(`/guest-checkout/${p.id}`); }}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container max-w-7xl mx-auto px-4 pb-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No products found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(p => (
              <button key={p.id} onClick={() => { const slug = p.slug; if (slug && slug.length > 0) navigate(`/store/${storeSlug}/${slug}`); else navigate(`/product/${p.id}`); }} className="group rounded-xl overflow-hidden border bg-card hover:shadow-lg transition">
                <div className="relative aspect-square bg-muted">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-muted-foreground opacity-20"/></div>}
                </div>
                <div className="p-3">
                  <div className="font-medium line-clamp-2 min-h-[2.5rem]">{p.title}</div>
                  <div className="mt-1 font-semibold" style={{ color: primaryColor }}>{formatPrice(Number(p.price))}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Powered by {settings.store_name || 'EcoPro'}</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}><ExternalLink className="w-4 h-4 mr-2"/>Explore More Stores</Button>
        </div>
      </div>
    </div>
  );
}
