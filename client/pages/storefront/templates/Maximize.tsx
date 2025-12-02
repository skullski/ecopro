import { TemplateProps } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Package, Search } from 'lucide-react';

export default function MaximizeTemplate(props: TemplateProps) {
  const { storeSlug, filtered, products, categories, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, sortOption, setSortOption, formatPrice } = props;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {products.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 mb-6">
          <div className="bg-card rounded-xl border p-4 h-max sticky top-20">
            <div className="space-y-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Categories</p>
                <div className="space-y-2 max-h-64 overflow-auto pr-1">
                  <button onClick={() => setCategoryFilter('all')} className={`w-full text-left px-3 py-1.5 rounded-md border ${categoryFilter==='all'?'bg-primary text-primary-foreground border-primary':'hover:bg-muted'}`}>All</button>
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`w-full text-left px-3 py-1.5 rounded-md border ${categoryFilter===cat?'bg-primary text-primary-foreground border-primary':'hover:bg-muted'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Sort</p>
                <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="views-desc">Popularity</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-muted-foreground">{filtered.length} results</h3>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
              {filtered.map((product) => {
                const discount = product.original_price 
                  ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
                  : 0;
                return (
                  <Card key={product.id} className="group overflow-hidden rounded-lg border bg-card">
                    <div className={`relative aspect-square bg-muted`}>
                      <img
                        src={product.images?.[0] || '/placeholder.png'}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                      {product.stock_quantity <= 0 && (
                        <span className="absolute left-2 top-2 z-10 text-[11px] px-2 py-0.5 rounded bg-black/70 text-white">Sold out</span>
                      )}
                      {discount > 0 && (
                        <span className="absolute right-2 top-2 z-10 text-[11px] px-2 py-0.5 rounded bg-rose-600 text-white">-{discount}%</span>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{product.title}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-semibold">{formatPrice(Number(product.price))}</span>
                        {product.original_price && (
                          <span className="text-muted-foreground line-through text-xs">{formatPrice(Number(product.original_price))}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
