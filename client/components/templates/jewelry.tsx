import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  material: string;
  price: number;
  images: string[];
}

export default function JewelryTemplate(props: any) {
  const { products = PRODUCTS, navigate, storeSlug } = props;
  const [activeCollection, setActiveCollection] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const filtered = activeCollection === 'All' ? products : products.filter(p => p.material === activeCollection);

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed bottom-6 right-6 z-50">
        <button className="rounded-full bg-black text-white font-semibold px-5 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition">
          Bag <span className="w-6 h-6 rounded-full bg-yellow-600 text-white text-xs flex items-center justify-center font-bold">{cartCount}</span>
        </button>
      </div>

      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="font-serif text-4xl font-light tracking-wider text-gray-900">JewelryOS</h1>
          <p className="text-xs text-gray-600 mt-2">Luxury jewelry for every occasion</p>
        </div>
      </header>

      <section className="border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-semibold mb-4 text-gray-900">The Gold Edit</h2>
          <p className="text-gray-600 mb-6 text-sm">Curated selection of our finest pieces in yellow and white gold.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 4).map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition group cursor-pointer" onClick={() => setQuickViewProduct(p)}>
                <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover rounded mb-3 group-hover:scale-105 transition" />
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                <p className="text-yellow-700 text-sm font-semibold mt-2">{p.price} DZD</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-600 mb-4 font-semibold">Filter by Material</p>
          <div className="flex gap-3 flex-wrap">
            {['All', 'Gold', 'Silver', 'Platinum', 'Rose Gold'].map(mat => (
              <button
                key={mat}
                onClick={() => setActiveCollection(mat)}
                className={`px-4 py-2 text-sm font-medium transition border-2 rounded-full ${
                  activeCollection === mat
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-900 hover:border-gray-500'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-6">Collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(p => (
              <div
                key={p.id}
                onClick={() => setQuickViewProduct(p)}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer"
                style={{ boxShadow: `0 4px 12px rgba(184, 134, 11, ${p.material === 'Gold' || p.material === 'Rose Gold' ? 0.15 : 0.05})` }}
              >
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition" />
                  <div className="absolute bottom-3 left-3 bg-black/80 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
                    {p.material}
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-serif text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                  <p className="text-yellow-700 font-semibold text-lg mt-3">{p.price} DZD</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCartCount(c => c + 1);
                    }}
                    className="w-full mt-4 py-2 bg-black text-white rounded font-semibold text-sm hover:bg-gray-900 transition"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
          <div className="bg-white rounded-lg w-96 p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-semibold text-gray-900">Jewelry Details</h2>
              <button onClick={() => setQuickViewProduct(null)} className="text-3xl text-gray-400 hover:text-gray-900">✕</button>
            </div>
            <img src={quickViewProduct.images[0]} alt={quickViewProduct.name} className="w-full h-80 object-cover rounded-lg" />
            <div>
              <p className="font-serif text-2xl font-semibold text-gray-900">{quickViewProduct.name}</p>
              <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-semibold mt-3">
                {quickViewProduct.material}
              </div>
              <p className="text-yellow-700 font-semibold text-3xl mt-4">{quickViewProduct.price} DZD</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-2">
              <p><span className="font-semibold">Material:</span> Premium {quickViewProduct.material.toLowerCase()}</p>
              <p><span className="font-semibold">Quality:</span> Luxury grade</p>
              <p><span className="font-semibold">Finish:</span> Polished</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const slug = quickViewProduct.slug;
                  if (slug && slug.length > 0)
                    navigate(`/store/${storeSlug}/${slug}`);
                  else
                    navigate(`/product/${quickViewProduct.id}`);
                }}
                className="flex-1 py-3 border border-gray-900 text-gray-900 rounded font-semibold hover:bg-gray-50 transition"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  const slug = quickViewProduct.slug;
                  if (slug && slug.length > 0)
                    navigate(`/store/${storeSlug}/checkout/${slug}`);
                  else
                    navigate(`/checkout/${quickViewProduct.id}`);
                  setQuickViewProduct(null);
                }}
                className="flex-1 py-3 bg-black text-white rounded font-semibold hover:bg-gray-900 transition"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-gray-200 mt-12 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>&copy; 2024 JewelryOS. Crafted with precision.</p>
        </div>
      </footer>
    </div>
  );
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Diamond Solitaire Ring', material: 'Gold', price: 125000, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'] },
  { id: 2, name: 'Pearl Drop Earrings', material: 'Silver', price: 35000, images: ['https://images.unsplash.com/photo-1599643478069-ff49baf2b900?w=400&q=80'] },
  { id: 3, name: 'Sapphire Necklace', material: 'Platinum', price: 185000, images: ['https://images.unsplash.com/photo-1515562141207-5daf927e4738?w=400&q=80'] },
  { id: 4, name: 'Rose Gold Bracelet', material: 'Rose Gold', price: 65000, images: ['https://images.unsplash.com/photo-1599643478306-8c74bdf12ec8?w=400&q=80'] },
  { id: 5, name: 'Emerald Ring', material: 'Gold', price: 95000, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'] },
  { id: 6, name: 'Crystal Pendant', material: 'Silver', price: 28000, images: ['https://images.unsplash.com/photo-1599643478069-ff49baf2b900?w=400&q=80'] },
  { id: 7, name: 'Diamond Bracelet', material: 'Platinum', price: 220000, images: ['https://images.unsplash.com/photo-1515562141207-5daf927e4738?w=400&q=80'] },
  { id: 8, name: 'Gold Layered Necklace', material: 'Gold', price: 48000, images: ['https://images.unsplash.com/photo-1599643478306-8c74bdf12ec8?w=400&q=80'] },
  { id: 9, name: 'Ruby Stud Earrings', material: 'Rose Gold', price: 72000, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'] },
  { id: 10, name: 'Sapphire Bracelet', material: 'Gold', price: 155000, images: ['https://images.unsplash.com/photo-1599643478069-ff49baf2b900?w=400&q=80'] },
];
