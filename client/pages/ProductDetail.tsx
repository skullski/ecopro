import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/state/CartContext";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  sellerId: string;
  likes: string[];
  imageUrl?: string;
  images?: string[];
  category?: string;
  stock?: number;
};
type Review = {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: number;
};

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const cart = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [selectedImage, setSelectedImage] = useState(0);

  async function load() {
    if (!id) return;
    const p = await apiFetch<Product>(`/api/products/${id}`);
    setProduct(p);
    const r = await apiFetch<{ items: Review[] }>(`/api/products/${id}/reviews`);
    setReviews(r.items);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const priceText = useMemo(() => (product ? `$${(product.price / 100).toFixed(2)}` : ""), [product]);

  async function toggleLike() {
    if (!id) return;
    await apiFetch<{ liked: boolean; likesCount: number }>(`/api/products/${id}/like`, { method: "POST" });
    await load();
  }

  function addToCart() {
    if (!product) return;
    cart.add({ productId: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl }, 1);
    nav("/cart");
  }

  function goToCheckout() {
    if (!id) return;
    nav(`/checkout/${id}`);
  }

  async function startChat() {
    if (!id) return;
    const conv = await apiFetch<{ id: string }>(`/api/products/${id}/chat`, { method: "POST" });
    nav(`/chat/${conv.id}`);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !newReview.comment.trim()) return;
    setSubmitting(true);
    try {
      const r = await apiFetch<Review>(`/api/products/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify(newReview),
      });
      setReviews((prev) => [r, ...prev]);
      setNewReview({ rating: 5, comment: "" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!product) return <div className="p-6 text-center">Loading...</div>;

  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : product.imageUrl 
    ? [product.imageUrl] 
    : [];
  const currentImage = allImages[selectedImage] || product.imageUrl;

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)' }}>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
              <img 
                src={currentImage} 
                alt={product.title} 
                className="w-full h-full object-cover min-h-80" 
              />
            </div>
            
            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-cyan-400 ring-2 ring-cyan-400/30' 
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <img src={img} alt={`view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div>
              {product.category && (
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">{product.category}</p>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-2">{product.title}</h1>
              
              {/* Stock Status */}
              {product.stock !== undefined && (
                <p className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
              )}
            </div>

            {/* Rating & Likes */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
              <div className="flex items-center gap-1">
                <span className="text-2xl">⭐</span>
                <span className="text-sm text-slate-400">{reviews.length} reviews</span>
              </div>
              <div className="text-sm text-slate-400">
                ❤️ {product.likes?.length || 0} people liked this
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Price</p>
              <p className="text-4xl font-bold text-cyan-400">{priceText}</p>
            </div>

            {/* Description */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold text-gray-100 mb-2">Description</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={goToCheckout}
                className="w-full py-3 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-colors"
              >
                Buy Now
              </button>
              <button 
                onClick={addToCart}
                className="w-full py-3 bg-slate-800 text-cyan-400 font-bold rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Add to Cart
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={toggleLike}
                  className="py-2 border-2 border-slate-700 text-slate-300 font-semibold rounded-lg hover:border-red-500 hover:text-red-400 transition-colors"
                >
                  ❤️ Like
                </button>
                <button 
                  onClick={startChat}
                  className="py-2 border-2 border-slate-700 text-slate-300 font-semibold rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                >
                  💬 Chat
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Reviews Section */}
      <section className="border-t border-slate-700 pt-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Customer Reviews ({reviews.length})</h2>
        {/* Review Form */}
        <form onSubmit={submitReview} className="bg-slate-900/50 rounded-lg p-6 space-y-4 border border-slate-700 mb-8">
          <h3 className="font-semibold text-gray-100">Share Your Experience</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Rating</label>
            <select
              className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={newReview.rating}
              onChange={(e) => setNewReview((v) => ({ ...v, rating: Number(e.target.value) }))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n === 5 ? '⭐⭐⭐⭐⭐ Excellent' : n === 4 ? '⭐⭐⭐⭐ Good' : n === 3 ? '⭐⭐⭐ Average' : n === 2 ? '⭐⭐ Poor' : '⭐ Terrible'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Review</label>
            <textarea
              className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              rows={4}
              placeholder="Share your experience with this product..."
              value={newReview.comment}
              onChange={(e) => setNewReview((v) => ({ ...v, comment: e.target.value }))}
            />
          </div>

          <button 
            className="w-full py-2 bg-cyan-500 text-slate-950 font-semibold rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting || !newReview.comment.trim()}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border border-slate-700 rounded-lg p-4 bg-slate-900/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">
                    {Array(5).fill(0).map((_, i) => (
                      <span key={i} className={i < r.rating ? 'text-cyan-400' : 'text-slate-600'}>⭐</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-slate-300">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
