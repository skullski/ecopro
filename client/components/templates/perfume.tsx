import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  realm: 'Noir' | 'Gold' | 'Dream';
  price: number;
  notes: string[];
  rating: number;
  images: string[];
  description?: string;
}

export default function PerfumeTemplate(props: any) {
  const { products = PRODUCTS, navigate, storeSlug } = props;
  const [realmFilter, setRealmFilter] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Normalize products to ensure all have required fields
  const normalizedProducts = Array.isArray(products) ? products.map(p => ({
    ...p,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://via.placeholder.com/400x300?text=No+Image'],
    rating: typeof p.rating === 'number' ? p.rating : 4.5,
    notes: Array.isArray(p.notes) ? p.notes : ['Notes unavailable'],
    realm: p.realm || 'Noir',
  })) : PRODUCTS;

  const filtered = realmFilter === 'All' ? normalizedProducts : normalizedProducts.filter(p => p.realm === realmFilter);

  return (
    <div style={{ backgroundColor: '#0a0a0a' }} className="min-h-screen text-white">
      <div className="fixed bottom-6 right-6 z-50">
        <button className="rounded-full bg-amber-600 text-white font-semibold px-5 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition">
          Bag <span className="w-6 h-6 rounded-full bg-white text-amber-600 text-xs flex items-center justify-center font-bold">{cartCount}</span>
        </button>
      </div>

      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="font-serif text-3xl font-semibold text-amber-600">Olfactory</h1>
          <p className="text-xs text-gray-400 mt-1">Premium fragrance collections</p>
        </div>
      </header>

      <section className="relative h-80 overflow-hidden bg-gradient-to-b from-amber-900/20 to-black">
        <img src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1600&q=80" alt="Hero" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black flex items-end justify-center pb-12">
          <div className="text-center">
            <p className="font-serif text-4xl font-semibold text-amber-400 mb-2">The Realms of Scent</p>
            <p className="text-sm text-gray-400">Discover scents that tell your story</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-4">Filter by Realm</label>
          <div className="flex gap-3 flex-wrap">
            {['All', 'Noir', 'Gold', 'Dream'].map((realm) => (
              <button
                key={realm}
                onClick={() => setRealmFilter(realm)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition border ${
                  realmFilter === realm
                    ? 'bg-amber-600 text-black border-amber-600'
                    : 'border-amber-900/50 text-amber-400 hover:border-amber-600'
                }`}
              >
                {realm}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold text-amber-400 mb-6">Featured Fragrances</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => setQuickViewProduct(p)}
                className="bg-gradient-to-br from-amber-900/20 to-black border border-amber-900/50 rounded-lg overflow-hidden hover:border-amber-600 transition group cursor-pointer"
              >
                <div className="relative h-56 bg-black overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition opacity-80" />
                  <div className="absolute top-3 left-3 bg-black/80 px-2 py-1 rounded text-xs font-semibold text-amber-400">
                    {p.realm}
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm text-white line-clamp-1">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Fragrance</p>
                  <div className="flex gap-1 mt-2">
                    {'★'.repeat(Math.floor(p.rating))}
                    <span className="text-xs text-gray-600">({p.rating})</span>
                  </div>
                  <p className="text-amber-400 font-semibold text-sm mt-3">{p.price} DZD</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCartCount(c => c + 1);
                    }}
                    className="w-full mt-3 py-2 bg-amber-600 text-black rounded font-semibold text-xs hover:bg-amber-500 transition"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
          <div className="bg-black border border-amber-900/50 rounded-lg w-96 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-amber-400">Fragrance Details</h2>
              <button onClick={() => setQuickViewProduct(null)} className="text-2xl text-gray-600 hover:text-white">✕</button>
            </div>
            <img src={quickViewProduct.images[0]} alt={quickViewProduct.name} className="w-full h-64 object-cover rounded" />
            <div>
              <p className="font-semibold text-lg text-white">{quickViewProduct.name}</p>
              <div className="inline-block bg-amber-600/30 text-amber-400 px-2 py-1 rounded text-xs font-semibold mt-2">{quickViewProduct.realm}</div>
              <div className="flex gap-1 mt-2">
                {'★'.repeat(Math.floor(quickViewProduct.rating))}
                <span className="text-xs text-gray-600">({quickViewProduct.rating})</span>
              </div>
              <p className="text-amber-400 font-semibold text-2xl mt-3">{quickViewProduct.price} DZD</p>
            </div>
            {quickViewProduct.description && <p className="text-sm text-gray-400">{quickViewProduct.description}</p>}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-3">Scent Notes</label>
              <div className="flex flex-wrap gap-2">
                {quickViewProduct.notes.map((note, i) => (
                  <span key={i} className="bg-amber-900/30 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-900/50">
                    {note}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const slug = (quickViewProduct as any).slug;
                  if (slug && typeof slug === 'string' && slug.length > 0)
                    navigate(`/store/${storeSlug}/${slug}`);
                  else
                    navigate(`/product/${quickViewProduct.id}`);
                }}
                className="flex-1 py-3 border border-amber-600 text-amber-600 rounded font-semibold hover:bg-amber-600/10 transition"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  const slug = (quickViewProduct as any).slug;
                  if (slug && typeof slug === 'string' && slug.length > 0)
                    navigate(`/store/${storeSlug}/checkout/${slug}`);
                  else
                    navigate(`/checkout/${quickViewProduct.id}`);
                  setQuickViewProduct(null);
                }}
                className="flex-1 py-3 bg-amber-600 text-black rounded font-semibold hover:bg-amber-500 transition"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-amber-900/30 mt-12 py-8 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>&copy; 2024 Olfactory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Midnight Elixir', realm: 'Noir', price: 8500, notes: ['Oud', 'Amber', 'Musk'], rating: 4.8, images: ['https://images.unsplash.com/photo-1594738957566-e26d9eacde42?w=400&q=80'], description: 'Deep, mysterious, intoxicating' },
  { id: 2, name: 'Golden Hour', realm: 'Gold', price: 7800, notes: ['Saffron', 'Vanilla', 'Sandalwood'], rating: 4.9, images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&q=80'], description: 'Warm, luxurious, captivating' },
  { id: 3, name: 'Dream Whisper', realm: 'Dream', price: 7200, notes: ['Rose', 'Peony', 'Jasmine'], rating: 4.7, images: ['https://images.unsplash.com/photo-1614707267537-b85faf00021e?w=400&q=80'], description: 'Soft, romantic, dreamy' },
  { id: 4, name: 'Obsidian Night', realm: 'Noir', price: 9200, notes: ['Black Pepper', 'Leather', 'Vetiver'], rating: 4.6, images: ['https://images.unsplash.com/photo-1532635726884-8b83bb820773?w=400&q=80'] },
  { id: 5, name: 'Imperial Gold', realm: 'Gold', price: 8900, notes: ['Incense', 'Amber', 'Wood'], rating: 4.8, images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&q=80'] },
  { id: 6, name: 'Ethereal', realm: 'Dream', price: 6800, notes: ['Bergamot', 'Lily', 'Musk'], rating: 4.5, images: ['https://images.unsplash.com/photo-1588405748688-c5646683b495?w=400&q=80'] },
  { id: 7, name: 'Noir Essence', realm: 'Noir', price: 8200, notes: ['Coffee', 'Cocoa', 'Tobacco'], rating: 4.7, images: ['https://images.unsplash.com/photo-1564697569336-22b2c89c59b6?w=400&q=80'] },
  { id: 8, name: 'Sunlit Dreams', realm: 'Gold', price: 7500, notes: ['Orange', 'Neroli', 'Cedar'], rating: 4.6, images: ['https://images.unsplash.com/photo-1573592269827-a9ef3561b389?w=400&q=80'] },
];
