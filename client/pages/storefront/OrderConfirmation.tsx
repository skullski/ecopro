import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle, Edit2 } from "lucide-react";

export default function OrderConfirmation() {
  const { storeSlug, orderId } = useParams<{ storeSlug: string; orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/storefront/${storeSlug}/order/${orderId}`);
      
      if (!res.ok) {
        throw new Error("Order not found or link expired");
      }

      const data = await res.json();
      setOrder(data.order);
      setEditedOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/storefront/${storeSlug}/order/${orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          orderData: order
        })
      });

      if (!res.ok) throw new Error("Failed to confirm order");

      const data = await res.json();
      alert("✅ Order confirmed! Thank you for your purchase.");
      navigate(`/store/${storeSlug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!window.confirm("Are you sure you want to decline this order?")) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/storefront/${storeSlug}/order/${orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decline"
        })
      });

      if (!res.ok) throw new Error("Failed to decline order");

      alert("Order declined. You can place a new order anytime.");
      navigate(`/store/${storeSlug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/storefront/${storeSlug}/order/${orderId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedOrder)
      });

      if (!res.ok) throw new Error("Failed to update order");

      const data = await res.json();
      setOrder(data.order);
      setIsEditing(false);
      alert("Order updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-sm md:text-base text-gray-600 mb-4">{error || "This order confirmation link is invalid or has expired."}</p>
          <Button onClick={() => navigate("/")} className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-xl md:text-2xl lg:text-lg md:text-xl md:text-2xl font-bold text-gray-800 mb-1">تأكيد الطلب</h1>
          <p className="text-xs md:text-sm text-gray-600">Order #{order.id}</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          {!isEditing ? (
            <>
              {/* Product Info */}
              <div className="mb-4 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📦 Product Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-semibold text-gray-800">{order.product_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold text-gray-800">{order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-gray-800">{order.total_price} DZD</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Customer Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-800">{order.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-800">{order.customer_phone}</span>
                  </div>
                  {order.customer_email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold text-gray-800">{order.customer_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Shipping Address</h2>
                <p className="text-gray-800 bg-gray-50 p-4 rounded">
                  {order.shipping_address || "No address provided"}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Editable Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editedOrder.customer_name}
                    onChange={(e) =>
                      setEditedOrder({ ...editedOrder, customer_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editedOrder.customer_phone}
                    onChange={(e) =>
                      setEditedOrder({ ...editedOrder, customer_phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={editedOrder.customer_email || ""}
                    onChange={(e) =>
                      setEditedOrder({ ...editedOrder, customer_email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Address
                  </label>
                  <textarea
                    value={editedOrder.shipping_address || ""}
                    onChange={(e) =>
                      setEditedOrder({ ...editedOrder, shipping_address: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editedOrder.quantity}
                    onChange={(e) =>
                      setEditedOrder({ ...editedOrder, quantity: parseInt(e.target.value) })
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                disabled={submitting}
              >
                <Edit2 className="w-4 h-4" />
                Change Details
              </Button>

              <Button
                onClick={handleDecline}
                variant="destructive"
                className="w-full flex items-center justify-center gap-2"
                disabled={submitting}
              >
                <XCircle className="w-4 h-4" />
                Decline
              </Button>

              <Button
                onClick={handleApprove}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                disabled={submitting}
              >
                <CheckCircle className="w-4 h-4" />
                {submitting ? "Approving..." : "Approve Order"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="w-full"
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSaveChanges}
                className="w-full md:col-span-2 bg-green-600 hover:bg-green-700 text-white"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save & Continue"}
              </Button>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Info Message */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm">
            ⏰ This confirmation link expires in 48 hours. Please confirm your order soon!
          </p>
        </div>
      </div>
    </div>
  );
}
