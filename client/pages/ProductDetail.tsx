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

  if (!product) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <img src={product.imageUrl} alt={product.title} className="w-full h-80 object-cover rounded" />
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="text-gray-600">{product.description}</p>
          <div className="text-xl font-bold">{priceText}</div>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-outline" onClick={toggleLike}>Like</button>
            <button className="btn btn-secondary" onClick={addToCart}>Add to cart</button>
            <button className="btn btn-primary" onClick={goToCheckout}>Buy now</button>
            <button className="btn" onClick={startChat}>Chat with seller</button>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <form onSubmit={submitReview} className="space-y-2">
          <div className="flex items-center gap-2">
            <label>Rating</label>
            <select
              className="select select-bordered"
              value={newReview.rating}
              onChange={(e) => setNewReview((v) => ({ ...v, rating: Number(e.target.value) }))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Write your review..."
            value={newReview.comment}
            onChange={(e) => setNewReview((v) => ({ ...v, comment: e.target.value }))}
          />
          <button className="btn btn-primary" disabled={submitting || !newReview.comment.trim()}>
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </form>

        <div className="divide-y">
          {reviews.length === 0 && <div className="text-gray-500">No reviews yet.</div>}
          {reviews.map((r) => (
            <div key={r.id} className="py-3">
              <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()} • {r.rating}★</div>
              <div>{r.comment}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
