import React, { useState } from 'react';
import { getWilayaList, getCommunesByWilaya } from '../data/algeriaLocations';

export default function OrderEditModal({ order, onClose, onSave }) {
  const [formData, setFormData] = useState({
    product_name: order.product_name || '',
    quantity: order.quantity || 1,
    total_price: order.total_price || 0,
    status: order.status || 'pending',
    payment_status: order.payment_status || '',
    payment_method: order.payment_method || '',
    delivery_status: order.delivery_status || '',
    shipping_address: order.shipping_address || '',
    wilaya: order.wilaya || '',
    commune: order.commune || '',
    internal_notes: order.internal_notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const wilayaList = getWilayaList();
  const communeList = formData.wilaya ? getCommunesByWilaya(formData.wilaya) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onSave(data.order);
      } else {
        setError(data.error || 'Failed to update order');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      color: '#999',
      padding: '0',
      width: '32px',
      height: '32px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
    },
    fullWidth: {
      gridColumn: '1 / -1',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
    },
    input: {
      padding: '10px 12px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.3s',
    },
    textarea: {
      padding: '12px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    select: {
      padding: '10px 12px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    error: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
    },
    footer: {
      display: 'flex',
      gap: '12px',
      marginTop: '25px',
      justifyContent: 'flex-end',
    },
    saveButton: {
      padding: '12px 24px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    cancelButton: {
      padding: '12px 24px',
      backgroundColor: 'white',
      color: '#666',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>✏️ Edit Order #{order.order_number}</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <div style={{ ...styles.field, ...styles.fullWidth }}>
              <label style={styles.label}>Product Name</label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                style={styles.input}
                min="1"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Total Price (DZD)</label>
              <input
                type="number"
                value={formData.total_price}
                onChange={(e) => setFormData({ ...formData, total_price: parseFloat(e.target.value) })}
                style={styles.input}
                step="0.01"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Order Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={styles.select}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="changed">Changed</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Payment Status</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                style={styles.select}
              >
                <option value="">Not Set</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                style={styles.select}
              >
                <option value="">Not Set</option>
                <option value="cash">Cash on Delivery</option>
                <option value="card">Credit/Debit Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="ccp">CCP</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Delivery Status</label>
              <select
                value={formData.delivery_status}
                onChange={(e) => setFormData({ ...formData, delivery_status: e.target.value })}
                style={styles.select}
              >
                <option value="">Not Set</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Wilaya *</label>
              <select
                value={formData.wilaya}
                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value, commune: '' })}
                style={styles.select}
                required
              >
                <option value="">Select Wilaya</option>
                {wilayaList.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Commune *</label>
              <select
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                style={styles.select}
                disabled={!formData.wilaya}
                required
              >
                <option value="">Select Commune</option>
                {communeList.map((commune) => (
                  <option key={commune} value={commune}>
                    {commune}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ ...styles.field, ...styles.fullWidth }}>
              <label style={styles.label}>Shipping Address</label>
              <textarea
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                style={styles.textarea}
                placeholder="Full delivery address..."
                rows="2"
              />
            </div>

            <div style={{ ...styles.field, ...styles.fullWidth }}>
              <label style={styles.label}>Internal Notes (Private)</label>
              <textarea
                value={formData.internal_notes}
                onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                style={styles.textarea}
                placeholder="Add private notes about this order (not visible to buyer)..."
                rows="3"
              />
            </div>
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveButton,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
